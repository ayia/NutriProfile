import asyncio
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.food_log import FoodLog, DailyNutrition
from app.models.activity import ActivityLog
from app.models.gamification import Achievement, Streak, Notification, UserStats, ACHIEVEMENTS, calculate_level
from app.agents.coach import get_coach_agent, CoachInput, get_time_of_day
from app.agents.dashboard_personalizer import get_dashboard_personalizer_agent, PersonalizerInput
from app.i18n import get_translator, DEFAULT_LANGUAGE
from app.schemas.dashboard import (
    CoachResponseSchema,
    CoachAdviceSchema,
    AchievementResponse,
    StreakResponse,
    NotificationResponse,
    UserStatsResponse,
    QuickStats,
    DashboardResponse,
    PersonalizationData,
    PriorityWidget,
    PersonalizedStat,
    HealthAlert,
    PersonalizedInsight,
    UIConfig,
)

router = APIRouter()


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Récupère toutes les données du dashboard.
    """
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    # Récupérer ou créer les stats utilisateur
    stats = await get_or_create_user_stats(db, current_user.id)

    # Nutrition du jour - calculée directement depuis food_logs pour être toujours à jour
    food_logs_query = select(FoodLog).where(and_(
        FoodLog.user_id == current_user.id,
        FoodLog.meal_date >= start_of_day,
        FoodLog.meal_date <= end_of_day,
    ))
    food_logs_result = await db.execute(food_logs_query)
    food_logs = food_logs_result.scalars().all()

    # Calculer les totaux depuis les food_logs
    calories_from_food = sum(log.total_calories or 0 for log in food_logs)
    protein_from_food = sum(log.total_protein or 0 for log in food_logs)
    carbs_from_food = sum(log.total_carbs or 0 for log in food_logs)
    fat_from_food = sum(log.total_fat or 0 for log in food_logs)
    meals_count = len(food_logs)

    # Récupérer l'eau depuis DailyNutrition (seule donnée qui y est stockée séparément)
    nutrition_query = select(DailyNutrition).where(and_(
        DailyNutrition.user_id == current_user.id,
        DailyNutrition.date >= start_of_day,
        DailyNutrition.date <= end_of_day,
    ))
    nutrition_result = await db.execute(nutrition_query)
    nutrition = nutrition_result.scalar_one_or_none()
    water_today = nutrition.water_ml if nutrition else 0

    # Activités du jour - récupérer durée ET calories brûlées
    activities_query = select(
        func.sum(ActivityLog.duration_minutes),
        func.sum(ActivityLog.calories_burned)
    ).where(and_(
        ActivityLog.user_id == current_user.id,
        ActivityLog.activity_date >= start_of_day,
        ActivityLog.activity_date <= end_of_day,
    ))
    activities_result = await db.execute(activities_query)
    activity_row = activities_result.one()
    activity_minutes = activity_row[0] or 0
    calories_burned = activity_row[1] or 0

    # Streak de logging
    streak_query = select(Streak).where(and_(
        Streak.user_id == current_user.id,
        Streak.streak_type == "logging",
    ))
    streak_result = await db.execute(streak_query)
    logging_streak = streak_result.scalar_one_or_none()

    # Objectifs du profil - chargement explicite pour async
    profile_query = select(Profile).where(Profile.user_id == current_user.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    target_calories = profile.daily_calories if profile and profile.daily_calories else 2000
    target_protein = profile.protein_g if profile and profile.protein_g else 100
    target_carbs = profile.carbs_g if profile and profile.carbs_g else 250
    target_fat = profile.fat_g if profile and profile.fat_g else 65

    # Calculer les calories nettes (mangées - brûlées par activité)
    # Note: On affiche les calories nettes pour un suivi plus précis
    # Fix 2023-12-23: calories_from_food - calories_burned = net calories
    calories_net = max(0, calories_from_food - calories_burned)

    # Objectifs personnalisables depuis le profil (avec valeurs par défaut)
    water_target = profile.water_target_ml if profile and hasattr(profile, 'water_target_ml') else 2000
    activity_target = profile.activity_target_min if profile and hasattr(profile, 'activity_target_min') else 30

    quick_stats = QuickStats(
        calories_today=calories_net,
        calories_target=target_calories,
        calories_percent=round((calories_net / target_calories) * 100, 1) if target_calories else 0,
        protein_today=protein_from_food,
        protein_target=target_protein,
        protein_percent=round((protein_from_food / target_protein) * 100, 1) if target_protein else 0,
        # Glucides - important pour diabétiques
        carbs_today=carbs_from_food,
        carbs_target=target_carbs,
        carbs_percent=round((carbs_from_food / target_carbs) * 100, 1) if target_carbs else 0,
        # Lipides - important pour santé cardiaque
        fat_today=fat_from_food,
        fat_target=target_fat,
        fat_percent=round((fat_from_food / target_fat) * 100, 1) if target_fat else 0,
        water_today=water_today,
        water_target=water_target,
        water_percent=round((water_today / water_target) * 100, 1) if water_target else 0,
        activity_today=activity_minutes,
        activity_target=activity_target,
        activity_percent=round((activity_minutes / activity_target) * 100, 1) if activity_target else 0,
        calories_burned=calories_burned,
        meals_today=meals_count,
        streak_days=logging_streak.current_count if logging_streak else 0,
    )

    # Conseil du coach (avec fallback si l'API IA échoue ou timeout)
    coach_advice = None
    if profile:
        # Vérifier si le token Hugging Face est configuré
        from app.config import get_settings
        settings = get_settings()
        hf_token = settings.HUGGINGFACE_TOKEN

        # Si le token n'est pas configuré ou est le placeholder, utiliser directement le fallback
        if not hf_token or hf_token == "" or "your-" in hf_token.lower() or "placeholder" in hf_token.lower():
            import logging
            logging.info("Hugging Face token not configured, using fallback coach advice")
            coach_advice = get_fallback_coach_advice(current_user.name, quick_stats, current_user.preferred_language)
        else:
            try:
                # Timeout de 5 secondes pour éviter que le dashboard reste bloqué
                coach_advice = await asyncio.wait_for(
                    get_coach_advice(db, current_user, quick_stats),
                    timeout=5.0
                )
            except asyncio.TimeoutError:
                import logging
                logging.warning("Coach AI timed out after 5s, using fallback")
                coach_advice = get_fallback_coach_advice(current_user.name, quick_stats, current_user.preferred_language)
            except Exception as e:
                # Si le coach IA échoue, on utilise un conseil par défaut
                import logging
                logging.warning(f"Coach AI failed, using fallback: {e}")
                coach_advice = get_fallback_coach_advice(current_user.name, quick_stats, current_user.preferred_language)

    # Achievements récents
    achievements_query = (
        select(Achievement)
        .where(Achievement.user_id == current_user.id)
        .order_by(Achievement.unlocked_at.desc())
        .limit(5)
    )
    achievements_result = await db.execute(achievements_query)
    recent_achievements = achievements_result.scalars().all()

    # Streaks actifs
    streaks_query = select(Streak).where(and_(
        Streak.user_id == current_user.id,
        Streak.current_count > 0,
    ))
    streaks_result = await db.execute(streaks_query)
    active_streaks = streaks_result.scalars().all()

    # Notifications
    notifications_query = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(10)
    )
    notifications_result = await db.execute(notifications_query)
    notifications = notifications_result.scalars().all()

    unread_count = sum(1 for n in notifications if not n.read)

    # User stats response
    user_stats = UserStatsResponse(
        total_points=stats.total_points,
        level=stats.level,
        xp_current=stats.xp_current,
        xp_next_level=stats.xp_next_level,
        xp_percent=0,  # Calculé dans __init__
        total_meals_logged=stats.total_meals_logged,
        total_activities=stats.total_activities,
        total_recipes_generated=stats.total_recipes_generated,
        total_photos_analyzed=stats.total_photos_analyzed,
        best_streak_logging=stats.best_streak_logging,
        best_streak_activity=stats.best_streak_activity,
        achievements_count=stats.achievements_count,
    )

    # Personnalisation du dashboard basée sur le profil complet
    personalization = None
    if profile:
        try:
            personalization = await asyncio.wait_for(
                get_personalization(db, current_user, profile, quick_stats),
                timeout=3.0
            )
        except asyncio.TimeoutError:
            import logging
            logging.warning("Dashboard personalization timed out, using defaults")
        except Exception as e:
            import logging
            logging.warning(f"Dashboard personalization failed: {e}")

    return DashboardResponse(
        user_name=current_user.name,
        quick_stats=quick_stats,
        coach_advice=coach_advice,
        user_stats=user_stats,
        recent_achievements=recent_achievements,
        active_streaks=active_streaks,
        unread_notifications=unread_count,
        notifications=notifications,
        personalization=personalization,
    )


@router.get("/coach", response_model=CoachResponseSchema)
async def get_coach(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère les conseils du coach."""
    # Récupérer les stats du jour
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    nutrition_query = select(DailyNutrition).where(and_(
        DailyNutrition.user_id == current_user.id,
        DailyNutrition.date >= start_of_day,
        DailyNutrition.date <= end_of_day,
    ))
    nutrition_result = await db.execute(nutrition_query)
    nutrition = nutrition_result.scalar_one_or_none()

    # Chargement explicite du profile pour async
    profile_query = select(Profile).where(Profile.user_id == current_user.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=400, detail="Profil non configuré")

    # Objectifs personnalisables depuis le profil (avec valeurs par défaut)
    water_target = profile.water_target_ml if hasattr(profile, 'water_target_ml') else 2000
    activity_target = profile.activity_target_min if hasattr(profile, 'activity_target_min') else 30

    quick_stats = QuickStats(
        calories_today=nutrition.total_calories if nutrition else 0,
        calories_target=profile.daily_calories or 2000,
        calories_percent=0,
        protein_today=nutrition.total_protein if nutrition else 0,
        protein_target=profile.protein_g or 100,
        protein_percent=0,
        water_today=nutrition.water_ml if nutrition else 0,
        water_target=water_target,
        water_percent=0,
        activity_today=0,
        activity_target=activity_target,
        activity_percent=0,
        meals_today=nutrition.meals_count if nutrition else 0,
        streak_days=0,
    )

    try:
        # Timeout de 5 secondes pour éviter les blocages
        return await asyncio.wait_for(
            get_coach_advice(db, current_user, quick_stats),
            timeout=5.0
        )
    except asyncio.TimeoutError:
        import logging
        logging.warning("Coach AI timed out after 5s, using fallback")
        return get_fallback_coach_advice(current_user.name, quick_stats, current_user.preferred_language)
    except Exception as e:
        import logging
        logging.warning(f"Coach AI failed, using fallback: {e}")
        return get_fallback_coach_advice(current_user.name, quick_stats, current_user.preferred_language)


