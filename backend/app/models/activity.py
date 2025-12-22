from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class ActivityLog(Base):
    """Journal des activités physiques."""

    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Type d'activité
    activity_type = Column(String(50), nullable=False)  # running, walking, cycling, gym, etc.
    name = Column(String(200), nullable=True)  # Nom personnalisé optionnel

    # Durée et intensité
    duration_minutes = Column(Integer, nullable=False)
    intensity = Column(String(20), default="moderate")  # light, moderate, intense

    # Calories brûlées (estimées ou saisies)
    calories_burned = Column(Integer, nullable=True)
    calories_source = Column(String(20), default="estimated")  # estimated, manual, device

    # Métadonnées optionnelles
    distance_km = Column(Float, nullable=True)
    steps = Column(Integer, nullable=True)
    heart_rate_avg = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    # Date de l'activité
    activity_date = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    user = relationship("User", back_populates="activity_logs")

    def __repr__(self):
        return f"<ActivityLog {self.activity_type} - {self.duration_minutes}min>"


class WeightLog(Base):
    """Suivi du poids."""

    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    weight_kg = Column(Float, nullable=False)
    body_fat_percent = Column(Float, nullable=True)
    muscle_mass_kg = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    log_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    user = relationship("User", back_populates="weight_logs")

    def __repr__(self):
        return f"<WeightLog {self.weight_kg}kg - {self.log_date}>"


class Goal(Base):
    """Objectifs personnalisés."""

    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Type d'objectif
    goal_type = Column(String(50), nullable=False)  # weight, calories, steps, activity, water

    # Valeurs
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0)
    unit = Column(String(20), nullable=False)  # kg, kcal, steps, minutes, ml

    # Période
    period = Column(String(20), default="daily")  # daily, weekly, monthly

    # Dates
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)

    # Statut
    is_active = Column(Boolean, default=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    user = relationship("User", back_populates="goals")

    def __repr__(self):
        return f"<Goal {self.goal_type} - {self.target_value}{self.unit}>"


# Constantes pour les types d'activités
ACTIVITY_TYPES = {
    "running": {"name": "Course", "icon": "🏃", "met": 9.8},
    "walking": {"name": "Marche", "icon": "🚶", "met": 3.5},
    "cycling": {"name": "Vélo", "icon": "🚴", "met": 7.5},
    "swimming": {"name": "Natation", "icon": "🏊", "met": 8.0},
    "gym": {"name": "Musculation", "icon": "🏋️", "met": 6.0},
    "yoga": {"name": "Yoga", "icon": "🧘", "met": 3.0},
    "hiking": {"name": "Randonnée", "icon": "🥾", "met": 6.0},
    "dancing": {"name": "Danse", "icon": "💃", "met": 5.5},
    "tennis": {"name": "Tennis", "icon": "🎾", "met": 7.3},
    "football": {"name": "Football", "icon": "⚽", "met": 8.0},
    "basketball": {"name": "Basketball", "icon": "🏀", "met": 8.0},
    "other": {"name": "Autre", "icon": "🏅", "met": 5.0},
}

INTENSITY_MULTIPLIERS = {
    "light": 0.7,
    "moderate": 1.0,
    "intense": 1.3,
}


def calculate_calories_burned(
    activity_type: str,
    duration_minutes: int,
    intensity: str,
    weight_kg: float
) -> int:
    """
    Calcule les calories brûlées basé sur le MET.

    Formule: Calories = MET × poids(kg) × durée(heures)
    """
    activity = ACTIVITY_TYPES.get(activity_type, ACTIVITY_TYPES["other"])
    met = activity["met"]
    multiplier = INTENSITY_MULTIPLIERS.get(intensity, 1.0)

    hours = duration_minutes / 60
    calories = met * multiplier * weight_kg * hours

    return int(calories)
