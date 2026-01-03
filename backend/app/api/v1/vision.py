from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.database import get_db, async_session_maker
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.food_log import FoodLog, FoodItem as FoodItemModel, DailyNutrition
from app.models.activity import ActivityLog, WeightLog
from app.schemas.food_log import (
    ImageAnalyzeRequest,
    ImageAnalyzeResponse,
    DetectedItem,
    FoodLogCreate,
    FoodLogResponse,
    FoodLogUpdate,
    FoodItemCreate,
    FoodItemResponse,
    FoodItemUpdate,
    DailyNutritionResponse,
    DailyMealsResponse,
    WaterLogRequest,
    HealthReportResponse,
    AnalysisSaveRequest,
)
from app.agents.vision import get_vision_agent, VisionInput, validate_nutrition, calculate_health_report, FoodAnalysis
from app.services.subscription import SubscriptionService, get_limit_value

router = APIRouter()


@router.post("/analyze", response_model=ImageAnalyzeResponse)
async def analyze_image(
    request: ImageAnalyzeRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Analyse une image de nourriture et détecte les aliments.

    - Utilise l'IA vision pour identifier les aliments
    - Estime les portions et valeurs nutritionnelles
    - Génère un rapport de santé personnalisé basé sur le profil
    - Sauvegarde automatiquement dans le journal (par défaut)
    """
    # Phase 1: Vérifier les limites (nouvelle session courte)
    async with async_session_maker() as db:
        sub_service = SubscriptionService(db)
        allowed, used, limit = await sub_service.check_limit(current_user.id, "vision_analyses")

        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "limit_reached",
                    "message": "Limite d'analyses photo atteinte pour aujourd'hui",
                    "used": used,
                    "limit": limit,
                    "upgrade_url": "/pricing"
                }
            )

    # Phase 2: Analyse IA (peut prendre du temps - pas de DB ici)
    agent = get_vision_agent(language=current_user.preferred_language)

    vision_input = VisionInput(
        image_base64=request.image_base64,
        context=request.meal_type,
    )

    try:
        result = await agent.process(vision_input)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'analyse: {str(e)}"
        )

    analysis = result.result
    confidence = result.confidence
    model_used = result.model_used

    # Valider les valeurs nutritionnelles
    validated_items = [validate_nutrition(item) for item in analysis.items]

    # Recalculer les totaux
    total_calories = sum(item.calories for item in validated_items)
    total_protein = sum(item.protein for item in validated_items)
    total_carbs = sum(item.carbs for item in validated_items)
    total_fat = sum(item.fat for item in validated_items)

    # Phase 3: Opérations DB post-analyse (nouvelle session fraîche)
    async with async_session_maker() as db:
        # Incrémenter l'usage après analyse réussie
        sub_service = SubscriptionService(db)
        await sub_service.increment_usage(current_user.id, "vision_analyses")
        # Commit immédiat pour l'usage (même si save_to_log est false)
        await db.commit()

        # Récupérer le profil utilisateur pour le rapport de santé
        profile_query = select(Profile).where(Profile.user_id == current_user.id)
        profile_result = await db.execute(profile_query)
        profile = profile_result.scalar_one_or_none()

        # Récupérer ce qui a été consommé aujourd'hui
        today = datetime.utcnow().date()
        start_of_day = datetime.combine(today, datetime.min.time())
        end_of_day = datetime.combine(today, datetime.max.time())

        daily_query = select(DailyNutrition).where(and_(
            DailyNutrition.user_id == current_user.id,
            DailyNutrition.date >= start_of_day,
            DailyNutrition.date <= end_of_day,
        ))
        daily_result = await db.execute(daily_query)
        daily_nutrition = daily_result.scalar_one_or_none()

        # === RÉCUPÉRER LES ACTIVITÉS DU JOUR ===
        activities_query = select(ActivityLog).where(and_(
            ActivityLog.user_id == current_user.id,
            ActivityLog.activity_date >= start_of_day,
            ActivityLog.activity_date <= end_of_day,
        ))
        activities_result = await db.execute(activities_query)
        activities_today = activities_result.scalars().all()

        activities_dict = None
        if activities_today:
            activities_dict = {
                "calories_burned": sum(a.calories_burned or 0 for a in activities_today),
                "duration_minutes": sum(a.duration_minutes for a in activities_today),
                "activity_types": list(set(a.activity_type for a in activities_today)),
            }

        # === RÉCUPÉRER LA TENDANCE DE POIDS (7 derniers jours) ===
        week_ago = today - timedelta(days=7)
        weight_query = (
            select(WeightLog)
            .where(and_(
                WeightLog.user_id == current_user.id,
                WeightLog.log_date >= datetime.combine(week_ago, datetime.min.time()),
            ))
            .order_by(WeightLog.log_date)
        )
        weight_result = await db.execute(weight_query)
        weight_logs = weight_result.scalars().all()

        weight_trend_dict = None
        if len(weight_logs) >= 2:
            first_weight = weight_logs[0].weight_kg
            last_weight = weight_logs[-1].weight_kg
            change = last_weight - first_weight

            direction = "stable"
            if change < -0.3:
                direction = "losing"
            elif change > 0.3:
                direction = "gaining"

            # Calculer les jours restants pour atteindre l'objectif
            days_to_goal = None
            if profile and profile.target_weight_kg and change != 0:
                remaining = abs(last_weight - profile.target_weight_kg)
                weekly_rate = abs(change)
                if weekly_rate > 0:
                    days_to_goal = int((remaining / weekly_rate) * 7)

            weight_trend_dict = {
                "change_7d": round(change, 2),
                "direction": direction,
                "days_to_goal": days_to_goal,
                "current_weight": last_weight,
            }

        # === RÉCUPÉRER L'HISTORIQUE ALIMENTAIRE (7 derniers jours) ===
        meal_history_query = (
            select(FoodLog)
            .where(and_(
                FoodLog.user_id == current_user.id,
                FoodLog.meal_date >= datetime.combine(week_ago, datetime.min.time()),
            ))
            .options(selectinload(FoodLog.items))
        )
        meal_history_result = await db.execute(meal_history_query)
        recent_meals = meal_history_result.scalars().all()

        meal_history_dict = None
        if recent_meals:
            # Extraire les aliments récents
            recent_foods = []
            for meal in recent_meals:
                for item in meal.items:
                    if item.name not in recent_foods:
                        recent_foods.append(item.name)

            # Calculer le score de variété
            unique_foods = len(set(recent_foods))
            total_items = len(recent_foods)
            variety_score = min(100, int((unique_foods / max(total_items, 1)) * 100 * 2))

            # Moyenne des calories sur 7 jours
            daily_calories_map = {}
            for meal in recent_meals:
                meal_date = meal.meal_date.date()
                if meal_date not in daily_calories_map:
                    daily_calories_map[meal_date] = 0
                daily_calories_map[meal_date] += meal.total_calories or 0

            avg_calories = sum(daily_calories_map.values()) / max(len(daily_calories_map), 1)

            meal_history_dict = {
                "recent_foods": recent_foods[-20:],  # 20 derniers aliments
                "variety_score": variety_score,
                "avg_calories_7d": round(avg_calories),
            }

        # === PRÉPARER LES DONNÉES DU PROFIL COMPLET ===
        user_profile_dict = None
        if profile:
            user_profile_dict = {
                # Objectifs nutritionnels
                "daily_calories": profile.daily_calories,
                "protein_g": profile.protein_g,
                "carbs_g": profile.carbs_g,
                "fat_g": profile.fat_g,
                "goal": profile.goal or "maintain",
                "diet_type": profile.diet_type or "omnivore",
                "allergies": profile.allergies or [],
                "excluded_foods": profile.excluded_foods or [],
                # Données physiques
                "age": profile.age,
                "gender": profile.gender,
                "weight_kg": profile.weight_kg,
                "height_cm": profile.height_cm,
                "target_weight_kg": profile.target_weight_kg,
                "activity_level": profile.activity_level or "moderate",
                # Données métaboliques
                "bmr": profile.bmr,
                "tdee": profile.tdee,
                # Données de santé
                "medical_conditions": profile.medical_conditions or [],
                "medications": profile.medications or [],
            }

        # === PRÉPARER LES DONNÉES DE CONSOMMATION DU JOUR ===
        daily_consumed_dict = None
        if daily_nutrition:
            daily_consumed_dict = {
                "calories": daily_nutrition.total_calories or 0,
                "protein": daily_nutrition.total_protein or 0,
                "carbs": daily_nutrition.total_carbs or 0,
                "fat": daily_nutrition.total_fat or 0,
                "water_ml": daily_nutrition.water_ml or 0,
                "meals_count": daily_nutrition.meals_count or 0,
            }

        food_log_id = None

        # Sauvegarder si demandé (par défaut: True)
        if request.save_to_log:
            # Protection anti-doublons: vérifier si un repas similaire existe dans les 5 dernières minutes
            five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
            duplicate_check = select(FoodLog).where(and_(
                FoodLog.user_id == current_user.id,
                FoodLog.meal_type == request.meal_type,
                FoodLog.total_calories == total_calories,
                FoodLog.created_at >= five_minutes_ago,
            ))
            duplicate_result = await db.execute(duplicate_check)
            existing_duplicate = duplicate_result.scalar_one_or_none()

            if existing_duplicate:
                # Retourner l'ID du repas existant sans créer de doublon
                food_log_id = existing_duplicate.id
            else:
                food_log = FoodLog(
                    user_id=current_user.id,
                    meal_type=request.meal_type,
                    meal_date=datetime.utcnow(),
                    description=analysis.description,
                    image_analyzed=True,
                    detected_items=[item.to_dict() for item in validated_items],
                    confidence_score=confidence,
                    model_used=model_used,
                    total_calories=total_calories,
                    total_protein=total_protein,
                    total_carbs=total_carbs,
                    total_fat=total_fat,
                )
                db.add(food_log)
                await db.flush()

                # Créer les items individuels
                for item in validated_items:
                    food_item = FoodItemModel(
                        food_log_id=food_log.id,
                        name=item.name,
                        quantity=item.quantity,
                        unit=item.unit,
                        calories=item.calories,
                        protein=item.protein,
                        carbs=item.carbs,
                        fat=item.fat,
                        source="ai",
                        confidence=item.confidence,
                    )
                    db.add(food_item)

                await db.commit()
                food_log_id = food_log.id

                # Mettre à jour le résumé journalier
                await update_daily_nutrition(db, current_user.id, datetime.utcnow().date())

    # Créer un objet FoodAnalysis pour le calcul du rapport
    analysis_for_report = FoodAnalysis(
        items=validated_items,
        meal_type=analysis.meal_type or request.meal_type,
        total_calories=total_calories,
        total_protein=total_protein,
        total_carbs=total_carbs,
        total_fat=total_fat,
        description=analysis.description,
    )

    # === CALCULER LE RAPPORT DE SANTÉ ULTRA-PERSONNALISÉ ===
    health_report = calculate_health_report(
        analysis=analysis_for_report,
        user_profile=user_profile_dict,
        daily_consumed=daily_consumed_dict,
        activities_today=activities_dict,
        weight_trend=weight_trend_dict,
        meal_history=meal_history_dict,
        language=current_user.preferred_language,
    )

    # Préparer la réponse
    detected_items = [
        DetectedItem(
            name=item.name,
            quantity=item.quantity,
            unit=item.unit,
            calories=item.calories,
            protein=item.protein,
            carbs=item.carbs,
            fat=item.fat,
            confidence=item.confidence,
        )
        for item in validated_items
    ]

    # Construire la réponse du rapport de santé
    health_report_response = HealthReportResponse(
        health_score=health_report.health_score,
        goal_compatibility=health_report.goal_compatibility,
        verdict=health_report.verdict,
        verdict_color=health_report.verdict_color,
        summary=health_report.summary,
        positive_points=health_report.positive_points,
        negative_points=health_report.negative_points,
        recommendations=health_report.recommendations,
        macro_analysis=health_report.macro_analysis,
        weekly_impact=health_report.weekly_impact,
        meal_timing_feedback=health_report.meal_timing_feedback,
    )

    return ImageAnalyzeResponse(
        success=True,
        description=analysis.description,
        meal_type=analysis.meal_type or request.meal_type,
        items=detected_items,
        total_calories=total_calories,
        total_protein=round(total_protein, 1),
        total_carbs=round(total_carbs, 1),
        total_fat=round(total_fat, 1),
        confidence=confidence,
        model_used=model_used,
        food_log_id=food_log_id,
        health_report=health_report_response,
    )


@router.post("/logs/save", response_model=FoodLogResponse)
async def save_analysis(
    request: AnalysisSaveRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Sauvegarde une analyse déjà effectuée dans le journal.

    - Ne reconsomme PAS de crédit (le scan a déjà été compté)
    - Sauvegarde les items détectés dans la base de données
    - Met à jour le résumé nutritionnel journalier
    """
    # Utiliser une session fraîche pour éviter les problèmes de connexion
    async with async_session_maker() as db:
        # Protection anti-doublons: vérifier si un repas similaire existe dans les 5 dernières minutes
        five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
        duplicate_check = select(FoodLog).where(and_(
            FoodLog.user_id == current_user.id,
            FoodLog.meal_type == request.meal_type,
            FoodLog.total_calories == request.total_calories,
            FoodLog.created_at >= five_minutes_ago,
        ))
        duplicate_result = await db.execute(duplicate_check)
        existing_duplicate = duplicate_result.scalar_one_or_none()

        if existing_duplicate:
            # Retourner le repas existant sans créer de doublon
            query = (
                select(FoodLog)
                .where(FoodLog.id == existing_duplicate.id)
                .options(selectinload(FoodLog.items))
            )
            result = await db.execute(query)
            return result.scalar_one()

        # Créer le food log
        food_log = FoodLog(
            user_id=current_user.id,
            meal_type=request.meal_type,
            meal_date=datetime.utcnow(),
            description=request.description,
            image_analyzed=True,
            detected_items=[item.model_dump() for item in request.items],
            confidence_score=request.confidence,
            model_used=request.model_used,
            total_calories=request.total_calories,
            total_protein=request.total_protein,
            total_carbs=request.total_carbs,
            total_fat=request.total_fat,
        )
        db.add(food_log)
        await db.flush()

        # Créer les items individuels
        for item in request.items:
            food_item = FoodItemModel(
                food_log_id=food_log.id,
                name=item.name,
                quantity=item.quantity,
                unit=item.unit,
                calories=item.calories,
                protein=item.protein,
                carbs=item.carbs,
                fat=item.fat,
                source="ai",
                confidence=item.confidence,
            )
            db.add(food_item)

        await db.commit()
        await db.refresh(food_log)

        # Mettre à jour le résumé journalier
        await update_daily_nutrition(db, current_user.id, datetime.utcnow().date())

        # Recharger avec les items
        query = (
            select(FoodLog)
            .where(FoodLog.id == food_log.id)
            .options(selectinload(FoodLog.items))
        )
        result = await db.execute(query)
        return result.scalar_one()


@router.get("/logs", response_model=list[FoodLogResponse])
async def get_food_logs(
    filter_date: date | None = None,
    meal_type: str | None = None,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère les logs de repas de l'utilisateur (limité par tier)."""
    # Appliquer le filtre d'historique basé sur le tier
    sub_service = SubscriptionService(db)
    tier = await sub_service.get_user_tier(current_user.id)
    # Utiliser get_limit_value pour extraire la valeur entière (pas le dict)
    history_days = get_limit_value(tier, "history_days")

    query = select(FoodLog).where(FoodLog.user_id == current_user.id)

    # Appliquer la limite d'historique si pas illimité (-1)
    if history_days != -1:
        min_date = datetime.combine(
            date.today() - timedelta(days=history_days),
            datetime.min.time()
        )
        query = query.where(FoodLog.meal_date >= min_date)

    if filter_date:
        start = datetime.combine(filter_date, datetime.min.time())
        end = datetime.combine(filter_date, datetime.max.time())
        query = query.where(and_(FoodLog.meal_date >= start, FoodLog.meal_date <= end))

    if meal_type:
        query = query.where(FoodLog.meal_type == meal_type)

    query = query.options(selectinload(FoodLog.items))
    query = query.order_by(FoodLog.meal_date.desc()).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/logs/{log_id}", response_model=FoodLogResponse)
async def get_food_log(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère un log de repas spécifique."""
    query = (
        select(FoodLog)
        .where(and_(FoodLog.id == log_id, FoodLog.user_id == current_user.id))
        .options(selectinload(FoodLog.items))
    )
    result = await db.execute(query)
    food_log = result.scalar_one_or_none()

    if not food_log:
        raise HTTPException(status_code=404, detail="Log non trouvé")

    return food_log


@router.post("/logs", response_model=FoodLogResponse)
async def create_food_log(
    data: FoodLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crée un log de repas manuellement."""
    food_log = FoodLog(
        user_id=current_user.id,
        meal_type=data.meal_type,
        meal_date=data.meal_date or datetime.utcnow(),
        description=data.description,
    )
    db.add(food_log)
    await db.flush()

    total_calories = 0
    total_protein = 0.0
    total_carbs = 0.0
    total_fat = 0.0

    if data.items:
        for item_data in data.items:
            food_item = FoodItemModel(
                food_log_id=food_log.id,
                name=item_data.name,
                quantity=item_data.quantity,
                unit=item_data.unit,
                calories=item_data.calories or 0,
                protein=item_data.protein or 0,
                carbs=item_data.carbs or 0,
                fat=item_data.fat or 0,
                source="manual",
            )
            db.add(food_item)
            total_calories += item_data.calories or 0
            total_protein += item_data.protein or 0
            total_carbs += item_data.carbs or 0
            total_fat += item_data.fat or 0

    food_log.total_calories = total_calories
    food_log.total_protein = total_protein
    food_log.total_carbs = total_carbs
    food_log.total_fat = total_fat

    await db.commit()
    await db.refresh(food_log)

    # Mettre à jour le résumé journalier
    await update_daily_nutrition(db, current_user.id, food_log.meal_date.date())

    return food_log


@router.patch("/logs/{log_id}", response_model=FoodLogResponse)
async def update_food_log(
    log_id: int,
    data: FoodLogUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Met à jour un log de repas."""
    query = select(FoodLog).where(
        and_(FoodLog.id == log_id, FoodLog.user_id == current_user.id)
    )
    result = await db.execute(query)
    food_log = result.scalar_one_or_none()

    if not food_log:
        raise HTTPException(status_code=404, detail="Log non trouvé")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(food_log, field, value)

    food_log.user_corrected = True
    await db.commit()
    await db.refresh(food_log)

    # Mettre à jour le résumé journalier
    await update_daily_nutrition(db, current_user.id, food_log.meal_date.date())

    return food_log


@router.delete("/logs/{log_id}")
async def delete_food_log(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Supprime un log de repas."""
    query = select(FoodLog).where(
        and_(FoodLog.id == log_id, FoodLog.user_id == current_user.id)
    )
    result = await db.execute(query)
    food_log = result.scalar_one_or_none()

    if not food_log:
        raise HTTPException(status_code=404, detail="Log non trouvé")

    meal_date = food_log.meal_date.date()
    await db.delete(food_log)
    await db.commit()

    # Mettre à jour le résumé journalier
    await update_daily_nutrition(db, current_user.id, meal_date)

    return {"message": "Log supprimé"}


# Food Items endpoints

@router.post("/logs/{log_id}/items", response_model=FoodItemResponse)
async def add_food_item(
    log_id: int,
    data: FoodItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ajoute un aliment à un log."""
    query = select(FoodLog).where(
        and_(FoodLog.id == log_id, FoodLog.user_id == current_user.id)
    )
    result = await db.execute(query)
    food_log = result.scalar_one_or_none()

    if not food_log:
        raise HTTPException(status_code=404, detail="Log non trouvé")

    food_item = FoodItemModel(
        food_log_id=log_id,
        name=data.name,
        quantity=data.quantity,
        unit=data.unit,
        calories=data.calories or 0,
        protein=data.protein or 0,
        carbs=data.carbs or 0,
        fat=data.fat or 0,
        source="manual",
    )
    db.add(food_item)

    # Mettre à jour les totaux du log
    food_log.total_calories = (food_log.total_calories or 0) + (data.calories or 0)
    food_log.total_protein = (food_log.total_protein or 0) + (data.protein or 0)
    food_log.total_carbs = (food_log.total_carbs or 0) + (data.carbs or 0)
    food_log.total_fat = (food_log.total_fat or 0) + (data.fat or 0)
    food_log.user_corrected = True

    await db.commit()
    await db.refresh(food_item)

    # Mettre à jour le résumé journalier
    await update_daily_nutrition(db, current_user.id, food_log.meal_date.date())

    return food_item


@router.patch("/items/{item_id}", response_model=FoodItemResponse)
async def update_food_item(
    item_id: int,
    data: FoodItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Met à jour un aliment (correction)."""
    query = (
        select(FoodItemModel)
        .join(FoodLog)
        .where(and_(FoodItemModel.id == item_id, FoodLog.user_id == current_user.id))
    )
    result = await db.execute(query)
    food_item = result.scalar_one_or_none()

    if not food_item:
        raise HTTPException(status_code=404, detail="Aliment non trouvé")

    # Sauvegarder les anciennes valeurs pour recalcul
    old_calories = food_item.calories or 0
    old_protein = food_item.protein or 0
    old_carbs = food_item.carbs or 0
    old_fat = food_item.fat or 0

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(food_item, field, value)

    food_item.source = "manual"

    # Mettre à jour les totaux du log parent
    log_query = select(FoodLog).where(FoodLog.id == food_item.food_log_id)
    log_result = await db.execute(log_query)
    food_log = log_result.scalar_one()

    food_log.total_calories = (food_log.total_calories or 0) - old_calories + (food_item.calories or 0)
    food_log.total_protein = (food_log.total_protein or 0) - old_protein + (food_item.protein or 0)
    food_log.total_carbs = (food_log.total_carbs or 0) - old_carbs + (food_item.carbs or 0)
    food_log.total_fat = (food_log.total_fat or 0) - old_fat + (food_item.fat or 0)
    food_log.user_corrected = True

    await db.commit()
    await db.refresh(food_item)

    # Mettre à jour le résumé journalier
    await update_daily_nutrition(db, current_user.id, food_log.meal_date.date())

    return food_item


@router.delete("/items/{item_id}")
async def delete_food_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Supprime un aliment."""
    query = (
        select(FoodItemModel)
        .join(FoodLog)
        .where(and_(FoodItemModel.id == item_id, FoodLog.user_id == current_user.id))
    )
    result = await db.execute(query)
    food_item = result.scalar_one_or_none()

    if not food_item:
        raise HTTPException(status_code=404, detail="Aliment non trouvé")

    # Mettre à jour les totaux du log parent
    log_query = select(FoodLog).where(FoodLog.id == food_item.food_log_id)
    log_result = await db.execute(log_query)
    food_log = log_result.scalar_one()

    food_log.total_calories = (food_log.total_calories or 0) - (food_item.calories or 0)
    food_log.total_protein = (food_log.total_protein or 0) - (food_item.protein or 0)
    food_log.total_carbs = (food_log.total_carbs or 0) - (food_item.carbs or 0)
    food_log.total_fat = (food_log.total_fat or 0) - (food_item.fat or 0)

    meal_date = food_log.meal_date.date()
    await db.delete(food_item)
    await db.commit()

    # Mettre à jour le résumé journalier
    await update_daily_nutrition(db, current_user.id, meal_date)

    return {"message": "Aliment supprimé"}


# Daily Nutrition endpoints

@router.get("/daily/{target_date}", response_model=DailyMealsResponse)
async def get_daily_meals(
    target_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère les repas et le résumé nutritionnel d'une journée (limité par tier)."""
    import logging
    logger = logging.getLogger(__name__)

    # Vérifier si la date est dans la limite d'historique du tier
    sub_service = SubscriptionService(db)
    tier = await sub_service.get_user_tier(current_user.id)
    # Utiliser get_limit_value pour extraire la valeur entière (pas le dict)
    history_days = get_limit_value(tier, "history_days")

    server_today = date.today()
    logger.info(f"[get_daily_meals] user_id={current_user.id}, target_date={target_date}, server_today={server_today}, tier={tier}, history_days={history_days}")

    # Vérifier si la date demandée est accessible
    if history_days != -1:
        min_allowed_date = server_today - timedelta(days=history_days)
        if target_date < min_allowed_date:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "history_limit",
                    "message": f"Votre abonnement limite l'historique à {history_days} jours",
                    "upgrade_url": "/pricing"
                }
            )

    # Récupérer les repas pour la date demandée
    start = datetime.combine(target_date, datetime.min.time())
    end = datetime.combine(target_date, datetime.max.time())
    logger.info(f"[get_daily_meals] Querying meals between {start} and {end}")

    meals_query = (
        select(FoodLog)
        .where(and_(
            FoodLog.user_id == current_user.id,
            FoodLog.meal_date >= start,
            FoodLog.meal_date <= end,
        ))
        .options(selectinload(FoodLog.items))
        .order_by(FoodLog.meal_date)
    )
    meals_result = await db.execute(meals_query)
    meals = meals_result.scalars().all()

    # Récupérer le résumé journalier
    nutrition_query = select(DailyNutrition).where(and_(
        DailyNutrition.user_id == current_user.id,
        DailyNutrition.date >= start,
        DailyNutrition.date <= end,
    ))
    nutrition_result = await db.execute(nutrition_query)
    nutrition = nutrition_result.scalar_one_or_none()

    logger.info(f"[get_daily_meals] Found {len(meals)} meals for user {current_user.id} on {target_date}")

    return DailyMealsResponse(
        date=datetime.combine(target_date, datetime.min.time()),
        meals=meals,
        nutrition=nutrition,
    )


@router.post("/daily/{target_date}/water")
async def add_water(
    target_date: date,
    data: WaterLogRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ajoute de l'eau au suivi journalier."""
    start = datetime.combine(target_date, datetime.min.time())
    end = datetime.combine(target_date, datetime.max.time())

    query = select(DailyNutrition).where(and_(
        DailyNutrition.user_id == current_user.id,
        DailyNutrition.date >= start,
        DailyNutrition.date <= end,
    ))
    result = await db.execute(query)
    daily = result.scalar_one_or_none()

    if not daily:
        daily = DailyNutrition(
            user_id=current_user.id,
            date=datetime.combine(target_date, datetime.min.time()),
        )
        db.add(daily)

    daily.water_ml = (daily.water_ml or 0) + data.amount_ml
    await db.commit()

    return {"water_ml": daily.water_ml}


# Helper function

async def update_daily_nutrition(db: AsyncSession, user_id: int, target_date: date):
    """Met à jour le résumé nutritionnel journalier."""
    start = datetime.combine(target_date, datetime.min.time())
    end = datetime.combine(target_date, datetime.max.time())

    # Récupérer tous les logs du jour
    logs_query = select(FoodLog).where(and_(
        FoodLog.user_id == user_id,
        FoodLog.meal_date >= start,
        FoodLog.meal_date <= end,
    ))
    logs_result = await db.execute(logs_query)
    logs = logs_result.scalars().all()

    # Calculer les totaux
    total_calories = sum(log.total_calories or 0 for log in logs)
    total_protein = sum(log.total_protein or 0 for log in logs)
    total_carbs = sum(log.total_carbs or 0 for log in logs)
    total_fat = sum(log.total_fat or 0 for log in logs)
    total_fiber = sum(log.total_fiber or 0 for log in logs)
    meals_count = len(logs)

    # Récupérer ou créer le résumé journalier
    daily_query = select(DailyNutrition).where(and_(
        DailyNutrition.user_id == user_id,
        DailyNutrition.date >= start,
        DailyNutrition.date <= end,
    ))
    daily_result = await db.execute(daily_query)
    daily = daily_result.scalar_one_or_none()

    if not daily:
        daily = DailyNutrition(
            user_id=user_id,
            date=datetime.combine(target_date, datetime.min.time()),
        )
        db.add(daily)

    daily.total_calories = total_calories
    daily.total_protein = total_protein
    daily.total_carbs = total_carbs
    daily.total_fat = total_fat
    daily.total_fiber = total_fiber
    daily.meals_count = meals_count

    await db.commit()
