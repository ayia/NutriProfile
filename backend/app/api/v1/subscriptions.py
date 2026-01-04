"""Endpoints pour la gestion des abonnements."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.config import get_settings
from app.services.subscription import SubscriptionService, TIER_LIMITS
from app.schemas.subscription import (
    SubscriptionStatusResponse,
    UsageStatusResponse,
    UsageBase,
    LimitInfo,
    TierLimitsResponse,
    FullTierLimits,
    CheckoutRequest,
    CheckoutResponse,
    CustomerPortalResponse,
    PricingResponse,
    PricingPlan,
    SubscriptionTier,
    SubscriptionStatus,
    LimitCheckResult,
)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])
settings = get_settings()


@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retourne le statut d'abonnement de l'utilisateur."""
    service = SubscriptionService(db)
    subscription = await service.get_subscription(current_user.id)

    # Obtenir le tier effectif (inclut le trial)
    effective_tier = await service.get_effective_tier(current_user.id)

    # Obtenir les informations de trial
    trial_info = await service.get_trial_info(current_user.id)

    return SubscriptionStatusResponse(
        tier=SubscriptionTier(effective_tier),
        status=SubscriptionStatus(subscription.status.value) if subscription else None,
        renews_at=subscription.current_period_end if subscription else None,
        cancel_at_period_end=subscription.cancel_at_period_end if subscription else False,
        is_active=subscription.status.value == "active" if subscription else True,
        # Trial info
        is_trial=trial_info["is_trial"],
        trial_ends_at=current_user.trial_ends_at if current_user.trial_ends_at else None,
        days_remaining=trial_info["days_remaining"]
    )


@router.get("/usage", response_model=UsageStatusResponse)
async def get_usage_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retourne l'utilisation actuelle et les limites complètes (incluant fonctionnalités)."""
    service = SubscriptionService(db)
    status = await service.get_usage_status(current_user.id)

    limits = status["limits"]
    usage = status["usage"]

    # Obtenir les informations de trial
    trial_info = await service.get_trial_info(current_user.id)

    return UsageStatusResponse(
        tier=SubscriptionTier(status["tier"]),
        limits=FullTierLimits(
            # Usage limits
            vision_analyses=LimitInfo(**limits["vision_analyses"]),
            recipe_generations=LimitInfo(**limits["recipe_generations"]),
            coach_messages=LimitInfo(**limits["coach_messages"]),
            history_days=LimitInfo(**limits["history_days"]),
            # Feature availability
            export_pdf=LimitInfo(**limits["export_pdf"]),
            meal_plans=LimitInfo(**limits["meal_plans"]),
            advanced_stats=LimitInfo(**limits["advanced_stats"]),
            priority_support=LimitInfo(**limits["priority_support"]),
            dedicated_support=LimitInfo(**limits["dedicated_support"]),
            api_access=LimitInfo(**limits["api_access"]),
        ),
        usage=UsageBase(
            vision_analyses=usage["vision_analyses"],
            recipe_generations=usage["recipe_generations"],
            coach_messages=usage["coach_messages"]
        ),
        reset_at=status["reset_at"],
        # Trial info
        is_trial=trial_info["is_trial"],
        trial_days_remaining=trial_info["days_remaining"]
    )


@router.get("/limits", response_model=TierLimitsResponse)
async def get_all_tier_limits():
    """
    Retourne toutes les limites pour tous les tiers.
    Utilisé par le frontend pour afficher les informations de pricing de manière synchronisée.
    """
    def convert_tier_limits(tier_data: dict) -> FullTierLimits:
        return FullTierLimits(
            # Usage limits
            vision_analyses=LimitInfo(**tier_data["vision_analyses"]),
            recipe_generations=LimitInfo(**tier_data["recipe_generations"]),
            coach_messages=LimitInfo(**tier_data["coach_messages"]),
            history_days=LimitInfo(**tier_data["history_days"]),
            # Feature availability
            export_pdf=LimitInfo(**tier_data["export_pdf"]),
            meal_plans=LimitInfo(**tier_data["meal_plans"]),
            advanced_stats=LimitInfo(**tier_data["advanced_stats"]),
            priority_support=LimitInfo(**tier_data["priority_support"]),
            dedicated_support=LimitInfo(**tier_data["dedicated_support"]),
            api_access=LimitInfo(**tier_data["api_access"]),
        )

    return TierLimitsResponse(
        free=convert_tier_limits(TIER_LIMITS["free"]),
        premium=convert_tier_limits(TIER_LIMITS["premium"]),
        pro=convert_tier_limits(TIER_LIMITS["pro"])
    )


