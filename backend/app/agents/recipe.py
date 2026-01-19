"""Agent de génération de recettes avec multi-modèles et consensus."""
import asyncio
import json
import re
from typing import Any

import structlog

from app.agents.base import BaseAgent, AgentResponse
from app.agents.consensus import ConsensusValidator
from app.llm.models import ModelCapability
from app.models.profile import DietType, Goal
from app.i18n import DEFAULT_LANGUAGE

logger = structlog.get_logger()

# Modèles utilisés pour la génération de recettes (2-3 modèles pour consensus)
RECIPE_MODELS = [
    "Qwen/Qwen2.5-72B-Instruct",            # Modèle principal
    "Qwen/Qwen2.5-7B-Instruct",             # Modèle secondaire (remplace Mistral)
    "meta-llama/Llama-3.1-8B-Instruct",     # Modèle tertiaire
]

# Modèle de validation nutritionnelle
NUTRITION_VALIDATION_MODEL = "Qwen/Qwen2.5-7B-Instruct"


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
    Agent de génération de recettes avec multi-modèles.

    Utilise 2-3 modèles en parallèle pour générer des recettes,
    puis valide le consensus avec un modèle de validation nutritionnelle.
    """

    name = "RecipeAgent"
    capability = ModelCapability.RECIPE_GENERATION
    confidence_threshold = 0.6

    async def process(self, input_data: RecipeInput, model=None) -> AgentResponse:
        """
        Traitement multi-modèles avec consensus.
        """
        prompt = self.build_prompt(input_data)

        logger.info(
            "recipe_agent_multi_model_processing",
            agent=self.name,
            models=RECIPE_MODELS[:3],
        )

        # Étape 1: Appeler 2-3 modèles en parallèle
        responses = await self._call_multiple_models(prompt, input_data)

        if not responses:
            logger.warning("recipe_no_valid_responses")
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
                    reasoning=resp["result"].description,
                    used_fallback=False,
                ))

        if len(agent_responses) < 2:
            # Pas assez de réponses pour consensus, utiliser la meilleure
            if agent_responses:
                best = agent_responses[0]
                return AgentResponse(
                    result=self._dict_to_recipe(best.result),
                    confidence=best.confidence,
                    model_used=best.model_used,
                    reasoning=best.reasoning,
                    used_fallback=False,
                )
            return await self.fallback(input_data)

        # Étape 3: Fusion par consensus
        consensus = consensus_validator.validate(
            agent_responses,
            task_type="recipe_generation",
            min_agreement=2,
        )

        logger.info(
            "recipe_consensus_result",
            is_valid=consensus.is_valid,
            confidence=consensus.confidence,
            agreement=consensus.agreement_score,
            models_count=len(agent_responses),
        )

        if not consensus.is_valid:
            # Prendre la meilleure réponse si pas de consensus
            best = max(agent_responses, key=lambda r: r.confidence)
            return AgentResponse(
                result=self._dict_to_recipe(best.result),
                confidence=best.confidence * 0.9,
                model_used=best.model_used,
                reasoning=best.reasoning,
                used_fallback=False,
                metadata={"consensus_warnings": consensus.warnings},
            )

        # Étape 4: Validation nutritionnelle avec modèle de validation
        validated_result = await self._validate_nutrition(
            consensus.merged_result,
            input_data
        )

        if validated_result:
            return AgentResponse(
                result=validated_result,
                confidence=consensus.confidence,
                model_used=f"consensus({len(agent_responses)} models)",
                reasoning=validated_result.description,
                used_fallback=False,
                metadata={
                    "agreement_score": consensus.agreement_score,
                    "individual_scores": consensus.individual_scores,
                    "validated": True,
                },
            )

        # Fallback si validation échoue
        merged = self._merge_recipes(agent_responses)
        return AgentResponse(
            result=merged,
            confidence=consensus.confidence,
            model_used=f"consensus({len(agent_responses)} models)",
            reasoning=merged.description,
            used_fallback=False,
        )

    async def _call_multiple_models(
        self,
        prompt: str,
        input_data: RecipeInput
    ) -> list[dict[str, Any]]:
        """Appelle plusieurs modèles en parallèle."""
        async def call_model(model_id: str) -> dict[str, Any] | None:
            try:
                raw_response = await self.client.text_chat(
                    prompt=prompt,
                    model_id=model_id,
                    max_tokens=1000,
                    temperature=0.7,
                )

                if not raw_response:
                    return None

                result = self.parse_response(raw_response, input_data)
                confidence = self.calculate_confidence(result, raw_response)

                logger.info(
                    "recipe_model_response",
                    model=model_id,
                    confidence=confidence,
                    recipe_title=result.title,
                )

                return {
                    "model": model_id,
                    "result": result,
                    "confidence": confidence,
                    "raw": raw_response,
                }

            except Exception as e:
                logger.error(
                    "recipe_model_error",
                    model=model_id,
                    error=str(e),
                )
                return None

        # Appeler les 3 modèles en parallèle
        tasks = [call_model(model) for model in RECIPE_MODELS[:3]]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filtrer les réponses valides
        valid_responses = []
        for result in results:
            if isinstance(result, dict) and result is not None:
                valid_responses.append(result)

        return valid_responses

    async def _validate_nutrition(
        self,
        merged_result: dict[str, Any],
        input_data: RecipeInput
    ) -> Recipe | None:
        """Valide les valeurs nutritionnelles avec un modèle de validation."""
        try:
            nutrition = merged_result.get("nutrition", {})
            validation_prompt = f"""Tu es un expert en nutrition. Valide cette recette et ses valeurs nutritionnelles:

