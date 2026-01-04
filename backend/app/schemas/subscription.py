"""Schémas Pydantic pour le système d'abonnement."""

from datetime import datetime, date
from pydantic import BaseModel, Field
from enum import Enum


class SubscriptionTier(str, Enum):
    """Niveaux d'abonnement disponibles."""
    FREE = "free"
    PREMIUM = "premium"
    PRO = "pro"


class SubscriptionStatus(str, Enum):
    """Statuts possibles d'un abonnement."""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PAST_DUE = "past_due"
    PAUSED = "paused"


# ============== Subscription Schemas ==============

class SubscriptionBase(BaseModel):
    """Base schema for subscription."""
    tier: SubscriptionTier = SubscriptionTier.FREE
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE


class SubscriptionCreate(SubscriptionBase):
    """Schema for creating a subscription."""
    user_id: int
    ls_subscription_id: str | None = None
    ls_customer_id: str | None = None
    ls_variant_id: str | None = None


class SubscriptionResponse(SubscriptionBase):
    """Schema for subscription response."""
    id: int
    user_id: int
    ls_subscription_id: str | None = None
    current_period_start: datetime | None = None
    current_period_end: datetime | None = None
    cancel_at_period_end: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SubscriptionStatusResponse(BaseModel):
    """Schema for subscription status endpoint."""
    tier: SubscriptionTier
    status: SubscriptionStatus | None = None
    renews_at: datetime | None = None
    cancel_at_period_end: bool = False
    is_active: bool = True
    # Trial info
    is_trial: bool = False
    trial_ends_at: datetime | None = None
    days_remaining: int | None = None


# ============== Usage Tracking Schemas ==============

class UsageBase(BaseModel):
    """Base schema for usage tracking."""
    vision_analyses: int = 0
    recipe_generations: int = 0
    coach_messages: int = 0


class UsageResponse(UsageBase):
    """Schema for usage response."""
    date: date

    class Config:
        from_attributes = True


class LimitInfo(BaseModel):
    """Schema for a single limit with period."""
    limit: int = Field(description="-1 for unlimited, 0 for disabled, 1 for enabled (boolean)")
    period: str = Field(description="day, week, total, or boolean")


class UsageLimits(BaseModel):
    """Schema for tier limits with periods."""
    vision_analyses: LimitInfo
    recipe_generations: LimitInfo
    coach_messages: LimitInfo
    history_days: LimitInfo


class FeatureLimits(BaseModel):
    """Schema for feature availability per tier."""
    export_pdf: LimitInfo
    meal_plans: LimitInfo
    advanced_stats: LimitInfo
    priority_support: LimitInfo
    dedicated_support: LimitInfo
    api_access: LimitInfo


class FullTierLimits(BaseModel):
    """Schema for complete tier limits including usage and features."""
    # Usage limits
    vision_analyses: LimitInfo
    recipe_generations: LimitInfo
    coach_messages: LimitInfo
    history_days: LimitInfo
    # Feature availability
    export_pdf: LimitInfo
    meal_plans: LimitInfo
    advanced_stats: LimitInfo
    priority_support: LimitInfo
    dedicated_support: LimitInfo
    api_access: LimitInfo


class TierLimitsResponse(BaseModel):
    """Schema for all tier limits endpoint."""
    free: FullTierLimits
    premium: FullTierLimits
    pro: FullTierLimits


class UsageStatusResponse(BaseModel):
    """Schema for usage status endpoint with full tier limits."""
    tier: SubscriptionTier
    limits: FullTierLimits
    usage: UsageBase
    reset_at: datetime | None = None
    # Trial info
    is_trial: bool = False
    trial_days_remaining: int | None = None


class LimitCheckResult(BaseModel):
    """Schema for limit check result."""
    allowed: bool
    used: int
    limit: int
    remaining: int = Field(description="-1 for unlimited")


# ============== Checkout Schemas ==============

class CheckoutRequest(BaseModel):
    """Schema for checkout request."""
    variant_id: str


class CheckoutResponse(BaseModel):
    """Schema for checkout response."""
    checkout_url: str


class CustomerPortalResponse(BaseModel):
    """Schema for customer portal response."""
    portal_url: str


# ============== Webhook Schemas ==============

class LemonSqueezyWebhookMeta(BaseModel):
    """Schema for Lemon Squeezy webhook meta."""
    event_name: str
    custom_data: dict | None = None


class LemonSqueezyWebhookData(BaseModel):
    """Schema for Lemon Squeezy webhook data attributes."""
    id: int
    status: str | None = None
    customer_id: int | None = None
    variant_id: int | None = None
    product_id: int | None = None
    renews_at: str | None = None
    ends_at: str | None = None
    created_at: str | None = None
    updated_at: str | None = None


class LemonSqueezyWebhook(BaseModel):
    """Schema for Lemon Squeezy webhook payload."""
    meta: LemonSqueezyWebhookMeta
    data: dict  # Flexible pour différents types d'événements


# ============== Pricing Display Schemas ==============

class PricingPlan(BaseModel):
    """Schema for pricing plan display."""
    tier: SubscriptionTier
    name: str
    description: str
    price_monthly: float
    price_yearly: float
    variant_id_monthly: str
    variant_id_yearly: str
    features: list[str]
    popular: bool = False


class PricingResponse(BaseModel):
    """Schema for pricing endpoint."""
    plans: list[PricingPlan]
    currency: str = "EUR"
