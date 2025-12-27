"""Modèles pour le système d'abonnement et de suivi d'usage."""

from datetime import datetime, date
from enum import Enum as PyEnum
from sqlalchemy import String, DateTime, Date, Integer, Boolean, ForeignKey, Enum, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SubscriptionTier(str, PyEnum):
    """Niveaux d'abonnement disponibles."""
    FREE = "free"
    PREMIUM = "premium"
    PRO = "pro"


class SubscriptionStatus(str, PyEnum):
    """Statuts possibles d'un abonnement."""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PAST_DUE = "past_due"
    PAUSED = "paused"


class Subscription(Base):
    """Modèle d'abonnement utilisateur."""

    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)

    # Paddle IDs (Merchant of Record)
    paddle_subscription_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    paddle_customer_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    paddle_price_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    paddle_transaction_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Subscription details
    tier: Mapped[SubscriptionTier] = mapped_column(
        Enum(SubscriptionTier),
        default=SubscriptionTier.FREE,
        nullable=False
    )
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus),
        default=SubscriptionStatus.ACTIVE,
        nullable=False
    )

    # Billing period
    current_period_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    current_period_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end: Mapped[bool] = mapped_column(default=False, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relation
    user = relationship("User", back_populates="subscription")


class UsageTracking(Base):
    """Suivi de l'utilisation quotidienne par utilisateur."""

    __tablename__ = "usage_tracking"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)

    # Compteurs quotidiens
    vision_analyses: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    recipe_generations: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    coach_messages: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Contrainte unique: un seul enregistrement par user/date
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='unique_user_date'),
    )

    # Relation
    user = relationship("User", back_populates="usage_tracking")