RECETTE: {merged_result.get('title', 'Recette')}

INGRÉDIENTS:
{json.dumps(merged_result.get('ingredients', []), ensure_ascii=False, indent=2)}

VALEURS NUTRITIONNELLES ACTUELLES:
- Calories: {nutrition.get('calories', 0)} kcal
- Protéines: {nutrition.get('protein', 0)}g
- Glucides: {nutrition.get('carbs', 0)}g
- Lipides: {nutrition.get('fat', 0)}g

CONTRAINTES DE L'UTILISATEUR:
- Régime: {input_data.diet_type.value if hasattr(input_data.diet_type, 'value') else input_data.diet_type}
- Objectif: {input_data.goal.value if hasattr(input_data.goal, 'value') else input_data.goal}
- Allergies: {', '.join(input_data.allergies) if input_data.allergies else 'Aucune'}

Vérifie:
1. Les valeurs nutritionnelles sont-elles réalistes pour ces ingrédients?
2. La recette respecte-t-elle le régime alimentaire?
3. Aucun allergène n'est présent?

Si les valeurs sont aberrantes, corrige-les.
Réponds en JSON avec le même format que l'entrée, avec les valeurs corrigées si nécessaire."""

            raw_response = await self.client.text_chat(
                prompt=validation_prompt,
                model_id=NUTRITION_VALIDATION_MODEL,
                max_tokens=800,
                temperature=0.3,
            )

            if not raw_response:
                return None

            # Parser et retourner la recette validée
            return self.parse_response(raw_response, input_data)

        except Exception as e:
            logger.error("recipe_nutrition_validation_error", error=str(e))
            return None

    def _merge_recipes(self, responses: list[AgentResponse]) -> Recipe:
        """Fusionne plusieurs recettes."""
        if not responses:
            return self.deterministic_fallback(RecipeInput())

        # Prendre la recette de la meilleure réponse comme base
        best = max(responses, key=lambda r: r.confidence)
        best_result = best.result

        # Fusionner les ingrédients communs
        all_ingredients = []
        for resp in responses:
            if isinstance(resp.result, dict):
                all_ingredients.extend(resp.result.get("ingredients", []))

        # Compter les ingrédients par nom
        ingredient_counts: dict[str, list[dict]] = {}
        for ing in all_ingredients:
            name = ing.get("name", "").lower()
            if name:
                if name not in ingredient_counts:
                    ingredient_counts[name] = []
                ingredient_counts[name].append(ing)

        # Garder les ingrédients présents dans au moins 2 recettes
        common_ingredients = []
        for name, ings in ingredient_counts.items():
            if len(ings) >= 2:
                common_ingredients.append(ings[0])

        # Si pas assez d'ingrédients communs, utiliser ceux de la meilleure recette
        if len(common_ingredients) < 3:
            common_ingredients = best_result.get("ingredients", [])

        return Recipe(
            title=best_result.get("title", "Recette"),
            description=best_result.get("description", ""),
            ingredients=common_ingredients,
            instructions=best_result.get("instructions", []),
            prep_time=best_result.get("prep_time", 15),
            cook_time=best_result.get("cook_time", 15),
            servings=best_result.get("servings", 2),
            nutrition=best_result.get("nutrition", {}),
            tags=best_result.get("tags", []),
        )

    def _dict_to_recipe(self, data: dict[str, Any]) -> Recipe:
        """Convertit un dict en Recipe."""
        return Recipe(
            title=data.get("title", "Recette"),
            description=data.get("description", ""),
            ingredients=data.get("ingredients", []),
            instructions=data.get("instructions", []),
            prep_time=data.get("prep_time", 15),
            cook_time=data.get("cook_time", 15),
            servings=data.get("servings", 2),
            nutrition=data.get("nutrition", {}),
            tags=data.get("tags", []),
        )

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

        # Use translation for "no choice" text
        no_choice = self.t("agents.recipe.prompt.noChoice")
        none_text = self.t("agents.common.none")

        ingredients_text = ", ".join(input_data.ingredients) if input_data.ingredients else no_choice
        allergies_text = ", ".join(input_data.allergies) if input_data.allergies else none_text
        excluded_text = ", ".join(input_data.excluded_foods) if input_data.excluded_foods else none_text

        # Gérer les valeurs None et les types string/enum pour diet_type et goal
        diet_type = input_data.diet_type or DietType.OMNIVORE
        goal = input_data.goal or Goal.MAINTAIN

        # Handle both string and enum types
        diet_type_value = diet_type.value if hasattr(diet_type, 'value') else diet_type
        goal_value = goal.value if hasattr(goal, 'value') else goal

        # Convert string to enum for dict lookup if needed
        diet_type_enum = diet_type if hasattr(diet_type, 'value') else DietType(diet_type) if diet_type in [e.value for e in DietType] else DietType.OMNIVORE
        goal_enum = goal if hasattr(goal, 'value') else Goal(goal) if goal in [e.value for e in Goal] else Goal.MAINTAIN

        diet_text = f"{diet_type_value} - {diet_instructions.get(diet_type_enum, '')}"
        goal_text = goal_instructions.get(goal_enum, self.t("agents.recipe.goalInstructions.maintain"))

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
                weight_info = self.t("agents.recipe.prompt.currentWeight", weight=ctx.weight_kg)
                if ctx.target_weight_kg:
                    diff = ctx.weight_kg - ctx.target_weight_kg
                    if diff > 0:
                        weight_info += " " + self.t("agents.recipe.prompt.goalLose", diff=f"{diff:.1f}")
                    elif diff < 0:
                        weight_info += " " + self.t("agents.recipe.prompt.goalGain", diff=f"{abs(diff):.1f}")
                context_parts.append(weight_info)

            if ctx.weight_trend is not None:
                trend = self.t("agents.recipe.prompt.weightTrendStable")
                if ctx.weight_trend > 0.2:
                    trend = self.t("agents.recipe.prompt.weightTrendUp", trend=f"{ctx.weight_trend:.1f}")
                elif ctx.weight_trend < -0.2:
                    trend = self.t("agents.recipe.prompt.weightTrendDown", trend=f"{ctx.weight_trend:.1f}")
                context_parts.append(self.t("agents.recipe.prompt.weightTrend", trend=trend))

            if ctx.calories_consumed_today > 0 or ctx.calories_burned_today > 0:
                today_info = self.t("agents.recipe.prompt.todayStats", consumed=ctx.calories_consumed_today)
                if ctx.calories_burned_today > 0:
                    today_info += self.t("agents.recipe.prompt.todayBurned",
                                        burned=ctx.calories_burned_today,
                                        minutes=ctx.activity_minutes_today)
                context_parts.append(today_info)

            if remaining_calories > 0:
                context_parts.append(self.t("agents.recipe.prompt.remainingBudget", calories=remaining_calories))

            if ctx.protein_consumed_today > 0 and ctx.protein_g:
                context_parts.append(self.t("agents.recipe.prompt.proteinProgress",
                                           consumed=ctx.protein_consumed_today,
                                           target=ctx.protein_g))

            # Recommandation d'ajustement
            adjustment_text = {
                "reduce_calories": self.t("agents.recipe.prompt.adjustReduce"),
                "slight_reduction": self.t("agents.recipe.prompt.adjustSlightReduce"),
                "increase_calories": self.t("agents.recipe.prompt.adjustIncrease"),
                "slight_increase": self.t("agents.recipe.prompt.adjustSlightIncrease"),
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
                user_context_text = f"\n\n{self.t('agents.recipe.prompt.userContextHeader')}\n" + "\n".join(f"- {p}" for p in context_parts)

        # Construire les cibles nutritionnelles
        nutrition_targets = ""
        if target_calories:
            nutrition_targets = f"\n- {self.t('agents.recipe.prompt.targetCalories', calories=target_calories)}"
        if target_protein:
            nutrition_targets += f"\n- {self.t('agents.recipe.prompt.targetProtein', protein=target_protein)}"

        # Build the full prompt using translations
        system_role = self.t("agents.recipe.prompt.systemRole", mealType=input_data.meal_type)
        dietary_constraints = self.t("agents.recipe.prompt.dietaryConstraints")
        diet_label = self.t("agents.recipe.prompt.diet", diet=diet_text)
        goal_label = self.t("agents.recipe.prompt.nutritionalGoal", goal=goal_text)
        allergies_label = self.t("agents.recipe.prompt.allergies", allergies=allergies_text)
        excluded_label = self.t("agents.recipe.prompt.excludedFoods", excluded=excluded_text)
        practical_constraints = self.t("agents.recipe.prompt.practicalConstraints")
        max_prep = self.t("agents.recipe.prompt.maxPrepTime", time=input_data.max_prep_time)
        servings_label = self.t("agents.recipe.prompt.servingsCount", servings=input_data.servings)
        ingredients_label = self.t("agents.recipe.prompt.availableIngredients", ingredients=ingredients_text)
        important_instructions = self.t("agents.recipe.prompt.importantInstructions")
        instruction1 = self.t("agents.recipe.prompt.instruction1")
        instruction2 = self.t("agents.recipe.prompt.instruction2")
        instruction3 = self.t("agents.recipe.prompt.instruction3")
        instruction4 = self.t("agents.recipe.prompt.instruction4")
        json_format = self.t("agents.recipe.prompt.jsonFormat")
        json_title = self.t("agents.recipe.prompt.jsonTitle")
        json_desc = self.t("agents.recipe.prompt.jsonDescription")
        json_ing1 = self.t("agents.recipe.prompt.jsonIngredient1")
        json_qty1 = self.t("agents.recipe.prompt.jsonQuantity1")
        json_ing2 = self.t("agents.recipe.prompt.jsonIngredient2")
        json_qty2 = self.t("agents.recipe.prompt.jsonQuantity2")
        json_step1 = self.t("agents.recipe.prompt.jsonStep1")
        json_step2 = self.t("agents.recipe.prompt.jsonStep2")
        json_step3 = self.t("agents.recipe.prompt.jsonStep3")
        json_tags = self.t("agents.recipe.prompt.jsonTags")
        json_personalization = self.t("agents.recipe.prompt.jsonPersonalization")
        final_instruction = self.t("agents.recipe.prompt.finalInstruction")

        return f"""{system_role}
{user_context_text}

{dietary_constraints}
- {diet_label}
- {goal_label}
- {allergies_label}
- {excluded_label}

{practical_constraints}
- {max_prep}
- {servings_label}{nutrition_targets}

{ingredients_label}

{important_instructions}
{instruction1}
{instruction2}
{instruction3}
{instruction4}

{json_format}
{{
    "title": "{json_title}",
    "description": "{json_desc}",
    "ingredients": [
        {{"name": "{json_ing1}", "quantity": "{json_qty1}"}},
        {{"name": "{json_ing2}", "quantity": "{json_qty2}"}}
    ],
    "instructions": [
        "{json_step1}",
        "{json_step2}",
        "{json_step3}"
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
    "tags": ["{json_tags.split(', ')[0] if ', ' in json_tags else json_tags}"],
    "personalization_note": "{json_personalization}"
}}

{final_instruction}"""

    def parse_response(self, raw_response: str, input_data: RecipeInput) -> Recipe:
        """Parse la réponse LLM en objet Recipe."""
        try:
            # Chercher le JSON dans la réponse
            json_match = re.search(r'\{[\s\S]*\}', raw_response)
            if json_match:
                data = json.loads(json_match.group())

                # Extraire les temps avec valeurs par défaut raisonnables
                prep_time = data.get("prep_time", 15)
                cook_time = data.get("cook_time", 15)
                instructions = data.get("instructions", [])

                # Si les temps sont 0 ou invalides, estimer basé sur les instructions
                if (prep_time == 0 and cook_time == 0) or (prep_time + cook_time == 0):
                    # Estimer: ~2 min par étape de préparation, ~3 min par étape de cuisson
                    num_steps = len(instructions)
                    if num_steps > 0:
                        prep_time = max(5, num_steps * 2)  # Minimum 5 min de préparation
                        cook_time = max(5, num_steps * 2)  # Minimum 5 min de cuisson
                    else:
                        prep_time = 10
                        cook_time = 15

                return Recipe(
                    title=data.get("title", "Recette sans nom"),
                    description=data.get("description", ""),
                    ingredients=data.get("ingredients", []),
                    instructions=instructions,
                    prep_time=prep_time,
                    cook_time=cook_time,
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
