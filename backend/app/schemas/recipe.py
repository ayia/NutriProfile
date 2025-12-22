from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class IngredientItem(BaseModel):
    """Un ingrédient avec sa quantité."""
    name: str
    quantity: str


class NutritionInfo(BaseModel):
    """Informations nutritionnelles."""
    calories: int = 0
    protein: int = Field(0, alias="protein_g")
    carbs: int = Field(0, alias="carbs_g")
    fat: int = Field(0, alias="fat_g")
    fiber: int = Field(0, alias="fiber_g")

    model_config = ConfigDict(populate_by_name=True)


class RecipeGenerateRequest(BaseModel):
    """Requête de génération de recette."""
    ingredients: list[str] = Field(default_factory=list, description="Ingrédients disponibles")
    meal_type: str = Field(default="lunch", description="Type de repas: breakfast, lunch, dinner, snack")
    max_prep_time: int = Field(default=30, ge=5, le=120, description="Temps de préparation max en minutes")
    servings: int = Field(default=2, ge=1, le=10, description="Nombre de portions")


class RecipeResponse(BaseModel):
    """Réponse avec une recette."""
    id: int
    title: str
    description: str | None
    image_url: str | None
    ingredients: list[IngredientItem]
    instructions: list[str]
    prep_time: int
    cook_time: int
    total_time: int = 0
    servings: int
    calories: int | None
    protein_g: int | None
    carbs_g: int | None
    fat_g: int | None
    fiber_g: int | None
    tags: list[str]
    meal_type: str
    is_generated: bool
    confidence_score: float | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    def __init__(self, **data):
        if 'total_time' not in data or data['total_time'] == 0:
            data['total_time'] = (data.get('prep_time') or 0) + (data.get('cook_time') or 0)
        super().__init__(**data)


class RecipeGenerateResponse(BaseModel):
    """Réponse de génération de recette."""
    recipe: RecipeResponse
    confidence: float
    model_used: str
    used_fallback: bool


class FavoriteCreate(BaseModel):
    """Ajouter une recette aux favoris."""
    recipe_id: int
    notes: str | None = None
    rating: int | None = Field(None, ge=1, le=5)


class FavoriteResponse(BaseModel):
    """Réponse favori."""
    id: int
    recipe_id: int
    notes: str | None
    rating: int | None
    created_at: datetime
    recipe: RecipeResponse

    model_config = ConfigDict(from_attributes=True)


class RecipeHistoryResponse(BaseModel):
    """Historique des recettes générées."""
    id: int
    recipe_id: int
    input_ingredients: list[str]
    meal_type: str | None
    created_at: datetime
    recipe: RecipeResponse

    model_config = ConfigDict(from_attributes=True)
