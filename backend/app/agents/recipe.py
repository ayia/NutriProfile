import json
import re
from typing import Any

from app.agents.base import BaseAgent, AgentResponse
from app.llm.models import ModelCapability
from app.models.profile import DietType, Goal
from app.i18n import DEFAULT_LANGUAGE


class MealHistoryAnalysis:
    """Analyse de l'historique alimentaire pour personnalisation."""

    def __init__(
        self,
        # Aliments mangés récemment (7 derniers jours)
        recent_foods: list[str] | None = None,
        # Fréquence des aliments (aliment -> nombre de fois)
        food_frequency: dict[str, int] | None = None,
        # Aliments par type de repas
        breakfast_foods: list[str] | None = None,
        lunch_foods: list[str] | None = None,
        dinner_foods: list[str] | None = None,
        # Score de variété (0-100)
        variety_score: float = 50.0,
        # Nombre de repas logués dans les 7 derniers jours
        meals_logged_week: int = 0,
        # Protéines principales récentes
        recent_proteins: list[str] | None = None,
        # Accompagnements fréquents
        frequent_sides: list[str] | None = None,
    ):
        self.recent_foods = recent_foods or []
        self.food_frequency = food_frequency or {}
        self.breakfast_foods = breakfast_foods or []
        self.lunch_foods = lunch_foods or []
        self.dinner_foods = dinner_foods or []
        self.variety_score = variety_score
        self.meals_logged_week = meals_logged_week
        self.recent_proteins = recent_proteins or []
        self.frequent_sides = frequent_sides or []

    def get_foods_to_avoid(self, max_recent: int = 3) -> list[str]:
        """Retourne les aliments mangés trop souvent récemment (à éviter)."""
        if not self.food_frequency:
            return []
        # Aliments mangés plus de 3 fois dans la semaine
        return [food for food, count in self.food_frequency.items() if count >= max_recent]

    def get_suggested_proteins(self, meal_type: str) -> list[str]:
        """Suggère des protéines non consommées récemment."""
        all_proteins = ["poulet", "boeuf", "porc", "agneau", "poisson", "saumon",
                       "thon", "crevettes", "tofu", "tempeh", "oeufs", "lentilles",
                       "pois chiches", "haricots"]
        # Exclure celles mangées récemment
        return [p for p in all_proteins if p.lower() not in [r.lower() for r in self.recent_proteins]]

    def get_variety_recommendation(self) -> str:
        """Recommandation basée sur le score de variété."""
        if self.variety_score >= 80:
            return "Excellente variété alimentaire! Continuez ainsi."
        elif self.variety_score >= 60:
            return "Bonne variété. Essayez d'explorer de nouveaux aliments."
        elif self.variety_score >= 40:
            return "Variété moyenne. Diversifiez vos sources de protéines et légumes."
        else:
            return "Variété faible. Important d'introduire plus d'aliments différents."


