"""Schémas pour les plans repas IA."""
from datetime import date
from pydantic import BaseModel, Field
from typing import Literal


class MealPlanRequest(BaseModel):
    """Requête de génération de plan repas."""

    days: int = Field(
        default=7,
        ge=1,
        le=14,
        description="Nombre de jours à planifier"
    )
    start_date: date | None = Field(
        default=None,
        description="Date de début du plan"
    )
    meals_per_day: int = Field(
        default=3,
        ge=2,
        le=5,
        description="Nombre de repas par jour"
    )
    include_snacks: bool = Field(
        default=True,
        description="Inclure des collations"
    )
    budget_level: Literal["low", "medium", "high"] = Field(
        default="medium",
        description="Niveau de budget"
    )
    cooking_time_max: int = Field(
        default=45,
        description="Temps de cuisson max en minutes"
    )
    variety_level: Literal["low", "medium", "high"] = Field(
        default="medium",
        description="Niveau de variété souhaité"
    )


class MealPlanMeal(BaseModel):
    """Un repas dans le plan."""

    meal_type: Literal["breakfast", "lunch", "dinner", "snack"]
    name: str
    description: str
    ingredients: list[dict[str, str]]  # [{"name": "...", "quantity": "..."}]
    prep_time: int
    cook_time: int
    calories: int
    protein: int
    carbs: int
    fat: int
    tags: list[str] = []


class MealPlanDay(BaseModel):
    """Plan d'une journée."""

    date: str
    day_name: str
    meals: list[MealPlanMeal]
    total_calories: int
    total_protein: int
    total_carbs: int
    total_fat: int


class MealPlanResponse(BaseModel):
    """Réponse du plan repas complet."""

    id: int | None = None
    user_id: int
    start_date: str
    end_date: str
    days: list[MealPlanDay]

    # Totaux
    avg_daily_calories: int
    avg_daily_protein: int
    avg_daily_carbs: int
    avg_daily_fat: int

    # Méta
    confidence: float
    generation_time_ms: int
    models_used: list[str]

    # Shopping list
    shopping_list: list[dict[str, str]] | None = None


class MealPlanSummary(BaseModel):
    """Résumé d'un plan repas."""

    id: int
    start_date: str
    end_date: str
    days_count: int
    avg_calories: int
    created_at: str
    is_active: bool


class ShoppingListItem(BaseModel):
    """Un item de la liste de courses."""

    name: str
    quantity: str
    category: str
    estimated_price: float | None = None
