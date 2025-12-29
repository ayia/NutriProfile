"""Agent de personnalisation du dashboard basé sur le profil utilisateur complet."""
import asyncio
import json
import re
from datetime import datetime, date, timedelta
from typing import Any

import structlog

from app.agents.base import BaseAgent, AgentResponse
from app.agents.consensus import ConsensusValidator
from app.llm.models import ModelCapability
from app.models.profile import DietType, Goal as ProfileGoal, ActivityLevel
from app.i18n import DEFAULT_LANGUAGE

logger = structlog.get_logger()

# Modèles utilisés pour la personnalisation
PERSONALIZER_MODELS = [
    "Qwen/Qwen2.5-72B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.2",
]

# Conditions médicales et leurs priorités nutritionnelles
MEDICAL_CONDITION_PRIORITIES = {
    "diabetes": {
        "priority_nutrients": ["carbs", "sugar", "fiber", "glycemic_index"],
        "alerts": ["high_carbs", "sugar_spike"],
        "widgets": ["carbs_tracker", "glycemic_load"],
    },
    "hypertension": {
        "priority_nutrients": ["sodium", "potassium", "water"],
        "alerts": ["high_sodium"],
        "widgets": ["sodium_tracker", "blood_pressure"],
    },
    "heart_disease": {
        "priority_nutrients": ["fat", "saturated_fat", "cholesterol", "sodium"],
        "alerts": ["high_fat", "high_cholesterol"],
        "widgets": ["heart_health_score", "fat_breakdown"],
    },
    "kidney_disease": {
        "priority_nutrients": ["protein", "potassium", "phosphorus", "sodium"],
        "alerts": ["high_protein", "high_potassium"],
        "widgets": ["kidney_friendly_score"],
    },
    "anemia": {
        "priority_nutrients": ["iron", "vitamin_b12", "folate"],
        "alerts": ["low_iron"],
        "widgets": ["iron_tracker"],
    },
    "osteoporosis": {
        "priority_nutrients": ["calcium", "vitamin_d", "protein"],
        "alerts": ["low_calcium"],
        "widgets": ["bone_health_score"],
    },
    "celiac": {
        "priority_nutrients": ["gluten_free"],
        "alerts": ["gluten_detected"],
        "widgets": ["gluten_free_checker"],
    },
}

# Priorités par objectif
GOAL_PRIORITIES = {
    "lose_weight": {
        "priority_nutrients": ["calories", "protein", "fiber"],
        "widgets": ["calorie_deficit", "weekly_progress", "activity_burn"],
        "emphasis": "deficit",
    },
    "gain_muscle": {
        "priority_nutrients": ["protein", "calories", "carbs"],
        "widgets": ["protein_tracker", "muscle_building_score", "workout_nutrition"],
        "emphasis": "surplus",
    },
    "maintain": {
        "priority_nutrients": ["calories", "protein", "balance"],
        "widgets": ["balance_score", "consistency_tracker"],
        "emphasis": "balance",
    },
    "improve_health": {
        "priority_nutrients": ["fiber", "vitamins", "minerals", "water"],
        "widgets": ["health_score", "nutrient_diversity"],
        "emphasis": "quality",
    },
}

# Priorités par régime alimentaire
DIET_TYPE_PRIORITIES = {
    "vegan": {
        "priority_nutrients": ["protein", "vitamin_b12", "iron", "omega3"],
        "widgets": ["plant_protein_tracker", "b12_reminder"],
    },
    "vegetarian": {
        "priority_nutrients": ["protein", "iron", "vitamin_b12"],
        "widgets": ["protein_sources"],
    },
    "keto": {
        "priority_nutrients": ["carbs", "fat", "protein"],
        "widgets": ["ketosis_tracker", "net_carbs"],
    },
    "mediterranean": {
        "priority_nutrients": ["healthy_fats", "fiber", "fish"],
        "widgets": ["mediterranean_score"],
    },
}

# Priorités par tranche d'âge
AGE_PRIORITIES = {
    "young": {  # < 25
        "priority_nutrients": ["calcium", "protein", "iron"],
        "widgets": ["growth_nutrients"],
    },
    "adult": {  # 25-50
        "priority_nutrients": ["balance", "protein", "fiber"],
        "widgets": ["balance_score"],
    },
    "senior": {  # > 50
        "priority_nutrients": ["calcium", "vitamin_d", "protein", "fiber"],
        "widgets": ["bone_health", "hydration_reminder"],
    },
}


