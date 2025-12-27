"""Service de gestion des abonnements et du suivi d'usage."""

from datetime import date, datetime, timedelta
from typing import Tuple
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subscription import Subscription, UsageTracking, SubscriptionTier, SubscriptionStatus
from app.models.user import User
from app.config import get_settings

settings = get_settings()


# Limites par tier
TIER_LIMITS = {
    "free": {
        "vision_analyses": 3,       # par jour
        "recipe_generations": 2,    # par jour
        "coach_messages": 5,        # par jour
        "history_days": 7,          # jours d'historique
    },
    "premium": {
        "vision_analyses": -1,      # illimité
        "recipe_generations": 10,   # par semaine
        "coach_messages": 5,        # par jour
        "history_days": 90,
    },
    "pro": {
        "vision_analyses": -1,
        "recipe_generations": -1,
        "coach_messages": -1,
        "history_days": -1,         # illimité
    }
}


class SubscriptionService:
    """Service pour gérer les abonnements et l'usage."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_tier(self, user_id: int) -> str:
        """Récupère le tier d'abonnement de l'utilisateur."""
        result = await self.db.execute(
            select(User.subscription_tier).where(User.id == user_id)
        )
        tier = result.scalar_one_or_none()
        return tier or "free"

    async def get_tier_limits(self, tier: str) -> dict:
        """Retourne les limites pour un tier donné."""
        return TIER_LIMITS.get(tier, TIER_LIMITS["free"])

    async def get_today_usage(self, user_id: int) -> UsageTracking | None:
        """Récupère l'usage du jour pour un utilisateur."""
        today = date.today()
        result = await self.db.execute(
            select(UsageTracking)
            .where(UsageTracking.user_id == user_id)
            .where(UsageTracking.date == today)
        )
        return result.scalar_one_or_none()

    async def get_or_create_today_usage(self, user_id: int) -> UsageTracking:
        """Récupère ou crée l'enregistrement d'usage du jour."""
        usage = await self.get_today_usage(user_id)

        if not usage:
            usage = UsageTracking(
                user_id=user_id,
                date=date.today(),
                vision_analyses=0,
                recipe_generations=0,
                coach_messages=0
            )
            self.db.add(usage)
            await self.db.commit()
            await self.db.refresh(usage)

        return usage

    async def get_week_recipe_count(self, user_id: int) -> int:
        """Compte les générations de recettes de la semaine en cours."""
        today = date.today()
        # Début de la semaine (lundi)
        start_of_week = today - timedelta(days=today.weekday())

        result = await self.db.execute(
            select(UsageTracking)
            .where(UsageTracking.user_id == user_id)
            .where(UsageTracking.date >= start_of_week)
        )
        usages = result.scalars().all()

        return sum(u.recipe_generations for u in usages)

    async def check_limit(
        self,
        user_id: int,
        action: str
    ) -> Tuple[bool, int, int]:
        """
        Vérifie si l'utilisateur peut effectuer l'action.

        Args:
            user_id: ID de l'utilisateur
            action: Type d'action (vision_analyses, recipe_generations, coach_messages)

        Returns:
            Tuple[bool, int, int]: (autorisé, utilisé, limite)
            - autorisé: True si l'action est permise
            - utilisé: nombre d'utilisations actuelles
            - limite: limite maximale (-1 = illimité)
        """
        tier = await self.get_user_tier(user_id)
        limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
        limit = limits.get(action, 0)

        # Si illimité
        if limit == -1:
            return True, 0, -1

        # Pour les recettes, on compte sur la semaine
        if action == "recipe_generations":
            used = await self.get_week_recipe_count(user_id)
        else:
            # Pour les autres, on compte sur le jour
            usage = await self.get_today_usage(user_id)
            used = getattr(usage, action, 0) if usage else 0

        allowed = used < limit
        return allowed, used, limit

    async def increment_usage(self, user_id: int, action: str) -> None:
        """
        Incrémente le compteur d'usage pour une action.

        Args:
            user_id: ID de l'utilisateur
            action: Type d'action (vision_analyses, recipe_generations, coach_messages)
        """
        usage = await self.get_or_create_today_usage(user_id)

        current_value = getattr(usage, action, 0)
        setattr(usage, action, current_value + 1)

        await self.db.commit()

    async def get_usage_status(self, user_id: int) -> dict:
        """Retourne le statut complet d'usage pour un utilisateur."""
        tier = await self.get_user_tier(user_id)
        limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
        usage = await self.get_today_usage(user_id)

        # Pour les recettes, on compte sur la semaine
        week_recipes = await self.get_week_recipe_count(user_id)

        return {
            "tier": tier,
            "limits": limits,
            "usage": {
                "vision_analyses": usage.vision_analyses if usage else 0,
                "recipe_generations": week_recipes,
                "coach_messages": usage.coach_messages if usage else 0,
            },
            "reset_at": self._get_next_reset_time()
        }

    def _get_next_reset_time(self) -> datetime:
        """Calcule le prochain reset (minuit UTC)."""
        now = datetime.utcnow()
        tomorrow = now.date() + timedelta(days=1)
        return datetime.combine(tomorrow, datetime.min.time())

    # ============== Subscription Management ==============

    async def get_subscription(self, user_id: int) -> Subscription | None:
        """Récupère l'abonnement d'un utilisateur."""
        result = await self.db.execute(
            select(Subscription).where(Subscription.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_or_update_subscription(
        self,
        user_id: int,
        tier: str,
        paddle_subscription_id: str | None = None,
        paddle_customer_id: str | None = None,
        paddle_price_id: str | None = None,
        paddle_transaction_id: str | None = None,
        status: str = "active",
        period_end: datetime | None = None
    ) -> Subscription:
        """Crée ou met à jour un abonnement."""
        subscription = await self.get_subscription(user_id)

        if subscription:
            subscription.tier = SubscriptionTier(tier)
            subscription.status = SubscriptionStatus(status)
            if paddle_subscription_id:
                subscription.paddle_subscription_id = paddle_subscription_id
            if paddle_customer_id:
                subscription.paddle_customer_id = paddle_customer_id
            if paddle_price_id:
                subscription.paddle_price_id = paddle_price_id
            if paddle_transaction_id:
                subscription.paddle_transaction_id = paddle_transaction_id
            if period_end:
                subscription.current_period_end = period_end
        else:
            subscription = Subscription(
                user_id=user_id,
                tier=SubscriptionTier(tier),
                status=SubscriptionStatus(status),
                paddle_subscription_id=paddle_subscription_id,
                paddle_customer_id=paddle_customer_id,
                paddle_price_id=paddle_price_id,
                paddle_transaction_id=paddle_transaction_id,
                current_period_end=period_end
            )
            self.db.add(subscription)

        # Mettre à jour le tier sur l'utilisateur aussi
        user = await self.db.get(User, user_id)
        if user:
            user.subscription_tier = tier

        await self.db.commit()
        await self.db.refresh(subscription)
        return subscription

    async def cancel_subscription(self, user_id: int, at_period_end: bool = True) -> Subscription | None:
        """Annule un abonnement."""
        subscription = await self.get_subscription(user_id)
        if not subscription:
            return None

        if at_period_end:
            subscription.cancel_at_period_end = True
        else:
            subscription.status = SubscriptionStatus.CANCELLED
            # Rétrograder vers free
            subscription.tier = SubscriptionTier.FREE
            user = await self.db.get(User, user_id)
            if user:
                user.subscription_tier = "free"

        await self.db.commit()
        await self.db.refresh(subscription)
        return subscription

    # ============== Paddle Integration ==============

    def _get_paddle_base_url(self) -> str:
        """Retourne l'URL de base Paddle selon l'environnement."""
        env = getattr(settings, 'PADDLE_ENVIRONMENT', 'sandbox')
        if env == "production":
            return "https://api.paddle.com"
        return "https://sandbox-api.paddle.com"

    async def create_checkout_url(self, user_id: int, price_id: str) -> str | None:
        """Crée une URL de checkout Paddle."""
        api_key = getattr(settings, 'PADDLE_API_KEY', '')

        if not api_key:
            return None

        # Récupérer l'email de l'utilisateur
        user = await self.db.get(User, user_id)
        if not user:
            return None

        base_url = self._get_paddle_base_url()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{base_url}/transactions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "items": [
                        {
                            "price_id": price_id,
                            "quantity": 1
                        }
                    ],
                    "customer_id": user.paddle_customer_id if hasattr(user, 'paddle_customer_id') and user.paddle_customer_id else None,
                    "custom_data": {
                        "user_id": str(user_id)
                    },
                    "checkout": {
                        "url": f"https://nutriprofile.fly.dev/checkout/success?user_id={user_id}"
                    }
                }
            )

            if response.status_code in [200, 201]:
                data = response.json()
                # Paddle retourne l'URL de checkout dans la réponse
                checkout_url = data.get("data", {}).get("checkout", {}).get("url")
                return checkout_url
            return None

    async def get_customer_portal_url(self, user_id: int) -> str | None:
        """Récupère l'URL du portail client Paddle."""
        subscription = await self.get_subscription(user_id)
        if not subscription or not subscription.paddle_subscription_id:
            return None

        api_key = getattr(settings, 'PADDLE_API_KEY', '')
        if not api_key:
            return None

        base_url = self._get_paddle_base_url()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{base_url}/subscriptions/{subscription.paddle_subscription_id}",
                headers={
                    "Authorization": f"Bearer {api_key}",
                }
            )

            if response.status_code == 200:
                data = response.json()
                # Paddle fournit un management_urls dans la subscription
                management_urls = data.get("data", {}).get("management_urls", {})
                return management_urls.get("update_payment_method") or management_urls.get("cancel")
            return None

    async def cancel_paddle_subscription(self, user_id: int) -> bool:
        """Annule un abonnement Paddle."""
        subscription = await self.get_subscription(user_id)
        if not subscription or not subscription.paddle_subscription_id:
            return False

        api_key = getattr(settings, 'PADDLE_API_KEY', '')
        if not api_key:
            return False

        base_url = self._get_paddle_base_url()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{base_url}/subscriptions/{subscription.paddle_subscription_id}/cancel",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "effective_from": "next_billing_period"
                }
            )

            return response.status_code == 200


# Mapping price_id -> tier (à configurer avec vos vrais IDs Paddle)
PRICE_TO_TIER = {
    # Ces IDs seront remplacés par les vrais Price IDs Paddle
    # Format: pri_xxxxxxxxxxxxx
}


def get_tier_from_price(price_id: str) -> str:
    """Retourne le tier correspondant à un price_id Paddle."""
    # Vérifier d'abord le mapping statique
    if price_id in PRICE_TO_TIER:
        return PRICE_TO_TIER[price_id]

    # Sinon, vérifier par les settings
    if price_id == settings.PADDLE_PREMIUM_MONTHLY_PRICE_ID:
        return "premium"
    if price_id == settings.PADDLE_PREMIUM_YEARLY_PRICE_ID:
        return "premium"
    if price_id == settings.PADDLE_PRO_MONTHLY_PRICE_ID:
        return "pro"
    if price_id == settings.PADDLE_PRO_YEARLY_PRICE_ID:
        return "pro"

    return "free"
