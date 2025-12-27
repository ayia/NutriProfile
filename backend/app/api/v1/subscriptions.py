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
    UsageLimits,
    UsageBase,
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

    return SubscriptionStatusResponse(
        tier=SubscriptionTier(current_user.subscription_tier),
        status=SubscriptionStatus(subscription.status.value) if subscription else None,
        renews_at=subscription.current_period_end if subscription else None,
        cancel_at_period_end=subscription.cancel_at_period_end if subscription else False,
        is_active=subscription.status.value == "active" if subscription else True
    )


@router.get("/usage", response_model=UsageStatusResponse)
async def get_usage_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retourne l'utilisation actuelle et les limites."""
    service = SubscriptionService(db)
    status = await service.get_usage_status(current_user.id)

    limits = status["limits"]
    usage = status["usage"]

    return UsageStatusResponse(
        tier=SubscriptionTier(status["tier"]),
        limits=UsageLimits(
            vision_analyses=limits["vision_analyses"],
            recipe_generations=limits["recipe_generations"],
            coach_messages=limits["coach_messages"],
            history_days=limits["history_days"]
        ),
        usage=UsageBase(
            vision_analyses=usage["vision_analyses"],
            recipe_generations=usage["recipe_generations"],
            coach_messages=usage["coach_messages"]
        ),
        reset_at=status["reset_at"]
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


@router.get("/pricing", response_model=PricingResponse)
async def get_pricing():
    """Retourne les plans tarifaires disponibles."""
    plans = [
        PricingPlan(
            tier=SubscriptionTier.FREE,
            name="Gratuit",
            description="Pour découvrir NutriProfile",
            price_monthly=0,
            price_yearly=0,
            variant_id_monthly="",
            variant_id_yearly="",
            features=[
                "3 analyses photo par jour",
                "2 recettes par semaine",
                "1 conseil coach par jour",
                "Historique 7 jours",
                "Suivi calories de base"
            ],
            popular=False
        ),
        PricingPlan(
            tier=SubscriptionTier.PREMIUM,
            name="Premium",
            description="Pour les utilisateurs réguliers",
            price_monthly=4.99,
            price_yearly=39.99,
            variant_id_monthly=settings.PADDLE_PREMIUM_MONTHLY_PRICE_ID,
            variant_id_yearly=settings.PADDLE_PREMIUM_YEARLY_PRICE_ID,
            features=[
                "Analyses photo illimitées",
                "10 recettes par semaine",
                "5 conseils coach par jour",
                "Historique 90 jours",
                "Statistiques avancées",
                "Support prioritaire"
            ],
            popular=True
        ),
        PricingPlan(
            tier=SubscriptionTier.PRO,
            name="Pro",
            description="Pour les passionnés de nutrition",
            price_monthly=9.99,
            price_yearly=79.99,
            variant_id_monthly=settings.PADDLE_PRO_MONTHLY_PRICE_ID,
            variant_id_yearly=settings.PADDLE_PRO_YEARLY_PRICE_ID,
            features=[
                "Tout illimité",
                "Historique complet",
                "Export PDF (bientôt)",
                "Plans repas IA (bientôt)",
                "API access (bientôt)",
                "Support dédié"
            ],
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
