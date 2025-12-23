import asyncio
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.food_log import DailyNutrition
from app.models.activity import ActivityLog
from app.models.gamification import Achievement, Streak, Notification, UserStats, ACHIEVEMENTS, calculate_level
from app.agents.coach import get_coach_agent, CoachInput, get_time_of_day
from app.schemas.dashboard import (
    CoachResponseSchema,
    CoachAdviceSchema,
    AchievementResponse,
    StreakResponse,
    NotificationResponse,
    UserStatsResponse,
    QuickStats,
    DashboardResponse,
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

    # Nutrition du jour
    nutrition_query = select(DailyNutrition).where(and_(
        DailyNutrition.user_id == current_user.id,
        DailyNutrition.date >= start_of_day,
        DailyNutrition.date <= end_of_day,
    ))
    nutrition_result = await db.execute(nutrition_query)
    nutrition = nutrition_result.scalar_one_or_none()

    # Activités du jour
    activities_query = select(func.sum(ActivityLog.duration_minutes)).where(and_(
        ActivityLog.user_id == current_user.id,
        ActivityLog.activity_date >= start_of_day,
        ActivityLog.activity_date <= end_of_day,
    ))
    activities_result = await db.execute(activities_query)
    activity_minutes = activities_result.scalar() or 0

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

    # Quick stats
    calories_today = nutrition.total_calories if nutrition else 0
    protein_today = nutrition.total_protein if nutrition else 0
    water_today = nutrition.water_ml if nutrition else 0
    meals_today = nutrition.meals_count if nutrition else 0

    quick_stats = QuickStats(
        calories_today=calories_today,
        calories_target=target_calories,
        calories_percent=round((calories_today / target_calories) * 100, 1) if target_calories else 0,
        protein_today=protein_today,
        protein_target=target_protein,
        protein_percent=round((protein_today / target_protein) * 100, 1) if target_protein else 0,
        water_today=water_today,
        water_target=2000,
        water_percent=round((water_today / 2000) * 100, 1),
        activity_today=activity_minutes,
        activity_target=30,
        activity_percent=round((activity_minutes / 30) * 100, 1),
        meals_today=meals_today,
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
            coach_advice = get_fallback_coach_advice(current_user.name, quick_stats)
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
                coach_advice = get_fallback_coach_advice(current_user.name, quick_stats)
            except Exception as e:
                # Si le coach IA échoue, on utilise un conseil par défaut
                import logging
                logging.warning(f"Coach AI failed, using fallback: {e}")
                coach_advice = get_fallback_coach_advice(current_user.name, quick_stats)

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

    return DashboardResponse(
        user_name=current_user.name,
        quick_stats=quick_stats,
        coach_advice=coach_advice,
        user_stats=user_stats,
        recent_achievements=recent_achievements,
        active_streaks=active_streaks,
        unread_notifications=unread_count,
        notifications=notifications,
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

    quick_stats = QuickStats(
        calories_today=nutrition.total_calories if nutrition else 0,
        calories_target=profile.daily_calories or 2000,
        calories_percent=0,
        protein_today=nutrition.total_protein if nutrition else 0,
        protein_target=profile.protein_g or 100,
        protein_percent=0,
        water_today=nutrition.water_ml if nutrition else 0,
        water_target=2000,
        water_percent=0,
        activity_today=0,
        activity_target=30,
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
        return get_fallback_coach_advice(current_user.name, quick_stats)
    except Exception as e:
        import logging
        logging.warning(f"Coach AI failed, using fallback: {e}")
        return get_fallback_coach_advice(current_user.name, quick_stats)


def get_fallback_coach_advice(user_name: str, quick_stats: QuickStats) -> CoachResponseSchema:
    """Génère des conseils par défaut quand l'IA n'est pas disponible."""
    time_of_day = get_time_of_day()

    greetings = {
        "morning": f"Bonjour {user_name} !",
        "afternoon": f"Bon après-midi {user_name} !",
        "evening": f"Bonsoir {user_name} !",
    }

    # Générer un résumé basé sur les stats
    calories_percent = quick_stats.calories_percent
    if calories_percent < 50:
        summary = "Vous êtes encore loin de votre objectif calorique. N'oubliez pas de bien manger !"
    elif calories_percent < 80:
        summary = "Vous êtes sur la bonne voie ! Continuez ainsi."
    elif calories_percent <= 100:
        summary = "Excellent ! Vous approchez de votre objectif calorique."
    else:
        summary = "Attention, vous avez dépassé votre objectif calorique aujourd'hui."

    # Conseils par défaut
    advices = []

    if quick_stats.water_today < 1500:
        advices.append(CoachAdviceSchema(
            message="Pensez à boire de l'eau régulièrement !",
            category="hydration",
            priority=1,
            action="Boire un verre d'eau",
            emoji="💧"
        ))

    if quick_stats.protein_percent < 50:
        advices.append(CoachAdviceSchema(
            message="Augmentez votre apport en protéines.",
            category="nutrition",
            priority=2,
            action="Manger des aliments riches en protéines",
            emoji="🥩"
        ))

    if quick_stats.activity_today < 15:
        advices.append(CoachAdviceSchema(
            message="Un peu d'exercice vous ferait du bien !",
            category="activity",
            priority=2,
            action="Faire une marche de 15 minutes",
            emoji="🚶"
        ))

    if not advices:
        advices.append(CoachAdviceSchema(
            message="Continuez comme ça, vous êtes sur la bonne voie !",
            category="motivation",
            priority=3,
            action=None,
            emoji="⭐"
        ))

    return CoachResponseSchema(
        greeting=greetings.get(time_of_day, f"Bonjour {user_name} !"),
        summary=summary,
        advices=advices,
        motivation_quote="Chaque petit pas compte vers un mode de vie plus sain.",
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

    coach = get_coach_agent()
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
