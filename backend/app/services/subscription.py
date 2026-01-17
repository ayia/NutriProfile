"""Service de gestion des abonnements et du suivi d'usage."""

import logging
from datetime import date, datetime, timedelta, timezone
from typing import Tuple
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subscription import Subscription, UsageTracking, SubscriptionTier, SubscriptionStatus
from app.models.user import User
from app.config import get_settings
from app.core.cache import get_cache, tier_cache_key, pricing_cache_key, invalidate_user_tier_cache

logger = logging.getLogger(__name__)
settings = get_settings()

# Trial duration in days (7 days optimal for health/fitness apps - 45% conversion rate)
TRIAL_DURATION_DAYS = 7


# Limites par tier avec périodes explicites
# Structure: {"limit": valeur, "period": "day"|"week"|"total"|"boolean"}
# -1 = illimité, 0 = désactivé, 1 = activé (pour boolean)
TIER_LIMITS = {
    "free": {
        # Limites d'usage quotidiennes/hebdomadaires
        "vision_analyses": {"limit": 3, "period": "day"},
        "recipe_generations": {"limit": 2, "period": "week"},
        "coach_messages": {"limit": 1, "period": "day"},
        "history_days": {"limit": 7, "period": "total"},
        # Fonctionnalités exclusives (0 = non disponible, 1 = disponible)
        "export_pdf": {"limit": 0, "period": "boolean"},
        "meal_plans": {"limit": 0, "period": "boolean"},
        "advanced_stats": {"limit": 0, "period": "boolean"},
        "priority_support": {"limit": 0, "period": "boolean"},
        "dedicated_support": {"limit": 0, "period": "boolean"},
        "api_access": {"limit": 0, "period": "boolean"},
    },
    "premium": {
        # Limites d'usage quotidiennes/hebdomadaires
        "vision_analyses": {"limit": -1, "period": "day"},
        "recipe_generations": {"limit": 10, "period": "week"},
        "coach_messages": {"limit": 5, "period": "day"},
        "history_days": {"limit": 90, "period": "total"},
        # Fonctionnalités exclusives
        "export_pdf": {"limit": 0, "period": "boolean"},
        "meal_plans": {"limit": 0, "period": "boolean"},
        "advanced_stats": {"limit": 1, "period": "boolean"},
        "priority_support": {"limit": 1, "period": "boolean"},
        "dedicated_support": {"limit": 0, "period": "boolean"},
        "api_access": {"limit": 0, "period": "boolean"},
    },
    "pro": {
        # Limites d'usage quotidiennes/hebdomadaires
        "vision_analyses": {"limit": -1, "period": "day"},
        "recipe_generations": {"limit": -1, "period": "week"},
        "coach_messages": {"limit": -1, "period": "day"},
        "history_days": {"limit": -1, "period": "total"},
        # Fonctionnalités exclusives
        "export_pdf": {"limit": 1, "period": "boolean"},
        "meal_plans": {"limit": 1, "period": "boolean"},
        "advanced_stats": {"limit": 1, "period": "boolean"},
        "priority_support": {"limit": 1, "period": "boolean"},
        "dedicated_support": {"limit": 1, "period": "boolean"},
        "api_access": {"limit": 0, "period": "boolean"},  # Bientôt disponible
    }
}


def has_feature(tier: str, feature: str) -> bool:
    """Vérifie si un tier a accès à une fonctionnalité boolean."""
    tier_limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
    feature_info = tier_limits.get(feature, {"limit": 0, "period": "boolean"})
    return feature_info.get("limit", 0) == 1


def get_limit_value(tier: str, action: str) -> int:
    """Extrait la valeur limite d'un tier/action."""
    tier_limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
    limit_info = tier_limits.get(action, {"limit": 0, "period": "day"})
    return limit_info["limit"] if isinstance(limit_info, dict) else limit_info


def get_limit_period(tier: str, action: str) -> str:
    """Extrait la période d'un tier/action."""
    tier_limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
    limit_info = tier_limits.get(action, {"limit": 0, "period": "day"})
    return limit_info["period"] if isinstance(limit_info, dict) else "day"