def get_fallback_coach_advice(user_name: str, quick_stats: QuickStats, language: str = DEFAULT_LANGUAGE) -> CoachResponseSchema:
    """Génère des conseils par défaut quand l'IA n'est pas disponible."""
    time_of_day = get_time_of_day()
    t = get_translator(language)

    greetings = {
        "morning": t.get("agents.coach.greetingMorning", name=user_name),
        "afternoon": t.get("agents.coach.greetingAfternoon", name=user_name),
        "evening": t.get("agents.coach.greetingEvening", name=user_name),
    }

    # Générer un résumé basé sur les stats
    calories_percent = quick_stats.calories_percent
    if calories_percent < 50:
        summary = t.get("agents.coach.fallbackSummary.farFromGoal")
    elif calories_percent < 80:
        summary = t.get("agents.coach.fallbackSummary.onTrackGood")
    elif calories_percent <= 100:
        summary = t.get("agents.coach.fallbackSummary.almostThere")
    else:
        summary = t.get("agents.coach.fallbackSummary.exceeded")

    # Conseils par défaut
    advices = []

    if quick_stats.water_today < 1500:
        advices.append(CoachAdviceSchema(
            message=t.get("agents.coach.fallbackAdvice.drinkWater"),
            category="hydration",
            priority="high",
            action=t.get("agents.coach.fallbackAdvice.drinkWaterAction"),
            emoji="💧"
        ))

    if quick_stats.protein_percent < 50:
        advices.append(CoachAdviceSchema(
            message=t.get("agents.coach.fallbackAdvice.increaseProtein"),
            category="nutrition",
            priority="medium",
            action=t.get("agents.coach.fallbackAdvice.increaseProteinAction"),
            emoji="🥩"
        ))

    if quick_stats.activity_today < 15:
        advices.append(CoachAdviceSchema(
            message=t.get("agents.coach.fallbackAdvice.doExercise"),
            category="activity",
            priority="medium",
            action=t.get("agents.coach.fallbackAdvice.doExerciseAction"),
            emoji="🚶"
        ))

    if not advices:
        advices.append(CoachAdviceSchema(
            message=t.get("agents.coach.fallbackAdvice.keepItUp"),
            category="motivation",
            priority="low",
            action=None,
            emoji="⭐"
        ))

    return CoachResponseSchema(
        greeting=greetings.get(time_of_day, t.get("agents.coach.greetingMorning", name=user_name)),
        summary=summary,
        advices=advices,
        motivation_quote=t.get("agents.coach.fallbackMotivation"),
        confidence=0.5,  # Confidence basse car ce n'est pas l'IA
    )