class PersonalizerInput:
    """Données d'entrée pour le personnaliseur."""

    def __init__(
        self,
        # Profil utilisateur complet
        name: str,
        age: int,
        gender: str,
        height_cm: float,
        weight_kg: float,
        goal: str | ProfileGoal | None,
        diet_type: str | DietType | None,
        activity_level: str | ActivityLevel | None,
        # Données de santé
        medical_conditions: list[str] | None = None,
        allergies: list[str] | None = None,
        medications: list[str] | None = None,
        # Objectifs nutritionnels
        target_calories: int = 2000,
        target_protein: float = 100,
        target_carbs: float = 250,
        target_fat: float = 65,
        target_water: int = 2000,
        # Stats actuelles
        calories_today: int = 0,
        protein_today: float = 0,
        carbs_today: float = 0,
        fat_today: float = 0,
        water_today: int = 0,
        activity_minutes_today: int = 0,
        # Historique
        avg_calories_week: float = 0,
        avg_protein_week: float = 0,
        avg_carbs_week: float = 0,
        days_logged_week: int = 0,
        weight_change_week: float | None = None,
        # Contexte
        time_of_day: str = "afternoon",
        meals_today: int = 0,
        streak_days: int = 0,
    ):
        self.name = name
        self.age = age
        self.gender = gender
        self.height_cm = height_cm
        self.weight_kg = weight_kg
        self.goal = goal.value if hasattr(goal, 'value') else (goal or "maintain")
        self.diet_type = diet_type.value if hasattr(diet_type, 'value') else (diet_type or "omnivore")
        self.activity_level = activity_level.value if hasattr(activity_level, 'value') else (activity_level or "moderate")
        self.medical_conditions = medical_conditions or []
        self.allergies = allergies or []
        self.medications = medications or []
        self.target_calories = target_calories
        self.target_protein = target_protein
        self.target_carbs = target_carbs
        self.target_fat = target_fat
        self.target_water = target_water
        self.calories_today = calories_today
        self.protein_today = protein_today
        self.carbs_today = carbs_today
        self.fat_today = fat_today
        self.water_today = water_today
        self.activity_minutes_today = activity_minutes_today
        self.avg_calories_week = avg_calories_week
        self.avg_protein_week = avg_protein_week
        self.avg_carbs_week = avg_carbs_week
        self.days_logged_week = days_logged_week
        self.weight_change_week = weight_change_week
        self.time_of_day = time_of_day
        self.meals_today = meals_today
        self.streak_days = streak_days


class PersonalizationResult:
    """Résultat de la personnalisation du dashboard."""

    def __init__(
        self,
        # Contexte du profil (résumé pour l'UI)
        profile_summary: str,
        health_context: list[str],
        # Widgets prioritaires (ordonnés par importance)
        priority_widgets: list[dict[str, Any]],
        # Stats personnalisées à afficher
        personalized_stats: list[dict[str, Any]],
        # Alertes de santé
        health_alerts: list[dict[str, Any]],
        # Insights personnalisés
        insights: list[dict[str, Any]],
        # Configuration UI
        ui_config: dict[str, Any],
    ):
        self.profile_summary = profile_summary
        self.health_context = health_context
        self.priority_widgets = priority_widgets
        self.personalized_stats = personalized_stats
        self.health_alerts = health_alerts
        self.insights = insights
        self.ui_config = ui_config

    def to_dict(self) -> dict:
        return {
            "profile_summary": self.profile_summary,
            "health_context": self.health_context,
            "priority_widgets": self.priority_widgets,
            "personalized_stats": self.personalized_stats,
            "health_alerts": self.health_alerts,
            "insights": self.insights,
            "ui_config": self.ui_config,
        }


