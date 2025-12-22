from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.recipe import Recipe as RecipeModel, FavoriteRecipe, RecipeHistory
from app.schemas.recipe import (
    RecipeGenerateRequest,
    RecipeGenerateResponse,
    RecipeResponse,
    FavoriteCreate,
    FavoriteResponse,
    RecipeHistoryResponse,
)
from app.api.v1.auth import get_current_user
from app.agents.recipe import get_recipe_agent, RecipeInput

router = APIRouter()


@router.post("/generate", response_model=RecipeGenerateResponse)
async def generate_recipe(
    request: RecipeGenerateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> RecipeGenerateResponse:
    """
    Générer une recette personnalisée avec l'IA.

    Prend en compte le profil de l'utilisateur (régime, allergies, objectifs).
    """
    # Récupérer le profil pour personnalisation
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    # Préparer l'input pour l'agent
    recipe_input = RecipeInput(
        ingredients=request.ingredients,
        meal_type=request.meal_type,
        diet_type=profile.diet_type if profile else None,
        allergies=profile.allergies if profile else [],
        excluded_foods=profile.excluded_foods if profile else [],
        max_prep_time=request.max_prep_time,
        servings=request.servings,
        goal=profile.goal if profile else None,
        target_calories=profile.daily_calories // 3 if profile and profile.daily_calories else None,
    )

    # Générer la recette
    agent = get_recipe_agent()
    response = await agent.process(recipe_input)

    if not response.result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Échec de la génération de recette",
        )

    recipe_data = response.result.to_dict()

    # Sauvegarder en base
    recipe = RecipeModel(
        title=recipe_data["title"],
        description=recipe_data["description"],
        ingredients=recipe_data["ingredients"],
        instructions=recipe_data["instructions"],
        prep_time=recipe_data["prep_time"],
        cook_time=recipe_data["cook_time"],
        servings=recipe_data["servings"],
        calories=recipe_data["nutrition"].get("calories"),
        protein_g=recipe_data["nutrition"].get("protein"),
        carbs_g=recipe_data["nutrition"].get("carbs"),
        fat_g=recipe_data["nutrition"].get("fat"),
        fiber_g=recipe_data["nutrition"].get("fiber"),
        tags=recipe_data["tags"],
        meal_type=request.meal_type,
        diet_types=[profile.diet_type.value] if profile and profile.diet_type else [],
        is_generated=True,
        confidence_score=response.confidence,
        model_used=response.model_used,
    )

    db.add(recipe)
    await db.flush()

    # Ajouter à l'historique
    history = RecipeHistory(
        user_id=current_user.id,
        recipe_id=recipe.id,
        input_ingredients=request.ingredients,
        meal_type=request.meal_type,
    )
    db.add(history)

    await db.commit()
    await db.refresh(recipe)

    return RecipeGenerateResponse(
        recipe=RecipeResponse.model_validate(recipe),
        confidence=response.confidence,
        model_used=response.model_used,
        used_fallback=response.used_fallback,
    )


@router.get("/history", response_model=list[RecipeHistoryResponse])
async def get_recipe_history(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=10, le=50),
    offset: int = Query(default=0, ge=0),
) -> list[RecipeHistoryResponse]:
    """Récupérer l'historique des recettes générées."""
    result = await db.execute(
        select(RecipeHistory)
        .where(RecipeHistory.user_id == current_user.id)
        .options()
        .order_by(desc(RecipeHistory.created_at))
        .offset(offset)
        .limit(limit)
    )
    history_items = result.scalars().all()

    # Charger les recettes associées
    responses = []
    for item in history_items:
        recipe_result = await db.execute(
            select(RecipeModel).where(RecipeModel.id == item.recipe_id)
        )
        recipe = recipe_result.scalar_one_or_none()
        if recipe:
            responses.append(RecipeHistoryResponse(
                id=item.id,
                recipe_id=item.recipe_id,
                input_ingredients=item.input_ingredients,
                meal_type=item.meal_type,
                created_at=item.created_at,
                recipe=RecipeResponse.model_validate(recipe),
            ))

    return responses


