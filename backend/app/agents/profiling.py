import json
import re
from typing import Any

from app.agents.base import BaseAgent, AgentResponse
from app.llm.models import ModelCapability
from app.models.profile import Gender, ActivityLevel, Goal, DietType
from app.services.nutrition import get_nutrition_service
from app.schemas.profile import NutritionCalculation
from app.i18n import DEFAULT_LANGUAGE


class ProfileInput:
    """Données d'entrée pour l'agent de profilage."""

    def __init__(
        self,
        age: int,
        gender: Gender,
        height_cm: float,
        weight_kg: float,
        activity_level: ActivityLevel,
        goal: Goal,
        diet_type: DietType,
        allergies: list[str],
        medical_conditions: list[str],
    ):
        self.age = age
        self.gender = gender
        self.height_cm = height_cm
        self.weight_kg = weight_kg
        self.activity_level = activity_level
        self.goal = goal
        self.diet_type = diet_type
        self.allergies = allergies
        self.medical_conditions = medical_conditions


class ProfileAnalysis:
    """Résultat de l'analyse de profil."""

    def __init__(
        self,
        nutrition: NutritionCalculation,
        recommendations: list[str],
        warnings: list[str],
        deficiencies: list[str],
    ):
        self.nutrition = nutrition
        self.recommendations = recommendations
        self.warnings = warnings
        self.deficiencies = deficiencies

    def to_dict(self) -> dict:
        return {
            "nutrition": self.nutrition.model_dump(),
            "recommendations": self.recommendations,
            "warnings": self.warnings,
            "deficiencies": self.deficiencies,
        }


