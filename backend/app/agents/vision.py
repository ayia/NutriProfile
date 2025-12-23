import json
import re
import base64
from typing import Any

from app.agents.base import BaseAgent, AgentResponse
from app.llm.models import ModelCapability


class VisionInput:
    """Données d'entrée pour l'agent de vision."""

    def __init__(
        self,
        image_base64: str,
        image_type: str = "image/jpeg",
        context: str | None = None,
    ):
        self.image_base64 = image_base64
        self.image_type = image_type
        self.context = context  # Ex: "petit-déjeuner", "restaurant", etc.


class FoodItem:
    """Un aliment détecté dans l'image."""

    def __init__(
        self,
        name: str,
        quantity: str,
        unit: str,
        calories: int,
        protein: float,
        carbs: float,
        fat: float,
        confidence: float = 0.8,
    ):
        self.name = name
        self.quantity = quantity
        self.unit = unit
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fat = fat
        self.confidence = confidence

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "quantity": self.quantity,
            "unit": self.unit,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fat": self.fat,
            "confidence": self.confidence,
        }


class HealthReport:
    """Rapport de santé personnalisé basé sur le repas et le profil utilisateur."""

    def __init__(
        self,
        health_score: int = 50,
        goal_compatibility: int = 50,
        verdict: str = "neutral",
        verdict_color: str = "gray",
        summary: str = "",
        positive_points: list[str] | None = None,
        negative_points: list[str] | None = None,
        recommendations: list[str] | None = None,
        macro_analysis: dict | None = None,
        weekly_impact: dict | None = None,
        meal_timing_feedback: str | None = None,
    ):
        self.health_score = health_score  # 0-100 score global santé du repas
        self.goal_compatibility = goal_compatibility  # 0-100 compatibilité avec objectifs
        self.verdict = verdict  # "excellent", "good", "neutral", "poor", "bad"
        self.verdict_color = verdict_color  # Couleur pour UI: green, yellow, orange, red
        self.summary = summary  # Résumé en une phrase
        self.positive_points = positive_points or []
        self.negative_points = negative_points or []
        self.recommendations = recommendations or []
        self.macro_analysis = macro_analysis or {}
        self.weekly_impact = weekly_impact or {}  # Impact sur progression hebdo
        self.meal_timing_feedback = meal_timing_feedback  # Feedback selon l'heure

    def to_dict(self) -> dict:
        return {
            "health_score": self.health_score,
            "goal_compatibility": self.goal_compatibility,
            "verdict": self.verdict,
            "verdict_color": self.verdict_color,
            "summary": self.summary,
            "positive_points": self.positive_points,
            "negative_points": self.negative_points,
            "recommendations": self.recommendations,
            "macro_analysis": self.macro_analysis,
            "weekly_impact": self.weekly_impact,
            "meal_timing_feedback": self.meal_timing_feedback,
        }


class FoodAnalysis:
    """Résultat complet de l'analyse d'image."""

    def __init__(
        self,
        items: list[FoodItem],
        meal_type: str | None = None,
        total_calories: int = 0,
        total_protein: float = 0,
        total_carbs: float = 0,
        total_fat: float = 0,
        description: str = "",
        health_report: HealthReport | None = None,
    ):
        self.items = items
        self.meal_type = meal_type
        self.description = description
        self.health_report = health_report

        # Calcul des totaux si non fournis
        if total_calories == 0 and items:
            self.total_calories = sum(item.calories for item in items)
            self.total_protein = sum(item.protein for item in items)
            self.total_carbs = sum(item.carbs for item in items)
            self.total_fat = sum(item.fat for item in items)
        else:
            self.total_calories = total_calories
            self.total_protein = total_protein
            self.total_carbs = total_carbs
            self.total_fat = total_fat

    def to_dict(self) -> dict:
        return {
            "items": [item.to_dict() for item in self.items],
            "meal_type": self.meal_type,
            "total_calories": self.total_calories,
            "total_protein": round(self.total_protein, 1),
            "total_carbs": round(self.total_carbs, 1),
            "total_fat": round(self.total_fat, 1),
            "description": self.description,
            "health_report": self.health_report.to_dict() if self.health_report else None,
        }


