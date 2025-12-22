from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict


# Activity Log Schemas

class ActivityLogBase(BaseModel):
    """Base pour un log d'activité."""
    activity_type: str
    name: str | None = None
    duration_minutes: int = Field(..., ge=1, le=600)
    intensity: str = Field(default="moderate", pattern="^(light|moderate|intense)$")
    distance_km: float | None = None
    steps: int | None = None
    heart_rate_avg: int | None = None
    notes: str | None = None
    activity_date: datetime | None = None


class ActivityLogCreate(ActivityLogBase):
    """Création d'un log d'activité."""
    calories_burned: int | None = None  # Si non fourni, sera calculé


class ActivityLogResponse(ActivityLogBase):
    """Réponse log d'activité."""
    id: int
    user_id: int
    calories_burned: int | None = None
    calories_source: str = "estimated"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityLogUpdate(BaseModel):
    """Mise à jour d'un log d'activité."""
    activity_type: str | None = None
    name: str | None = None
    duration_minutes: int | None = Field(None, ge=1, le=600)
    intensity: str | None = None
    calories_burned: int | None = None
    distance_km: float | None = None
    steps: int | None = None
    notes: str | None = None


# Weight Log Schemas

class WeightLogBase(BaseModel):
    """Base pour un log de poids."""
    weight_kg: float = Field(..., ge=20, le=500)
    body_fat_percent: float | None = Field(None, ge=1, le=70)
    muscle_mass_kg: float | None = Field(None, ge=10, le=200)
    notes: str | None = None
    log_date: datetime | None = None


class WeightLogCreate(WeightLogBase):
    """Création d'un log de poids."""
    pass


class WeightLogResponse(WeightLogBase):
    """Réponse log de poids."""
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Goal Schemas

class GoalBase(BaseModel):
    """Base pour un objectif."""
    goal_type: str  # weight, calories, steps, activity, water
    target_value: float
    unit: str
    period: str = Field(default="daily", pattern="^(daily|weekly|monthly)$")
    end_date: datetime | None = None


class GoalCreate(GoalBase):
    """Création d'un objectif."""
    start_date: datetime | None = None


class GoalResponse(GoalBase):
    """Réponse objectif."""
    id: int
    user_id: int
    current_value: float = 0
    start_date: datetime
    is_active: bool = True
    is_completed: bool = False
    completed_at: datetime | None = None
    progress_percent: float | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    def __init__(self, **data):
        super().__init__(**data)
        if self.target_value > 0:
            self.progress_percent = round((self.current_value / self.target_value) * 100, 1)


class GoalUpdate(BaseModel):
    """Mise à jour d'un objectif."""
    target_value: float | None = None
    current_value: float | None = None
    end_date: datetime | None = None
    is_active: bool | None = None


# Statistics Schemas

class DailyStats(BaseModel):
    """Statistiques journalières."""
    date: date
    calories_consumed: int = 0
    calories_burned: int = 0
    net_calories: int = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    water_ml: int = 0
    steps: int = 0
    activity_minutes: int = 0
    meals_count: int = 0


class WeeklyStats(BaseModel):
    """Statistiques hebdomadaires."""
    start_date: date
    end_date: date
    avg_calories_consumed: float = 0
    avg_calories_burned: float = 0
    total_activity_minutes: int = 0
    total_steps: int = 0
    weight_change: float | None = None
    days_logged: int = 0


class ProgressData(BaseModel):
    """Données de progression pour les graphiques."""
    dates: list[str]
    calories: list[int]
    protein: list[float]
    weight: list[float | None]
    activity_minutes: list[int]


class ActivityTypeSummary(BaseModel):
    """Résumé par type d'activité."""
    activity_type: str
    name: str
    icon: str
    total_duration: int
    total_calories: int
    count: int


class TrackingSummary(BaseModel):
    """Résumé complet du suivi."""
    today: DailyStats
    week: WeeklyStats
    goals: list[GoalResponse]
    recent_activities: list[ActivityLogResponse]
    recent_weights: list[WeightLogResponse]
    activity_breakdown: list[ActivityTypeSummary]
