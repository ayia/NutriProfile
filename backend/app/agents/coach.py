"""Agent coach nutritionnel avec multi-modèles et consensus."""
import asyncio
import json
import re
from datetime import datetime
from typing import Any

import structlog

from app.agents.base import BaseAgent, AgentResponse
from app.agents.consensus import ConsensusValidator
from app.llm.models import ModelCapability
from app.models.profile import DietType, Goal as ProfileGoal
from app.i18n import DEFAULT_LANGUAGE

logger = structlog.get_logger()

# Modèles utilisés pour le coaching (2-3 modèles pour consensus)
COACH_MODELS = [
    "Qwen/Qwen2.5-72B-Instruct",       # Modèle principal
    "Qwen/Qwen2.5-7B-Instruct",        # Modèle secondaire (remplace Mistral)
    "meta-llama/Llama-3.1-8B-Instruct",  # Modèle tertiaire
]

# Modèle de validation (pour valider le consensus)
VALIDATION_MODEL = "Qwen/Qwen2.5-7B-Instruct"


class CoachInput:
    """Données d'entrée pour l'agent coach."""

    def __init__(
        self,
        # Profil utilisateur
        name: str,
        age: int,
        goal: str | ProfileGoal | None,
        diet_type: str | DietType | None,
        target_calories: int,
        target_protein: float,
        target_carbs: float,
        target_fat: float,
        # Stats actuelles
        calories_today: int = 0,
        protein_today: float = 0,
        carbs_today: float = 0,
        fat_today: float = 0,
        water_today: int = 0,
        activity_minutes_today: int = 0,
        calories_burned_today: int = 0,
        # Stats semaine
        avg_calories_week: float = 0,
        weight_change_week: float | None = None,
        days_logged_week: int = 0,
        # Contexte
        time_of_day: str = "afternoon",
        meals_today: int = 0,
        last_meal_type: str | None = None,
    ):
        self.name = name
        self.age = age
        self.goal = goal
        self.diet_type = diet_type
        self.target_calories = target_calories
        self.target_protein = target_protein
        self.target_carbs = target_carbs
        self.target_fat = target_fat
        self.calories_today = calories_today
        self.protein_today = protein_today
        self.carbs_today = carbs_today
        self.fat_today = fat_today
        self.water_today = water_today
        self.activity_minutes_today = activity_minutes_today
        self.calories_burned_today = calories_burned_today
        self.avg_calories_week = avg_calories_week
        self.weight_change_week = weight_change_week
        self.days_logged_week = days_logged_week
        self.time_of_day = time_of_day
        self.meals_today = meals_today
        self.last_meal_type = last_meal_type


class CoachAdvice:
    """Conseil du coach."""

    def __init__(
        self,
        message: str,
        category: str,
        priority: str = "medium",
        action: str | None = None,
        emoji: str = "💡",
    ):
        self.message = message
        self.category = category
        self.priority = priority
        self.action = action
        self.emoji = emoji

    def to_dict(self) -> dict:
        return {
            "message": self.message,
            "category": self.category,
            "priority": self.priority,
            "action": self.action,
            "emoji": self.emoji,
        }


class CoachResponse:
    """Réponse complète du coach."""

    def __init__(
        self,
        greeting: str,
        summary: str,
        advices: list[CoachAdvice],
        motivation_quote: str | None = None,
    ):
        self.greeting = greeting
        self.summary = summary
        self.advices = advices
        self.motivation_quote = motivation_quote

    def to_dict(self) -> dict:
        return {
            "greeting": self.greeting,
            "summary": self.summary,
            "advices": [a.to_dict() for a in self.advices],
            "motivation_quote": self.motivation_quote,
        }