class ProfilingAgent(BaseAgent[ProfileInput, ProfileAnalysis]):
    """
    Agent de profilage nutritionnel.

    Analyse le profil utilisateur et génère:
    - Calculs BMR/TDEE (déterministe via NutritionService)
    - Recommandations personnalisées (via LLM)
    - Alertes sur les carences potentielles
    - Avertissements liés aux conditions médicales
    """

    name = "ProfilingAgent"
    capability = ModelCapability.PROFILING
    confidence_threshold = 0.7
    text_model = "Qwen/Qwen2.5-72B-Instruct"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.nutrition_service = get_nutrition_service()

    async def process(self, input_data: ProfileInput, model=None) -> AgentResponse:
        """
        Traitement spécifique utilisant l'API Chat Completions.
        Override la méthode de base pour utiliser text_chat.
        """
        import structlog

        logger = structlog.get_logger()

        prompt = self.build_prompt(input_data)

        logger.info(
            "profiling_agent_processing",
            agent=self.name,
            model=self.text_model,
        )

        try:
            raw_response = await self.client.text_chat(
                prompt=prompt,
                model_id=self.text_model,
                max_tokens=500,
                temperature=0.5,
            )

            if not raw_response:
                logger.warning("profiling_empty_response")
                return await self.fallback(input_data)

            result = self.parse_response(raw_response, input_data)
            confidence = self.calculate_confidence(result, raw_response)

            logger.info(
                "profiling_agent_response",
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
                reasoning="Profile analysis completed",
                used_fallback=False,
            )

        except Exception as e:
            logger.error(
                "profiling_agent_error",
                agent=self.name,
                model=self.text_model,
                error=str(e),
            )
            return await self.fallback(input_data)

    def build_prompt(self, input_data: ProfileInput) -> str:
        """Construit le prompt pour l'analyse de profil."""
        none_text = self.t("agents.common.none")

        allergies_text = ', '.join(input_data.allergies) if input_data.allergies else none_text
        conditions_text = ', '.join(input_data.medical_conditions) if input_data.medical_conditions else none_text

        return self.t_prompt(
            "calculate",
            age=input_data.age,
            gender=input_data.gender.value,
            height=input_data.height_cm,
            weight=input_data.weight_kg,
            activity=input_data.activity_level.value,
            goal=input_data.goal.value
        ) + f"""

Diet: {input_data.diet_type.value}
Allergies: {allergies_text}
Medical conditions: {conditions_text}

Respond in JSON with this exact format:
{{
    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
    "warnings": ["warning if medical condition or allergy"],
    "deficiencies": ["potential deficiency 1", "potential deficiency 2"],
    "reasoning": "short explanation of your analysis"
}}

Be concise and practical. Maximum 3 recommendations, 2 warnings, 2 deficiencies."""

    def parse_response(self, raw_response: str, input_data: ProfileInput) -> ProfileAnalysis:
        """Parse la réponse LLM et combine avec les calculs déterministes."""
        # Calculs déterministes via NutritionService
        nutrition = self.nutrition_service.calculate_all(
            weight_kg=input_data.weight_kg,
            height_cm=input_data.height_cm,
            age=input_data.age,
            gender=input_data.gender,
            activity_level=input_data.activity_level,
            goal=input_data.goal,
        )

        # Parser la réponse LLM pour les recommandations
        try:
            # Chercher le JSON dans la réponse
            json_match = re.search(r'\{[\s\S]*\}', raw_response)
            if json_match:
                data = json.loads(json_match.group())
                recommendations = data.get("recommendations", [])[:3]
                warnings = data.get("warnings", [])[:2]
                deficiencies = data.get("deficiencies", [])[:2]
            else:
                raise ValueError("No JSON found")

        except (json.JSONDecodeError, ValueError):
            # Fallback: recommandations par défaut
            recommendations, warnings, deficiencies = self._default_recommendations(input_data)

        return ProfileAnalysis(
            nutrition=nutrition,
            recommendations=recommendations,
            warnings=warnings,
            deficiencies=deficiencies,
        )

    def calculate_confidence(self, result: ProfileAnalysis, raw_response: str) -> float:
        """Calcule le score de confiance."""
        confidence = 0.8  # Base: calculs nutritionnels sont fiables

        # Bonus si recommandations cohérentes
        if result.recommendations and len(result.recommendations) >= 2:
            confidence += 0.1

        # Bonus si warnings appropriés pour conditions médicales
        if result.warnings:
            confidence += 0.05

        return min(confidence, 1.0)

    def deterministic_fallback(self, input_data: ProfileInput) -> ProfileAnalysis:
        """Fallback déterministe sans LLM."""
        nutrition = self.nutrition_service.calculate_all(
            weight_kg=input_data.weight_kg,
            height_cm=input_data.height_cm,
            age=input_data.age,
            gender=input_data.gender,
            activity_level=input_data.activity_level,
            goal=input_data.goal,
        )

        recommendations, warnings, deficiencies = self._default_recommendations(input_data)

        return ProfileAnalysis(
            nutrition=nutrition,
            recommendations=recommendations,
            warnings=warnings,
            deficiencies=deficiencies,
        )

    def _default_recommendations(
        self, input_data: ProfileInput
    ) -> tuple[list[str], list[str], list[str]]:
        """Génère des recommandations par défaut basées sur le profil."""
        recommendations = []
        warnings = []
        deficiencies = []

        # Recommandations selon l'objectif
        if input_data.goal == Goal.LOSE_WEIGHT:
            recommendations.append(self.t("agents.profiling.recommendations.loseWeight.leanProtein"))
            recommendations.append(self.t("agents.profiling.recommendations.loseWeight.drinkWater"))
        elif input_data.goal == Goal.GAIN_MUSCLE:
            recommendations.append(self.t("agents.profiling.recommendations.gainMuscle.proteinEveryMeal"))
            recommendations.append(self.t("agents.profiling.recommendations.gainMuscle.postWorkout"))
        else:
            recommendations.append(self.t("agents.profiling.recommendations.general.varyProtein"))
            recommendations.append(self.t("agents.profiling.recommendations.general.fruitsVeggies"))

        recommendations.append(self.t("agents.profiling.recommendations.general.limitProcessed"))

        # Carences selon le régime
        if input_data.diet_type == DietType.VEGAN:
            deficiencies.append(self.t("agents.profiling.deficiencies.vegan.b12"))
            deficiencies.append(self.t("agents.profiling.deficiencies.vegan.iron"))
        elif input_data.diet_type == DietType.VEGETARIAN:
            deficiencies.append(self.t("agents.profiling.deficiencies.vegetarian.iron"))

        # Warnings selon les conditions médicales
        conditions_lower = [c.lower() for c in input_data.medical_conditions]
        if "diabète" in conditions_lower or "diabetes" in conditions_lower:
            warnings.append(self.t("agents.profiling.warnings.diabetes"))
        if "hypertension" in conditions_lower:
            warnings.append(self.t("agents.profiling.warnings.hypertension"))

        # Warnings allergies
        for allergy in input_data.allergies:
            warnings.append(self.t("agents.profiling.warnings.allergyTrace", allergy=allergy))

        return recommendations[:3], warnings[:2], deficiencies[:2]


# Factory
def get_profiling_agent(language: str = DEFAULT_LANGUAGE) -> ProfilingAgent:
    """Retourne une instance de l'agent de profilage."""
    return ProfilingAgent(language=language)
