import json
import re
from typing import Any

from app.agents.base import BaseAgent, AgentResponse
from app.llm.models import ModelCapability
from app.models.profile import DietType, Goal


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
        """Construit le prompt pour générer une recette."""
        diet_instructions = {
            DietType.VEGAN: "La recette doit être 100% végétalienne (pas de produits animaux).",
            DietType.VEGETARIAN: "La recette doit être végétarienne (pas de viande ni poisson).",
            DietType.PESCATARIAN: "La recette peut contenir du poisson mais pas de viande.",
            DietType.KETO: "La recette doit être pauvre en glucides (moins de 20g net).",
            DietType.PALEO: "La recette doit suivre le régime paléo (pas de céréales, légumineuses, produits laitiers).",
            DietType.MEDITERRANEAN: "La recette doit suivre le régime méditerranéen.",
            DietType.OMNIVORE: "Pas de restriction particulière.",
        }

        goal_instructions = {
            Goal.LOSE_WEIGHT: "Privilégie les recettes légères et riches en protéines.",
            Goal.GAIN_MUSCLE: "Privilégie les recettes riches en protéines (30g+ par portion).",
            Goal.MAINTAIN: "Équilibre les macronutriments.",
            Goal.IMPROVE_HEALTH: "Privilégie les aliments nutritifs et peu transformés.",
        }

        ingredients_text = ", ".join(input_data.ingredients) if input_data.ingredients else "au choix"
        allergies_text = ", ".join(input_data.allergies) if input_data.allergies else "aucune"
        excluded_text = ", ".join(input_data.excluded_foods) if input_data.excluded_foods else "aucun"

        # Gérer les valeurs None pour diet_type et goal
        diet_type = input_data.diet_type or DietType.OMNIVORE
        goal = input_data.goal or Goal.MAINTAIN
        diet_text = f"{diet_type.value} - {diet_instructions.get(diet_type, '')}"
        goal_text = goal_instructions.get(goal, "Équilibre les macronutriments.")

        return f"""Tu es un chef cuisinier expert en nutrition. Génère une recette pour un {input_data.meal_type}.

CONTRAINTES:
- Régime: {diet_text}
- Objectif: {goal_text}
- Allergies à éviter: {allergies_text}
- Aliments exclus: {excluded_text}
- Temps de préparation max: {input_data.max_prep_time} minutes
- Nombre de portions: {input_data.servings}
{f"- Calories cibles par portion: {input_data.target_calories} kcal" if input_data.target_calories else ""}

INGRÉDIENTS DISPONIBLES: {ingredients_text}

Réponds en JSON avec ce format exact:
{{
    "title": "Nom de la recette",
    "description": "Description courte et appétissante",
    "ingredients": [
        {{"name": "ingrédient 1", "quantity": "quantité"}},
        {{"name": "ingrédient 2", "quantity": "quantité"}}
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
        "calories": 450,
        "protein": 30,
        "carbs": 40,
        "fat": 15,
        "fiber": 8
    }},
    "tags": ["rapide", "healthy", "protéiné"]
}}

Sois créatif mais réaliste. La recette doit être facile à suivre."""

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
                title="Bowl de flocons d'avoine aux fruits",
                description="Un petit-déjeuner équilibré et nutritif",
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
                title="Salade de poulet grillé",
                description="Une salade fraîche et protéinée",
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
                title="Saumon aux légumes rôtis",
                description="Un dîner sain et savoureux",
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
                title="Yaourt grec aux noix",
                description="Un encas protéiné et rassasiant",
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


def get_recipe_agent() -> RecipeAgent:
    """Retourne une instance de l'agent recettes."""
    return RecipeAgent()
