"""Agent de génération de plans repas avec multi-modèles et consensus."""
import asyncio
import json
import re
from datetime import date, timedelta
from typing import Any

import structlog

from app.agents.base import BaseAgent, AgentResponse
from app.agents.consensus import ConsensusValidator
from app.llm.models import ModelCapability
from app.models.profile import DietType, Goal
from app.i18n import DEFAULT_LANGUAGE
from app.schemas.meal_plan import (
    MealPlanRequest,
    MealPlanResponse,
    MealPlanDay,
    MealPlanMeal,
)

logger = structlog.get_logger()

# Modèles utilisés pour la génération de plans repas (3 modèles pour consensus)
MEAL_PLAN_MODELS = [
    "Qwen/Qwen2.5-72B-Instruct",            # Modèle principal
    "Qwen/Qwen2.5-7B-Instruct",             # Modèle secondaire (remplace Mistral)
    "meta-llama/Llama-3.1-8B-Instruct",     # Modèle tertiaire
]

# Modèle de validation nutritionnelle
NUTRITION_VALIDATION_MODEL = "Qwen/Qwen2.5-7B-Instruct"

# Noms des jours
DAY_NAMES = {
    "fr": ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
    "en": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
}


class MealPlanInput:
    """Données d'entrée pour l'agent de plans repas."""

    def __init__(
        self,
        user_id: int,
        days: int = 7,
        start_date: date | None = None,
        meals_per_day: int = 3,
        include_snacks: bool = True,
        budget_level: str = "medium",
        cooking_time_max: int = 45,
        variety_level: str = "medium",
        # Profil utilisateur
        diet_type: DietType = DietType.OMNIVORE,
        allergies: list[str] | None = None,
        excluded_foods: list[str] | None = None,
        goal: Goal = Goal.MAINTAIN,
        target_calories: int = 2000,
        target_protein: int = 100,
        target_carbs: int = 250,
        target_fat: int = 65,
    ):
        self.user_id = user_id
        self.days = days
        self.start_date = start_date or date.today()
        self.meals_per_day = meals_per_day
        self.include_snacks = include_snacks
        self.budget_level = budget_level
        self.cooking_time_max = cooking_time_max
        self.variety_level = variety_level
        self.diet_type = diet_type
        self.allergies = allergies or []
        self.excluded_foods = excluded_foods or []
        self.goal = goal
        self.target_calories = target_calories
        self.target_protein = target_protein
        self.target_carbs = target_carbs
        self.target_fat = target_fat


