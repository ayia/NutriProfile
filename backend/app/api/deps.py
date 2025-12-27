"""Dependencies for API endpoints."""

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.database import get_db
from app.models.user import User


async def check_subscription_tier(
    user: User,
    db: AsyncSession,  # noqa: ARG001 - kept for future use
    required_tier: str = "pro"
) -> bool:
    """
    Vérifie que l'utilisateur a le tier d'abonnement requis.

    Args:
        user: L'utilisateur actuel
        db: Session de base de données
        required_tier: Le tier minimum requis ("free", "premium", "pro")

    Raises:
        HTTPException 403 si le tier est insuffisant
    """
    tier_hierarchy = {"free": 0, "premium": 1, "pro": 2}

    user_tier = user.subscription_tier or "free"
    user_level = tier_hierarchy.get(user_tier, 0)
    required_level = tier_hierarchy.get(required_tier, 2)

    if user_level < required_level:
        raise HTTPException(
            status_code=403,
            detail={
                "error": "subscription_required",
                "message": f"Cette fonctionnalité nécessite un abonnement {required_tier.capitalize()}.",
                "required_tier": required_tier,
                "current_tier": user_tier,
            }
        )

    return True


__all__ = ["get_current_user", "get_db", "check_subscription_tier"]
