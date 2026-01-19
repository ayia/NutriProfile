from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# Import SubscriptionTier pour éviter les imports circulaires
from enum import Enum as PyEnum


class SubscriptionTierEnum(str, PyEnum):
    """Niveaux d'abonnement (copie locale pour éviter import circulaire)."""
    FREE = "free"
    PREMIUM = "premium"
    PRO = "pro"


class User(Base):
    """Modèle utilisateur."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    preferred_language: Mapped[str] = mapped_column(String(5), default="en", nullable=False)

    # Subscription tier (cached for quick access)
    subscription_tier: Mapped[str] = mapped_column(
        String(20),
        default="free",
        nullable=False
    )

    # Trial period - 14 days Premium for new users
    trial_ends_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="When the 14-day trial period ends"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relations
    profile = relationship("Profile", back_populates="user", uselist=False)
    food_logs = relationship("FoodLog", back_populates="user", cascade="all, delete-orphan")
    daily_nutrition = relationship("DailyNutrition", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
    weight_logs = relationship("WeightLog", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")
    streaks = relationship("Streak", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    stats = relationship("UserStats", back_populates="user", uselist=False, cascade="all, delete-orphan")

    # Subscription relations
    subscription = relationship("Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan")
    usage_tracking = relationship("UsageTracking", back_populates="user", cascade="all, delete-orphan")

    # Favorite foods relation
    favorite_foods = relationship("FavoriteFood", back_populates="user", cascade="all, delete-orphan")

    # Favorite meals relation
    favorite_meals = relationship("FavoriteMeal", back_populates="user", cascade="all, delete-orphan")