@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
    recipe_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> RecipeResponse:
    """Récupérer une recette par son ID."""
    result = await db.execute(
        select(RecipeModel).where(RecipeModel.id == recipe_id)
    )
    recipe = result.scalar_one_or_none()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recette non trouvée",
        )

    return RecipeResponse.model_validate(recipe)


# ==================== FAVORIS ====================

@router.post("/favorites", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    data: FavoriteCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> FavoriteResponse:
    """Ajouter une recette aux favoris."""
    # Vérifier que la recette existe
    result = await db.execute(
        select(RecipeModel).where(RecipeModel.id == data.recipe_id)
    )
    recipe = result.scalar_one_or_none()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recette non trouvée",
        )

    # Vérifier si déjà en favoris
    result = await db.execute(
        select(FavoriteRecipe).where(
            FavoriteRecipe.user_id == current_user.id,
            FavoriteRecipe.recipe_id == data.recipe_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette recette est déjà dans vos favoris",
        )

    favorite = FavoriteRecipe(
        user_id=current_user.id,
        recipe_id=data.recipe_id,
        notes=data.notes,
        rating=data.rating,
    )

    db.add(favorite)
    await db.commit()
    await db.refresh(favorite)

    return FavoriteResponse(
        id=favorite.id,
        recipe_id=favorite.recipe_id,
        notes=favorite.notes,
        rating=favorite.rating,
        created_at=favorite.created_at,
        recipe=RecipeResponse.model_validate(recipe),
    )


@router.get("/favorites/", response_model=list[FavoriteResponse])
async def get_favorites(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[FavoriteResponse]:
    """Récupérer les recettes favorites."""
    result = await db.execute(
        select(FavoriteRecipe)
        .where(FavoriteRecipe.user_id == current_user.id)
        .order_by(desc(FavoriteRecipe.created_at))
        .offset(offset)
        .limit(limit)
    )
    favorites = result.scalars().all()

    responses = []
    for fav in favorites:
        recipe_result = await db.execute(
            select(RecipeModel).where(RecipeModel.id == fav.recipe_id)
        )
        recipe = recipe_result.scalar_one_or_none()
        if recipe:
            responses.append(FavoriteResponse(
                id=fav.id,
                recipe_id=fav.recipe_id,
                notes=fav.notes,
                rating=fav.rating,
                created_at=fav.created_at,
                recipe=RecipeResponse.model_validate(recipe),
            ))

    return responses


@router.delete("/favorites/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    recipe_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> None:
    """Retirer une recette des favoris."""
    result = await db.execute(
        select(FavoriteRecipe).where(
            FavoriteRecipe.user_id == current_user.id,
            FavoriteRecipe.recipe_id == recipe_id,
        )
    )
    favorite = result.scalar_one_or_none()

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favori non trouvé",
        )

    await db.delete(favorite)
    await db.commit()


@router.patch("/favorites/{recipe_id}", response_model=FavoriteResponse)
async def update_favorite(
    recipe_id: int,
    data: FavoriteCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> FavoriteResponse:
    """Mettre à jour les notes/rating d'un favori."""
    result = await db.execute(
        select(FavoriteRecipe).where(
            FavoriteRecipe.user_id == current_user.id,
            FavoriteRecipe.recipe_id == recipe_id,
        )
    )
    favorite = result.scalar_one_or_none()

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favori non trouvé",
        )

    if data.notes is not None:
        favorite.notes = data.notes
    if data.rating is not None:
        favorite.rating = data.rating

    await db.commit()
    await db.refresh(favorite)

    recipe_result = await db.execute(
        select(RecipeModel).where(RecipeModel.id == recipe_id)
    )
    recipe = recipe_result.scalar_one()

    return FavoriteResponse(
        id=favorite.id,
        recipe_id=favorite.recipe_id,
        notes=favorite.notes,
        rating=favorite.rating,
        created_at=favorite.created_at,
        recipe=RecipeResponse.model_validate(recipe),
    )
