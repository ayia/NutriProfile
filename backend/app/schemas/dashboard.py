from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, model_validator


# Coach Schemas

class CoachAdviceSchema(BaseModel):
    """Conseil du coach."""
    message: str
    category: str
    priority: str
    action: str | None = None
    emoji: str = "💡"


class CoachResponseSchema(BaseModel):
    """Réponse du coach."""
    greeting: str
    summary: str
    advices: list[CoachAdviceSchema]
    motivation_quote: str | None = None
    confidence: float


# Achievement Schemas

class AchievementResponse(BaseModel):
    """Réponse achievement."""
    id: int
    achievement_type: str
    name: str
    description: str | None
    icon: str
    points: int
    unlocked_at: datetime
    seen: bool

    model_config = ConfigDict(from_attributes=True)


class AchievementUnlocked(BaseModel):
    """Achievement nouvellement débloqué."""
    achievement: AchievementResponse
    is_new: bool = True


# Streak Schemas

class StreakResponse(BaseModel):
    """Réponse streak."""
    id: int
    streak_type: str
    current_count: int
    best_count: int
    last_date: datetime | None

    model_config = ConfigDict(from_attributes=True)


# Notification Schemas

class NotificationResponse(BaseModel):
    """Réponse notification."""
    id: int
    notification_type: str
    title: str
    message: str | None
    icon: str | None
    action_url: str | None
    data: dict | None
    read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationCreate(BaseModel):
    """Création notification."""
    notification_type: str
    title: str
    message: str | None = None
    icon: str | None = None
    action_url: str | None = None
    data: dict | None = None


# User Stats Schemas

class UserStatsResponse(BaseModel):
    """Statistiques utilisateur."""
    total_points: int
    level: int
    xp_current: int
    xp_next_level: int
    xp_percent: float = 0

    total_meals_logged: int
    total_activities: int
    total_recipes_generated: int
    total_photos_analyzed: int

    best_streak_logging: int
    best_streak_activity: int

    achievements_count: int

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='after')
    def calculate_xp_percent(self):
        if self.xp_next_level > 0:
            object.__setattr__(self, 'xp_percent', round((self.xp_current / self.xp_next_level) * 100, 1))
        return self


# Dashboard Schemas

class QuickStats(BaseModel):
    """Stats rapides pour le dashboard."""
    calories_today: int
    calories_target: int
    calories_percent: float

    protein_today: float
    protein_target: float
    protein_percent: float

    water_today: int
    water_target: int = 2000
    water_percent: float

    activity_today: int
    activity_target: int = 30
    activity_percent: float

    meals_today: int
    streak_days: int


class DashboardResponse(BaseModel):
    """Réponse complète du dashboard."""
    user_name: str
    quick_stats: QuickStats
    coach_advice: CoachResponseSchema | None
    user_stats: UserStatsResponse
    recent_achievements: list[AchievementResponse]
    active_streaks: list[StreakResponse]
    unread_notifications: int
    notifications: list[NotificationResponse]


# Leaderboard (optionnel)

class LeaderboardEntry(BaseModel):
    """Entrée du classement."""
    rank: int
    user_name: str
    level: int
    total_points: int
    streak_days: int
    is_current_user: bool = False
