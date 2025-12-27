"""API endpoints pour le coaching nutritionnel."""
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from pydantic import BaseModel

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.food_log import DailyNutrition
from app.models.activity import ActivityLog
from app.models.gamification import Streak, UserStats
from app.agents.coach import get_coach_agent, CoachInput, get_time_of_day

router = APIRouter()


# Schemas
class TipResponse(BaseModel):
    """Conseil du jour."""
    category: str
    message: str
    priority: str
    emoji: str
    action: str | None = None


class WeeklySummaryResponse(BaseModel):
    """Résumé hebdomadaire."""
    avg_calories: float
    avg_protein: float
    avg_carbs: float
    avg_fat: float
    total_activities: int
    activity_minutes: int
    meals_logged: int
    best_day: str | None
    worst_day: str | None
    streak_days: int
    progress_message: str


class ChallengeResponse(BaseModel):
    """Défi personnalisé."""
    id: str
    title: str
    description: str
    category: str
    difficulty: str
    points: int
    progress: int
    target: int
    completed: bool
    emoji: str


@router.get("/tips", response_model=list[TipResponse])
async def get_tips(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Récupère les conseils personnalisés du jour.
    """
    # Récupérer le profil
    profile_query = select(Profile).where(Profile.user_id == current_user.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()

    # Stats du jour
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

    # Générer les conseils basés sur le contexte
    tips = []
    time_of_day = get_time_of_day()

    # Conseil basé sur l'heure
    if time_of_day == "morning":
        tips.append(TipResponse(
            category="hydratation",
            message="Commencez votre journée avec un grand verre d'eau pour réhydrater votre corps après la nuit.",
            priority="high",
            emoji="💧",
            action="Boire 500ml d'eau"
        ))
    elif time_of_day == "afternoon":
        if not nutrition or nutrition.meals_count < 2:
            tips.append(TipResponse(
                category="repas",
                message="N'oubliez pas de prendre un déjeuner équilibré pour maintenir votre énergie.",
                priority="high",
                emoji="🍽️",
                action="Planifier le déjeuner"
            ))

    # Conseil basé sur les objectifs
    if profile:
        if profile.goal == "lose_weight":
            tips.append(TipResponse(
                category="nutrition",
                message="Privilégiez les légumes et protéines maigres pour vous sentir rassasié plus longtemps.",
                priority="medium",
                emoji="🥗",
                action="Ajouter des légumes"
            ))
        elif profile.goal == "gain_muscle":
            tips.append(TipResponse(
                category="nutrition",
                message="Assurez-vous de consommer suffisamment de protéines après l'entraînement.",
                priority="high",
                emoji="💪",
                action="Préparer un shake protéiné"
            ))

    # Conseil activité
    activities_query = select(func.sum(ActivityLog.duration_minutes)).where(and_(
        ActivityLog.user_id == current_user.id,
        ActivityLog.activity_date >= start_of_day,
        ActivityLog.activity_date <= end_of_day,
    ))
    activities_result = await db.execute(activities_query)
    activity_minutes = activities_result.scalar() or 0

    if activity_minutes < 30:
        tips.append(TipResponse(
            category="activite",
            message="Une marche de 30 minutes peut améliorer votre humeur et votre digestion.",
            priority="medium",
            emoji="🚶",
            action="Planifier une marche"
        ))

    # Conseil générique si pas assez
    if len(tips) < 3:
        tips.append(TipResponse(
            category="bien-etre",
            message="Prenez quelques minutes pour respirer profondément et vous détendre.",
            priority="low",
            emoji="🧘",
            action="5 minutes de respiration"
        ))

    return tips[:5]  # Maximum 5 conseils


@router.get("/weekly-summary", response_model=WeeklySummaryResponse)
async def get_weekly_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Récupère le résumé de la semaine.
    """
    today = date.today()
    week_start = today - timedelta(days=7)
    start_datetime = datetime.combine(week_start, datetime.min.time())
    end_datetime = datetime.combine(today, datetime.max.time())

    # Moyennes nutritionnelles
    nutrition_query = select(
        func.avg(DailyNutrition.total_calories),
        func.avg(DailyNutrition.total_protein),
        func.avg(DailyNutrition.total_carbs),
        func.avg(DailyNutrition.total_fat),
        func.sum(DailyNutrition.meals_count),
    ).where(and_(
        DailyNutrition.user_id == current_user.id,
        DailyNutrition.date >= start_datetime,
        DailyNutrition.date <= end_datetime,
    ))
    nutrition_result = await db.execute(nutrition_query)
    nutrition_row = nutrition_result.one()

    avg_calories = nutrition_row[0] or 0
    avg_protein = nutrition_row[1] or 0
    avg_carbs = nutrition_row[2] or 0
    avg_fat = nutrition_row[3] or 0
    meals_logged = nutrition_row[4] or 0

    # Activités
    activities_query = select(
        func.count(ActivityLog.id),
        func.sum(ActivityLog.duration_minutes),
    ).where(and_(
        ActivityLog.user_id == current_user.id,
        ActivityLog.activity_date >= start_datetime,
        ActivityLog.activity_date <= end_datetime,
    ))
    activities_result = await db.execute(activities_query)
    activities_row = activities_result.one()

    total_activities = activities_row[0] or 0
    activity_minutes = activities_row[1] or 0

    # Streak
    streak_query = select(Streak).where(and_(
        Streak.user_id == current_user.id,
        Streak.streak_type == "logging",
    ))
    streak_result = await db.execute(streak_query)
    streak = streak_result.scalar_one_or_none()
    streak_days = streak.current_count if streak else 0

    # Message de progression
    if avg_calories > 0:
        progress_message = "Vous êtes sur la bonne voie ! Continuez comme ça."
    else:
        progress_message = "Commencez à logger vos repas pour suivre votre progression."

    return WeeklySummaryResponse(
        avg_calories=round(avg_calories, 0),
        avg_protein=round(avg_protein, 1),
        avg_carbs=round(avg_carbs, 1),
        avg_fat=round(avg_fat, 1),
        total_activities=total_activities,
        activity_minutes=activity_minutes,
        meals_logged=meals_logged,
        best_day=None,  # TODO: calculer
        worst_day=None,  # TODO: calculer
        streak_days=streak_days,
        progress_message=progress_message,
    )


@router.get("/challenges", response_model=list[ChallengeResponse])
async def get_challenges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Récupère les défis personnalisés.
    """
    # Stats utilisateur
    stats_query = select(UserStats).where(UserStats.user_id == current_user.id)
    stats_result = await db.execute(stats_query)
    stats = stats_result.scalar_one_or_none()

    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

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

    challenges = []

    # Défi repas
    meals_today = nutrition.meals_count if nutrition else 0
    challenges.append(ChallengeResponse(
        id="daily_meals",
        title="Logger 3 repas",
        description="Enregistrez vos 3 repas principaux aujourd'hui",
        category="nutrition",
        difficulty="easy",
        points=50,
        progress=meals_today,
        target=3,
        completed=meals_today >= 3,
        emoji="🍽️"
    ))

    # Défi hydratation
    water_today = nutrition.water_ml if nutrition else 0
    challenges.append(ChallengeResponse(
        id="daily_water",
        title="Boire 2L d'eau",
        description="Atteignez votre objectif d'hydratation quotidien",
        category="hydratation",
        difficulty="medium",
        points=30,
        progress=water_today,
        target=2000,
        completed=water_today >= 2000,
        emoji="💧"
    ))

    # Défi activité
    challenges.append(ChallengeResponse(
        id="daily_activity",
        title="30 min d'activité",
        description="Faites au moins 30 minutes d'exercice",
        category="activite",
        difficulty="medium",
        points=75,
        progress=activity_minutes,
        target=30,
        completed=activity_minutes >= 30,
        emoji="🏃"
    ))

    # Défi streak
    streak_query = select(Streak).where(and_(
        Streak.user_id == current_user.id,
        Streak.streak_type == "logging",
    ))
    streak_result = await db.execute(streak_query)
    streak = streak_result.scalar_one_or_none()
    streak_days = streak.current_count if streak else 0

    challenges.append(ChallengeResponse(
        id="weekly_streak",
        title="Streak de 7 jours",
        description="Maintenez un streak de logging pendant 7 jours",
        category="regularity",
        difficulty="hard",
        points=200,
        progress=streak_days,
        target=7,
        completed=streak_days >= 7,
        emoji="🔥"
    ))

    return challenges