class CoachAgent(BaseAgent[CoachInput, CoachResponse]):
    """
    Agent coach nutritionnel personnalisé avec multi-modèles.

    Utilise 2-3 modèles en parallèle pour générer des conseils,
    puis valide le consensus avec un modèle de validation.
    """

    name = "CoachAgent"
    capability = ModelCapability.COACHING
    confidence_threshold = 0.5

    async def process(self, input_data: CoachInput, model=None) -> AgentResponse:
        """
        Traitement multi-modèles avec consensus.
        """
        prompt = self.build_prompt(input_data)

        logger.info(
            "coach_agent_multi_model_processing",
            agent=self.name,
            models=COACH_MODELS[:3],
        )

        # Étape 1: Appeler 2-3 modèles en parallèle
        responses = await self._call_multiple_models(prompt, input_data)

        if not responses:
            logger.warning("coach_no_valid_responses")
            return await self.fallback(input_data)

        # Étape 2: Valider avec le consensus
        consensus_validator = ConsensusValidator(
            min_confidence=0.5,
            language=self.language
        )

        # Convertir les réponses pour le consensus
        agent_responses = []
        for resp in responses:
            if resp["result"]:
                agent_responses.append(AgentResponse(
                    result=resp["result"].to_dict(),
                    confidence=resp["confidence"],
                    model_used=resp["model"],
                    reasoning=resp["result"].summary,
                    used_fallback=False,
                ))

        if len(agent_responses) < 2:
            # Pas assez de réponses pour consensus, utiliser la meilleure
            if agent_responses:
                best = agent_responses[0]
                return AgentResponse(
                    result=self._dict_to_coach_response(best.result),
                    confidence=best.confidence,
                    model_used=best.model_used,
                    reasoning=best.reasoning,
                    used_fallback=False,
                )
            return await self.fallback(input_data)

        # Étape 3: Fusion par consensus
        consensus = consensus_validator.validate(
            agent_responses,
            task_type="coaching",
            min_agreement=2,
        )

        logger.info(
            "coach_consensus_result",
            is_valid=consensus.is_valid,
            confidence=consensus.confidence,
            agreement=consensus.agreement_score,
            models_count=len(agent_responses),
        )

        if not consensus.is_valid:
            # Prendre la meilleure réponse si pas de consensus
            best = max(agent_responses, key=lambda r: r.confidence)
            return AgentResponse(
                result=self._dict_to_coach_response(best.result),
                confidence=best.confidence * 0.9,  # Pénalité pour manque de consensus
                model_used=best.model_used,
                reasoning=best.reasoning,
                used_fallback=False,
                metadata={"consensus_warnings": consensus.warnings},
            )

        # Étape 4: Validation finale avec le modèle de validation
        validated_result = await self._validate_with_model(
            consensus.merged_result,
            input_data
        )

        if validated_result:
            return AgentResponse(
                result=validated_result,
                confidence=consensus.confidence,
                model_used=f"consensus({len(agent_responses)} models)",
                reasoning=validated_result.summary,
                used_fallback=False,
                metadata={
                    "agreement_score": consensus.agreement_score,
                    "individual_scores": consensus.individual_scores,
                    "validated": True,
                },
            )

        # Fallback si validation échoue
        merged = self._merge_coach_responses(agent_responses)
        return AgentResponse(
            result=merged,
            confidence=consensus.confidence,
            model_used=f"consensus({len(agent_responses)} models)",
            reasoning=merged.summary,
            used_fallback=False,
        )

    async def _call_multiple_models(
        self,
        prompt: str,
        input_data: CoachInput
    ) -> list[dict[str, Any]]:
        """Appelle plusieurs modèles en parallèle."""
        async def call_model(model_id: str) -> dict[str, Any] | None:
            try:
                raw_response = await self.client.text_chat(
                    prompt=prompt,
                    model_id=model_id,
                    max_tokens=800,
                    temperature=0.7,
                )

                if not raw_response:
                    return None

                result = self.parse_response(raw_response, input_data)
                confidence = self.calculate_confidence(result, raw_response)

                logger.info(
                    "coach_model_response",
                    model=model_id,
                    confidence=confidence,
                )

                return {
                    "model": model_id,
                    "result": result,
                    "confidence": confidence,
                    "raw": raw_response,
                }

            except Exception as e:
                logger.error(
                    "coach_model_error",
                    model=model_id,
                    error=str(e),
                )
                return None

        # Appeler les 3 modèles en parallèle
        tasks = [call_model(model) for model in COACH_MODELS[:3]]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filtrer les réponses valides
        valid_responses = []
        for result in results:
            if isinstance(result, dict) and result is not None:
                valid_responses.append(result)

        return valid_responses

    async def _validate_with_model(
        self,
        merged_result: dict[str, Any],
        input_data: CoachInput
    ) -> CoachResponse | None:
        """Valide le résultat fusionné avec un modèle de validation."""
        try:
            validation_prompt = f"""Tu es un expert en nutrition. Valide et améliore ces conseils:

CONSEILS À VALIDER:
{json.dumps(merged_result, ensure_ascii=False, indent=2)}

CONTEXTE UTILISATEUR:
- Objectif calories: {input_data.target_calories} kcal
- Calories consommées: {input_data.calories_today} kcal
- Moment: {input_data.time_of_day}

Retourne le JSON amélioré avec le même format. Garde uniquement les conseils pertinents et cohérents.
Assure-toi que:
1. Les conseils sont spécifiques au contexte
2. Les priorités sont correctes (high pour urgent)
3. Les catégories sont appropriées

Réponds UNIQUEMENT avec le JSON, sans commentaires."""

            raw_response = await self.client.text_chat(
                prompt=validation_prompt,
                model_id=VALIDATION_MODEL,
                max_tokens=600,
                temperature=0.3,  # Plus déterministe pour validation
            )

            if not raw_response:
                return None

            return self.parse_response(raw_response, input_data)

        except Exception as e:
            logger.error("coach_validation_error", error=str(e))
            return None

    def _merge_coach_responses(
        self,
        responses: list[AgentResponse]
    ) -> CoachResponse:
        """Fusionne plusieurs réponses de coaching."""
        if not responses:
            return self.deterministic_fallback(CoachInput(
                name="",
                age=30,
                goal="maintain",
                diet_type="omnivore",
                target_calories=2000,
                target_protein=100,
                target_carbs=250,
                target_fat=65,
            ))

        # Prendre le greeting de la meilleure réponse
        best = max(responses, key=lambda r: r.confidence)
        best_result = best.result

        # Collecter tous les conseils uniques par catégorie
        all_advices: dict[str, list[dict]] = {}
        for resp in responses:
            result = resp.result
            if isinstance(result, dict):
                for advice in result.get("advices", []):
                    cat = advice.get("category", "tip")
                    if cat not in all_advices:
                        all_advices[cat] = []
                    all_advices[cat].append(advice)

        # Garder le meilleur conseil par catégorie (par priorité)
        priority_order = {"high": 3, "medium": 2, "low": 1}
        merged_advices = []
        for cat, advices in all_advices.items():
            sorted_advices = sorted(
                advices,
                key=lambda a: priority_order.get(a.get("priority", "low"), 0),
                reverse=True
            )
            if sorted_advices:
                merged_advices.append(CoachAdvice(
                    message=sorted_advices[0].get("message", ""),
                    category=cat,
                    priority=sorted_advices[0].get("priority", "medium"),
                    action=sorted_advices[0].get("action"),
                    emoji=sorted_advices[0].get("emoji", "💡"),
                ))

        return CoachResponse(
            greeting=best_result.get("greeting", "Bonjour !"),
            summary=best_result.get("summary", ""),
            advices=merged_advices[:4],  # Max 4 conseils
            motivation_quote=best_result.get("motivation_quote"),
        )

    def _dict_to_coach_response(self, data: dict[str, Any]) -> CoachResponse:
        """Convertit un dict en CoachResponse."""
        advices = []
        for advice_data in data.get("advices", []):
            advices.append(CoachAdvice(
                message=advice_data.get("message", ""),
                category=advice_data.get("category", "tip"),
                priority=advice_data.get("priority", "medium"),
                action=advice_data.get("action"),
                emoji=advice_data.get("emoji", "💡"),
            ))

        return CoachResponse(
            greeting=data.get("greeting", "Bonjour !"),
            summary=data.get("summary", ""),
            advices=advices,
            motivation_quote=data.get("motivation_quote"),
        )

    def build_prompt(self, input_data: CoachInput) -> str:
        """Construit le prompt pour le coach."""
        goal_value = input_data.goal.value if hasattr(input_data.goal, 'value') else input_data.goal
        goal_mapping = {
            "lose_weight": self.t("agents.coach.goals.loseWeight"),
            "gain_muscle": self.t("agents.coach.goals.gainMuscle"),
            "maintain": self.t("agents.coach.goals.maintain"),
            "improve_health": self.t("agents.coach.goals.improveHealth"),
        }
        goal_text = goal_mapping.get(goal_value, self.t("agents.coach.goals.maintain"))

        time_context = {
            "morning": self.t("agents.coach.timeContext.morning"),
            "afternoon": self.t("agents.coach.timeContext.afternoon"),
            "evening": self.t("agents.coach.timeContext.evening"),
            "night": self.t("agents.coach.timeContext.night"),
        }.get(input_data.time_of_day, "")

        calories_remaining = input_data.target_calories - input_data.calories_today
        protein_remaining = input_data.target_protein - input_data.protein_today

        diet_type_value = input_data.diet_type.value if hasattr(input_data.diet_type, 'value') else (input_data.diet_type or "omnivore")

        return f"""Tu es un coach nutritionnel bienveillant et motivant pour {input_data.name}.

PROFIL:
- Âge: {input_data.age} ans
- Objectif: {goal_text}
- Régime: {diet_type_value}
- Objectifs journaliers: {input_data.target_calories} kcal, {input_data.target_protein}g protéines

STATS AUJOURD'HUI:
- Calories: {input_data.calories_today}/{input_data.target_calories} kcal (reste {calories_remaining})
- Protéines: {input_data.protein_today}/{input_data.target_protein}g (reste {protein_remaining:.0f}g)
- Eau: {input_data.water_today}ml
- Activité: {input_data.activity_minutes_today} min ({input_data.calories_burned_today} kcal brûlées)
- Repas: {input_data.meals_today}

STATS SEMAINE:
- Moyenne calories: {input_data.avg_calories_week:.0f} kcal/jour
- Jours suivis: {input_data.days_logged_week}/7
{f"- Évolution poids: {input_data.weight_change_week:+.1f} kg" if input_data.weight_change_week else ""}

CONTEXTE: {time_context}

Génère une réponse JSON avec ce format exact:
{{
    "greeting": "Salutation personnalisée courte",
    "summary": "Résumé de la journée en 1-2 phrases",
    "advices": [
        {{
            "message": "Conseil concret et actionnable",
            "category": "nutrition|activity|hydration|motivation|tip",
            "priority": "low|medium|high",
            "action": "Action suggérée (optionnel)",
            "emoji": "emoji approprié"
        }}
    ],
    "motivation_quote": "Citation motivante (optionnel)"
}}

Donne 2-4 conseils pertinents selon le contexte. Sois positif et encourageant !"""

    def parse_response(self, raw_response: str, input_data: CoachInput) -> CoachResponse:
        """Parse la réponse LLM en objet CoachResponse."""
        try:
            json_match = re.search(r'\{[\s\S]*\}', raw_response)
            if json_match:
                data = json.loads(json_match.group())

                advices = []
                for advice_data in data.get("advices", []):
                    advices.append(CoachAdvice(
                        message=advice_data.get("message", ""),
                        category=advice_data.get("category", "tip"),
                        priority=advice_data.get("priority", "medium"),
                        action=advice_data.get("action"),
                        emoji=advice_data.get("emoji", "💡"),
                    ))

                return CoachResponse(
                    greeting=data.get("greeting", f"Bonjour {input_data.name} !"),
                    summary=data.get("summary", ""),
                    advices=advices,
                    motivation_quote=data.get("motivation_quote"),
                )
            else:
                raise ValueError("No JSON found")

        except (json.JSONDecodeError, ValueError):
            return self.deterministic_fallback(input_data)

    def calculate_confidence(self, result: CoachResponse, raw_response: str) -> float:
        """Calcule le score de confiance."""
        confidence = 0.5

        if result.greeting:
            confidence += 0.1
        if result.summary:
            confidence += 0.1
        if len(result.advices) >= 2:
            confidence += 0.2
        if result.motivation_quote:
            confidence += 0.1

        return min(confidence, 1.0)

    def deterministic_fallback(self, input_data: CoachInput) -> CoachResponse:
        """Fallback avec conseils basiques."""
        advices = []

        # Conseil hydratation
        if input_data.water_today < 1500:
            advices.append(CoachAdvice(
                message=self.t("agents.coach.advice.drinkWater"),
                category="hydration",
                priority="high",
                emoji="💧",
            ))

        # Conseil calories
        calories_remaining = input_data.target_calories - input_data.calories_today
        if calories_remaining > 500 and input_data.time_of_day in ["afternoon", "evening"]:
            advices.append(CoachAdvice(
                message=self.t("agents.coach.advice.caloriesRemaining", calories=calories_remaining),
                category="nutrition",
                priority="medium",
                emoji="🍽️",
            ))
        elif calories_remaining < -200:
            advices.append(CoachAdvice(
                message=self.t("agents.coach.advice.caloriesExceeded"),
                category="activity",
                priority="medium",
                emoji="🚶",
            ))

        # Conseil protéines
        protein_remaining = input_data.target_protein - input_data.protein_today
        if protein_remaining > 30:
            advices.append(CoachAdvice(
                message=self.t("agents.coach.advice.proteinRemaining", protein=int(protein_remaining)),
                category="nutrition",
                priority="medium",
                emoji="💪",
            ))

        # Conseil activité
        if input_data.activity_minutes_today == 0:
            advices.append(CoachAdvice(
                message=self.t("agents.coach.advice.noActivityYet"),
                category="activity",
                priority="low",
                emoji="🏃",
            ))

        # Conseil motivation si bonne semaine
        if input_data.days_logged_week >= 5:
            advices.append(CoachAdvice(
                message=self.t("agents.coach.streakMessage", days=input_data.days_logged_week),
                category="motivation",
                priority="low",
                emoji="🌟",
            ))

        # Fallback si aucun conseil
        if not advices:
            advices.append(CoachAdvice(
                message=self.t("agents.coach.encouragement.onTrack"),
                category="motivation",
                priority="low",
                emoji="✨",
            ))

        greeting = self.t("agents.coach.greeting", name=input_data.name)
        summary = self.t("agents.coach.caloriesSummary",
                         consumed=input_data.calories_today,
                         target=input_data.target_calories)

        return CoachResponse(
            greeting=greeting,
            summary=summary,
            advices=advices,
            motivation_quote=self.t("agents.coach.encouragement.onTrack"),
        )


def get_time_of_day() -> str:
    """Retourne le moment de la journée."""
    hour = datetime.now().hour
    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 17:
        return "afternoon"
    elif 17 <= hour < 21:
        return "evening"
    else:
        return "night"


def get_coach_agent(language: str = DEFAULT_LANGUAGE) -> CoachAgent:
    """Retourne une instance de l'agent coach."""
    return CoachAgent(language=language)