class SubscriptionService:
    """Service pour gérer les abonnements et l'usage."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_tier(self, user_id: int) -> str:
        """
        Récupère le tier effectif de l'utilisateur.
        Prend en compte: subscription payée > trial actif > free
        """
        return await self.get_effective_tier(user_id)

    async def get_effective_tier(self, user_id: int) -> str:
        """
        Détermine le tier effectif de l'utilisateur.

        Ordre de priorité:
        1. Subscription payée active (premium/pro) → tier de la subscription
        2. Trial actif (trial_ends_at > now) → "premium"
        3. Sinon → "free"

        Note: Utilise le cache Redis (TTL 5 minutes) pour optimiser les requêtes fréquentes.
        """
        # Check cache first
        cache = get_cache()
        cache_key = tier_cache_key(user_id)
        cached_tier = await cache.get(cache_key)
        if cached_tier is not None:
            return cached_tier

        # Cache miss - fetch from database
        user = await self.db.get(User, user_id)
        if not user:
            tier = "free"
        else:
            # 1. Vérifier subscription payée active
            subscription = await self.get_subscription(user_id)
            if subscription and subscription.status == SubscriptionStatus.ACTIVE:
                if subscription.tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PRO]:
                    tier = subscription.tier.value
                else:
                    # 2. Vérifier trial actif
                    if user.trial_ends_at:
                        now = datetime.now(timezone.utc)
                        # S'assurer que trial_ends_at est timezone-aware (SQLite stocke sans TZ)
                        trial_ends = user.trial_ends_at
                        if trial_ends.tzinfo is None:
                            trial_ends = trial_ends.replace(tzinfo=timezone.utc)
                        if now < trial_ends:
                            tier = "premium"
                        else:
                            tier = user.subscription_tier or "free"
                    else:
                        tier = user.subscription_tier or "free"
            else:
                # 2. Vérifier trial actif
                if user.trial_ends_at:
                    now = datetime.now(timezone.utc)
                    # S'assurer que trial_ends_at est timezone-aware (SQLite stocke sans TZ)
                    trial_ends = user.trial_ends_at
                    if trial_ends.tzinfo is None:
                        trial_ends = trial_ends.replace(tzinfo=timezone.utc)
                    if now < trial_ends:
                        tier = "premium"
                    else:
                        # 3. Défaut: subscription_tier ou free
                        tier = user.subscription_tier or "free"
                else:
                    # 3. Défaut: subscription_tier ou free
                    tier = user.subscription_tier or "free"

        # Store in cache (5 minutes TTL)
        await cache.set(cache_key, tier, ttl=300)
        return tier

    async def is_trial_active(self, user_id: int) -> bool:
        """Vérifie si l'utilisateur est en période trial."""
        user = await self.db.get(User, user_id)
        if not user or not user.trial_ends_at:
            return False

        # Si l'utilisateur a une subscription payée active, le trial ne compte pas
        subscription = await self.get_subscription(user_id)
        if subscription and subscription.status == SubscriptionStatus.ACTIVE:
            if subscription.tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PRO]:
                return False

        now = datetime.now(timezone.utc)
        # S'assurer que trial_ends_at est timezone-aware (SQLite stocke sans TZ)
        trial_ends = user.trial_ends_at
        if trial_ends.tzinfo is None:
            trial_ends = trial_ends.replace(tzinfo=timezone.utc)
        return now < trial_ends

    async def get_trial_days_remaining(self, user_id: int) -> int | None:
        """Retourne le nombre de jours restants dans le trial, ou None si pas de trial."""
        user = await self.db.get(User, user_id)
        if not user or not user.trial_ends_at:
            return None

        # Si l'utilisateur a une subscription payée active, pas de trial
        subscription = await self.get_subscription(user_id)
        if subscription and subscription.status == SubscriptionStatus.ACTIVE:
            if subscription.tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PRO]:
                return None

        now = datetime.now(timezone.utc)
        # S'assurer que trial_ends_at est timezone-aware (SQLite stocke sans TZ)
        trial_ends = user.trial_ends_at
        if trial_ends.tzinfo is None:
            trial_ends = trial_ends.replace(tzinfo=timezone.utc)

        if now >= trial_ends:
            return 0

        delta = trial_ends - now
        return max(0, delta.days)

    async def get_trial_info(self, user_id: int) -> dict:
        """Retourne les informations complètes sur le trial."""
        user = await self.db.get(User, user_id)
        is_trial = await self.is_trial_active(user_id)
        days_remaining = await self.get_trial_days_remaining(user_id)

        return {
            "is_trial": is_trial,
            "trial_ends_at": user.trial_ends_at.isoformat() if user and user.trial_ends_at else None,
            "days_remaining": days_remaining
        }

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
            await self.db.flush()  # Flush instead of commit - let get_db handle commit

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
        limit = get_limit_value(tier, action)
        period = get_limit_period(tier, action)

        # Si illimité
        if limit == -1:
            return True, 0, -1

        # Compter selon la période
        if period == "week":
            used = await self.get_week_recipe_count(user_id)
        else:
            # Pour les autres (day), on compte sur le jour
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
        # No commit here - let get_db handle it

    async def get_usage_status(self, user_id: int) -> dict:
        """Retourne le statut complet d'usage pour un utilisateur."""
        tier = await self.get_user_tier(user_id)
        tier_limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
        usage = await self.get_today_usage(user_id)

        # Pour les recettes, on compte sur la semaine
        week_recipes = await self.get_week_recipe_count(user_id)

        return {
            "tier": tier,
            "limits": tier_limits,
            "usage": {
                "vision_analyses": usage.vision_analyses if usage else 0,
                "recipe_generations": week_recipes,
                "coach_messages": usage.coach_messages if usage else 0,
            },
            "reset_at": self._get_next_reset_time()
        }

    @staticmethod
    def get_all_tier_limits() -> dict:
        """Retourne toutes les limites pour tous les tiers (pour l'API pricing)."""
        return TIER_LIMITS

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
        ls_subscription_id: str | None = None,
        ls_customer_id: str | None = None,
        ls_variant_id: str | None = None,
        ls_order_id: str | None = None,
        status: str = "active",
        period_start: datetime | None = None,
        period_end: datetime | None = None
    ) -> Subscription:
        """Crée ou met à jour un abonnement avec Lemon Squeezy."""
        subscription = await self.get_subscription(user_id)

        if subscription:
            subscription.tier = SubscriptionTier(tier)
            subscription.status = SubscriptionStatus(status)
            if ls_subscription_id:
                subscription.ls_subscription_id = ls_subscription_id
            if ls_customer_id:
                subscription.ls_customer_id = ls_customer_id
            if ls_variant_id:
                subscription.ls_variant_id = ls_variant_id
            if ls_order_id:
                subscription.ls_order_id = ls_order_id
            if period_start:
                subscription.current_period_start = period_start
            if period_end:
                subscription.current_period_end = period_end
        else:
            subscription = Subscription(
                user_id=user_id,
                tier=SubscriptionTier(tier),
                status=SubscriptionStatus(status),
                ls_subscription_id=ls_subscription_id,
                ls_customer_id=ls_customer_id,
                ls_variant_id=ls_variant_id,
                ls_order_id=ls_order_id,
                current_period_start=period_start,
                current_period_end=period_end
            )
            self.db.add(subscription)

        # Mettre à jour le tier sur l'utilisateur aussi
        user = await self.db.get(User, user_id)
        if user:
            user.subscription_tier = tier

        await self.db.flush()
        await self.db.refresh(subscription)

        # Invalidate tier cache
        await invalidate_user_tier_cache(user_id)

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

        await self.db.flush()
        await self.db.refresh(subscription)

        # Invalidate tier cache
        await invalidate_user_tier_cache(user_id)

        return subscription

    # ============== Lemon Squeezy Integration ==============

    async def create_checkout_url(self, user_id: int, variant_id: str) -> str | None:
        """
        Crée une URL de checkout Lemon Squeezy.

        Args:
            user_id: ID de l'utilisateur
            variant_id: ID du variant Lemon Squeezy

        Returns:
            URL de checkout ou None si échec
        """
        api_key = getattr(settings, 'LEMONSQUEEZY_API_KEY', '')
        store_id = getattr(settings, 'LEMONSQUEEZY_STORE_ID', '')

        logger.info(f"Creating checkout for user {user_id} with variant {variant_id}")
        logger.info(f"API key present: {bool(api_key)}, Store ID: {store_id}")

        if not api_key or not store_id:
            logger.error("Missing LEMONSQUEEZY_API_KEY or LEMONSQUEEZY_STORE_ID")
            return None

        # Récupérer l'email de l'utilisateur
        user = await self.db.get(User, user_id)
        if not user:
            logger.error(f"User {user_id} not found")
            return None

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.lemonsqueezy.com/v1/checkouts",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Accept": "application/vnd.api+json",
                        "Content-Type": "application/vnd.api+json",
                    },
                    json={
                        "data": {
                            "type": "checkouts",
                            "attributes": {
                                "checkout_data": {
                                    "email": user.email,
                                    "name": user.name if hasattr(user, 'name') and user.name else None,
                                    "custom": {
                                        "user_id": str(user_id)
                                    }
                                },
                                "product_options": {
                                    "redirect_url": "https://nutriprofile.pages.dev/dashboard?checkout=success",
                                }
                            },
                            "relationships": {
                                "store": {
                                    "data": {
                                        "type": "stores",
                                        "id": store_id
                                    }
                                },
                                "variant": {
                                    "data": {
                                        "type": "variants",
                                        "id": variant_id
                                    }
                                }
                            }
                        }
                    }
                )

                logger.info(f"Lemon Squeezy response status: {response.status_code}")

                if response.status_code in [200, 201]:
                    data = response.json()
                    # Lemon Squeezy retourne l'URL de checkout dans attributes.url
                    checkout_url = data.get("data", {}).get("attributes", {}).get("url")
                    logger.info(f"Checkout URL created: {checkout_url[:50]}..." if checkout_url else "No URL in response")
                    return checkout_url
                else:
                    logger.error(f"Lemon Squeezy error {response.status_code}: {response.text}")
                    return None
        except Exception as e:
            logger.error(f"Checkout creation failed: {str(e)}")
            return None

    async def get_customer_portal_url(self, user_id: int) -> str | None:
        """
        Récupère l'URL du portail client Lemon Squeezy.

        Lemon Squeezy génère un customer portal URL dans les données d'abonnement.
        """
        subscription = await self.get_subscription(user_id)
        if not subscription or not subscription.ls_subscription_id:
            return None

        api_key = getattr(settings, 'LEMONSQUEEZY_API_KEY', '')
        if not api_key:
            return None

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.lemonsqueezy.com/v1/subscriptions/{subscription.ls_subscription_id}",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Accept": "application/vnd.api+json",
                }
            )

            if response.status_code == 200:
                data = response.json()
                # Lemon Squeezy fournit urls.update_payment_method et urls.customer_portal
                urls = data.get("data", {}).get("attributes", {}).get("urls", {})
                return urls.get("customer_portal") or urls.get("update_payment_method")
            return None

    async def cancel_lemonsqueezy_subscription(self, user_id: int) -> bool:
        """Annule un abonnement Lemon Squeezy."""
        subscription = await self.get_subscription(user_id)
        if not subscription or not subscription.ls_subscription_id:
            return False

        api_key = getattr(settings, 'LEMONSQUEEZY_API_KEY', '')
        if not api_key:
            return False

        async with httpx.AsyncClient() as client:
            # Lemon Squeezy utilise DELETE pour annuler (ou PATCH pour cancel at period end)
            response = await client.delete(
                f"https://api.lemonsqueezy.com/v1/subscriptions/{subscription.ls_subscription_id}",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Accept": "application/vnd.api+json",
                }
            )

            return response.status_code in [200, 204]

    async def reset_usage(self, user_id: int) -> None:
        """
        DEBUG ONLY: Reset all usage counters for a user.
        Deletes all UsageTracking records for the user.
        """
        from sqlalchemy import delete
        await self.db.execute(
            delete(UsageTracking).where(UsageTracking.user_id == user_id)
        )
        await self.db.commit()


# Mapping variant_id -> tier (Lemon Squeezy)
VARIANT_TO_TIER = {
    # Ces IDs seront remplis par les settings au runtime
}


def get_tier_from_variant(variant_id: str) -> str:
    """Retourne le tier correspondant à un variant_id Lemon Squeezy."""
    # Vérifier d'abord le mapping statique
    if variant_id in VARIANT_TO_TIER:
        return VARIANT_TO_TIER[variant_id]

    # Sinon, vérifier par les settings
    if variant_id == settings.LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID:
        return "premium"
    if variant_id == settings.LEMONSQUEEZY_PREMIUM_YEARLY_VARIANT_ID:
        return "premium"
    if variant_id == settings.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID:
        return "pro"
    if variant_id == settings.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID:
        return "pro"

    return "free"
