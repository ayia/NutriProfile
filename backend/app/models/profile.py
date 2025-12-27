from datetime import datetime
from enum import Enum
from sqlalchemy import String, DateTime, Integer, Float, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"          # Peu ou pas d'exercice
    LIGHT = "light"                   # Exercice léger 1-3 jours/sem
    MODERATE = "moderate"             # Exercice modéré 3-5 jours/sem
    ACTIVE = "active"                 # Exercice intense 6-7 jours/sem
    VERY_ACTIVE = "very_active"       # Exercice très intense + travail physique


class Goal(str, Enum):
    LOSE_WEIGHT = "lose_weight"
    MAINTAIN = "maintain"
    GAIN_MUSCLE = "gain_muscle"
    IMPROVE_HEALTH = "improve_health"


class DietType(str, Enum):
    OMNIVORE = "omnivore"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    PESCATARIAN = "pescatarian"
    KETO = "keto"
    PALEO = "paleo"
    MEDITERRANEAN = "mediterranean"


class Profile(Base):
    """Profil nutritionnel de l'utilisateur."""

    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)

    # Informations personnelles - Using String instead of SQLEnum for PostgreSQL/SQLite compatibility
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    height_cm: Mapped[float] = mapped_column(Float, nullable=False)  # Taille en cm
    weight_kg: Mapped[float] = mapped_column(Float, nullable=False)  # Poids en kg

    # Niveau d'activité et objectifs
    activity_level: Mapped[str] = mapped_column(String(20), nullable=False)
    goal: Mapped[str] = mapped_column(String(20), nullable=False)
    target_weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Préférences alimentaires
    diet_type: Mapped[str] = mapped_column(String(20), default="omnivore")
    allergies: Mapped[list] = mapped_column(JSON, default=list)  # Liste des allergies
    excluded_foods: Mapped[list] = mapped_column(JSON, default=list)  # Aliments exclus
    favorite_foods: Mapped[list] = mapped_column(JSON, default=list)  # Aliments préférés

    # Données de santé (optionnel)
    medical_conditions: Mapped[list] = mapped_column(JSON, default=list)
    medications: Mapped[list] = mapped_column(JSON, default=list)

    # Valeurs calculées (mises à jour par l'agent)
    bmr: Mapped[float | None] = mapped_column(Float, nullable=True)  # Basal Metabolic Rate
    tdee: Mapped[float | None] = mapped_column(Float, nullable=True)  # Total Daily Energy Expenditure
    daily_calories: Mapped[int | None] = mapped_column(Integer, nullable=True)
    protein_g: Mapped[int | None] = mapped_column(Integer, nullable=True)
    carbs_g: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fat_g: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Métadonnées
    is_complete: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relation avec User
    user = relationship("User", back_populates="profile")