class DashboardPersonalizerAgent(BaseAgent[PersonalizerInput, PersonalizationResult]):
    """
    Agent qui personnalise le dashboard en fonction du profil complet de l'utilisateur.

    Analyse:
    - Conditions médicales (diabète, hypertension, etc.)
    - Âge et genre
    - Objectifs (perte de poids, prise de muscle, etc.)
    - Régime alimentaire (végan, keto, etc.)
    - Allergies et médicaments
    - Historique et habitudes
    """

    name = "DashboardPersonalizerAgent"
    capability = ModelCapability.COACHING
    confidence_threshold = 0.5

    def build_prompt(self, input_data: PersonalizerInput) -> str:
        """Non utilisé - cet agent utilise une analyse déterministe."""
        return ""

    def parse_response(self, raw_response: str, input_data: PersonalizerInput) -> PersonalizationResult:
        """Non utilisé - cet agent utilise une analyse déterministe."""
        return self._deterministic_analysis(input_data)

    def calculate_confidence(self, result: PersonalizationResult, raw_response: str) -> float:
        """Non utilisé - cet agent utilise une analyse déterministe."""
        return 0.85

    async def process(self, input_data: PersonalizerInput, model=None) -> AgentResponse:
        """
        Personnalise le dashboard basé sur le profil utilisateur.
        Utilise d'abord une analyse déterministe, puis enrichit avec l'IA.
        """
        logger.info(
            "dashboard_personalizer_processing",
            agent=self.name,
            medical_conditions=input_data.medical_conditions,
            goal=input_data.goal,
            diet_type=input_data.diet_type,
            age=input_data.age,
        )

        # Étape 1: Analyse déterministe basée sur les règles
        deterministic_result = self._deterministic_analysis(input_data)

        # Étape 2: Enrichissement par IA (optionnel, avec timeout court)
        try:
            ai_enrichment = await asyncio.wait_for(
                self._ai_enrichment(input_data, deterministic_result),
                timeout=3.0
            )
            if ai_enrichment:
                deterministic_result = self._merge_results(deterministic_result, ai_enrichment)
        except asyncio.TimeoutError:
            logger.warning("dashboard_personalizer_ai_timeout")
        except Exception as e:
            logger.warning("dashboard_personalizer_ai_error", error=str(e))

        return AgentResponse(
            result=deterministic_result,
            confidence=0.85,
            model_used="deterministic+ai",
            reasoning="Personalization based on medical conditions, goals, and profile",
            used_fallback=False,
        )

    def _deterministic_analysis(self, input_data: PersonalizerInput) -> PersonalizationResult:
        """Analyse déterministe basée sur les règles métier."""
        priority_widgets = []
        personalized_stats = []
        health_alerts = []
        health_context = []
        insights = []

        # 1. Analyser les conditions médicales
        for condition in input_data.medical_conditions:
            condition_lower = condition.lower()
            for key, config in MEDICAL_CONDITION_PRIORITIES.items():
                if key in condition_lower:
                    health_context.append(f"condition_{key}")

                    # Ajouter les widgets prioritaires
                    for widget in config["widgets"]:
                        priority_widgets.append({
                            "id": widget,
                            "type": "health",
                            "priority": 1,  # Haute priorité
                            "reason": f"Important pour {condition}",
                            "source": "medical_condition",
                        })

                    # Ajouter les stats personnalisées
                    for nutrient in config["priority_nutrients"]:
                        if nutrient not in [s["id"] for s in personalized_stats]:
                            personalized_stats.append({
                                "id": nutrient,
                                "priority": 1,
                                "reason": f"À surveiller pour {condition}",
                            })

                    # Vérifier les alertes
                    self._check_condition_alerts(
                        input_data, condition_lower, config, health_alerts
                    )

        # 2. Analyser l'objectif
        goal_config = GOAL_PRIORITIES.get(input_data.goal, GOAL_PRIORITIES["maintain"])
        health_context.append(f"goal_{input_data.goal}")

        for widget in goal_config["widgets"]:
            priority_widgets.append({
                "id": widget,
                "type": "goal",
                "priority": 2,
                "reason": f"Objectif: {input_data.goal}",
                "source": "goal",
            })

        for nutrient in goal_config["priority_nutrients"]:
            if nutrient not in [s["id"] for s in personalized_stats]:
                personalized_stats.append({
                    "id": nutrient,
                    "priority": 2,
                    "reason": f"Important pour {input_data.goal}",
                })

        # 3. Analyser le régime alimentaire
        diet_config = DIET_TYPE_PRIORITIES.get(input_data.diet_type, {})
        if diet_config:
            health_context.append(f"diet_{input_data.diet_type}")

            for widget in diet_config.get("widgets", []):
                priority_widgets.append({
                    "id": widget,
                    "type": "diet",
                    "priority": 3,
                    "reason": f"Régime {input_data.diet_type}",
                    "source": "diet_type",
                })

            for nutrient in diet_config.get("priority_nutrients", []):
                if nutrient not in [s["id"] for s in personalized_stats]:
                    personalized_stats.append({
                        "id": nutrient,
                        "priority": 3,
                        "reason": f"Important pour régime {input_data.diet_type}",
                    })

        # 4. Analyser l'âge
        age_category = self._get_age_category(input_data.age)
        age_config = AGE_PRIORITIES.get(age_category, AGE_PRIORITIES["adult"])
        health_context.append(f"age_{age_category}")

        for nutrient in age_config["priority_nutrients"]:
            if nutrient not in [s["id"] for s in personalized_stats]:
                personalized_stats.append({
                    "id": nutrient,
                    "priority": 4,
                    "reason": f"Recommandé pour votre tranche d'âge",
                })

        # 5. Allergies
        if input_data.allergies:
            health_context.extend([f"allergy_{a.lower()}" for a in input_data.allergies])
            health_alerts.append({
                "type": "allergy_reminder",
                "severity": "info",
                "title": "Rappel allergies",
                "message": f"Attention aux allergies: {', '.join(input_data.allergies)}",
                "icon": "⚠️",
            })

        # 6. Générer les insights basés sur les données actuelles
        insights = self._generate_insights(input_data)

        # 7. Configuration UI basée sur le profil
        ui_config = self._generate_ui_config(input_data, health_context)

        # 8. Ajouter les stats de base si pas assez de stats personnalisées
        base_stats = ["calories", "protein", "water", "activity"]
        for stat in base_stats:
            if stat not in [s["id"] for s in personalized_stats]:
                personalized_stats.append({
                    "id": stat,
                    "priority": 5,
                    "reason": "Suivi de base",
                })

        # Trier par priorité
        priority_widgets.sort(key=lambda x: x["priority"])
        personalized_stats.sort(key=lambda x: x["priority"])

        # Générer le résumé du profil
        profile_summary = self._generate_profile_summary(input_data)

        return PersonalizationResult(
            profile_summary=profile_summary,
            health_context=health_context,
            priority_widgets=priority_widgets[:6],  # Max 6 widgets
            personalized_stats=personalized_stats[:8],  # Max 8 stats
            health_alerts=health_alerts,
            insights=insights[:4],  # Max 4 insights
            ui_config=ui_config,
        )

    def _check_condition_alerts(
        self,
        input_data: PersonalizerInput,
        condition: str,
        config: dict,
        health_alerts: list,
    ):
        """Vérifie les alertes spécifiques à une condition médicale."""
        # Diabète - alertes sur les glucides
        if "diabetes" in condition:
            carbs_percent = (input_data.carbs_today / input_data.target_carbs * 100) if input_data.target_carbs else 0
            if carbs_percent > 80:
                health_alerts.append({
                    "type": "high_carbs",
                    "severity": "warning",
                    "title": "Glucides élevés",
                    "message": f"Vous avez consommé {carbs_percent:.0f}% de vos glucides. Attention à l'index glycémique.",
                    "icon": "🍞",
                    "action": "Privilégiez les glucides complexes",
                })

            # Ajouter stat glucides en priorité absolue
            health_alerts.insert(0, {
                "type": "carbs_tracking",
                "severity": "info",
                "title": "Suivi glucides",
                "message": f"{input_data.carbs_today:.0f}g / {input_data.target_carbs:.0f}g glucides",
                "icon": "📊",
                "show_always": True,
            })

        # Hypertension - alertes sur l'eau
        if "hypertension" in condition:
            if input_data.water_today < input_data.target_water * 0.5:
                health_alerts.append({
                    "type": "low_water",
                    "severity": "warning",
                    "title": "Hydratation insuffisante",
                    "message": "L'hydratation est importante pour la pression artérielle.",
                    "icon": "💧",
                    "action": "Buvez un verre d'eau",
                })

    def _get_age_category(self, age: int) -> str:
        """Détermine la catégorie d'âge."""
        if age < 25:
            return "young"
        elif age > 50:
            return "senior"
        return "adult"

    def _generate_insights(self, input_data: PersonalizerInput) -> list[dict]:
        """Génère des insights basés sur les données actuelles."""
        insights = []

        # Insight calories
        calories_percent = (input_data.calories_today / input_data.target_calories * 100) if input_data.target_calories else 0
        if calories_percent < 30 and input_data.time_of_day in ["afternoon", "evening"]:
            insights.append({
                "type": "low_calories",
                "title": "Calories faibles",
                "message": "Vous n'avez consommé que {:.0f}% de vos calories. N'oubliez pas de manger équilibré.".format(calories_percent),
                "icon": "🍽️",
                "priority": 1,
            })
        elif calories_percent > 100:
            insights.append({
                "type": "excess_calories",
                "title": "Objectif dépassé",
                "message": "Vous avez dépassé votre objectif calorique. Une activité physique pourrait équilibrer.",
                "icon": "🏃",
                "priority": 1,
            })

        # Insight protéines
        protein_percent = (input_data.protein_today / input_data.target_protein * 100) if input_data.target_protein else 0
        if protein_percent < 50 and input_data.time_of_day == "evening":
            insights.append({
                "type": "low_protein",
                "title": "Protéines à compléter",
                "message": "Il vous reste {:.0f}g de protéines à consommer aujourd'hui.".format(
                    input_data.target_protein - input_data.protein_today
                ),
                "icon": "💪",
                "priority": 2,
            })

        # Insight streak
        if input_data.streak_days >= 7:
            insights.append({
                "type": "streak_celebration",
                "title": "Excellente régularité!",
                "message": f"Vous êtes à {input_data.streak_days} jours consécutifs. Continuez!",
                "icon": "🔥",
                "priority": 3,
            })

        # Insight progression poids
        if input_data.weight_change_week:
            if input_data.goal == "lose_weight" and input_data.weight_change_week < 0:
                insights.append({
                    "type": "weight_progress",
                    "title": "Progression positive",
                    "message": f"Vous avez perdu {abs(input_data.weight_change_week):.1f}kg cette semaine.",
                    "icon": "📉",
                    "priority": 2,
                })
            elif input_data.goal == "gain_muscle" and input_data.weight_change_week > 0:
                insights.append({
                    "type": "weight_progress",
                    "title": "Progression positive",
                    "message": f"Vous avez pris {input_data.weight_change_week:.1f}kg cette semaine.",
                    "icon": "📈",
                    "priority": 2,
                })

        return insights

    def _generate_ui_config(self, input_data: PersonalizerInput, health_context: list) -> dict:
        """Génère la configuration UI personnalisée."""
        config = {
            "show_carbs_prominently": False,
            "show_fat_breakdown": False,
            "show_sodium_tracker": False,
            "show_hydration_prominently": False,
            "show_activity_prominently": False,
            "show_weight_tracker": False,
            "primary_color_theme": "default",
            "stats_layout": "standard",  # standard, compact, detailed
        }

        # Diabète -> glucides en évidence
        if any("diabetes" in c for c in health_context):
            config["show_carbs_prominently"] = True
            config["stats_layout"] = "detailed"

        # Hypertension -> sodium et hydratation
        if any("hypertension" in c for c in health_context):
            config["show_sodium_tracker"] = True
            config["show_hydration_prominently"] = True

        # Perte de poids -> activité et poids
        if "goal_lose_weight" in health_context:
            config["show_activity_prominently"] = True
            config["show_weight_tracker"] = True

        # Prise de muscle -> protéines
        if "goal_gain_muscle" in health_context:
            config["stats_layout"] = "detailed"

        # Keto -> graisses détaillées
        if "diet_keto" in health_context:
            config["show_fat_breakdown"] = True
            config["show_carbs_prominently"] = True

        # Senior -> hydratation
        if "age_senior" in health_context:
            config["show_hydration_prominently"] = True
            config["stats_layout"] = "compact"

        return config

    def _generate_profile_summary(self, input_data: PersonalizerInput) -> str:
        """Génère un résumé textuel du profil."""
        parts = []

        # Âge et genre
        gender_text = "Homme" if input_data.gender == "male" else "Femme" if input_data.gender == "female" else ""
        if gender_text:
            parts.append(f"{gender_text}, {input_data.age} ans")
        else:
            parts.append(f"{input_data.age} ans")

        # Objectif
        goal_mapping = {
            "lose_weight": "perte de poids",
            "gain_muscle": "prise de muscle",
            "maintain": "maintien",
            "improve_health": "amélioration santé",
        }
        if input_data.goal in goal_mapping:
            parts.append(f"Objectif: {goal_mapping[input_data.goal]}")

        # Régime
        if input_data.diet_type and input_data.diet_type != "omnivore":
            parts.append(f"Régime {input_data.diet_type}")

        # Conditions médicales
        if input_data.medical_conditions:
            parts.append(f"Suivi: {', '.join(input_data.medical_conditions[:2])}")

        return " • ".join(parts)

    async def _ai_enrichment(
        self,
        input_data: PersonalizerInput,
        base_result: PersonalizationResult
    ) -> dict | None:
        """Enrichissement optionnel par IA pour des insights plus personnalisés."""
        try:
            prompt = self._build_enrichment_prompt(input_data, base_result)

            raw_response = await self.client.text_chat(
                prompt=prompt,
                model_id=PERSONALIZER_MODELS[0],
                max_tokens=500,
                temperature=0.7,
            )

            if not raw_response:
                return None

            # Parser la réponse JSON
            json_match = re.search(r'\{[\s\S]*\}', raw_response)
            if json_match:
                return json.loads(json_match.group())
            return None

        except Exception as e:
            logger.warning("ai_enrichment_error", error=str(e))
            return None

    def _build_enrichment_prompt(
        self,
        input_data: PersonalizerInput,
        base_result: PersonalizationResult
    ) -> str:
        """Construit le prompt pour l'enrichissement IA."""
        return f"""Tu es un expert en nutrition personnalisée. Analyse ce profil et génère des insights supplémentaires.

PROFIL:
- Nom: {input_data.name}
- Âge: {input_data.age} ans
- Genre: {input_data.gender}
- Objectif: {input_data.goal}
- Régime: {input_data.diet_type}
- Conditions médicales: {', '.join(input_data.medical_conditions) if input_data.medical_conditions else 'Aucune'}
- Allergies: {', '.join(input_data.allergies) if input_data.allergies else 'Aucune'}
- Médicaments: {', '.join(input_data.medications) if input_data.medications else 'Aucun'}

STATS AUJOURD'HUI:
- Calories: {input_data.calories_today}/{input_data.target_calories}
- Protéines: {input_data.protein_today:.0f}/{input_data.target_protein:.0f}g
- Glucides: {input_data.carbs_today:.0f}/{input_data.target_carbs:.0f}g
- Eau: {input_data.water_today}/{input_data.target_water}ml
- Activité: {input_data.activity_minutes_today} min
- Streak: {input_data.streak_days} jours

CONTEXTE DÉTECTÉ: {', '.join(base_result.health_context)}

Génère une réponse JSON avec ce format:
{{
    "additional_insights": [
        {{
            "title": "Titre court",
            "message": "Message personnalisé et actionnable",
            "icon": "emoji approprié",
            "priority": 1-5
        }}
    ],
    "personalized_tip": "Un conseil très personnalisé basé sur l'ensemble du profil"
}}

Sois concis et pertinent. Maximum 2 insights supplémentaires."""

    def _merge_results(
        self,
        base: PersonalizationResult,
        ai_enrichment: dict
    ) -> PersonalizationResult:
        """Fusionne les résultats déterministes avec l'enrichissement IA."""
        # Ajouter les insights IA
        additional_insights = ai_enrichment.get("additional_insights", [])
        for insight in additional_insights:
            if insight not in base.insights:
                base.insights.append(insight)

        # Ajouter le tip personnalisé comme insight
        personalized_tip = ai_enrichment.get("personalized_tip")
        if personalized_tip:
            base.insights.insert(0, {
                "type": "ai_personalized",
                "title": "Conseil personnalisé",
                "message": personalized_tip,
                "icon": "🤖",
                "priority": 0,
            })

        # Limiter à 5 insights max
        base.insights = base.insights[:5]

        return base


def get_dashboard_personalizer_agent(language: str = DEFAULT_LANGUAGE) -> DashboardPersonalizerAgent:
    """Retourne une instance de l'agent personnaliseur de dashboard."""
    return DashboardPersonalizerAgent(language=language)
