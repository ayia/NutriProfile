from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.activity import WeightLog
from app.schemas.profile import (
    ProfileCreate,
    ProfileUpdate,
    ProfileResponse,
    ProfileSummary,
    NutritionCalculation,
)
from app.api.v1.auth import get_current_user
from app.services.nutrition import get_nutrition_service
from app.agents.profiling import get_profiling_agent, ProfileInput

router = APIRouter()


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    """Récupérer le profil de l'utilisateur connecté."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé. Veuillez compléter l'onboarding.",
        )

    return ProfileResponse.model_validate(profile)


@router.get("/me/summary", response_model=ProfileSummary)
async def get_profile_summary(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> ProfileSummary:
    """Récupérer un résumé du profil pour le dashboard."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        return ProfileSummary(has_profile=False, is_complete=False)

    return ProfileSummary(
        has_profile=True,
        is_complete=profile.is_complete,
        daily_calories=profile.daily_calories,
        goal=profile.goal,
        diet_type=profile.diet_type,
    )


@router.post("/", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    profile_data: ProfileCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    """Créer un nouveau profil nutritionnel."""
    # Vérifier si un profil existe déjà
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un profil existe déjà. Utilisez PUT pour le mettre à jour.",
        )

    # Calculer les besoins nutritionnels
    nutrition_service = get_nutrition_service()
    nutrition = nutrition_service.calculate_all(
        weight_kg=profile_data.weight_kg,
        height_cm=profile_data.height_cm,
        age=profile_data.age,
        gender=profile_data.gender,
        activity_level=profile_data.activity_level,
        goal=profile_data.goal,
    )

    # Créer le profil - convert enums to their string values for database storage
    profile = Profile(
        user_id=current_user.id,
        age=profile_data.age,
        gender=profile_data.gender.value,
        height_cm=profile_data.height_cm,
        weight_kg=profile_data.weight_kg,
        activity_level=profile_data.activity_level.value,
        goal=profile_data.goal.value,
        target_weight_kg=profile_data.target_weight_kg,
        diet_type=profile_data.diet_type.value,
        allergies=profile_data.allergies,
        excluded_foods=profile_data.excluded_foods,
        favorite_foods=profile_data.favorite_foods,
        medical_conditions=profile_data.medical_conditions,
        medications=profile_data.medications,
        bmr=nutrition.bmr,
        tdee=nutrition.tdee,
        daily_calories=nutrition.daily_calories,
        protein_g=nutrition.protein_g,
        carbs_g=nutrition.carbs_g,
        fat_g=nutrition.fat_g,
        is_complete=True,
    )

    db.add(profile)
    await db.flush()

    # Créer le premier enregistrement de poids dans l'historique
    initial_weight_log = WeightLog(
        user_id=current_user.id,
        weight_kg=profile_data.weight_kg,
        notes="Poids initial du profil",
        log_date=datetime.utcnow(),
    )
    db.add(initial_weight_log)

    await db.commit()
    await db.refresh(profile)

    return ProfileResponse.model_validate(profile)


@router.put("/me", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    """Mettre à jour le profil."""
    # Use print for guaranteed visibility in logs
    print(f"[PROFILE UPDATE] Received request from user {current_user.id}")
    print(f"[PROFILE UPDATE] Raw profile_data: {profile_data}")

    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        print(f"[PROFILE UPDATE] Profile not found for user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé.",
        )

    # Sauvegarder l'ancien poids pour comparaison
    old_weight = profile.weight_kg

    # Mettre à jour les champs fournis - convert enums to string values
    update_data = profile_data.model_dump(exclude_unset=True)
    print(f"[PROFILE UPDATE] update_data after model_dump: {update_data}")
    enum_fields = {'gender', 'activity_level', 'goal', 'diet_type'}
    for field, value in update_data.items():
        if field in enum_fields and hasattr(value, 'value'):
            setattr(profile, field, value.value)
        else:
            setattr(profile, field, value)

    # Recalculer si les données de base changent
    recalculate_fields = {'age', 'gender', 'height_cm', 'weight_kg', 'activity_level', 'goal'}
    if recalculate_fields & set(update_data.keys()):
        nutrition_service = get_nutrition_service()
        nutrition = nutrition_service.calculate_all(
            weight_kg=profile.weight_kg,
            height_cm=profile.height_cm,
            age=profile.age,
            gender=profile.gender,
            activity_level=profile.activity_level,
            goal=profile.goal,
        )
        profile.bmr = nutrition.bmr
        profile.tdee = nutrition.tdee
        profile.daily_calories = nutrition.daily_calories
        profile.protein_g = nutrition.protein_g
        profile.carbs_g = nutrition.carbs_g
        profile.fat_g = nutrition.fat_g

    # Si le poids a changé, créer une entrée dans l'historique
    if 'weight_kg' in update_data and update_data['weight_kg'] != old_weight:
        weight_log = WeightLog(
            user_id=current_user.id,
            weight_kg=update_data['weight_kg'],
            notes="Mise à jour depuis le profil",
            log_date=datetime.utcnow(),
        )
        db.add(weight_log)

    await db.commit()
    await db.refresh(profile)

    print(f"[PROFILE UPDATE] SUCCESS - medications: {profile.medications}, medical_conditions: {profile.medical_conditions}")
    return ProfileResponse.model_validate(profile)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> None:
    """Supprimer le profil."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé.",
        )

    await db.delete(profile)
    await db.commit()


@router.post("/me/analyze")
async def analyze_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Analyser le profil avec l'agent IA.

    Retourne des recommandations personnalisées et des alertes.
    """
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé.",
        )

    # Créer l'input pour l'agent
    profile_input = ProfileInput(
        age=profile.age,
        gender=profile.gender,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        activity_level=profile.activity_level,
        goal=profile.goal,
        diet_type=profile.diet_type,
        allergies=profile.allergies,
        medical_conditions=profile.medical_conditions,
    )

    # Lancer l'analyse
    agent = get_profiling_agent(language=current_user.preferred_language)
    response = await agent.process(profile_input)

    return {
        "analysis": response.result.to_dict() if response.result else None,
        "confidence": response.confidence,
        "model_used": response.model_used,
        "used_fallback": response.used_fallback,
    }


@router.post("/calculate", response_model=NutritionCalculation)
async def calculate_nutrition(
    profile_data: ProfileCreate,
) -> NutritionCalculation:
    """
    Calculer les besoins nutritionnels sans créer de profil.

    Utile pour prévisualiser les calculs pendant l'onboarding.
    """
    nutrition_service = get_nutrition_service()

    return nutrition_service.calculate_all(
        weight_kg=profile_data.weight_kg,
        height_cm=profile_data.height_cm,
        age=profile_data.age,
        gender=profile_data.gender,
        activity_level=profile_data.activity_level,
        goal=profile_data.goal,
    )