@router.get("/check-limit/{action}", response_model=LimitCheckResult)
async def check_action_limit(
    action: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Vérifie si une action spécifique est autorisée."""
    valid_actions = ["vision_analyses", "recipe_generations", "coach_messages"]
    if action not in valid_actions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action. Must be one of: {valid_actions}"
        )

    service = SubscriptionService(db)
    allowed, used, limit = await service.check_limit(current_user.id, action)

    remaining = -1 if limit == -1 else max(0, limit - used)

    return LimitCheckResult(
        allowed=allowed,
        used=used,
        limit=limit,
        remaining=remaining
    )


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Crée une URL de checkout Paddle."""
    service = SubscriptionService(db)
    # request.variant_id contient maintenant le price_id Paddle
    checkout_url = await service.create_checkout_url(
        current_user.id,
        request.variant_id  # Ce sera le price_id Paddle
    )

    if not checkout_url:
        raise HTTPException(
            status_code=503,
            detail="Payment service unavailable. Please try again later."
        )

    return CheckoutResponse(checkout_url=checkout_url)


@router.post("/portal", response_model=CustomerPortalResponse)
async def get_customer_portal(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retourne l'URL du portail client pour gérer l'abonnement."""
    service = SubscriptionService(db)
    portal_url = await service.get_customer_portal_url(current_user.id)

    if not portal_url:
        raise HTTPException(
            status_code=404,
            detail="No active subscription found"
        )

    return CustomerPortalResponse(portal_url=portal_url)


def _generate_features_from_limits(tier: str) -> list[str]:
    """
    Génère la liste des features à partir de TIER_LIMITS.
    Assure la synchronisation entre les limites techniques et l'affichage.
    """
    limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
    features = []

    # Vision analyses
    vision = limits["vision_analyses"]["limit"]
    if vision == -1:
        features.append("vision_unlimited")
    else:
        features.append(f"vision_{vision}")

    # Recipe generations
    recipes = limits["recipe_generations"]["limit"]
    if recipes == -1:
        features.append("recipes_unlimited")
    else:
        features.append(f"recipes_{recipes}")

    # Coach messages
    coach = limits["coach_messages"]["limit"]
    if coach == -1:
        features.append("coach_unlimited")
    else:
        features.append(f"coach_{coach}")

    # History days
    history = limits["history_days"]["limit"]
    if history == -1:
        features.append("history_unlimited")
    else:
        features.append(f"history_{history}")

    # Boolean features (only add if enabled)
    if limits["advanced_stats"]["limit"] == 1:
        features.append("advanced_stats")

    if limits["priority_support"]["limit"] == 1:
        features.append("priority_support")

    if limits["dedicated_support"]["limit"] == 1:
        features.append("dedicated_support")

    if limits["export_pdf"]["limit"] == 1:
        features.append("export_pdf")

    if limits["meal_plans"]["limit"] == 1:
        features.append("meal_plans")

    if limits["api_access"]["limit"] == 1:
        features.append("api_access")

    return features


@router.get("/pricing", response_model=PricingResponse)
async def get_pricing():
    """
    Retourne les plans tarifaires disponibles.
    Les features sont générées dynamiquement depuis TIER_LIMITS pour garantir la synchronisation.
    Utilise Lemon Squeezy comme payment gateway.
    """
    plans = [
        PricingPlan(
            tier=SubscriptionTier.FREE,
            name="free",
            description="free_description",
            price_monthly=0,
            price_yearly=0,
            variant_id_monthly="",
            variant_id_yearly="",
            features=_generate_features_from_limits("free"),
            popular=False
        ),
        PricingPlan(
            tier=SubscriptionTier.PREMIUM,
            name="premium",
            description="premium_description",
            price_monthly=5,    # 5 EUR (Lemon Squeezy charge en MAD équivalent)
            price_yearly=40,    # 40 EUR - 33% savings
            variant_id_monthly=settings.LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID,
            variant_id_yearly=settings.LEMONSQUEEZY_PREMIUM_YEARLY_VARIANT_ID,
            features=_generate_features_from_limits("premium"),
            popular=True
        ),
        PricingPlan(
            tier=SubscriptionTier.PRO,
            name="pro",
            description="pro_description",
            price_monthly=10,   # 10 EUR (Lemon Squeezy charge en MAD équivalent)
            price_yearly=80,    # 80 EUR - 33% savings
            variant_id_monthly=settings.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID,
            variant_id_yearly=settings.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID,
            features=_generate_features_from_limits("pro"),
            popular=False
        )
    ]

    return PricingResponse(plans=plans, currency="EUR")


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Annule l'abonnement à la fin de la période en cours."""
    service = SubscriptionService(db)
    subscription = await service.cancel_subscription(
        current_user.id,
        at_period_end=True
    )

    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="No active subscription found"
        )

    return {
        "message": "Subscription will be cancelled at the end of the current period",
        "ends_at": subscription.current_period_end
    }


# ============== TEST/DEBUG ENDPOINTS (For QA Testing Only) ==============

@router.post("/debug/set-tier")
async def debug_set_tier(
    tier: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    DEBUG ONLY: Set subscription tier for testing purposes.
    This endpoint should be removed or protected in production.

    Usage: POST /subscriptions/debug/set-tier?tier=premium
    Valid tiers: free, premium, pro
    """
    from sqlalchemy import update

    valid_tiers = ["free", "premium", "pro"]
    if tier not in valid_tiers:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid tier. Must be one of: {valid_tiers}"
        )

    # Update user tier using direct SQL update
    await db.execute(
        update(User).where(User.id == current_user.id).values(subscription_tier=tier)
    )
    await db.commit()

    return {
        "message": f"Tier updated to {tier}",
        "user_id": current_user.id,
        "email": current_user.email,
        "new_tier": tier
    }


@router.post("/debug/reset-usage")
async def debug_reset_usage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    DEBUG ONLY: Reset all usage counters for testing purposes.
    """
    service = SubscriptionService(db)
    await service.reset_usage(current_user.id)

    return {
        "message": "Usage counters reset",
        "user_id": current_user.id
    }