class VisionAgent(BaseAgent[VisionInput, FoodAnalysis]):
    """
    Agent d'analyse d'images alimentaires.

    Utilise des modèles vision-language pour:
    - Identifier les aliments dans une photo
    - Estimer les portions
    - Calculer les valeurs nutritionnelles
    """

    name = "VisionAgent"
    capability = ModelCapability.FOOD_DETECTION
    confidence_threshold = 0.5
    vlm_model = "Qwen/Qwen2.5-VL-72B-Instruct"

    async def process(self, input_data: VisionInput, model=None) -> AgentResponse:
        """
        Traitement spécifique pour la vision utilisant l'API VLM.
        Override la méthode de base pour utiliser vision_chat.
        """
        import structlog

        logger = structlog.get_logger()

        prompt = self.build_prompt(input_data)

        logger.info(
            "vision_agent_processing",
            agent=self.name,
            model=self.vlm_model,
        )

        try:
            # Utiliser la nouvelle méthode vision_chat
            raw_response = await self.client.vision_chat(
                image_base64=input_data.image_base64,
                prompt=prompt,
                model_id=self.vlm_model,
                max_tokens=800,
            )

            if not raw_response:
                logger.warning("vision_empty_response")
                return await self.fallback(input_data)

            result = self.parse_response(raw_response, input_data)
            confidence = self.calculate_confidence(result, raw_response)

            logger.info(
                "vision_agent_response",
                agent=self.name,
                model=self.vlm_model,
                confidence=confidence,
                items_count=len(result.items),
            )

            return AgentResponse(
                result=result,
                confidence=confidence,
                model_used=self.vlm_model,
                reasoning=result.description,
                used_fallback=False,
            )

        except Exception as e:
            logger.error(
                "vision_agent_error",
                agent=self.name,
                model=self.vlm_model,
                error=str(e),
            )
            return await self.fallback(input_data)

    def build_prompt(self, input_data: VisionInput) -> str:
        """Construit le prompt pour l'analyse d'image."""
        context_hint = ""
        if input_data.context:
            context_hint = f"\nContexte: C'est un {input_data.context}."

        return f"""Analyse cette image de nourriture et identifie tous les aliments visibles.
{context_hint}

Pour chaque aliment détecté, estime:
1. Le nom de l'aliment
2. La quantité approximative
3. L'unité (g, ml, pièce, portion, etc.)
4. Les valeurs nutritionnelles estimées

Réponds UNIQUEMENT en JSON avec ce format exact:
{{
    "description": "Description courte du repas",
    "meal_type": "breakfast|lunch|dinner|snack",
    "items": [
        {{
            "name": "nom de l'aliment",
            "quantity": "100",
            "unit": "g",
            "calories": 150,
            "protein": 5.0,
            "carbs": 20.0,
            "fat": 3.0,
            "confidence": 0.85
        }}
    ]
}}

Sois précis sur les portions. Pour les plats composés, décompose les ingrédients principaux.
Base tes estimations sur des valeurs nutritionnelles moyennes connues."""

    def build_vision_request(self, input_data: VisionInput) -> dict:
        """Construit la requête pour un modèle vision."""
        return {
            "image": input_data.image_base64,
            "image_type": input_data.image_type,
            "prompt": self.build_prompt(input_data),
        }

    def parse_response(self, raw_response: str, input_data: VisionInput) -> FoodAnalysis:
        """Parse la réponse LLM en objet FoodAnalysis."""
        try:
            # Chercher le JSON dans la réponse
            json_match = re.search(r'\{[\s\S]*\}', raw_response)
            if json_match:
                data = json.loads(json_match.group())

                items = []
                for item_data in data.get("items", []):
                    items.append(FoodItem(
                        name=item_data.get("name", "Aliment inconnu"),
                        quantity=str(item_data.get("quantity", "1")),
                        unit=item_data.get("unit", "portion"),
                        calories=int(item_data.get("calories", 0)),
                        protein=float(item_data.get("protein", 0)),
                        carbs=float(item_data.get("carbs", 0)),
                        fat=float(item_data.get("fat", 0)),
                        confidence=float(item_data.get("confidence", 0.7)),
                    ))

                return FoodAnalysis(
                    items=items,
                    meal_type=data.get("meal_type"),
                    description=data.get("description", ""),
                )
            else:
                raise ValueError("No JSON found in response")

        except (json.JSONDecodeError, ValueError):
            return self.deterministic_fallback(input_data)

    def calculate_confidence(self, result: FoodAnalysis, raw_response: str) -> float:
        """Calcule le score de confiance global."""
        if not result.items:
            return 0.3

        # Moyenne des confiances individuelles
        avg_confidence = sum(item.confidence for item in result.items) / len(result.items)

        # Bonus si on a une description et un type de repas
        if result.description:
            avg_confidence += 0.05
        if result.meal_type:
            avg_confidence += 0.05

        return min(avg_confidence, 1.0)

    def deterministic_fallback(self, input_data: VisionInput) -> FoodAnalysis:
        """Fallback quand l'analyse échoue."""
        # Retourner un résultat minimal demandant une correction manuelle
        return FoodAnalysis(
            items=[
                FoodItem(
                    name="Repas non identifié",
                    quantity="1",
                    unit="portion",
                    calories=500,
                    protein=20,
                    carbs=50,
                    fat=20,
                    confidence=0.3,
                )
            ],
            meal_type=input_data.context or "lunch",
            description="Analyse automatique non disponible. Veuillez corriger manuellement.",
        )


