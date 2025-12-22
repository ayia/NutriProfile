from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.food_log import FoodLog, FoodItem as FoodItemModel, DailyNutrition
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
)
from app.agents.vision import get_vision_agent, VisionInput, validate_nutrition

router = APIRouter()


@router.post("/analyze", response_model=ImageAnalyzeResponse)
async def analyze_image(
    request: ImageAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Analyse une image de nourriture et détecte les aliments.

    - Utilise l'IA vision pour identifier les aliments
    - Estime les portions et valeurs nutritionnelles
    - Optionnellement sauvegarde dans le journal
    """
    agent = get_vision_agent()

    # Préparer l'input
    vision_input = VisionInput(
        image_base64=request.image_base64,
        context=request.meal_type,
    )

    # Analyser l'image
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

    food_log_id = None

    # Sauvegarder si demandé
    if request.save_to_log:
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
    )


@router.get("/logs", response_model=list[FoodLogResponse])
async def get_food_logs(
    date: date | None = None,
    meal_type: str | None = None,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère les logs de repas de l'utilisateur."""
    query = select(FoodLog).where(FoodLog.user_id == current_user.id)

    if date:
        start = datetime.combine(date, datetime.min.time())
        end = datetime.combine(date, datetime.max.time())
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

@router.get("/daily/{date}", response_model=DailyMealsResponse)
async def get_daily_meals(
    date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère les repas et le résumé nutritionnel d'une journée."""
    # Récupérer les repas
    start = datetime.combine(date, datetime.min.time())
    end = datetime.combine(date, datetime.max.time())

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

    return DailyMealsResponse(
        date=datetime.combine(date, datetime.min.time()),
        meals=meals,
        nutrition=nutrition,
    )


@router.post("/daily/{date}/water")
async def add_water(
    date: date,
    data: WaterLogRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ajoute de l'eau au suivi journalier."""
    start = datetime.combine(date, datetime.min.time())
    end = datetime.combine(date, datetime.max.time())

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
            date=datetime.combine(date, datetime.min.time()),
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
