"""Endpoints pour les plans repas IA."""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.api.deps import get_current_user, check_subscription_tier
from app.models.user import User
from app.models.profile import Profile
from app.schemas.meal_plan import (
    MealPlanRequest,
    MealPlanResponse,
    MealPlanSummary,
)
from app.agents.meal_plan import get_meal_plan_agent, MealPlanInput

router = APIRouter()


@router.post("/generate", response_model=MealPlanResponse)
async def generate_meal_plan(
    request: MealPlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Génère un plan repas personnalisé avec IA.

    Fonctionnalité PRO uniquement.
    """
    # Vérifier que l'utilisateur a le tier PRO
    await check_subscription_tier(current_user, db, required_tier="pro")

    # Récupérer le profil utilisateur
    profile_query = select(Profile).where(Profile.user_id == current_user.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Veuillez compléter votre profil nutritionnel avant de générer un plan repas."
        )

    # Construire l'input pour l'agent
    meal_plan_input = MealPlanInput(
        user_id=current_user.id,
        days=request.days,
        start_date=request.start_date or date.today(),
        meals_per_day=request.meals_per_day,
        include_snacks=request.include_snacks,
        budget_level=request.budget_level,
        cooking_time_max=request.cooking_time_max,
        variety_level=request.variety_level,
        diet_type=profile.diet_type,
        allergies=profile.allergies or [],
        excluded_foods=profile.excluded_foods or [],
        goal=profile.goal,
        target_calories=profile.daily_calories or 2000,
        target_protein=profile.protein_g or 100,
        target_carbs=profile.carbs_g or 250,
        target_fat=profile.fat_g or 65,
    )

    # Appeler l'agent
    agent = get_meal_plan_agent(language=current_user.preferred_language)

    try:
        response = await agent.process(meal_plan_input)
        result = response.result

        # Ajouter l'ID de l'utilisateur
        if isinstance(result, MealPlanResponse):
            result.user_id = current_user.id

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération du plan repas: {str(e)}"
        )


@router.get("/current", response_model=MealPlanResponse | None)
async def get_current_meal_plan(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Récupère le plan repas actuel (si généré récemment).

    Note: Les plans ne sont pas stockés en base pour l'instant,
    cette route retourne None. Une future version pourrait
    stocker les plans générés.
    """
    # Pour l'instant, on ne stocke pas les plans en base
    # Une future version pourrait les sauvegarder
    return None


@router.get("/history", response_model=list[MealPlanSummary])
async def get_meal_plan_history(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Récupère l'historique des plans repas générés.

    Note: Les plans ne sont pas stockés en base pour l'instant,
    cette route retourne une liste vide.
    """
    # Pour l'instant, pas de stockage en base
    return []


@router.post("/preview", response_model=MealPlanResponse)
async def preview_meal_plan(
    request: MealPlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Génère un aperçu de plan repas (version limitée).

    Disponible pour tous les utilisateurs, mais limité à 3 jours.
    Les utilisateurs PRO peuvent générer des plans complets.
    """
    # Récupérer le profil utilisateur
    profile_query = select(Profile).where(Profile.user_id == current_user.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Veuillez compléter votre profil nutritionnel."
        )

    # Limiter à 3 jours pour les non-PRO
    days = min(request.days, 3)

    meal_plan_input = MealPlanInput(
        user_id=current_user.id,
        days=days,
        start_date=request.start_date or date.today(),
        meals_per_day=request.meals_per_day,
        include_snacks=request.include_snacks,
        budget_level=request.budget_level,
        cooking_time_max=request.cooking_time_max,
        variety_level=request.variety_level,
        diet_type=profile.diet_type,
        allergies=profile.allergies or [],
        excluded_foods=profile.excluded_foods or [],
        goal=profile.goal,
        target_calories=profile.daily_calories or 2000,
        target_protein=profile.protein_g or 100,
        target_carbs=profile.carbs_g or 250,
        target_fat=profile.fat_g or 65,
    )

    agent = get_meal_plan_agent(language=current_user.preferred_language)

    try:
        response = await agent.process(meal_plan_input)
        result = response.result

        if isinstance(result, MealPlanResponse):
            result.user_id = current_user.id

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération de l'aperçu: {str(e)}"
        )
