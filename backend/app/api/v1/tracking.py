from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.activity import ActivityLog, WeightLog, Goal as GoalModel, ACTIVITY_TYPES, calculate_calories_burned
from app.models.food_log import FoodLog, DailyNutrition
from app.schemas.activity import (
    ActivityLogCreate,
    ActivityLogResponse,
    ActivityLogUpdate,
    WeightLogCreate,
    WeightLogResponse,
    GoalCreate,
    GoalResponse,
    GoalUpdate,
    DailyStats,
    WeeklyStats,
    ProgressData,
    ActivityTypeSummary,
    TrackingSummary,
    WeeklyChartDay,
    WeeklyChartData,
)

router = APIRouter()


# ==================== Activity Logs ====================

@router.post("/activities", response_model=ActivityLogResponse)
async def create_activity(
    data: ActivityLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crée un log d'activité."""
    # Calculer les calories si non fournies
    calories_burned = data.calories_burned
    calories_source = "manual" if data.calories_burned else "estimated"

    if not calories_burned:
        # Récupérer le poids de l'utilisateur via une requête explicite
        weight = 70  # Défaut
        from app.models.profile import Profile
        profile_query = select(Profile).where(Profile.user_id == current_user.id)
        profile_result = await db.execute(profile_query)
        profile = profile_result.scalar_one_or_none()
        if profile and profile.weight_kg:
            weight = profile.weight_kg

        calories_burned = calculate_calories_burned(
            data.activity_type,
            data.duration_minutes,
            data.intensity,
            weight
        )

    activity = ActivityLog(
        user_id=current_user.id,
        activity_type=data.activity_type,
        name=data.name,
        duration_minutes=data.duration_minutes,
        intensity=data.intensity,
        calories_burned=calories_burned,
        calories_source=calories_source,
        distance_km=data.distance_km,
        steps=data.steps,
        heart_rate_avg=data.heart_rate_avg,
        notes=data.notes,
        activity_date=data.activity_date or datetime.utcnow(),
    )

    db.add(activity)
    await db.commit()
    await db.refresh(activity)

    return activity


@router.get("/activities", response_model=list[ActivityLogResponse])
async def get_activities(
    start_date: date | None = None,
    end_date: date | None = None,
    activity_type: str | None = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère les activités de l'utilisateur."""
    query = select(ActivityLog).where(ActivityLog.user_id == current_user.id)

    if start_date:
        query = query.where(ActivityLog.activity_date >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.where(ActivityLog.activity_date <= datetime.combine(end_date, datetime.max.time()))
    if activity_type:
        query = query.where(ActivityLog.activity_type == activity_type)

    query = query.order_by(ActivityLog.activity_date.desc()).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/activities/{activity_id}", response_model=ActivityLogResponse)
async def update_activity(
    activity_id: int,
    data: ActivityLogUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Met à jour une activité."""
    query = select(ActivityLog).where(
        and_(ActivityLog.id == activity_id, ActivityLog.user_id == current_user.id)
    )
    result = await db.execute(query)
    activity = result.scalar_one_or_none()

    if not activity:
        raise HTTPException(status_code=404, detail="Activité non trouvée")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)

    await db.commit()
    await db.refresh(activity)

    return activity


@router.delete("/activities/{activity_id}")
async def delete_activity(
    activity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Supprime une activité."""
    query = select(ActivityLog).where(
        and_(ActivityLog.id == activity_id, ActivityLog.user_id == current_user.id)
    )
    result = await db.execute(query)
    activity = result.scalar_one_or_none()

    if not activity:
        raise HTTPException(status_code=404, detail="Activité non trouvée")

    await db.delete(activity)
    await db.commit()

    return {"message": "Activité supprimée"}


# ==================== Weight Logs ====================

@router.post("/weight", response_model=WeightLogResponse)
async def create_weight_log(
    data: WeightLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crée un log de poids."""
    from app.models.profile import Profile

    weight_log = WeightLog(
        user_id=current_user.id,
        weight_kg=data.weight_kg,
        body_fat_percent=data.body_fat_percent,
        muscle_mass_kg=data.muscle_mass_kg,
        notes=data.notes,
        log_date=data.log_date or datetime.utcnow(),
    )

    db.add(weight_log)
    await db.commit()
    await db.refresh(weight_log)

    # Mettre à jour le poids dans le profil via une requête explicite
    profile_query = select(Profile).where(Profile.user_id == current_user.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    if profile:
        profile.weight_kg = data.weight_kg
        await db.commit()

    return weight_log


@router.get("/weight", response_model=list[WeightLogResponse])
async def get_weight_logs(
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère l'historique de poids."""
    query = (
        select(WeightLog)
        .where(WeightLog.user_id == current_user.id)
        .order_by(WeightLog.log_date.desc())
        .limit(limit)
    )

    result = await db.execute(query)
    return result.scalars().all()


# ==================== Goals ====================

@router.post("/goals", response_model=GoalResponse)
async def create_goal(
    data: GoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crée un objectif."""
    goal = GoalModel(
        user_id=current_user.id,
        goal_type=data.goal_type,
        target_value=data.target_value,
        unit=data.unit,
        period=data.period,
        start_date=data.start_date or datetime.utcnow(),
        end_date=data.end_date,
    )

    db.add(goal)
    await db.commit()
    await db.refresh(goal)

    return goal


@router.get("/goals", response_model=list[GoalResponse])
async def get_goals(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère les objectifs."""
    query = select(GoalModel).where(GoalModel.user_id == current_user.id)

    if active_only:
        query = query.where(GoalModel.is_active == True)

    query = query.order_by(GoalModel.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/goals/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    data: GoalUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Met à jour un objectif."""
    query = select(GoalModel).where(
        and_(GoalModel.id == goal_id, GoalModel.user_id == current_user.id)
    )
    result = await db.execute(query)
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)

    # Vérifier si l'objectif est atteint
    if goal.current_value >= goal.target_value and not goal.is_completed:
        goal.is_completed = True
        goal.completed_at = datetime.utcnow()

    await db.commit()
    await db.refresh(goal)

    return goal


@router.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Supprime un objectif."""
    query = select(GoalModel).where(
        and_(GoalModel.id == goal_id, GoalModel.user_id == current_user.id)
    )
    result = await db.execute(query)
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(status_code=404, detail="Objectif non trouvé")

    await db.delete(goal)
    await db.commit()

    return {"message": "Objectif supprimé"}


# ==================== Statistics ====================

@router.get("/stats/daily/{target_date}", response_model=DailyStats)
async def get_daily_stats(
    target_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère les statistiques d'une journée."""
    start = datetime.combine(target_date, datetime.min.time())
    end = datetime.combine(target_date, datetime.max.time())

    # Nutrition
    nutrition_query = select(DailyNutrition).where(and_(
        DailyNutrition.user_id == current_user.id,
        DailyNutrition.date >= start,
        DailyNutrition.date <= end,
    ))
    nutrition_result = await db.execute(nutrition_query)
    nutrition = nutrition_result.scalar_one_or_none()

    # Activités
    activities_query = select(ActivityLog).where(and_(
        ActivityLog.user_id == current_user.id,
        ActivityLog.activity_date >= start,
        ActivityLog.activity_date <= end,
    ))
    activities_result = await db.execute(activities_query)
    activities = activities_result.scalars().all()

    calories_burned = sum(a.calories_burned or 0 for a in activities)
    activity_minutes = sum(a.duration_minutes for a in activities)
    steps = sum(a.steps or 0 for a in activities)

    calories_consumed = nutrition.total_calories if nutrition else 0

    return DailyStats(
        date=target_date,
        calories_consumed=calories_consumed,
        calories_burned=calories_burned,
        net_calories=calories_consumed - calories_burned,
        protein_g=nutrition.total_protein if nutrition else 0,
        carbs_g=nutrition.total_carbs if nutrition else 0,
        fat_g=nutrition.total_fat if nutrition else 0,
        water_ml=nutrition.water_ml if nutrition else 0,
        steps=steps,
        activity_minutes=activity_minutes,
        meals_count=nutrition.meals_count if nutrition else 0,
    )


@router.get("/stats/weekly", response_model=WeeklyStats)
async def get_weekly_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère les statistiques de la semaine."""
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)

    start = datetime.combine(start_of_week, datetime.min.time())
    end = datetime.combine(end_of_week, datetime.max.time())

    # Nutrition
    nutrition_query = select(DailyNutrition).where(and_(
        DailyNutrition.user_id == current_user.id,
        DailyNutrition.date >= start,
        DailyNutrition.date <= end,
    ))
    nutrition_result = await db.execute(nutrition_query)
    nutritions = nutrition_result.scalars().all()

    # Activités
    activities_query = select(ActivityLog).where(and_(
        ActivityLog.user_id == current_user.id,
        ActivityLog.activity_date >= start,
        ActivityLog.activity_date <= end,
    ))
    activities_result = await db.execute(activities_query)
    activities = activities_result.scalars().all()

    # Poids
    weight_query = (
        select(WeightLog)
        .where(and_(
            WeightLog.user_id == current_user.id,
            WeightLog.log_date >= start,
            WeightLog.log_date <= end,
        ))
        .order_by(WeightLog.log_date)
    )
    weight_result = await db.execute(weight_query)
    weights = weight_result.scalars().all()

    weight_change = None
    if len(weights) >= 2:
        weight_change = weights[-1].weight_kg - weights[0].weight_kg

    total_calories = sum(n.total_calories for n in nutritions)
    total_burned = sum(a.calories_burned or 0 for a in activities)
    days_logged = len(nutritions)

    return WeeklyStats(
        start_date=start_of_week,
        end_date=end_of_week,
        avg_calories_consumed=total_calories / days_logged if days_logged > 0 else 0,
        avg_calories_burned=total_burned / 7,
        total_activity_minutes=sum(a.duration_minutes for a in activities),
        total_steps=sum(a.steps or 0 for a in activities),
        weight_change=weight_change,
        days_logged=days_logged,
    )


@router.get("/stats/progress", response_model=ProgressData)
async def get_progress_data(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère les données de progression pour les graphiques."""
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)

    dates = []
    calories = []
    protein = []
    weight_data = []
    activity_minutes = []

    # Récupérer toutes les données en une fois
    start = datetime.combine(start_date, datetime.min.time())
    end = datetime.combine(end_date, datetime.max.time())

    nutrition_query = select(DailyNutrition).where(and_(
        DailyNutrition.user_id == current_user.id,
        DailyNutrition.date >= start,
        DailyNutrition.date <= end,
    ))
    nutrition_result = await db.execute(nutrition_query)
    nutritions = {n.date.date(): n for n in nutrition_result.scalars().all()}

    activities_query = select(
        func.date(ActivityLog.activity_date).label('date'),
        func.sum(ActivityLog.duration_minutes).label('total_minutes')
    ).where(and_(
        ActivityLog.user_id == current_user.id,
        ActivityLog.activity_date >= start,
        ActivityLog.activity_date <= end,
    )).group_by(func.date(ActivityLog.activity_date))
    activities_result = await db.execute(activities_query)
    activities_by_date = {row.date: row.total_minutes for row in activities_result}

    weight_query = select(WeightLog).where(and_(
        WeightLog.user_id == current_user.id,
        WeightLog.log_date >= start,
        WeightLog.log_date <= end,
    ))
    weight_result = await db.execute(weight_query)
    weights_by_date = {w.log_date.date(): w.weight_kg for w in weight_result.scalars().all()}

    current = start_date
    while current <= end_date:
        dates.append(current.isoformat())

        nutrition = nutritions.get(current)
        calories.append(nutrition.total_calories if nutrition else 0)
        protein.append(nutrition.total_protein if nutrition else 0)

        weight_data.append(weights_by_date.get(current))
        activity_minutes.append(activities_by_date.get(current, 0))

        current += timedelta(days=1)

    return ProgressData(
        dates=dates,
        calories=calories,
        protein=protein,
        weight=weight_data,
        activity_minutes=activity_minutes,
    )


@router.get("/stats/weekly-chart", response_model=WeeklyChartData)
async def get_weekly_chart_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère les données pour le graphique hebdomadaire."""
    from app.models.profile import Profile

    # Noms des jours en français
    DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    DAY_SHORT = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())

    # Récupérer l'objectif calorique de l'utilisateur
    profile_query = select(Profile).where(Profile.user_id == current_user.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    calorie_target = profile.daily_calories if profile and profile.daily_calories else 2000

    # Récupérer les données de nutrition pour la semaine
    start = datetime.combine(start_of_week, datetime.min.time())
    end = datetime.combine(start_of_week + timedelta(days=6), datetime.max.time())

    nutrition_query = select(DailyNutrition).where(and_(
        DailyNutrition.user_id == current_user.id,
        DailyNutrition.date >= start,
        DailyNutrition.date <= end,
    ))
    nutrition_result = await db.execute(nutrition_query)
    nutritions = {n.date.date(): n for n in nutrition_result.scalars().all()}

    # Construire les données pour chaque jour
    days = []
    for i in range(7):
        current_date = start_of_week + timedelta(days=i)
        nutrition = nutritions.get(current_date)

        days.append(WeeklyChartDay(
            day=DAY_NAMES[i],
            shortDay=DAY_SHORT[i],
            date=current_date.isoformat(),
            calories=int(nutrition.total_calories) if nutrition else 0,
            target=calorie_target,
            protein=int(nutrition.total_protein) if nutrition else 0,
            carbs=int(nutrition.total_carbs) if nutrition else 0,
            fat=int(nutrition.total_fat) if nutrition else 0,
        ))

    return WeeklyChartData(days=days, calorie_target=calorie_target)


@router.get("/stats/activities-breakdown", response_model=list[ActivityTypeSummary])
async def get_activities_breakdown(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère la répartition des activités."""
    start = datetime.combine(date.today() - timedelta(days=days), datetime.min.time())

    query = select(
        ActivityLog.activity_type,
        func.sum(ActivityLog.duration_minutes).label('total_duration'),
        func.sum(ActivityLog.calories_burned).label('total_calories'),
        func.count().label('count')
    ).where(and_(
        ActivityLog.user_id == current_user.id,
        ActivityLog.activity_date >= start,
    )).group_by(ActivityLog.activity_type)

    result = await db.execute(query)

    breakdown = []
    for row in result:
        activity_info = ACTIVITY_TYPES.get(row.activity_type, ACTIVITY_TYPES["other"])
        breakdown.append(ActivityTypeSummary(
            activity_type=row.activity_type,
            name=activity_info["name"],
            icon=activity_info["icon"],
            total_duration=row.total_duration or 0,
            total_calories=row.total_calories or 0,
            count=row.count,
        ))

    return sorted(breakdown, key=lambda x: x.total_duration, reverse=True)


@router.get("/summary", response_model=TrackingSummary)
async def get_tracking_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère le résumé complet du suivi."""
    today = date.today()

    # Stats du jour
    daily_stats = await get_daily_stats(today, db, current_user)

    # Stats de la semaine
    weekly_stats = await get_weekly_stats(db, current_user)

    # Objectifs actifs
    goals = await get_goals(True, db, current_user)

    # Activités récentes
    recent_activities = await get_activities(None, None, None, 5, db, current_user)

    # Poids récents
    recent_weights = await get_weight_logs(7, db, current_user)

    # Répartition activités
    activity_breakdown = await get_activities_breakdown(30, db, current_user)

    return TrackingSummary(
        today=daily_stats,
        week=weekly_stats,
        goals=goals,
        recent_activities=recent_activities,
        recent_weights=recent_weights,
        activity_breakdown=activity_breakdown,
    )
