import json
import re
from datetime import datetime, timedelta
from typing import Any

from app.agents.base import BaseAgent, AgentResponse
from app.llm.models import ModelCapability
from app.models.profile import DietType, Goal as ProfileGoal


class CoachInput:
    """Données d'entrée pour l'agent coach."""

    def __init__(
        self,
        # Profil utilisateur
        name: str,
        age: int,
        goal: ProfileGoal,
        diet_type: DietType,
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
        time_of_day: str = "afternoon",  # morning, afternoon, evening, night
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
        category: str,  # nutrition, activity, hydration, motivation, tip
        priority: str = "medium",  # low, medium, high
        action: str | None = None,  # action suggérée
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
    Agent coach nutritionnel personnalisé.

    Fournit des conseils basés sur:
    - Le profil et les objectifs de l'utilisateur
    - Les statistiques actuelles
    - Le moment de la journée
    """

    name = "CoachAgent"
    capability = ModelCapability.COACHING
    confidence_threshold = 0.5
    text_model = "Qwen/Qwen2.5-72B-Instruct"

    async def process(self, input_data: CoachInput, model=None) -> AgentResponse:
        """
        Traitement spécifique utilisant l'API Chat Completions.
        Override la méthode de base pour utiliser text_chat.
        """
        import structlog

        logger = structlog.get_logger()

        prompt = self.build_prompt(input_data)

        logger.info(
            "coach_agent_processing",
            agent=self.name,
            model=self.text_model,
        )

        try:
            raw_response = await self.client.text_chat(
                prompt=prompt,
                model_id=self.text_model,
                max_tokens=800,
                temperature=0.7,
            )

            if not raw_response:
                logger.warning("coach_empty_response")
                return await self.fallback(input_data)

            result = self.parse_response(raw_response, input_data)
            confidence = self.calculate_confidence(result, raw_response)

            logger.info(
                "coach_agent_response",
                agent=self.name,
                model=self.text_model,
                confidence=confidence,
            )

            if confidence < self.confidence_threshold:
                logger.warning(
                    "low_confidence_fallback",
                    agent=self.name,
                    confidence=confidence,
                    threshold=self.confidence_threshold,
                )
                return await self.fallback(input_data)

            return AgentResponse(
                result=result,
                confidence=confidence,
                model_used=self.text_model,
                reasoning=result.summary,
                used_fallback=False,
            )

        except Exception as e:
            logger.error(
                "coach_agent_error",
                agent=self.name,
                model=self.text_model,
                error=str(e),
            )
            return await self.fallback(input_data)

    def build_prompt(self, input_data: CoachInput) -> str:
        """Construit le prompt pour le coach."""
        goal_text = {
            ProfileGoal.LOSE_WEIGHT: "perdre du poids",
            ProfileGoal.GAIN_MUSCLE: "gagner du muscle",
            ProfileGoal.MAINTAIN: "maintenir son poids",
            ProfileGoal.IMPROVE_HEALTH: "améliorer sa santé",
        }.get(input_data.goal, "maintenir son poids")

        time_context = {
            "morning": "C'est le matin, moment idéal pour un petit-déjeuner équilibré.",
            "afternoon": "C'est l'après-midi, attention au coup de fatigue post-déjeuner.",
            "evening": "C'est le soir, un dîner léger favorise un bon sommeil.",
            "night": "Il est tard, évite les grignotages nocturnes.",
        }.get(input_data.time_of_day, "")

        calories_remaining = input_data.target_calories - input_data.calories_today
        protein_remaining = input_data.target_protein - input_data.protein_today

        return f"""Tu es un coach nutritionnel bienveillant et motivant pour {input_data.name}.

PROFIL:
- Âge: {input_data.age} ans
- Objectif: {goal_text}
- Régime: {input_data.diet_type.value}
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
                message="N'oublie pas de boire de l'eau ! Vise au moins 2L par jour.",
                category="hydration",
                priority="high",
                action="Boire un verre d'eau maintenant",
                emoji="💧",
            ))

        # Conseil calories
        calories_remaining = input_data.target_calories - input_data.calories_today
        if calories_remaining > 500 and input_data.time_of_day in ["afternoon", "evening"]:
            advices.append(CoachAdvice(
                message=f"Il te reste {calories_remaining} kcal à consommer. Pense à un repas équilibré.",
                category="nutrition",
                priority="medium",
                emoji="🍽️",
            ))
        elif calories_remaining < -200:
            advices.append(CoachAdvice(
                message="Tu as dépassé ton objectif calorique. Une petite marche digestive ?",
                category="activity",
                priority="medium",
                action="Faire 15 min de marche",
                emoji="🚶",
            ))

        # Conseil protéines
        protein_remaining = input_data.target_protein - input_data.protein_today
        if protein_remaining > 30:
            advices.append(CoachAdvice(
                message=f"Encore {protein_remaining:.0f}g de protéines à atteindre. Pense aux œufs, poulet ou légumineuses.",
                category="nutrition",
                priority="medium",
                emoji="💪",
            ))

        # Conseil activité
        if input_data.activity_minutes_today == 0:
            advices.append(CoachAdvice(
                message="Pas encore d'activité aujourd'hui ? Même 15 minutes font la différence !",
                category="activity",
                priority="low",
                action="Ajouter une activité",
                emoji="🏃",
            ))

        # Conseil motivation si bonne semaine
        if input_data.days_logged_week >= 5:
            advices.append(CoachAdvice(
                message=f"Bravo ! {input_data.days_logged_week} jours de suivi cette semaine. Continue comme ça !",
                category="motivation",
                priority="low",
                emoji="🌟",
            ))

        # Fallback si aucun conseil
        if not advices:
            advices.append(CoachAdvice(
                message="Continue sur ta lancée, tu es sur la bonne voie !",
                category="motivation",
                priority="low",
                emoji="✨",
            ))

        # Greeting selon moment
        greetings = {
            "morning": f"Bonjour {input_data.name} ! Prêt(e) pour une nouvelle journée ?",
            "afternoon": f"Hello {input_data.name} ! Comment se passe ta journée ?",
            "evening": f"Bonsoir {input_data.name} ! On fait le point ?",
            "night": f"Bonne soirée {input_data.name} ! Repos bien mérité.",
        }

        # Summary
        summary = f"Tu as consommé {input_data.calories_today} kcal aujourd'hui"
        if input_data.activity_minutes_today > 0:
            summary += f" et fait {input_data.activity_minutes_today} min d'activité"
        summary += "."

        return CoachResponse(
            greeting=greetings.get(input_data.time_of_day, f"Salut {input_data.name} !"),
            summary=summary,
            advices=advices,
            motivation_quote="Chaque petit pas compte. Continue !",
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


def get_coach_agent() -> CoachAgent:
    """Retourne une instance de l'agent coach."""
    return CoachAgent()