async def get_coach_advice(db: AsyncSession, user: User, quick_stats: QuickStats) -> CoachResponseSchema:
    """Génère les conseils du coach."""
    # Chargement explicite du profile pour async
    profile_query = select(Profile).where(Profile.user_id == user.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()

    # Stats de la semaine
    week_start = datetime.combine(date.today() - timedelta(days=7), datetime.min.time())
    week_nutrition_query = select(
        func.avg(DailyNutrition.total_calories)
    ).where(and_(
        DailyNutrition.user_id == user.id,
        DailyNutrition.date >= week_start,
    ))
    week_result = await db.execute(week_nutrition_query)
    avg_calories_week = week_result.scalar() or 0

    coach = get_coach_agent(language=user.preferred_language)
    coach_input = CoachInput(
        name=user.name,
        age=profile.age if profile else 30,
        goal=profile.goal if profile else None,
        diet_type=profile.diet_type if profile else None,
        target_calories=profile.daily_calories if profile else 2000,
        target_protein=profile.protein_g if profile else 100,
        target_carbs=profile.carbs_g if profile else 250,
        target_fat=profile.fat_g if profile else 65,
        calories_today=quick_stats.calories_today,
        protein_today=quick_stats.protein_today,
        water_today=quick_stats.water_today,
        activity_minutes_today=quick_stats.activity_today,
        avg_calories_week=avg_calories_week,
        time_of_day=get_time_of_day(),
        meals_today=quick_stats.meals_today,
    )

    result = await coach.process(coach_input)

    return CoachResponseSchema(
        greeting=result.result.greeting,
        summary=result.result.summary,
        advices=[
            CoachAdviceSchema(
                message=a.message,
                category=a.category,
                priority=a.priority,
                action=a.action,
                emoji=a.emoji,
            )
            for a in result.result.advices
        ],
        motivation_quote=result.result.motivation_quote,
        confidence=result.confidence,
    )


async def get_personalization(
    db: AsyncSession,
    user: User,
    profile: Profile,
    quick_stats: QuickStats
) -> PersonalizationData | None:
    """
    Génère la personnalisation du dashboard basée sur le profil complet.
    Utilise l'agent DashboardPersonalizer pour analyser:
    - Conditions médicales (diabète, hypertension, etc.)
    - Objectifs (perte de poids, prise de muscle, etc.)
    - Régime alimentaire (végan, keto, etc.)
    - Âge et genre
    - Allergies et médicaments
    - Historique et habitudes
    """
    # Stats de la semaine pour le contexte historique
    week_start = datetime.combine(date.today() - timedelta(days=7), datetime.min.time())

    # Moyenne des calories et protéines de la semaine
    week_nutrition_query = select(
        func.avg(DailyNutrition.total_calories),
        func.avg(DailyNutrition.total_protein),
        func.avg(DailyNutrition.total_carbs),
        func.count(DailyNutrition.id)
    ).where(and_(
        DailyNutrition.user_id == user.id,
        DailyNutrition.date >= week_start,
    ))
    week_result = await db.execute(week_nutrition_query)
    week_row = week_result.one()
    avg_calories_week = week_row[0] or 0
    avg_protein_week = week_row[1] or 0
    avg_carbs_week = week_row[2] or 0
    days_logged_week = week_row[3] or 0

    # Créer l'input pour le personnaliseur
    personalizer_input = PersonalizerInput(
        name=user.name,
        age=profile.age,
        gender=profile.gender,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        goal=profile.goal,
        diet_type=profile.diet_type,
        activity_level=profile.activity_level,
        medical_conditions=profile.medical_conditions or [],
        allergies=profile.allergies or [],
        medications=profile.medications or [],
        target_calories=profile.daily_calories or 2000,
        target_protein=profile.protein_g or 100,
        target_carbs=profile.carbs_g or 250,
        target_fat=profile.fat_g or 65,
        target_water=profile.water_target_ml if hasattr(profile, 'water_target_ml') else 2000,
        calories_today=quick_stats.calories_today,
        protein_today=quick_stats.protein_today,
        carbs_today=quick_stats.carbs_today,
        fat_today=quick_stats.fat_today,
        water_today=quick_stats.water_today,
        activity_minutes_today=quick_stats.activity_today,
        avg_calories_week=avg_calories_week,
        avg_protein_week=avg_protein_week,
        avg_carbs_week=avg_carbs_week,
        days_logged_week=days_logged_week,
        time_of_day=get_time_of_day(),
        meals_today=quick_stats.meals_today,
        streak_days=quick_stats.streak_days,
    )

    # Appeler l'agent de personnalisation
    personalizer = get_dashboard_personalizer_agent(language=user.preferred_language)
    result = await personalizer.process(personalizer_input)

    if not result or not result.result:
        return None

    # Convertir le résultat en schéma Pydantic
    personalization_result = result.result

    return PersonalizationData(
        profile_summary=personalization_result.profile_summary,
        health_context=personalization_result.health_context,
        priority_widgets=[
            PriorityWidget(
                id=w["id"],
                type=w["type"],
                priority=w["priority"],
                reason=w["reason"],
                source=w["source"],
            )
            for w in personalization_result.priority_widgets
        ],
        personalized_stats=[
            PersonalizedStat(
                id=s["id"],
                priority=s["priority"],
                reason=s["reason"],
            )
            for s in personalization_result.personalized_stats
        ],
        health_alerts=[
            HealthAlert(
                type=a["type"],
                severity=a["severity"],
                title=a["title"],
                message=a["message"],
                icon=a["icon"],
                action=a.get("action"),
                show_always=a.get("show_always", False),
            )
            for a in personalization_result.health_alerts
        ],
        insights=[
            PersonalizedInsight(
                type=i["type"],
                title=i["title"],
                message=i["message"],
                icon=i["icon"],
                priority=i["priority"],
            )
            for i in personalization_result.insights
        ],
        ui_config=UIConfig(
            show_carbs_prominently=personalization_result.ui_config.get("show_carbs_prominently", False),
            show_fat_breakdown=personalization_result.ui_config.get("show_fat_breakdown", False),
            show_sodium_tracker=personalization_result.ui_config.get("show_sodium_tracker", False),
            show_hydration_prominently=personalization_result.ui_config.get("show_hydration_prominently", False),
            show_activity_prominently=personalization_result.ui_config.get("show_activity_prominently", False),
            show_weight_tracker=personalization_result.ui_config.get("show_weight_tracker", False),
            primary_color_theme=personalization_result.ui_config.get("primary_color_theme", "default"),
            stats_layout=personalization_result.ui_config.get("stats_layout", "standard"),
        ),
    )


# Notifications endpoints

@router.get("/notifications", response_model=list[NotificationResponse])
async def get_notifications(
    unread_only: bool = False,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère les notifications."""
    query = select(Notification).where(Notification.user_id == current_user.id)

    if unread_only:
        query = query.where(Notification.read == False)

    query = query.order_by(Notification.created_at.desc()).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Marque une notification comme lue."""
    query = select(Notification).where(and_(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ))
    result = await db.execute(query)
    notification = result.scalar_one_or_none()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")

    notification.read = True
    notification.read_at = datetime.utcnow()
    await db.commit()

    return {"message": "Notification marquée comme lue"}


@router.post("/notifications/read-all")
async def mark_all_notifications_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Marque toutes les notifications comme lues."""
    query = select(Notification).where(and_(
        Notification.user_id == current_user.id,
        Notification.read == False,
    ))
    result = await db.execute(query)
    notifications = result.scalars().all()

    for notification in notifications:
        notification.read = True
        notification.read_at = datetime.utcnow()

    await db.commit()

    return {"message": f"{len(notifications)} notifications marquées comme lues"}


# Achievements endpoints

@router.get("/achievements", response_model=list[AchievementResponse])
async def get_achievements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère tous les achievements de l'utilisateur."""
    query = (
        select(Achievement)
        .where(Achievement.user_id == current_user.id)
        .order_by(Achievement.unlocked_at.desc())
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/streaks", response_model=list[StreakResponse])
async def get_streaks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Récupère tous les streaks de l'utilisateur."""
    query = (
        select(Streak)
        .where(Streak.user_id == current_user.id)
        .order_by(Streak.current_count.desc())
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/achievements/{achievement_id}/seen")
async def mark_achievement_seen(
    achievement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Marque un achievement comme vu."""
    query = select(Achievement).where(and_(
        Achievement.id == achievement_id,
        Achievement.user_id == current_user.id,
    ))
    result = await db.execute(query)
    achievement = result.scalar_one_or_none()

    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement non trouvé")

    achievement.seen = True
    await db.commit()

    return {"message": "Achievement marqué comme vu"}


# Helper functions

async def get_or_create_user_stats(db: AsyncSession, user_id: int) -> UserStats:
    """Récupère ou crée les stats utilisateur."""
    query = select(UserStats).where(UserStats.user_id == user_id)
    result = await db.execute(query)
    stats = result.scalar_one_or_none()

    if not stats:
        stats = UserStats(user_id=user_id)
        db.add(stats)
        await db.commit()
        await db.refresh(stats)

    return stats


async def add_xp(db: AsyncSession, user_id: int, points: int) -> UserStats:
    """Ajoute de l'XP et met à jour le niveau."""
    stats = await get_or_create_user_stats(db, user_id)

    stats.total_points += points
    stats.xp_current += points

    # Vérifier le level up
    while stats.xp_current >= stats.xp_next_level:
        stats.xp_current -= stats.xp_next_level
        stats.level += 1
        stats.xp_next_level = int(stats.xp_next_level * 1.5)

    await db.commit()
    return stats


async def unlock_achievement(db: AsyncSession, user_id: int, achievement_type: str) -> Achievement | None:
    """Débloque un achievement s'il n'existe pas déjà."""
    # Vérifier si déjà débloqué
    query = select(Achievement).where(and_(
        Achievement.user_id == user_id,
        Achievement.achievement_type == achievement_type,
    ))
    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        return None

    # Récupérer les infos de l'achievement
    achievement_info = ACHIEVEMENTS.get(achievement_type)
    if not achievement_info:
        return None

    # Créer l'achievement
    achievement = Achievement(
        user_id=user_id,
        achievement_type=achievement_type,
        name=achievement_info["name"],
        description=achievement_info["description"],
        icon=achievement_info["icon"],
        points=achievement_info["points"],
    )
    db.add(achievement)

    # Mettre à jour les stats
    stats = await get_or_create_user_stats(db, user_id)
    stats.achievements_count += 1
    await add_xp(db, user_id, achievement_info["points"])

    # Créer une notification
    notification = Notification(
        user_id=user_id,
        notification_type="achievement",
        title=f"🏆 {achievement_info['name']}",
        message=achievement_info["description"],
        icon=achievement_info["icon"],
    )
    db.add(notification)

    await db.commit()
    await db.refresh(achievement)

    return achievement
