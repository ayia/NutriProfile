from typing import Annotated
from datetime import datetime, date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_

from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.recipe import Recipe as RecipeModel, FavoriteRecipe, RecipeHistory
from app.models.activity import ActivityLog, WeightLog
from app.models.food_log import DailyNutrition, FoodLog
from app.schemas.recipe import (
    RecipeGenerateRequest,
    RecipeGenerateResponse,
    RecipeResponse,
    FavoriteCreate,
    FavoriteResponse,
    RecipeHistoryResponse,
)
from app.api.v1.auth import get_current_user
from app.agents.recipe import get_recipe_agent, RecipeInput, UserContext, MealHistoryAnalysis

router = APIRouter()


async def _build_meal_history(
    db: AsyncSession,
    user_id: int,
) -> MealHistoryAnalysis:
    """
    Analyse l'historique alimentaire des 7 derniers jours.

    Extrait:
    - Aliments récents et leur fréquence
    - Aliments par type de repas
    - Score de variété
    - Protéines principales consommées
    """
    week_ago = date.today() - timedelta(days=7)
    week_start = datetime.combine(week_ago, datetime.min.time())

    # Récupérer les FoodLogs des 7 derniers jours
    food_logs_query = (
        select(FoodLog)
        .where(and_(
            FoodLog.user_id == user_id,
            FoodLog.meal_date >= week_start,
        ))
        .order_by(desc(FoodLog.meal_date))
    )
    food_logs_result = await db.execute(food_logs_query)
    food_logs = food_logs_result.scalars().all()

    # Initialiser les structures de données
    all_foods: list[str] = []
    food_frequency: dict[str, int] = {}
    breakfast_foods: list[str] = []
    lunch_foods: list[str] = []
    dinner_foods: list[str] = []
    protein_keywords = ["poulet", "boeuf", "porc", "agneau", "poisson", "saumon",
                        "thon", "crevettes", "tofu", "tempeh", "oeuf", "lentilles",
                        "pois chiches", "haricots", "dinde", "canard", "veau"]
    recent_proteins: list[str] = []

    for log in food_logs:
        # Extraire les aliments détectés (JSON)
        detected = log.detected_items or []
        if isinstance(detected, list):
            for item in detected:
                food_name = item.get("name", "") if isinstance(item, dict) else str(item)
                if food_name:
                    food_name_lower = food_name.lower()
                    all_foods.append(food_name_lower)

                    # Compter la fréquence
                    food_frequency[food_name_lower] = food_frequency.get(food_name_lower, 0) + 1

                    # Classer par type de repas
                    if log.meal_type == "breakfast":
                        breakfast_foods.append(food_name_lower)
                    elif log.meal_type == "lunch":
                        lunch_foods.append(food_name_lower)
                    elif log.meal_type == "dinner":
                        dinner_foods.append(food_name_lower)

                    # Identifier les protéines
                    for protein in protein_keywords:
                        if protein in food_name_lower and protein not in recent_proteins:
                            recent_proteins.append(protein)

    # Calculer le score de variété (nombre d'aliments uniques / total * 100)
    unique_foods = len(set(all_foods))
    total_foods = len(all_foods)
    variety_score = (unique_foods / max(total_foods, 1)) * 100 if total_foods > 0 else 50.0

    # Bonus si beaucoup d'aliments uniques
    if unique_foods >= 20:
        variety_score = min(100, variety_score + 20)
    elif unique_foods >= 10:
        variety_score = min(100, variety_score + 10)

    return MealHistoryAnalysis(
        recent_foods=list(set(all_foods))[:20],  # Top 20 aliments uniques
        food_frequency=food_frequency,
        breakfast_foods=list(set(breakfast_foods))[:10],
        lunch_foods=list(set(lunch_foods))[:10],
        dinner_foods=list(set(dinner_foods))[:10],
        variety_score=min(100, variety_score),
        meals_logged_week=len(food_logs),
        recent_proteins=recent_proteins[:10],
        frequent_sides=[],  # Peut être enrichi plus tard
    )