# Tables de référence nutritionnelle pour validation
NUTRITION_REFERENCE = {
    # Fruits
    "pomme": {"calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2, "unit": "100g"},
    "banane": {"calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3, "unit": "100g"},
    "orange": {"calories": 47, "protein": 0.9, "carbs": 12, "fat": 0.1, "unit": "100g"},

    # Protéines
    "poulet": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "unit": "100g"},
    "saumon": {"calories": 208, "protein": 20, "carbs": 0, "fat": 13, "unit": "100g"},
    "oeuf": {"calories": 155, "protein": 13, "carbs": 1.1, "fat": 11, "unit": "100g"},
    "boeuf": {"calories": 250, "protein": 26, "carbs": 0, "fat": 15, "unit": "100g"},

    # Féculents
    "riz": {"calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3, "unit": "100g"},
    "pâtes": {"calories": 131, "protein": 5, "carbs": 25, "fat": 1.1, "unit": "100g"},
    "pain": {"calories": 265, "protein": 9, "carbs": 49, "fat": 3.2, "unit": "100g"},
    "pomme de terre": {"calories": 77, "protein": 2, "carbs": 17, "fat": 0.1, "unit": "100g"},

    # Légumes
    "salade": {"calories": 15, "protein": 1.4, "carbs": 2.9, "fat": 0.2, "unit": "100g"},
    "tomate": {"calories": 18, "protein": 0.9, "carbs": 3.9, "fat": 0.2, "unit": "100g"},
    "carotte": {"calories": 41, "protein": 0.9, "carbs": 10, "fat": 0.2, "unit": "100g"},
    "brocoli": {"calories": 34, "protein": 2.8, "carbs": 7, "fat": 0.4, "unit": "100g"},

    # Produits laitiers
    "yaourt": {"calories": 59, "protein": 10, "carbs": 3.6, "fat": 0.7, "unit": "100g"},
    "fromage": {"calories": 402, "protein": 25, "carbs": 1.3, "fat": 33, "unit": "100g"},
    "lait": {"calories": 42, "protein": 3.4, "carbs": 5, "fat": 1, "unit": "100ml"},
}


def validate_nutrition(item: FoodItem) -> FoodItem:
    """Valide et corrige les valeurs nutritionnelles si aberrantes."""
    name_lower = item.name.lower()

    # Chercher une correspondance dans la référence
    for ref_name, ref_values in NUTRITION_REFERENCE.items():
        if ref_name in name_lower:
            # Vérifier si les valeurs sont plausibles (tolérance de 50%)
            if item.calories > ref_values["calories"] * 3:
                # Valeur aberrante, utiliser la référence
                try:
                    qty = float(item.quantity)
                    factor = qty / 100 if item.unit == "g" else 1
                except ValueError:
                    factor = 1

                return FoodItem(
                    name=item.name,
                    quantity=item.quantity,
                    unit=item.unit,
                    calories=int(ref_values["calories"] * factor),
                    protein=ref_values["protein"] * factor,
                    carbs=ref_values["carbs"] * factor,
                    fat=ref_values["fat"] * factor,
                    confidence=item.confidence * 0.8,  # Réduire la confiance
                )
            break

    return item


def get_vision_agent() -> VisionAgent:
    """Retourne une instance de l'agent vision."""
    return VisionAgent()


def _calculate_weekly_impact(
    meal_calories: int,
    target_calories: int,
    goal: str,
    daily_consumed: dict | None = None,
) -> dict:
    """
    Calcule l'impact de ce repas sur la progression hebdomadaire.
    """
    consumed_today = daily_consumed.get("calories", 0) if daily_consumed else 0
    total_today = consumed_today + meal_calories

    # Surplus ou déficit par rapport à l'objectif
    daily_diff = total_today - target_calories

    # Impact estimé sur le poids (3500 kcal = ~0.5kg)
    if goal == "lose_weight":
        if daily_diff < 0:
            # Déficit = bon pour perte de poids
            weekly_deficit = abs(daily_diff) * 7
            estimated_loss = round(weekly_deficit / 7700, 2)  # kg par semaine
            return {
                "status": "on_track",
                "message": f"En gardant ce rythme, vous pourriez perdre ~{estimated_loss}kg/semaine",
                "daily_balance": daily_diff,
                "trend": "positive",
            }
        else:
            return {
                "status": "over_target",
                "message": f"Vous êtes à +{daily_diff} kcal aujourd'hui. Équilibrez demain.",
                "daily_balance": daily_diff,
                "trend": "negative",
            }
    elif goal == "gain_muscle":
        if daily_diff > 0:
            # Surplus = bon pour prise de masse
            weekly_surplus = daily_diff * 7
            estimated_gain = round(weekly_surplus / 7700, 2)
            return {
                "status": "on_track",
                "message": f"Bon surplus calorique pour la prise de masse (+{daily_diff} kcal)",
                "daily_balance": daily_diff,
                "trend": "positive",
            }
        else:
            return {
                "status": "under_target",
                "message": f"Déficit de {abs(daily_diff)} kcal - augmentez l'apport pour la prise de masse",
                "daily_balance": daily_diff,
                "trend": "negative",
            }
    else:
        # Maintien
        if abs(daily_diff) <= target_calories * 0.1:
            return {
                "status": "balanced",
                "message": "Apport équilibré pour le maintien",
                "daily_balance": daily_diff,
                "trend": "neutral",
            }
        elif daily_diff > 0:
            return {
                "status": "over_target",
                "message": f"Léger surplus de {daily_diff} kcal",
                "daily_balance": daily_diff,
                "trend": "warning",
            }
        else:
            return {
                "status": "under_target",
                "message": f"Léger déficit de {abs(daily_diff)} kcal",
                "daily_balance": daily_diff,
                "trend": "warning",
            }


def _get_meal_timing_feedback(
    current_hour: int,
    meal_calories: int,
    meal_carbs: float,
    meal_protein: float,
) -> str:
    """
    Génère un feedback basé sur l'heure du repas et sa composition.
    """
    if 5 <= current_hour < 10:
        # Petit-déjeuner
        if meal_carbs >= 30:
            return "Bon timing! Les glucides du matin fournissent l'énergie pour la journée."
        elif meal_protein >= 20:
            return "Bon apport en protéines pour bien démarrer la journée."
        else:
            return "Le petit-déjeuner est idéal pour les glucides complexes et protéines."

    elif 11 <= current_hour < 14:
        # Déjeuner
        if meal_protein >= 25 and meal_calories >= 400:
            return "Déjeuner équilibré - parfait pour maintenir l'énergie l'après-midi."
        elif meal_calories < 300:
            return "Déjeuner léger - prévoyez un encas sain en après-midi."
        else:
            return "Bon moment pour un repas complet et équilibré."

    elif 14 <= current_hour < 17:
        # Encas après-midi
        if meal_calories <= 200:
            return "Encas raisonnable pour éviter les fringales du soir."
        elif meal_calories > 400:
            return "Cet encas est copieux - allégez le dîner en conséquence."
        else:
            return "Encas modéré - attention à ne pas trop manger ce soir."

    elif 18 <= current_hour < 21:
        # Dîner
        if meal_carbs < 40 and meal_protein >= 20:
            return "Dîner idéal: protéines et peu de glucides pour un bon sommeil."
        elif meal_calories > 800:
            return "Dîner copieux - évitez de manger trop tard pour la digestion."
        else:
            return "Dîner raisonnable - évitez les sucres rapides avant le coucher."

    elif current_hour >= 21 or current_hour < 5:
        # Repas tardif
        if meal_calories > 300:
            return "Repas tardif et calorique - peut affecter le sommeil et le métabolisme."
        elif meal_protein >= 15:
            return "Collation tardive protéinée - acceptable pour la récupération musculaire."
        else:
            return "Manger tard peut perturber le sommeil. Privilégiez des repas plus tôt."

    return "Bon appétit!"


def calculate_health_report(
    analysis: FoodAnalysis,
    user_profile: dict | None = None,
    daily_consumed: dict | None = None,
    activities_today: dict | None = None,
    weight_trend: dict | None = None,
    meal_history: dict | None = None,
) -> HealthReport:
    """
    Calcule un rapport de santé personnalisé ultra-complet basé sur:
    - L'analyse du repas
    - Le profil utilisateur complet (objectifs, régime, allergies, conditions médicales)
    - Ce qui a déjà été consommé dans la journée
    - Les activités physiques du jour (calories brûlées)
    - La tendance de poids (7 derniers jours)
    - L'historique alimentaire récent (variété, patterns)
    """
    positive_points = []
    negative_points = []
    recommendations = []
    health_score = 50
    goal_compatibility = 50

    # === EXTRACTION DES DONNÉES DU PROFIL ===
    target_calories = user_profile.get("daily_calories", 2000) if user_profile else 2000
    target_protein = user_profile.get("protein_g", 60) if user_profile else 60
    target_carbs = user_profile.get("carbs_g", 250) if user_profile else 250
    target_fat = user_profile.get("fat_g", 65) if user_profile else 65
    goal = user_profile.get("goal", "maintain") if user_profile else "maintain"
    diet_type = user_profile.get("diet_type", "omnivore") if user_profile else "omnivore"
    allergies = user_profile.get("allergies", []) if user_profile else []
    excluded_foods = user_profile.get("excluded_foods", []) if user_profile else []

    # Données physiques
    age = user_profile.get("age") if user_profile else None
    gender = user_profile.get("gender") if user_profile else None
    weight_kg = user_profile.get("weight_kg") if user_profile else None
    height_cm = user_profile.get("height_cm") if user_profile else None
    target_weight_kg = user_profile.get("target_weight_kg") if user_profile else None
    activity_level = user_profile.get("activity_level", "moderate") if user_profile else "moderate"

    # Données métaboliques
    bmr = user_profile.get("bmr") if user_profile else None
    tdee = user_profile.get("tdee") if user_profile else None

    # Données de santé
    medical_conditions = user_profile.get("medical_conditions", []) if user_profile else []
    medications = user_profile.get("medications", []) if user_profile else []

    # === DONNÉES DE CONSOMMATION DU JOUR ===
    consumed_calories = daily_consumed.get("calories", 0) if daily_consumed else 0
    consumed_protein = daily_consumed.get("protein", 0) if daily_consumed else 0
    consumed_carbs = daily_consumed.get("carbs", 0) if daily_consumed else 0
    consumed_fat = daily_consumed.get("fat", 0) if daily_consumed else 0
    water_ml = daily_consumed.get("water_ml", 0) if daily_consumed else 0
    meals_count = daily_consumed.get("meals_count", 0) if daily_consumed else 0

    # === DONNÉES D'ACTIVITÉ DU JOUR ===
    calories_burned_today = activities_today.get("calories_burned", 0) if activities_today else 0
    activity_minutes_today = activities_today.get("duration_minutes", 0) if activities_today else 0
    activity_types_today = activities_today.get("activity_types", []) if activities_today else []

    # === DONNÉES DE POIDS (TENDANCE) ===
    weight_change_7d = weight_trend.get("change_7d") if weight_trend else None
    weight_trend_direction = weight_trend.get("direction") if weight_trend else None  # "losing", "gaining", "stable"
    days_to_goal = weight_trend.get("days_to_goal") if weight_trend else None

    # === HISTORIQUE ALIMENTAIRE ===
    recent_foods = meal_history.get("recent_foods", []) if meal_history else []
    variety_score = meal_history.get("variety_score", 50) if meal_history else 50
    avg_daily_calories_7d = meal_history.get("avg_calories_7d") if meal_history else None

    # === CALCULS AJUSTÉS AVEC ACTIVITÉ ===
    # Calories nettes = consommées - brûlées par exercice
    net_calories_today = consumed_calories - calories_burned_today

    # Budget calorique ajusté (TDEE - déficit/surplus selon objectif)
    adjusted_target = target_calories + calories_burned_today  # Plus de marge si actif
    remaining_calories = adjusted_target - consumed_calories

    meal_calories = analysis.total_calories
    meal_protein = analysis.total_protein
    meal_carbs = analysis.total_carbs
    meal_fat = analysis.total_fat

    # === ANALYSE DES MACROS DU REPAS ===
    meal_ratio = meal_calories / target_calories * 100 if target_calories > 0 else 0
    protein_ratio = meal_protein / target_protein * 100 if target_protein > 0 else 0

    # Ratio typique par repas (25-35% des calories journalières)
    if 20 <= meal_ratio <= 40:
        positive_points.append("Portion caloriquement équilibrée pour un repas")
        health_score += 10
    elif meal_ratio > 50:
        negative_points.append(f"Ce repas représente {meal_ratio:.0f}% de vos calories journalières")
        health_score -= 15
        recommendations.append("Privilégiez des portions plus petites aux prochains repas")
    elif meal_ratio < 15:
        negative_points.append("Repas très léger, risque de fringale")
        recommendations.append("Ajoutez une source de protéines pour plus de satiété")

    # === ANALYSE DES PROTÉINES ===
    if meal_protein >= 20:
        positive_points.append(f"Bonne source de protéines ({meal_protein:.0f}g)")
        health_score += 10
    elif meal_protein < 10:
        negative_points.append("Faible en protéines")
        recommendations.append("Ajoutez œufs, légumineuses ou viande maigre")

    # === ANALYSE SELON L'OBJECTIF ===
    if goal == "lose_weight":
        if meal_calories <= remaining_calories * 0.35:
            positive_points.append("Compatible avec votre objectif de perte de poids")
            goal_compatibility += 20
        elif meal_calories > remaining_calories * 0.5:
            negative_points.append("Repas calorique pour un objectif de perte de poids")
            goal_compatibility -= 20
            recommendations.append("Réduisez les portions ou choisissez des aliments moins caloriques")

        if meal_protein >= 25:
            positive_points.append("Riche en protéines - favorise la satiété")
            goal_compatibility += 10

        # Feedback basé sur la tendance de poids
        if weight_trend_direction == "losing":
            positive_points.append("Votre poids diminue - continuez ainsi!")
            goal_compatibility += 10
        elif weight_trend_direction == "gaining":
            negative_points.append("Attention: votre poids augmente cette semaine")
            recommendations.append("Réduisez légèrement les portions pour inverser la tendance")
            goal_compatibility -= 10

    elif goal == "gain_muscle":
        if meal_protein >= 30:
            positive_points.append("Excellent apport protéique pour la prise de muscle")
            goal_compatibility += 25
        elif meal_protein < 20:
            negative_points.append("Insuffisant en protéines pour la prise de masse")
            goal_compatibility -= 15
            recommendations.append("Visez au moins 30g de protéines par repas")

        # Vérifier l'apport calorique suffisant
        if net_calories_today + meal_calories < tdee * 0.9 if tdee else False:
            recommendations.append("Vous êtes en déficit calorique - mangez plus pour prendre du muscle")

    elif goal == "improve_health":
        # Vérifier la présence de légumes/fibres
        has_vegetables = any(
            any(veg in item.name.lower() for veg in ["salade", "légume", "brocoli", "carotte", "tomate", "épinard", "courgette"])
            for item in analysis.items
        )
        if has_vegetables:
            positive_points.append("Contient des légumes - bon pour la santé")
            health_score += 15
            goal_compatibility += 15
        else:
            recommendations.append("Ajoutez des légumes pour plus de fibres et vitamines")

    # === INTÉGRATION DES ACTIVITÉS DU JOUR ===
    if calories_burned_today > 0:
        positive_points.append(f"Bravo! Vous avez brûlé {calories_burned_today} kcal aujourd'hui")
        health_score += 5

        # Ajuster les recommandations si très actif
        if calories_burned_today > 400:
            if meal_protein < 25:
                recommendations.append("Après l'effort, augmentez les protéines pour la récupération")
            if meal_carbs < 30:
                recommendations.append("Ajoutez des glucides complexes pour recharger vos réserves")

    if activity_minutes_today > 30:
        positive_points.append(f"{activity_minutes_today} minutes d'activité aujourd'hui")

    # === ANALYSE SELON L'ÂGE ET LE GENRE ===
    if age:
        if age >= 50:
            # Plus de 50 ans: emphase sur protéines et calcium
            if meal_protein < 20:
                recommendations.append("À votre âge, les protéines sont essentielles pour préserver la masse musculaire")
            if any(d in [item.name.lower() for item in analysis.items] for d in ["fromage", "lait", "yaourt"]):
                positive_points.append("Bon apport en calcium pour la santé osseuse")
                health_score += 5
        elif age < 25:
            # Jeunes: plus de flexibilité mais vigilance sur la nutrition
            if meal_calories > target_calories * 0.5:
                recommendations.append("Même jeune, surveillez les portions pour de bonnes habitudes")

    if gender == "female":
        # Femmes: attention au fer
        iron_rich = ["viande", "boeuf", "épinard", "lentilles", "haricots"]
        has_iron = any(any(f in item.name.lower() for f in iron_rich) for item in analysis.items)
        if has_iron:
            positive_points.append("Bon apport en fer")
            health_score += 5

    # === CONDITIONS MÉDICALES ===
    if medical_conditions:
        # Diabète
        if any("diabète" in c.lower() or "diabetes" in c.lower() for c in medical_conditions):
            if meal_carbs > 50:
                negative_points.append("⚠️ Attention: repas riche en glucides (diabète)")
                health_score -= 15
                recommendations.append("Limitez les glucides simples et privilégiez les fibres")
            sugar_items = ["sucre", "gâteau", "bonbon", "soda", "jus"]
            if any(any(s in item.name.lower() for s in sugar_items) for item in analysis.items):
                negative_points.append("⚠️ Contient des sucres rapides (déconseillé pour diabète)")
                health_score -= 20

        # Hypertension
        if any("hypertension" in c.lower() or "tension" in c.lower() for c in medical_conditions):
            salty_items = ["fromage", "charcuterie", "jambon", "chips", "frites"]
            if any(any(s in item.name.lower() for s in salty_items) for item in analysis.items):
                negative_points.append("⚠️ Aliments potentiellement riches en sel (hypertension)")
                health_score -= 10
                recommendations.append("Préférez des aliments pauvres en sodium")

        # Cholestérol
        if any("cholestérol" in c.lower() or "cholesterol" in c.lower() for c in medical_conditions):
            if meal_fat > 25:
                negative_points.append("Repas riche en graisses (attention au cholestérol)")
                health_score -= 10
            fatty_items = ["beurre", "crème", "friture", "bacon"]
            if any(any(f in item.name.lower() for f in fatty_items) for item in analysis.items):
                recommendations.append("Limitez les graisses saturées pour votre cholestérol")

    # === INTERACTIONS MÉDICAMENTS ===
    if medications:
        # Anticoagulants et vitamine K
        if any("warfarin" in m.lower() or "coumadin" in m.lower() or "anticoagulant" in m.lower() for m in medications):
            vit_k_foods = ["épinard", "brocoli", "chou", "laitue"]
            if any(any(v in item.name.lower() for v in vit_k_foods) for item in analysis.items):
                negative_points.append("⚠️ Aliment riche en vitamine K (attention avec anticoagulants)")
                recommendations.append("Consultez votre médecin sur la consommation de légumes verts")

        # Statines et pamplemousse
        if any("statine" in m.lower() or "atorvastatine" in m.lower() or "simvastatine" in m.lower() for m in medications):
            if any("pamplemousse" in item.name.lower() for item in analysis.items):
                negative_points.append("⚠️ Le pamplemousse interagit avec les statines!")
                health_score -= 25

    # === VÉRIFICATION ALLERGIES ET EXCLUSIONS ===
    for item in analysis.items:
        item_lower = item.name.lower()
        for allergen in allergies:
            if allergen.lower() in item_lower:
                negative_points.append(f"⚠️ ATTENTION: Contient potentiellement {allergen}")
                health_score -= 30
                goal_compatibility -= 30

        for excluded in excluded_foods:
            if excluded.lower() in item_lower:
                negative_points.append(f"Contient {excluded} (aliment exclu)")
                goal_compatibility -= 10

    # === VÉRIFICATION DU RÉGIME ALIMENTAIRE ===
    meat_items = ["poulet", "boeuf", "porc", "agneau", "viande", "steak", "jambon", "bacon"]
    fish_items = ["poisson", "saumon", "thon", "crevette", "fruits de mer"]
    dairy_items = ["fromage", "lait", "yaourt", "crème", "beurre"]

    has_meat = any(any(m in item.name.lower() for m in meat_items) for item in analysis.items)
    has_fish = any(any(f in item.name.lower() for f in fish_items) for item in analysis.items)
    has_dairy = any(any(d in item.name.lower() for d in dairy_items) for item in analysis.items)

    if diet_type == "vegetarian" and has_meat:
        negative_points.append("Contient de la viande (régime végétarien)")
        goal_compatibility -= 25
    elif diet_type == "vegan" and (has_meat or has_fish or has_dairy):
        negative_points.append("Contient des produits animaux (régime vegan)")
        goal_compatibility -= 25
    elif diet_type == "pescatarian" and has_meat:
        negative_points.append("Contient de la viande (régime pescétarien)")
        goal_compatibility -= 25
    elif diet_type == "keto":
        if meal_carbs > 20:
            negative_points.append(f"Trop de glucides ({meal_carbs:.0f}g) pour un régime keto")
            goal_compatibility -= 20
        if meal_fat < meal_protein:
            recommendations.append("En keto, privilégiez les lipides aux protéines")
    elif diet_type == "mediterranean":
        if has_fish or any("huile d'olive" in item.name.lower() for item in analysis.items):
            positive_points.append("Conforme au régime méditerranéen")
            goal_compatibility += 10

    # === ANALYSE DE VARIÉTÉ (HISTORIQUE) ===
    if recent_foods:
        current_items = [item.name.lower() for item in analysis.items]
        repeated = [f for f in recent_foods if any(f.lower() in ci for ci in current_items)]
        if len(repeated) > 2:
            recommendations.append("Variez votre alimentation - vous mangez souvent les mêmes aliments")
            health_score -= 5
        if variety_score < 40:
            recommendations.append("Essayez de nouveaux aliments pour plus de nutriments variés")

    # === HYDRATATION ===
    if water_ml < 1500:
        recommendations.append(f"N'oubliez pas l'eau! Seulement {water_ml}ml aujourd'hui")
    elif water_ml >= 2000:
        positive_points.append("Bonne hydratation aujourd'hui")
        health_score += 5

    # === IMPACT SUR CALORIES RESTANTES ===
    new_remaining = remaining_calories - meal_calories
    if new_remaining < 0:
        negative_points.append(f"Vous dépassez vos objectifs caloriques de {abs(new_remaining):.0f} kcal")
        goal_compatibility -= 20
    elif new_remaining < target_calories * 0.15:
        recommendations.append(f"Il vous reste {new_remaining:.0f} kcal pour le reste de la journée")

    # === CALCULER LES SCORES FINAUX ===
    health_score = max(0, min(100, health_score))
    goal_compatibility = max(0, min(100, goal_compatibility))

    # Déterminer le verdict avec couleur
    avg_score = (health_score + goal_compatibility) / 2
    if avg_score >= 80:
        verdict = "excellent"
        verdict_color = "green"
        summary = "Excellent choix! Ce repas est parfaitement adapté à votre profil."
    elif avg_score >= 65:
        verdict = "good"
        verdict_color = "emerald"
        summary = "Bon choix! Ce repas contribue positivement à vos objectifs."
    elif avg_score >= 45:
        verdict = "neutral"
        verdict_color = "yellow"
        summary = "Repas acceptable. Quelques ajustements pourraient l'améliorer."
    elif avg_score >= 30:
        verdict = "poor"
        verdict_color = "orange"
        summary = "Ce repas n'est pas idéal pour vos objectifs. Considérez les recommandations."
    else:
        verdict = "bad"
        verdict_color = "red"
        summary = "Attention! Ce repas ne correspond pas à votre profil nutritionnel."

    # === ANALYSE DES MACROS ENRICHIE POUR LE FRONTEND ===
    macro_analysis = {
        "calories": {
            "value": meal_calories,
            "target_meal": int(target_calories * 0.3),
            "percent_daily": round(meal_ratio, 1),
            "remaining_today": max(0, int(remaining_calories - meal_calories)),
            "burned_today": calories_burned_today,
            "net_today": net_calories_today + meal_calories,
        },
        "protein": {
            "value": round(meal_protein, 1),
            "target_meal": int(target_protein * 0.3),
            "percent_daily": round(protein_ratio, 1),
            "consumed_today": round(consumed_protein + meal_protein, 1),
        },
        "carbs": {
            "value": round(meal_carbs, 1),
            "percent_daily": round(meal_carbs / target_carbs * 100, 1) if target_carbs > 0 else 0,
            "consumed_today": round(consumed_carbs + meal_carbs, 1),
        },
        "fat": {
            "value": round(meal_fat, 1),
            "percent_daily": round(meal_fat / target_fat * 100, 1) if target_fat > 0 else 0,
            "consumed_today": round(consumed_fat + meal_fat, 1),
        },
        "activity": {
            "minutes_today": activity_minutes_today,
            "calories_burned": calories_burned_today,
            "types": activity_types_today[:3] if activity_types_today else [],
        },
        "hydration": {
            "water_ml": water_ml,
            "target_ml": 2500,
            "percent": round(water_ml / 2500 * 100, 1),
        },
    }

    # === IMPACT HEBDOMADAIRE ENRICHI ===
    weekly_impact = _calculate_weekly_impact(
        meal_calories=meal_calories,
        target_calories=target_calories,
        goal=goal,
        daily_consumed=daily_consumed,
    )

    # Enrichir avec la tendance de poids
    if weight_trend:
        weekly_impact["weight_trend"] = {
            "change_7d": weight_change_7d,
            "direction": weight_trend_direction,
            "days_to_goal": days_to_goal,
        }
        if weight_change_7d is not None:
            if goal == "lose_weight" and weight_change_7d < 0:
                weekly_impact["message"] = f"Excellente progression! -{abs(weight_change_7d):.1f}kg cette semaine"
            elif goal == "gain_muscle" and weight_change_7d > 0:
                weekly_impact["message"] = f"Bonne prise de masse: +{weight_change_7d:.1f}kg cette semaine"

    # Feedback basé sur l'heure du repas
    from datetime import datetime
    current_hour = datetime.now().hour
    meal_timing_feedback = _get_meal_timing_feedback(
        current_hour=current_hour,
        meal_calories=meal_calories,
        meal_carbs=meal_carbs,
        meal_protein=meal_protein,
    )

    return HealthReport(
        health_score=health_score,
        goal_compatibility=goal_compatibility,
        verdict=verdict,
        verdict_color=verdict_color,
        summary=summary,
        positive_points=positive_points,
        negative_points=negative_points,
        recommendations=recommendations,
        macro_analysis=macro_analysis,
        weekly_impact=weekly_impact,
        meal_timing_feedback=meal_timing_feedback,
    )
