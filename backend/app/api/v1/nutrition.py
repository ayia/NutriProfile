"""
API endpoints pour recherche nutritionnelle.

Fournit un système de waterfall pour trouver les informations nutritionnelles :
1. USDA FoodData Central API (300k aliments)
2. Traduction NLLB-200 + recherche USDA
3. Agent LLM Nutrition (HuggingFace)
4. Saisie manuelle (frontend)

Endpoint de traduction utilisant NLLB-200 (Facebook) pour traduire
les noms d'aliments de n'importe quelle langue vers l'anglais.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
import structlog

from app.models.user import User
from app.api.v1.auth import get_current_user
from app.services.multilingual_nutrition_search import search_nutrition_multilingual
from app.services.nllb_translator import (
    translate_food_to_english,
    translate_with_nllb,
    get_supported_languages,
    get_cache_stats,
)

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


# ==========================================
# Endpoints de traduction NLLB-200
# ==========================================

class TranslationRequest(BaseModel):
    """Requête de traduction."""

    text: str = Field(..., min_length=1, max_length=200, description="Texte à traduire")
    source_lang: str = Field(
        ...,
        pattern="^(en|fr|ar|de|es|pt|zh)$",
        description="Code langue source (en, fr, ar, de, es, pt, zh)"
    )
    target_lang: str = Field(
        default="en",
        pattern="^(en|fr|ar|de|es|pt|zh)$",
        description="Code langue cible (défaut: en)"
    )


class TranslationResponse(BaseModel):
    """Réponse de traduction."""

    original: str
    translated: str
    source_lang: str
    target_lang: str
    from_cache: bool = False


class FoodTranslationRequest(BaseModel):
    """Requête de traduction d'aliment vers anglais."""

    food_name: str = Field(..., min_length=1, max_length=200, description="Nom de l'aliment")
    language: str = Field(
        ...,
        pattern="^(en|fr|ar|de|es|pt|zh)$",
        description="Langue du nom (en, fr, ar, de, es, pt, zh)"
    )


class SupportedLanguagesResponse(BaseModel):
    """Langues supportées par NLLB-200."""

    languages: dict[str, str]
    cache_stats: dict


@router.post("/translate", response_model=TranslationResponse)
async def translate_text_endpoint(
    request: TranslationRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Traduit un texte d'une langue vers une autre avec NLLB-200.

    NLLB-200 (No Language Left Behind) est un modèle de traduction de Facebook/Meta
    spécialisé pour la traduction haute qualité entre 200 langues.

    Langues supportées: en, fr, de, es, pt, zh, ar

    Args:
        request: Texte à traduire, langue source et cible

    Returns:
        Texte traduit avec métadonnées
    """
    logger.info(
        "translation_request",
        user_id=current_user.id,
        text=request.text[:50],
        source=request.source_lang,
        target=request.target_lang,
    )

    try:
        translated = await translate_with_nllb(
            text=request.text,
            source_lang=request.source_lang,
            target_lang=request.target_lang
        )

        return TranslationResponse(
            original=request.text,
            translated=translated,
            source_lang=request.source_lang,
            target_lang=request.target_lang,
        )

    except Exception as e:
        logger.error("translation_error", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Erreur de traduction: {str(e)}"
        )


@router.post("/translate/food", response_model=TranslationResponse)
async def translate_food_name_endpoint(
    request: FoodTranslationRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Traduit un nom d'aliment vers l'anglais pour recherche USDA/OFF.

    Endpoint optimisé pour les noms d'aliments. Utilise NLLB-200 pour
    les langues nécessitant traduction (zh, ar) et retourne l'original
    pour les langues supportées nativement par USDA/OFF.

    Args:
        request: Nom de l'aliment et langue source

    Returns:
        Nom traduit en anglais
    """
    logger.info(
        "food_translation_request",
        user_id=current_user.id,
        food=request.food_name,
        language=request.language,
    )

    try:
        translated = await translate_food_to_english(
            food_name=request.food_name,
            source_lang=request.language
        )

        return TranslationResponse(
            original=request.food_name,
            translated=translated,
            source_lang=request.language,
            target_lang="en",
        )

    except Exception as e:
        logger.error("food_translation_error", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Erreur de traduction: {str(e)}"
        )


@router.get("/translate/languages", response_model=SupportedLanguagesResponse)
async def get_translation_languages_endpoint(
    current_user: User = Depends(get_current_user),
):
    """
    Retourne les langues supportées par le service de traduction NLLB-200.

    Returns:
        Liste des langues avec leurs codes NLLB et statistiques du cache
    """
    return SupportedLanguagesResponse(
        languages=get_supported_languages(),
        cache_stats=get_cache_stats(),
    )
