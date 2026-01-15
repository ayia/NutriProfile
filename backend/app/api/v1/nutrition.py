"""
API endpoints pour recherche nutritionnelle.

Fournit un système de waterfall pour trouver les informations nutritionnelles :
1. USDA FoodData Central API (300k aliments)
2. Agent LLM Nutrition (HuggingFace)
3. Saisie manuelle (frontend)
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
import structlog

from app.models.user import User
from app.api.v1.auth import get_current_user
from app.services.multilingual_nutrition_search import search_nutrition_multilingual

logger = structlog.get_logger()
router = APIRouter()


class NutritionSearchRequest(BaseModel):
    """Requête de recherche nutritionnelle."""

    food_name: str = Field(..., min_length=1, max_length=200)
    quantity_g: float = Field(default=100.0, gt=0, le=10000)
    context: str | None = Field(default=None, max_length=500)
    language: str = Field(default="en", pattern="^(en|fr|ar|de|es|pt|zh)$")


class NutritionSearchResponse(BaseModel):
    """Réponse de recherche nutritionnelle."""

    found: bool
    food_name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: float
    source: str  # "usda", "llm", "not_found"
    confidence: float  # 0.0-1.0
    portion_size_g: float


@router.post("/search", response_model=NutritionSearchResponse)
async def search_nutrition_endpoint(
    request: NutritionSearchRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Recherche les informations nutritionnelles pour un aliment.

    Waterfall automatique :
    1. USDA FoodData Central API (300,000 aliments, gratuit)
    2. Agent LLM Nutrition (HuggingFace, pour plats composés/exotiques)
    3. not_found → frontend affiche saisie manuelle

    Args:
        request: Nom de l'aliment, quantité, contexte optionnel

    Returns:
        Informations nutritionnelles ou indication not_found
    """
    logger.info(
        "nutrition_search_request",
        user_id=current_user.id,
        food=request.food_name,
        quantity_g=request.quantity_g,
        language=request.language,
    )

    # === NOUVELLE APPROCHE: MULTILINGUAL HYBRID SEARCH ===
    # Waterfall: Embeddings → Traduction → LLM
    result = await search_nutrition_multilingual(
        food_name=request.food_name,
        quantity_g=request.quantity_g,
        language=request.language,
        context=request.context
    )

    if result:
        logger.info(
            "nutrition_found",
            food=request.food_name,
            source=result.source,
            calories=result.calories,
            confidence=result.confidence,
        )

        return NutritionSearchResponse(
            found=True,
            food_name=result.food_name,
            calories=round(result.calories, 1),
            protein=round(result.protein, 1),
            carbs=round(result.carbs, 1),
            fat=round(result.fat, 1),
            fiber=round(result.fiber, 1),
            source=result.source,
            confidence=result.confidence,
            portion_size_g=request.quantity_g,
        )

    # === NOT FOUND → Frontend saisie manuelle ===
    logger.warning("nutrition_not_found", food=request.food_name)

    return NutritionSearchResponse(
        found=False,
        food_name=request.food_name,
        calories=0.0,
        protein=0.0,
        carbs=0.0,
        fat=0.0,
        fiber=0.0,
        source="not_found",
        confidence=0.0,
        portion_size_g=request.quantity_g,
    )