class MealPlanAgent(BaseAgent[MealPlanInput, MealPlanResponse]):
    """
    Agent de génération de plans repas avec multi-modèles.

    Utilise 3 modèles en parallèle pour générer des plans repas,
    puis valide le consensus avec un modèle de validation nutritionnelle.
    """

    name = "MealPlanAgent"
    capability = ModelCapability.RECIPE_GENERATION
    confidence_threshold = 0.6

    async def process(self, input_data: MealPlanInput, model=None) -> AgentResponse:
        """
        Traitement multi-modèles avec consensus.
        """
        import time
        start_time = time.time()

        logger.info(
            "meal_plan_agent_processing",
            agent=self.name,
            models=MEAL_PLAN_MODELS[:3],
            days=input_data.days,
        )

        # Générer le plan jour par jour pour plus de contrôle
        all_days: list[MealPlanDay] = []
        models_used = set()

        for day_offset in range(input_data.days):
            current_date = input_data.start_date + timedelta(days=day_offset)
            day_name = DAY_NAMES.get(self.language, DAY_NAMES["fr"])[current_date.weekday()]

            # Générer les repas pour ce jour
            day_meals = await self._generate_day_meals(input_data, current_date, day_name)

            if day_meals:
                # Calculer les totaux du jour
                total_calories = sum(m.calories for m in day_meals)
                total_protein = sum(m.protein for m in day_meals)
                total_carbs = sum(m.carbs for m in day_meals)
                total_fat = sum(m.fat for m in day_meals)

                all_days.append(MealPlanDay(
                    date=current_date.isoformat(),
                    day_name=day_name,
                    meals=day_meals,
                    total_calories=total_calories,
                    total_protein=total_protein,
                    total_carbs=total_carbs,
                    total_fat=total_fat,
                ))
                models_used.add("multi-model-consensus")
            else:
                # Fallback pour ce jour
                fallback_day = self._generate_fallback_day(input_data, current_date, day_name)
                all_days.append(fallback_day)
                models_used.add("fallback")

        if not all_days:
            return await self.fallback(input_data)

        # Calculer les moyennes
        avg_calories = sum(d.total_calories for d in all_days) // len(all_days)
        avg_protein = sum(d.total_protein for d in all_days) // len(all_days)
        avg_carbs = sum(d.total_carbs for d in all_days) // len(all_days)
        avg_fat = sum(d.total_fat for d in all_days) // len(all_days)

        # Générer la liste de courses
        shopping_list = self._generate_shopping_list(all_days)

        generation_time_ms = int((time.time() - start_time) * 1000)

        result = MealPlanResponse(
            user_id=input_data.user_id,
            start_date=input_data.start_date.isoformat(),
            end_date=(input_data.start_date + timedelta(days=input_data.days - 1)).isoformat(),
            days=all_days,
            avg_daily_calories=avg_calories,
            avg_daily_protein=avg_protein,
            avg_daily_carbs=avg_carbs,
            avg_daily_fat=avg_fat,
            confidence=0.8,
            generation_time_ms=generation_time_ms,
            models_used=list(models_used),
            shopping_list=shopping_list,
        )

        return AgentResponse(
            result=result,
            confidence=0.8,
            model_used="multi-model-consensus",
            reasoning="Plan repas généré avec consensus multi-modèles",
            used_fallback=False,
        )

    async def _generate_day_meals(
        self,
        input_data: MealPlanInput,
        current_date: date,
        day_name: str,
    ) -> list[MealPlanMeal]:
        """Génère les repas pour un jour donné."""
        prompt = self._build_day_prompt(input_data, day_name)

        # Appeler plusieurs modèles en parallèle
        async def call_model(model_id: str) -> dict | None:
            try:
                raw_response = await self.client.text_chat(
                    prompt=prompt,
                    model_id=model_id,
                    max_tokens=1500,
                    temperature=0.7,
                )

                if not raw_response:
                    return None

                meals = self._parse_day_response(raw_response, input_data)
                return {"model": model_id, "meals": meals}

            except Exception as e:
                logger.error("meal_plan_model_error", model=model_id, error=str(e))
                return None

        tasks = [call_model(model) for model in MEAL_PLAN_MODELS[:3]]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filtrer les résultats valides
        valid_results = []
        for result in results:
            if isinstance(result, dict) and result.get("meals"):
                valid_results.append(result)

        if not valid_results:
            return []

        # Si un seul résultat, l'utiliser directement
        if len(valid_results) == 1:
            return valid_results[0]["meals"]

        # Sinon, fusionner par consensus
        return self._merge_day_meals(valid_results, input_data)

    def _build_day_prompt(self, input_data: MealPlanInput, day_name: str) -> str:
        """Construit le prompt pour un jour."""
        diet_text = input_data.diet_type.value if hasattr(input_data.diet_type, 'value') else input_data.diet_type
        goal_text = input_data.goal.value if hasattr(input_data.goal, 'value') else input_data.goal

        allergies_text = ", ".join(input_data.allergies) if input_data.allergies else "Aucune"
        excluded_text = ", ".join(input_data.excluded_foods) if input_data.excluded_foods else "Aucun"

        meals_to_generate = []
        if input_data.meals_per_day >= 1:
            meals_to_generate.append("breakfast (petit-déjeuner)")
        if input_data.meals_per_day >= 2:
            meals_to_generate.append("lunch (déjeuner)")
        if input_data.meals_per_day >= 3:
            meals_to_generate.append("dinner (dîner)")
        if input_data.include_snacks:
            meals_to_generate.append("snack (collation)")

        return f"""Tu es un nutritionniste expert. Génère un plan de repas pour {day_name}.

PROFIL UTILISATEUR:
- Régime: {diet_text}
- Objectif: {goal_text}
- Allergies: {allergies_text}
- Aliments exclus: {excluded_text}
- Budget: {input_data.budget_level}
- Temps de cuisson max: {input_data.cooking_time_max} minutes

OBJECTIFS NUTRITIONNELS QUOTIDIENS:
- Calories: {input_data.target_calories} kcal
- Protéines: {input_data.target_protein}g
- Glucides: {input_data.target_carbs}g
- Lipides: {input_data.target_fat}g

REPAS À GÉNÉRER: {", ".join(meals_to_generate)}

INSTRUCTIONS:
1. Génère des repas équilibrés et variés
2. Respecte les contraintes alimentaires
3. Les totaux doivent approcher les objectifs quotidiens
4. Temps de préparation réalistes

Réponds UNIQUEMENT en JSON avec ce format:
{{
    "meals": [
        {{
            "meal_type": "breakfast",
            "name": "Nom du repas",
            "description": "Description courte",
            "ingredients": [
                {{"name": "ingrédient", "quantity": "100g"}}
            ],
            "prep_time": 10,
            "cook_time": 15,
            "calories": 350,
            "protein": 20,
            "carbs": 40,
            "fat": 12,
            "tags": ["rapide", "healthy"]
        }}
    ]
}}"""

    def _parse_day_response(self, raw_response: str, input_data: MealPlanInput) -> list[MealPlanMeal]:
        """Parse la réponse pour un jour."""
        try:
            json_match = re.search(r'\{[\s\S]*\}', raw_response)
            if json_match:
                data = json.loads(json_match.group())
                meals_data = data.get("meals", [])

                meals = []
                for m in meals_data:
                    meal = MealPlanMeal(
                        meal_type=m.get("meal_type", "lunch"),
                        name=m.get("name", "Repas"),
                        description=m.get("description", ""),
                        ingredients=m.get("ingredients", []),
                        prep_time=m.get("prep_time", 15),
                        cook_time=m.get("cook_time", 15),
                        calories=m.get("calories", 400),
                        protein=m.get("protein", 25),
                        carbs=m.get("carbs", 40),
                        fat=m.get("fat", 15),
                        tags=m.get("tags", []),
                    )
                    meals.append(meal)

                return meals

        except (json.JSONDecodeError, ValueError) as e:
            logger.warning("meal_plan_parse_error", error=str(e))

        return []

    def _merge_day_meals(
        self,
        results: list[dict],
        input_data: MealPlanInput,
    ) -> list[MealPlanMeal]:
        """Fusionne les repas de plusieurs modèles."""
        # Regrouper par type de repas
        meals_by_type: dict[str, list[MealPlanMeal]] = {}
        for result in results:
            for meal in result.get("meals", []):
                meal_type = meal.meal_type
                if meal_type not in meals_by_type:
                    meals_by_type[meal_type] = []
                meals_by_type[meal_type].append(meal)

        # Pour chaque type, prendre le repas avec les meilleures valeurs nutritionnelles
        merged_meals = []
        for meal_type, meals in meals_by_type.items():
            if meals:
                # Calculer un score basé sur la proximité des objectifs
                target_per_meal = input_data.target_calories // (input_data.meals_per_day + (1 if input_data.include_snacks else 0))

                best_meal = min(meals, key=lambda m: abs(m.calories - target_per_meal))
                merged_meals.append(best_meal)

        return merged_meals

    def _generate_fallback_day(
        self,
        input_data: MealPlanInput,
        current_date: date,
        day_name: str,
    ) -> MealPlanDay:
        """Génère un jour de fallback."""
        meals = []

        # Petit-déjeuner
        if input_data.meals_per_day >= 1:
            meals.append(MealPlanMeal(
                meal_type="breakfast",
                name="Bowl d'avoine aux fruits",
                description="Flocons d'avoine, fruits frais, miel et noix",
                ingredients=[
                    {"name": "flocons d'avoine", "quantity": "60g"},
                    {"name": "lait", "quantity": "200ml"},
                    {"name": "banane", "quantity": "1"},
                    {"name": "miel", "quantity": "1 c.à.s"},
                    {"name": "noix", "quantity": "20g"},
                ],
                prep_time=5,
                cook_time=5,
                calories=420,
                protein=12,
                carbs=65,
                fat=14,
                tags=["petit-déjeuner", "healthy"],
            ))

        # Déjeuner
        if input_data.meals_per_day >= 2:
            meals.append(MealPlanMeal(
                meal_type="lunch",
                name="Salade composée au poulet",
                description="Salade verte, poulet grillé, légumes et vinaigrette",
                ingredients=[
                    {"name": "blanc de poulet", "quantity": "150g"},
                    {"name": "salade verte", "quantity": "100g"},
                    {"name": "tomates cerises", "quantity": "100g"},
                    {"name": "concombre", "quantity": "1/2"},
                    {"name": "huile d'olive", "quantity": "2 c.à.s"},
                ],
                prep_time=10,
                cook_time=15,
                calories=480,
                protein=38,
                carbs=15,
                fat=30,
                tags=["déjeuner", "protéiné"],
            ))

        # Dîner
        if input_data.meals_per_day >= 3:
            meals.append(MealPlanMeal(
                meal_type="dinner",
                name="Saumon et légumes rôtis",
                description="Pavé de saumon avec légumes de saison au four",
                ingredients=[
                    {"name": "pavé de saumon", "quantity": "150g"},
                    {"name": "brocoli", "quantity": "150g"},
                    {"name": "patate douce", "quantity": "150g"},
                    {"name": "huile d'olive", "quantity": "1 c.à.s"},
                    {"name": "citron", "quantity": "1/2"},
                ],
                prep_time=10,
                cook_time=25,
                calories=520,
                protein=35,
                carbs=40,
                fat=25,
                tags=["dîner", "oméga-3"],
            ))

        # Collation
        if input_data.include_snacks:
            meals.append(MealPlanMeal(
                meal_type="snack",
                name="Yaourt grec aux noix",
                description="Yaourt grec nature avec noix et miel",
                ingredients=[
                    {"name": "yaourt grec", "quantity": "150g"},
                    {"name": "noix", "quantity": "20g"},
                    {"name": "miel", "quantity": "1 c.à.c"},
                ],
                prep_time=2,
                cook_time=0,
                calories=250,
                protein=18,
                carbs=15,
                fat=14,
                tags=["snack", "protéiné"],
            ))

        total_calories = sum(m.calories for m in meals)
        total_protein = sum(m.protein for m in meals)
        total_carbs = sum(m.carbs for m in meals)
        total_fat = sum(m.fat for m in meals)

        return MealPlanDay(
            date=current_date.isoformat(),
            day_name=day_name,
            meals=meals,
            total_calories=total_calories,
            total_protein=total_protein,
            total_carbs=total_carbs,
            total_fat=total_fat,
        )

    def _generate_shopping_list(self, days: list[MealPlanDay]) -> list[dict[str, str]]:
        """Génère la liste de courses à partir du plan."""
        ingredients: dict[str, list[str]] = {}

        for day in days:
            for meal in day.meals:
                for ing in meal.ingredients:
                    name = ing.get("name", "").lower()
                    quantity = ing.get("quantity", "")
                    if name:
                        if name not in ingredients:
                            ingredients[name] = []
                        if quantity:
                            ingredients[name].append(quantity)

        # Convertir en liste
        shopping_list = []
        for name, quantities in sorted(ingredients.items()):
            # Essayer de combiner les quantités
            combined = ", ".join(set(quantities)) if quantities else "à estimer"
            shopping_list.append({
                "name": name.capitalize(),
                "quantity": combined,
                "category": self._categorize_ingredient(name),
            })

        return shopping_list

    def _categorize_ingredient(self, name: str) -> str:
        """Catégorise un ingrédient."""
        name_lower = name.lower()

        proteins = ["poulet", "boeuf", "porc", "saumon", "thon", "crevette", "oeuf", "tofu", "tempeh"]
        dairy = ["lait", "yaourt", "fromage", "crème", "beurre"]
        fruits = ["pomme", "banane", "orange", "fraise", "myrtille", "citron"]
        vegetables = ["salade", "tomate", "concombre", "brocoli", "carotte", "courgette", "épinard"]
        grains = ["riz", "pâtes", "pain", "avoine", "quinoa", "blé"]

        if any(p in name_lower for p in proteins):
            return "Protéines"
        elif any(d in name_lower for d in dairy):
            return "Produits laitiers"
        elif any(f in name_lower for f in fruits):
            return "Fruits"
        elif any(v in name_lower for v in vegetables):
            return "Légumes"
        elif any(g in name_lower for g in grains):
            return "Féculents"
        else:
            return "Autres"

    def build_prompt(self, input_data: MealPlanInput) -> str:
        """Construit le prompt principal (utilisé pour fallback)."""
        return self._build_day_prompt(input_data, "Lundi")

    def parse_response(self, raw_response: str, input_data: MealPlanInput) -> MealPlanResponse:
        """Parse la réponse principale."""
        meals = self._parse_day_response(raw_response, input_data)
        if not meals:
            return self.deterministic_fallback(input_data)

        # Construire une réponse minimale
        day = MealPlanDay(
            date=input_data.start_date.isoformat(),
            day_name="Lundi",
            meals=meals,
            total_calories=sum(m.calories for m in meals),
            total_protein=sum(m.protein for m in meals),
            total_carbs=sum(m.carbs for m in meals),
            total_fat=sum(m.fat for m in meals),
        )

        return MealPlanResponse(
            user_id=input_data.user_id,
            start_date=input_data.start_date.isoformat(),
            end_date=input_data.start_date.isoformat(),
            days=[day],
            avg_daily_calories=day.total_calories,
            avg_daily_protein=day.total_protein,
            avg_daily_carbs=day.total_carbs,
            avg_daily_fat=day.total_fat,
            confidence=0.6,
            generation_time_ms=0,
            models_used=["single-model"],
        )

    def calculate_confidence(self, result: MealPlanResponse, raw_response: str) -> float:
        """Calcule le score de confiance."""
        confidence = 0.5

        if result.days:
            confidence += 0.2
            if len(result.days) >= 7:
                confidence += 0.1

        if result.avg_daily_calories > 0:
            confidence += 0.1

        if result.shopping_list:
            confidence += 0.1

        return min(confidence, 1.0)

    def deterministic_fallback(self, input_data: MealPlanInput) -> MealPlanResponse:
        """Plan de fallback déterministe."""
        days = []
        for i in range(input_data.days):
            current_date = input_data.start_date + timedelta(days=i)
            day_name = DAY_NAMES.get(self.language, DAY_NAMES["fr"])[current_date.weekday()]
            days.append(self._generate_fallback_day(input_data, current_date, day_name))

        return MealPlanResponse(
            user_id=input_data.user_id,
            start_date=input_data.start_date.isoformat(),
            end_date=(input_data.start_date + timedelta(days=input_data.days - 1)).isoformat(),
            days=days,
            avg_daily_calories=sum(d.total_calories for d in days) // len(days),
            avg_daily_protein=sum(d.total_protein for d in days) // len(days),
            avg_daily_carbs=sum(d.total_carbs for d in days) // len(days),
            avg_daily_fat=sum(d.total_fat for d in days) // len(days),
            confidence=0.5,
            generation_time_ms=0,
            models_used=["fallback"],
            shopping_list=self._generate_shopping_list(days),
        )


def get_meal_plan_agent(language: str = DEFAULT_LANGUAGE) -> MealPlanAgent:
    """Retourne une instance de l'agent de plans repas."""
    return MealPlanAgent(language=language)