async def _build_user_context(
    db: AsyncSession,
    user_id: int,
    profile: Profile | None
) -> UserContext | None:
    """
    Construit le contexte utilisateur complet pour la personnalisation des recettes.

    Récupère:
    - Données du profil (poids, taille, objectifs, macros)
    - Activités du jour (calories brûlées)
    - Nutrition du jour (calories consommées)
    - Tendance de poids sur la semaine
    - Historique alimentaire (7 jours)
    """
    if not profile:
        return None

    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    # 1. Récupérer les activités du jour
    activities_query = select(ActivityLog).where(and_(
        ActivityLog.user_id == user_id,
        ActivityLog.activity_date >= start_of_day,
        ActivityLog.activity_date <= end_of_day,
    ))
    activities_result = await db.execute(activities_query)
    activities = activities_result.scalars().all()

    calories_burned_today = sum(a.calories_burned or 0 for a in activities)
    activity_minutes_today = sum(a.duration_minutes for a in activities)

    # 2. Récupérer la nutrition du jour
    nutrition_query = select(DailyNutrition).where(and_(
        DailyNutrition.user_id == user_id,
        DailyNutrition.date >= start_of_day,
        DailyNutrition.date <= end_of_day,
    ))
    nutrition_result = await db.execute(nutrition_query)
    nutrition = nutrition_result.scalar_one_or_none()

    calories_consumed_today = nutrition.total_calories if nutrition else 0
    protein_consumed_today = nutrition.total_protein if nutrition else 0

    # 3. Calculer la tendance de poids sur la semaine
    week_ago = today - timedelta(days=7)
    weight_query = (
        select(WeightLog)
        .where(and_(
            WeightLog.user_id == user_id,
            WeightLog.log_date >= datetime.combine(week_ago, datetime.min.time()),
        ))
        .order_by(WeightLog.log_date)
    )
    weight_result = await db.execute(weight_query)
    weights = weight_result.scalars().all()

    weight_trend = None
    if len(weights) >= 2:
        weight_trend = weights[-1].weight_kg - weights[0].weight_kg

    # 4. Calculer la moyenne de calories sur la semaine
    week_nutrition_query = select(DailyNutrition).where(and_(
        DailyNutrition.user_id == user_id,
        DailyNutrition.date >= datetime.combine(week_ago, datetime.min.time()),
    ))
    week_nutrition_result = await db.execute(week_nutrition_query)
    week_nutritions = week_nutrition_result.scalars().all()

    avg_calories_week = None
    if week_nutritions:
        total_cal = sum(n.total_calories for n in week_nutritions)
        avg_calories_week = total_cal / len(week_nutritions)

    # 5. Déterminer le niveau d'activité réel basé sur les données
    activity_level_actual = None
    if activity_minutes_today >= 60:
        activity_level_actual = "très actif"
    elif activity_minutes_today >= 30:
        activity_level_actual = "actif"
    elif activity_minutes_today >= 15:
        activity_level_actual = "modérément actif"
    elif activity_minutes_today > 0:
        activity_level_actual = "légèrement actif"
    else:
        activity_level_actual = "sédentaire"

    # 6. Construire l'historique alimentaire
    meal_history = await _build_meal_history(db, user_id)

    # 7. Heure actuelle pour recommandations temporelles
    current_hour = datetime.now().hour

    return UserContext(
        age=profile.age,
        gender=profile.gender.value if profile.gender else None,
        weight_kg=profile.weight_kg,
        height_cm=profile.height_cm,
        target_weight_kg=profile.target_weight_kg,
        bmr=profile.bmr,
        tdee=profile.tdee,
        daily_calories=profile.daily_calories,
        protein_g=profile.protein_g,
        carbs_g=profile.carbs_g,
        fat_g=profile.fat_g,
        calories_consumed_today=calories_consumed_today,
        calories_burned_today=calories_burned_today,
        protein_consumed_today=protein_consumed_today,
        activity_minutes_today=activity_minutes_today,
        weight_trend=weight_trend,
        avg_calories_week=avg_calories_week,
        activity_level_actual=activity_level_actual,
        meal_history=meal_history,
        current_hour=current_hour,
    )


@router.post("/generate", response_model=RecipeGenerateResponse)
async def generate_recipe(
    request: RecipeGenerateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> RecipeGenerateResponse:
    """
    Générer une recette personnalisée avec l'IA.

    Prend en compte:
    - Le profil de l'utilisateur (régime, allergies, objectifs)
    - Les activités du jour (calories brûlées)
    - Les repas déjà consommés aujourd'hui
    - La tendance de poids sur la semaine
    """
    # Récupérer le profil pour personnalisation
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    # Construire le contexte utilisateur complet
    user_context = await _build_user_context(db, current_user.id, profile)

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
        target_calories=None,  # Sera calculé intelligemment par le contexte
        user_context=user_context,
    )

    # Générer la recette
    agent = get_recipe_agent(language=current_user.preferred_language)
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