class UserContext:
    """Contexte utilisateur pour la personnalisation des recettes."""

    def __init__(
        self,
        # Profil de base
        age: int | None = None,
        gender: str | None = None,
        weight_kg: float | None = None,
        height_cm: float | None = None,
        target_weight_kg: float | None = None,
        # Métabolisme calculé
        bmr: float | None = None,
        tdee: float | None = None,
        daily_calories: int | None = None,
        protein_g: int | None = None,
        carbs_g: int | None = None,
        fat_g: int | None = None,
        # Tracking du jour
        calories_consumed_today: int = 0,
        calories_burned_today: int = 0,
        protein_consumed_today: int = 0,
        activity_minutes_today: int = 0,
        # Tendances (dernière semaine)
        weight_trend: float | None = None,  # Positif = prise de poids, négatif = perte
        avg_calories_week: float | None = None,
        activity_level_actual: str | None = None,  # basé sur les activités réelles
        # NOUVEAU: Historique alimentaire
        meal_history: MealHistoryAnalysis | None = None,
        # Heure actuelle pour recommandations temporelles
        current_hour: int | None = None,
    ):
        self.age = age
        self.gender = gender
        self.weight_kg = weight_kg
        self.height_cm = height_cm
        self.target_weight_kg = target_weight_kg
        self.bmr = bmr
        self.tdee = tdee
        self.daily_calories = daily_calories
        self.protein_g = protein_g
        self.carbs_g = carbs_g
        self.fat_g = fat_g
        self.calories_consumed_today = calories_consumed_today
        self.calories_burned_today = calories_burned_today
        self.protein_consumed_today = protein_consumed_today
        self.activity_minutes_today = activity_minutes_today
        self.weight_trend = weight_trend
        self.avg_calories_week = avg_calories_week
        self.activity_level_actual = activity_level_actual
        self.meal_history = meal_history
        self.current_hour = current_hour

    def get_remaining_calories(self) -> int:
        """Calcule les calories restantes pour la journée."""
        if self.daily_calories:
            # Ajuster selon l'activité du jour (calories brûlées par l'exercice)
            adjusted_target = self.daily_calories + self.calories_burned_today
            return max(0, adjusted_target - self.calories_consumed_today)
        return 500  # Défaut pour un repas

    def get_remaining_protein(self) -> int:
        """Calcule les protéines restantes pour la journée."""
        if self.protein_g:
            return max(0, self.protein_g - self.protein_consumed_today)
        return 25  # Défaut

    def get_calorie_adjustment(self) -> str:
        """Recommandation basée sur la tendance de poids."""
        if self.weight_trend is None or self.target_weight_kg is None or self.weight_kg is None:
            return "normal"

        needs_to_lose = self.weight_kg > self.target_weight_kg
        needs_to_gain = self.weight_kg < self.target_weight_kg

        if needs_to_lose:
            if self.weight_trend > 0:
                return "reduce_calories"  # Prend du poids alors qu'il devrait perdre
            elif self.weight_trend < -0.5:
                return "normal"  # Perd bien
            else:
                return "slight_reduction"
        elif needs_to_gain:
            if self.weight_trend < 0:
                return "increase_calories"  # Perd du poids alors qu'il devrait prendre
            elif self.weight_trend > 0.5:
                return "normal"  # Prend bien
            else:
                return "slight_increase"

        return "normal"


class RecipeInput:
    """Données d'entrée pour l'agent de recettes."""

    def __init__(
        self,
        ingredients: list[str] | None = None,
        meal_type: str = "lunch",  # breakfast, lunch, dinner, snack
        diet_type: DietType = DietType.OMNIVORE,
        allergies: list[str] | None = None,
        excluded_foods: list[str] | None = None,
        max_prep_time: int = 30,  # minutes
        servings: int = 2,
        goal: Goal = Goal.MAINTAIN,
        target_calories: int | None = None,
        # Nouveau: contexte utilisateur complet
        user_context: UserContext | None = None,
    ):
        self.ingredients = ingredients or []
        self.meal_type = meal_type
        self.diet_type = diet_type
        self.allergies = allergies or []
        self.excluded_foods = excluded_foods or []
        self.max_prep_time = max_prep_time
        self.servings = servings
        self.goal = goal
        self.target_calories = target_calories
        self.user_context = user_context


class Recipe:
    """Structure d'une recette."""

    def __init__(
        self,
        title: str,
        description: str,
        ingredients: list[dict[str, str]],  # [{"name": "...", "quantity": "..."}]
        instructions: list[str],
        prep_time: int,
        cook_time: int,
        servings: int,
        nutrition: dict[str, int],  # {"calories": ..., "protein": ..., ...}
        tags: list[str] | None = None,
    ):
        self.title = title
        self.description = description
        self.ingredients = ingredients
        self.instructions = instructions
        self.prep_time = prep_time
        self.cook_time = cook_time
        self.servings = servings
        self.nutrition = nutrition
        self.tags = tags or []

    def to_dict(self) -> dict:
        return {
            "title": self.title,
            "description": self.description,
            "ingredients": self.ingredients,
            "instructions": self.instructions,
            "prep_time": self.prep_time,
            "cook_time": self.cook_time,
            "total_time": self.prep_time + self.cook_time,
            "servings": self.servings,
            "nutrition": self.nutrition,
            "tags": self.tags,
        }


class RecipeAgent(BaseAgent[RecipeInput, Recipe]):
    """
    Agent de génération de recettes.

    Génère des recettes personnalisées basées sur:
    - Ingrédients disponibles
    - Préférences alimentaires
    - Objectifs nutritionnels
    - Temps de préparation
    """

    name = "RecipeAgent"
    capability = ModelCapability.RECIPE_GENERATION
    confidence_threshold = 0.6
    text_model = "Qwen/Qwen2.5-72B-Instruct"

    async def process(self, input_data: RecipeInput, model=None) -> AgentResponse:
        """
        Traitement spécifique utilisant l'API Chat Completions.
        Override la méthode de base pour utiliser text_chat.
        """
        import structlog

        logger = structlog.get_logger()

        prompt = self.build_prompt(input_data)

        logger.info(
            "recipe_agent_processing",
            agent=self.name,
            model=self.text_model,
        )

        try:
            raw_response = await self.client.text_chat(
                prompt=prompt,
                model_id=self.text_model,
                max_tokens=1000,
                temperature=0.7,
            )

            if not raw_response:
                logger.warning("recipe_empty_response")
                return await self.fallback(input_data)

            result = self.parse_response(raw_response, input_data)
            confidence = self.calculate_confidence(result, raw_response)

            logger.info(
                "recipe_agent_response",
                agent=self.name,
                model=self.text_model,
                confidence=confidence,
                recipe_title=result.title,
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
                reasoning=result.description,
                used_fallback=False,
            )

        except Exception as e:
            logger.error(
                "recipe_agent_error",
                agent=self.name,
                model=self.text_model,
                error=str(e),
            )
            return await self.fallback(input_data)

    def build_prompt(self, input_data: RecipeInput) -> str:
        """Construit le prompt pour générer une recette personnalisée."""
        diet_instructions = {
            DietType.VEGAN: self.t("agents.recipe.dietInstructions.vegan"),
            DietType.VEGETARIAN: self.t("agents.recipe.dietInstructions.vegetarian"),
            DietType.PESCATARIAN: self.t("agents.recipe.dietInstructions.pescatarian"),
            DietType.KETO: self.t("agents.recipe.dietInstructions.keto"),
            DietType.PALEO: self.t("agents.recipe.dietInstructions.paleo"),
            DietType.MEDITERRANEAN: self.t("agents.recipe.dietInstructions.mediterranean"),
            DietType.OMNIVORE: self.t("agents.recipe.dietInstructions.omnivore"),
        }

        goal_instructions = {
            Goal.LOSE_WEIGHT: self.t("agents.recipe.goalInstructions.loseWeight"),
            Goal.GAIN_MUSCLE: self.t("agents.recipe.goalInstructions.gainMuscle"),
            Goal.MAINTAIN: self.t("agents.recipe.goalInstructions.maintain"),
            Goal.IMPROVE_HEALTH: self.t("agents.recipe.goalInstructions.improveHealth"),
        }

        ingredients_text = ", ".join(input_data.ingredients) if input_data.ingredients else "au choix"
        allergies_text = ", ".join(input_data.allergies) if input_data.allergies else "aucune"
        excluded_text = ", ".join(input_data.excluded_foods) if input_data.excluded_foods else "aucun"

        # Gérer les valeurs None pour diet_type et goal
        diet_type = input_data.diet_type or DietType.OMNIVORE
        goal = input_data.goal or Goal.MAINTAIN
        diet_text = f"{diet_type.value} - {diet_instructions.get(diet_type, '')}"
        goal_text = goal_instructions.get(goal, "Équilibre les macronutriments.")

        # Construire le contexte utilisateur si disponible
        user_context_text = ""
        target_calories = input_data.target_calories
        target_protein = None

        if input_data.user_context:
            ctx = input_data.user_context

            # Calculer les calories cibles intelligemment
            remaining_calories = ctx.get_remaining_calories()
            remaining_protein = ctx.get_remaining_protein()
            calorie_adjustment = ctx.get_calorie_adjustment()

            # Ajuster les calories selon le type de repas et ce qui reste
            meal_calorie_ratio = {
                "breakfast": 0.25,
                "lunch": 0.35,
                "dinner": 0.30,
                "snack": 0.10,
            }
            ratio = meal_calorie_ratio.get(input_data.meal_type, 0.30)

            if ctx.daily_calories and not target_calories:
                # Calories idéales pour ce repas basées sur le budget restant
                ideal_for_meal = int(ctx.daily_calories * ratio)
                # Prendre le minimum entre l'idéal et ce qui reste
                target_calories = min(ideal_for_meal, remaining_calories) if remaining_calories > 0 else ideal_for_meal

            target_protein = int(remaining_protein * ratio) if remaining_protein else None

            # Construire le contexte détaillé
            context_parts = []

            if ctx.weight_kg:
                weight_info = f"Poids actuel: {ctx.weight_kg} kg"
                if ctx.target_weight_kg:
                    diff = ctx.weight_kg - ctx.target_weight_kg
                    if diff > 0:
                        weight_info += f" (objectif: perdre {diff:.1f} kg)"
                    elif diff < 0:
                        weight_info += f" (objectif: prendre {abs(diff):.1f} kg)"
                context_parts.append(weight_info)

            if ctx.weight_trend is not None:
                trend = "stable"
                if ctx.weight_trend > 0.2:
                    trend = f"en hausse (+{ctx.weight_trend:.1f} kg cette semaine)"
                elif ctx.weight_trend < -0.2:
                    trend = f"en baisse ({ctx.weight_trend:.1f} kg cette semaine)"
                context_parts.append(f"Tendance poids: {trend}")

            if ctx.calories_consumed_today > 0 or ctx.calories_burned_today > 0:
                today_info = f"Aujourd'hui: {ctx.calories_consumed_today} kcal consommées"
                if ctx.calories_burned_today > 0:
                    today_info += f", {ctx.calories_burned_today} kcal brûlées (activité: {ctx.activity_minutes_today} min)"
                context_parts.append(today_info)

            if remaining_calories > 0:
                context_parts.append(f"Budget calorique restant: {remaining_calories} kcal")

            if ctx.protein_consumed_today > 0 and ctx.protein_g:
                context_parts.append(f"Protéines: {ctx.protein_consumed_today}g / {ctx.protein_g}g objectif")

            # Recommandation d'ajustement
            adjustment_text = {
                "reduce_calories": "IMPORTANT: L'utilisateur prend du poids mais veut en perdre. Propose une recette LÉGÈRE.",
                "slight_reduction": "Privilégie une recette modérément calorique pour favoriser la perte de poids.",
                "increase_calories": "IMPORTANT: L'utilisateur perd du poids mais veut en prendre. Propose une recette CALORIQUE.",
                "slight_increase": "Privilégie une recette assez calorique pour favoriser la prise de poids.",
                "normal": "",
            }
            if calorie_adjustment != "normal":
                context_parts.append(adjustment_text.get(calorie_adjustment, ""))

            # NOUVEAU: Analyse de l'historique alimentaire
            if ctx.meal_history:
                mh = ctx.meal_history
                history_parts = []

                # Aliments à éviter (mangés trop souvent)
                foods_to_avoid = mh.get_foods_to_avoid()
                if foods_to_avoid:
                    history_parts.append(f"{self.t('agents.recipe.mealHistory.avoid')} {', '.join(foods_to_avoid)}")

                # Score de variété
                if mh.variety_score < 60:
                    history_parts.append(f"{self.t('agents.recipe.mealHistory.varietyScore')} {mh.variety_score:.0f}/100 - {mh.get_variety_recommendation()}")

                # Protéines suggérées
                suggested_proteins = mh.get_suggested_proteins(input_data.meal_type)
                if suggested_proteins and len(suggested_proteins) > 0:
                    history_parts.append(f"{self.t('agents.recipe.mealHistory.suggestedProteins')} {', '.join(suggested_proteins[:5])}")

                # Repas logués cette semaine
                if mh.meals_logged_week > 0:
                    history_parts.append(f"{self.t('agents.recipe.mealHistory.loggedMeals')} {mh.meals_logged_week}")

                if history_parts:
                    context_parts.append(f"\n{self.t('agents.recipe.mealHistory.header')}")
                    context_parts.extend(history_parts)

            # NOUVEAU: Recommandations basées sur l'heure
            if ctx.current_hour is not None:
                time_recommendations = []
                hour = ctx.current_hour

                if 6 <= hour < 10:
                    time_recommendations.append(self.t("agents.recipe.timeRecommendations.morning"))
                elif 11 <= hour < 14:
                    time_recommendations.append(self.t("agents.recipe.timeRecommendations.midday"))
                elif 14 <= hour < 17:
                    time_recommendations.append(self.t("agents.recipe.timeRecommendations.afternoon"))
                elif 18 <= hour < 21:
                    time_recommendations.append(self.t("agents.recipe.timeRecommendations.evening"))
                elif hour >= 21 or hour < 6:
                    time_recommendations.append(self.t("agents.recipe.timeRecommendations.late"))

                if time_recommendations:
                    context_parts.extend(time_recommendations)

            if context_parts:
                user_context_text = "\n\nCONTEXTE UTILISATEUR (personnalisation importante):\n" + "\n".join(f"- {p}" for p in context_parts)

        # Construire les cibles nutritionnelles
        nutrition_targets = ""
        if target_calories:
            nutrition_targets = f"\n- Calories cibles par portion: {target_calories} kcal (±10%)"
        if target_protein:
            nutrition_targets += f"\n- Protéines cibles: {target_protein}g minimum"

        return f"""Tu es un chef cuisinier expert en nutrition personnalisée. Génère une recette pour un {input_data.meal_type}.
{user_context_text}

CONTRAINTES ALIMENTAIRES:
- Régime: {diet_text}
- Objectif nutritionnel: {goal_text}
- Allergies à éviter: {allergies_text}
- Aliments exclus: {excluded_text}

CONTRAINTES PRATIQUES:
- Temps de préparation max: {input_data.max_prep_time} minutes
- Nombre de portions: {input_data.servings}{nutrition_targets}

INGRÉDIENTS DISPONIBLES: {ingredients_text}

INSTRUCTIONS IMPORTANTES:
1. Adapte la recette au contexte utilisateur ci-dessus
2. Respecte strictement les contraintes caloriques si spécifiées
3. Privilégie des ingrédients frais et peu transformés
4. Assure un bon équilibre protéines/glucides/lipides selon l'objectif

Réponds en JSON avec ce format exact:
{{
    "title": "Nom de la recette",
    "description": "Description courte expliquant pourquoi cette recette est adaptée au profil",
    "ingredients": [
        {{"name": "ingrédient 1", "quantity": "quantité précise"}},
        {{"name": "ingrédient 2", "quantity": "quantité précise"}}
    ],
    "instructions": [
        "Étape 1: ...",
        "Étape 2: ...",
        "Étape 3: ..."
    ],
    "prep_time": 15,
    "cook_time": 20,
    "servings": {input_data.servings},
    "nutrition": {{
        "calories": {target_calories or 450},
        "protein": {target_protein or 25},
        "carbs": 40,
        "fat": 15,
        "fiber": 8
    }},
    "tags": ["rapide", "healthy", "protéiné"],
    "personalization_note": "Explication de comment cette recette est adaptée au profil utilisateur"
}}

Sois créatif mais réaliste. La recette doit être facile à suivre et PARFAITEMENT adaptée au contexte de l'utilisateur."""

    def parse_response(self, raw_response: str, input_data: RecipeInput) -> Recipe:
        """Parse la réponse LLM en objet Recipe."""
        try:
            # Chercher le JSON dans la réponse
            json_match = re.search(r'\{[\s\S]*\}', raw_response)
            if json_match:
                data = json.loads(json_match.group())

                return Recipe(
                    title=data.get("title", "Recette sans nom"),
                    description=data.get("description", ""),
                    ingredients=data.get("ingredients", []),
                    instructions=data.get("instructions", []),
                    prep_time=data.get("prep_time", 15),
                    cook_time=data.get("cook_time", 15),
                    servings=data.get("servings", input_data.servings),
                    nutrition=data.get("nutrition", {}),
                    tags=data.get("tags", []),
                )
            else:
                raise ValueError("No JSON found in response")

        except (json.JSONDecodeError, ValueError):
            # Fallback
            return self.deterministic_fallback(input_data)

    def calculate_confidence(self, result: Recipe, raw_response: str) -> float:
        """Calcule le score de confiance."""
        confidence = 0.5

        # Vérifications de qualité
        if result.title and len(result.title) > 3:
            confidence += 0.1

        if result.ingredients and len(result.ingredients) >= 3:
            confidence += 0.1

        if result.instructions and len(result.instructions) >= 3:
            confidence += 0.1

        if result.nutrition and result.nutrition.get("calories"):
            confidence += 0.1

        if result.prep_time > 0 and result.cook_time >= 0:
            confidence += 0.1

        return min(confidence, 1.0)

    def deterministic_fallback(self, input_data: RecipeInput) -> Recipe:
        """Recette de fallback simple."""
        # Recettes de base selon le type de repas
        fallback_recipes = {
            "breakfast": Recipe(
                title=self.t("agents.recipe.fallback.oatmealBowl"),
                description=self.t("agents.recipe.fallback.oatmealDesc"),
                ingredients=[
                    {"name": "flocons d'avoine", "quantity": "60g"},
                    {"name": "lait", "quantity": "200ml"},
                    {"name": "banane", "quantity": "1"},
                    {"name": "miel", "quantity": "1 c.à.s"},
                    {"name": "fruits rouges", "quantity": "50g"},
                ],
                instructions=[
                    "Faire chauffer le lait dans une casserole",
                    "Ajouter les flocons d'avoine et cuire 5 minutes",
                    "Verser dans un bol et ajouter les fruits coupés",
                    "Arroser de miel et servir tiède",
                ],
                prep_time=5,
                cook_time=5,
                servings=1,
                nutrition={"calories": 350, "protein": 12, "carbs": 55, "fat": 8, "fiber": 6},
                tags=["petit-déjeuner", "rapide", "végétarien"],
            ),
            "lunch": Recipe(
                title=self.t("agents.recipe.fallback.chickenSalad"),
                description=self.t("agents.recipe.fallback.chickenSaladDesc"),
                ingredients=[
                    {"name": "blanc de poulet", "quantity": "150g"},
                    {"name": "salade verte", "quantity": "100g"},
                    {"name": "tomates cerises", "quantity": "100g"},
                    {"name": "concombre", "quantity": "1/2"},
                    {"name": "huile d'olive", "quantity": "2 c.à.s"},
                    {"name": "citron", "quantity": "1/2"},
                ],
                instructions=[
                    "Griller le poulet assaisonné à la poêle",
                    "Laver et couper les légumes",
                    "Disposer la salade dans une assiette",
                    "Ajouter le poulet tranché et les légumes",
                    "Assaisonner avec huile et citron",
                ],
                prep_time=10,
                cook_time=15,
                servings=1,
                nutrition={"calories": 420, "protein": 35, "carbs": 15, "fat": 25, "fiber": 4},
                tags=["déjeuner", "protéiné", "léger"],
            ),
            "dinner": Recipe(
                title=self.t("agents.recipe.fallback.salmonVeggies"),
                description=self.t("agents.recipe.fallback.salmonDesc"),
                ingredients=[
                    {"name": "pavé de saumon", "quantity": "150g"},
                    {"name": "brocoli", "quantity": "150g"},
                    {"name": "patate douce", "quantity": "1 moyenne"},
                    {"name": "huile d'olive", "quantity": "1 c.à.s"},
                    {"name": "citron", "quantity": "1/2"},
                    {"name": "herbes de Provence", "quantity": "1 c.à.c"},
                ],
                instructions=[
                    "Préchauffer le four à 200°C",
                    "Couper la patate douce en cubes",
                    "Disposer légumes et saumon sur une plaque",
                    "Arroser d'huile et assaisonner",
                    "Cuire 25 minutes au four",
                ],
                prep_time=10,
                cook_time=25,
                servings=1,
                nutrition={"calories": 480, "protein": 32, "carbs": 35, "fat": 22, "fiber": 7},
                tags=["dîner", "oméga-3", "healthy"],
            ),
            "snack": Recipe(
                title=self.t("agents.recipe.fallback.greekYogurt"),
                description=self.t("agents.recipe.fallback.greekYogurtDesc"),
                ingredients=[
                    {"name": "yaourt grec", "quantity": "150g"},
                    {"name": "noix", "quantity": "30g"},
                    {"name": "miel", "quantity": "1 c.à.c"},
                ],
                instructions=[
                    "Verser le yaourt dans un bol",
                    "Ajouter les noix concassées",
                    "Arroser de miel",
                ],
                prep_time=2,
                cook_time=0,
                servings=1,
                nutrition={"calories": 280, "protein": 18, "carbs": 15, "fat": 18, "fiber": 2},
                tags=["snack", "protéiné", "rapide"],
            ),
        }

        return fallback_recipes.get(input_data.meal_type, fallback_recipes["lunch"])


def get_recipe_agent(language: str = DEFAULT_LANGUAGE) -> RecipeAgent:
    """Retourne une instance de l'agent recettes."""
    return RecipeAgent(language=language)
