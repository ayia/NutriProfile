"""Endpoints pour les webhooks Paddle et Lemon Squeezy."""

import hmac
import hashlib
import logging
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.config import get_settings
from app.services.subscription import SubscriptionService, get_tier_from_price

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)
settings = get_settings()


# ============== LEMON SQUEEZY WEBHOOKS ==============

# Mapping Variant ID -> Tier
LEMONSQUEEZY_VARIANT_TO_TIER = {
    settings.LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID: "premium",
    settings.LEMONSQUEEZY_PREMIUM_YEARLY_VARIANT_ID: "premium",
    settings.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID: "pro",
    settings.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID: "pro",
}


def verify_lemonsqueezy_signature(body: bytes, signature: str) -> bool:
    """Vérifie la signature HMAC du webhook Lemon Squeezy."""
    secret = settings.LEMONSQUEEZY_WEBHOOK_SECRET
    if not secret:
        logger.warning("LEMONSQUEEZY_WEBHOOK_SECRET not configured")
        return False

    expected = hmac.new(
        secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)


def get_tier_from_variant(variant_id: str) -> str:
    """Retourne le tier correspondant à un variant_id Lemon Squeezy."""
    return LEMONSQUEEZY_VARIANT_TO_TIER.get(str(variant_id), "free")


@router.post("/lemonsqueezy")
async def lemonsqueezy_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Endpoint pour recevoir les webhooks Lemon Squeezy.

    Events gérés:
    - subscription_created: Nouvel abonnement
    - subscription_updated: Mise à jour abonnement
    - subscription_cancelled: Abonnement annulé
    - subscription_resumed: Abonnement repris
    - subscription_expired: Abonnement expiré
    - subscription_paused: Abonnement mis en pause
    - subscription_unpaused: Abonnement repris
    - subscription_payment_success: Paiement réussi
    - subscription_payment_failed: Paiement échoué
    - order_created: Commande créée
    """
    # Récupérer le body et la signature
    body = await request.body()
    signature = request.headers.get("X-Signature", "")

    logger.info(f"Received Lemon Squeezy webhook, signature present: {bool(signature)}")

    # Vérifier la signature (skip si pas de secret configuré - dev mode)
    if settings.LEMONSQUEEZY_WEBHOOK_SECRET:
        if not verify_lemonsqueezy_signature(body, signature):
            logger.error("Invalid Lemon Squeezy webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")

    # Parser le payload
    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # Extraire les informations
    meta = payload.get("meta", {})
    event_name = meta.get("event_name", "")
    custom_data = meta.get("custom_data", {})
    data = payload.get("data", {})
    attributes = data.get("attributes", {})

    logger.info(f"Received Lemon Squeezy webhook: {event_name}")
    logger.info(f"Custom data: {custom_data}")

    # Router vers le bon handler
    handlers = {
        "subscription_created": handle_ls_subscription_created,
        "subscription_updated": handle_ls_subscription_updated,
        "subscription_cancelled": handle_ls_subscription_cancelled,
        "subscription_resumed": handle_ls_subscription_resumed,
        "subscription_expired": handle_ls_subscription_expired,
        "subscription_paused": handle_ls_subscription_paused,
        "subscription_unpaused": handle_ls_subscription_unpaused,
        "subscription_payment_success": handle_ls_payment_success,
        "subscription_payment_failed": handle_ls_payment_failed,
        "order_created": handle_ls_order_created,
    }

    handler = handlers.get(event_name)
    if handler:
        try:
            await handler(data, attributes, custom_data, db)
            logger.info(f"Successfully processed Lemon Squeezy webhook: {event_name}")
        except Exception as e:
            logger.error(f"Error processing Lemon Squeezy webhook {event_name}: {e}")
            import traceback
            logger.error(traceback.format_exc())
    else:
        logger.info(f"Unhandled Lemon Squeezy webhook event: {event_name}")

    return {"status": "ok", "event": event_name}


async def handle_ls_subscription_created(data: dict, attributes: dict, custom_data: dict, db: AsyncSession):
    """Gère la création d'un nouvel abonnement Lemon Squeezy."""
    user_id = custom_data.get("user_id")

    if not user_id:
        logger.error("No user_id in Lemon Squeezy webhook custom_data")
        return

    user_id = int(user_id)

    # Récupérer le variant_id
    variant_id = str(attributes.get("variant_id", ""))
    tier = get_tier_from_variant(variant_id)

    # Récupérer les infos d'abonnement
    subscription_id = str(data.get("id", ""))
    customer_id = str(attributes.get("customer_id", ""))
    status = attributes.get("status", "active")

    # Parser la date de fin de période
    renews_at = attributes.get("renews_at")
    period_end = parse_datetime(renews_at) if renews_at else None

    service = SubscriptionService(db)
    await service.create_or_update_subscription(
        user_id=user_id,
        tier=tier,
        paddle_subscription_id=subscription_id,  # Réutilise le champ existant
        paddle_customer_id=customer_id,
        paddle_price_id=variant_id,
        status=map_ls_status(status),
        period_end=period_end
    )

    logger.info(f"Created Lemon Squeezy subscription for user {user_id}: tier={tier}")


async def handle_ls_subscription_updated(data: dict, attributes: dict, custom_data: dict, db: AsyncSession):
    """Gère la mise à jour d'un abonnement Lemon Squeezy."""
    user_id = custom_data.get("user_id")

    if not user_id:
        logger.warning("No user_id in Lemon Squeezy subscription_updated webhook")
        return

    user_id = int(user_id)

    variant_id = str(attributes.get("variant_id", ""))
    tier = get_tier_from_variant(variant_id)
    status = attributes.get("status", "active")
    renews_at = attributes.get("renews_at")
    period_end = parse_datetime(renews_at) if renews_at else None

    service = SubscriptionService(db)
    await service.create_or_update_subscription(
        user_id=user_id,
        tier=tier,
        paddle_price_id=variant_id,
        status=map_ls_status(status),
        period_end=period_end
    )

    logger.info(f"Updated Lemon Squeezy subscription for user {user_id}: tier={tier}, status={status}")


async def handle_ls_subscription_cancelled(data: dict, attributes: dict, custom_data: dict, db: AsyncSession):
    """Gère l'annulation d'un abonnement Lemon Squeezy."""
    user_id = custom_data.get("user_id")

    if not user_id:
        return

    user_id = int(user_id)
    service = SubscriptionService(db)

    # Lemon Squeezy annule généralement à la fin de période
    ends_at = attributes.get("ends_at")
    if ends_at:
        subscription = await service.get_subscription(user_id)
        if subscription:
            subscription.cancel_at_period_end = True
            subscription.current_period_end = parse_datetime(ends_at)
            await db.commit()
    else:
        await service.cancel_subscription(user_id, at_period_end=False)

    logger.info(f"Cancelled Lemon Squeezy subscription for user {user_id}")


async def handle_ls_subscription_resumed(data: dict, attributes: dict, custom_data: dict, db: AsyncSession):
    """Gère la reprise d'un abonnement Lemon Squeezy."""
    user_id = custom_data.get("user_id")

    if not user_id:
        return

    user_id = int(user_id)

    variant_id = str(attributes.get("variant_id", ""))
    tier = get_tier_from_variant(variant_id)
    renews_at = attributes.get("renews_at")
    period_end = parse_datetime(renews_at) if renews_at else None

    service = SubscriptionService(db)
    await service.create_or_update_subscription(
        user_id=user_id,
        tier=tier,
        status="active",
        period_end=period_end
    )

    logger.info(f"Resumed Lemon Squeezy subscription for user {user_id}")


async def handle_ls_subscription_expired(data: dict, attributes: dict, custom_data: dict, db: AsyncSession):
    """Gère l'expiration d'un abonnement Lemon Squeezy."""
    user_id = custom_data.get("user_id")

    if not user_id:
        return

    user_id = int(user_id)
    service = SubscriptionService(db)
    await service.cancel_subscription(user_id, at_period_end=False)

    logger.info(f"Expired Lemon Squeezy subscription for user {user_id}")


async def handle_ls_subscription_paused(data: dict, attributes: dict, custom_data: dict, db: AsyncSession):
    """Gère la mise en pause d'un abonnement Lemon Squeezy."""
    user_id = custom_data.get("user_id")

    if not user_id:
        return

    user_id = int(user_id)
    service = SubscriptionService(db)
    subscription = await service.get_subscription(user_id)

    if subscription:
        subscription.status = "paused"
        await db.commit()

    logger.info(f"Paused Lemon Squeezy subscription for user {user_id}")


async def handle_ls_subscription_unpaused(data: dict, attributes: dict, custom_data: dict, db: AsyncSession):
    """Gère la reprise après pause d'un abonnement Lemon Squeezy."""
    await handle_ls_subscription_resumed(data, attributes, custom_data, db)


async def handle_ls_payment_success(data: dict, attributes: dict, custom_data: dict, db: AsyncSession):
    """Gère un paiement réussi Lemon Squeezy."""
    user_id = custom_data.get("user_id")

    if not user_id:
        return

    user_id = int(user_id)
    service = SubscriptionService(db)
    subscription = await service.get_subscription(user_id)

    if subscription:
        subscription.status = "active"
        renews_at = attributes.get("renews_at")
        if renews_at:
            subscription.current_period_end = parse_datetime(renews_at)
        await db.commit()

    logger.info(f"Payment success for Lemon Squeezy user {user_id}")


async def handle_ls_payment_failed(data: dict, attributes: dict, custom_data: dict, db: AsyncSession):
    """Gère un échec de paiement Lemon Squeezy."""
    user_id = custom_data.get("user_id")

    if not user_id:
        return

    user_id = int(user_id)
    service = SubscriptionService(db)
    subscription = await service.get_subscription(user_id)

    if subscription:
        subscription.status = "past_due"
        await db.commit()

    logger.info(f"Payment failed for Lemon Squeezy user {user_id}")


async def handle_ls_order_created(data: dict, attributes: dict, custom_data: dict, db: AsyncSession):
    """Gère la création d'une commande Lemon Squeezy (pour info/logs)."""
    user_id = custom_data.get("user_id")
    order_number = attributes.get("order_number", "")
    total = attributes.get("total", 0)
    currency = attributes.get("currency", "MAD")

    logger.info(f"Lemon Squeezy order created: #{order_number} for user {user_id} - {total} {currency}")


def map_ls_status(ls_status: str) -> str:
    """Mappe le status Lemon Squeezy vers notre status interne."""
    status_map = {
        "active": "active",
        "on_trial": "active",
        "paused": "paused",
        "past_due": "past_due",
        "cancelled": "cancelled",
        "expired": "expired",
        "unpaid": "past_due",
    }
    return status_map.get(ls_status, "active")


def verify_paddle_signature(body: bytes, signature: str, ts: str) -> bool:
    """Vérifie la signature HMAC du webhook Paddle."""
    secret = settings.PADDLE_WEBHOOK_SECRET
    if not secret:
        logger.warning("PADDLE_WEBHOOK_SECRET not configured")
        return False

    # Paddle utilise ts:h1=signature format
    # La signature est calculée sur ts + body
    message = ts.encode() + b":" + body

    expected = hmac.new(
        secret.encode(),
        message,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)


@router.post("/paddle")
async def paddle_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Endpoint pour recevoir les webhooks Paddle.

    Events gérés:
    - subscription.created: Nouvel abonnement
    - subscription.updated: Mise à jour abonnement
    - subscription.canceled: Abonnement annulé
    - subscription.paused: Abonnement mis en pause
    - subscription.resumed: Abonnement repris
    - subscription.past_due: Paiement en retard
    - transaction.completed: Transaction complétée
    - transaction.payment_failed: Paiement échoué
    """
    # Récupérer le body et les headers de signature
    body = await request.body()
    paddle_signature = request.headers.get("Paddle-Signature", "")

    # Parser la signature (format: ts=xxx;h1=yyy)
    ts = ""
    h1 = ""
    if paddle_signature:
        for part in paddle_signature.split(";"):
            if part.startswith("ts="):
                ts = part[3:]
            elif part.startswith("h1="):
                h1 = part[3:]

    # Vérifier la signature (skip si pas de secret configuré - dev mode)
    if settings.PADDLE_WEBHOOK_SECRET:
        if not verify_paddle_signature(body, h1, ts):
            logger.error("Invalid Paddle webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")

    # Parser le payload
    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # Extraire les informations
    event_type = payload.get("event_type", "")
    data = payload.get("data", {})

    logger.info(f"Received Paddle webhook: {event_type}")

    # Router vers le bon handler
    handlers = {
        "subscription.created": handle_subscription_created,
        "subscription.updated": handle_subscription_updated,
        "subscription.canceled": handle_subscription_cancelled,
        "subscription.paused": handle_subscription_paused,
        "subscription.resumed": handle_subscription_resumed,
        "subscription.past_due": handle_subscription_past_due,
        "transaction.completed": handle_transaction_completed,
        "transaction.payment_failed": handle_payment_failed,
    }

    handler = handlers.get(event_type)
    if handler:
        try:
            await handler(data, db)
            logger.info(f"Successfully processed webhook: {event_type}")
        except Exception as e:
            logger.error(f"Error processing webhook {event_type}: {e}")
            # Ne pas faire échouer le webhook, juste logger
    else:
        logger.info(f"Unhandled webhook event: {event_type}")

    return {"status": "ok", "event": event_type}


async def handle_subscription_created(data: dict, db: AsyncSession):
    """Gère la création d'un nouvel abonnement."""
    custom_data = data.get("custom_data", {})
    user_id = custom_data.get("user_id")

    if not user_id:
        logger.error("No user_id in webhook custom_data")
        return

    user_id = int(user_id)

    # Récupérer le price_id depuis les items
    items = data.get("items", [])
    price_id = items[0].get("price", {}).get("id", "") if items else ""
    tier = get_tier_from_price(price_id)

    service = SubscriptionService(db)
    await service.create_or_update_subscription(
        user_id=user_id,
        tier=tier,
        paddle_subscription_id=data.get("id"),
        paddle_customer_id=data.get("customer_id"),
        paddle_price_id=price_id,
        status="active",
        period_end=parse_datetime(data.get("current_billing_period", {}).get("ends_at"))
    )

    logger.info(f"Created subscription for user {user_id}: tier={tier}")


async def handle_subscription_updated(data: dict, db: AsyncSession):
    """Gère la mise à jour d'un abonnement."""
    custom_data = data.get("custom_data", {})
    user_id = custom_data.get("user_id")

    if not user_id:
        # Essayer de trouver par subscription_id
        subscription_id = data.get("id")
        if subscription_id:
            # TODO: chercher le user par paddle_subscription_id
            logger.warning(f"Subscription update without user_id: {subscription_id}")
        return

    user_id = int(user_id)

    items = data.get("items", [])
    price_id = items[0].get("price", {}).get("id", "") if items else ""
    tier = get_tier_from_price(price_id)

    # Mapper le status Paddle vers notre status
    paddle_status = data.get("status", "active")
    status_map = {
        "active": "active",
        "paused": "paused",
        "past_due": "past_due",
        "canceled": "cancelled",
        "trialing": "active",
    }
    mapped_status = status_map.get(paddle_status, "active")

    service = SubscriptionService(db)
    await service.create_or_update_subscription(
        user_id=user_id,
        tier=tier,
        paddle_subscription_id=data.get("id"),
        paddle_price_id=price_id,
        status=mapped_status,
        period_end=parse_datetime(data.get("current_billing_period", {}).get("ends_at"))
    )

    logger.info(f"Updated subscription for user {user_id}: tier={tier}, status={mapped_status}")


async def handle_subscription_cancelled(data: dict, db: AsyncSession):
    """Gère l'annulation d'un abonnement."""
    custom_data = data.get("custom_data", {})
    user_id = custom_data.get("user_id")

    if not user_id:
        return

    user_id = int(user_id)
    service = SubscriptionService(db)

    # Paddle schedule_change indique si l'annulation est immédiate ou à la fin de période
    scheduled_change = data.get("scheduled_change")
    if scheduled_change and scheduled_change.get("action") == "cancel":
        # Annulation programmée pour la fin de période
        subscription = await service.get_subscription(user_id)
        if subscription:
            subscription.cancel_at_period_end = True
            ends_at = parse_datetime(scheduled_change.get("effective_at"))
            if ends_at:
                subscription.current_period_end = ends_at
            await db.commit()
    else:
        # Annulation immédiate
        await service.cancel_subscription(user_id, at_period_end=False)

    logger.info(f"Cancelled subscription for user {user_id}")


async def handle_subscription_paused(data: dict, db: AsyncSession):
    """Gère la mise en pause d'un abonnement."""
    custom_data = data.get("custom_data", {})
    user_id = custom_data.get("user_id")

    if not user_id:
        return

    user_id = int(user_id)
    service = SubscriptionService(db)
    subscription = await service.get_subscription(user_id)

    if subscription:
        subscription.status = "paused"
        await db.commit()

    logger.info(f"Paused subscription for user {user_id}")


async def handle_subscription_resumed(data: dict, db: AsyncSession):
    """Gère la reprise d'un abonnement."""
    custom_data = data.get("custom_data", {})
    user_id = custom_data.get("user_id")

    if not user_id:
        return

    user_id = int(user_id)

    items = data.get("items", [])
    price_id = items[0].get("price", {}).get("id", "") if items else ""
    tier = get_tier_from_price(price_id)

    service = SubscriptionService(db)
    await service.create_or_update_subscription(
        user_id=user_id,
        tier=tier,
        status="active",
        period_end=parse_datetime(data.get("current_billing_period", {}).get("ends_at"))
    )

    logger.info(f"Resumed subscription for user {user_id}")


async def handle_subscription_past_due(data: dict, db: AsyncSession):
    """Gère un abonnement en retard de paiement."""
    custom_data = data.get("custom_data", {})
    user_id = custom_data.get("user_id")

    if not user_id:
        return

    user_id = int(user_id)
    service = SubscriptionService(db)
    subscription = await service.get_subscription(user_id)

    if subscription:
        subscription.status = "past_due"
        await db.commit()

    logger.info(f"Subscription past due for user {user_id}")


async def handle_transaction_completed(data: dict, db: AsyncSession):
    """Gère une transaction complétée (paiement réussi)."""
    custom_data = data.get("custom_data", {})
    user_id = custom_data.get("user_id")

    if not user_id:
        return

    user_id = int(user_id)

    # Si c'est une souscription, mettre à jour la période
    subscription_id = data.get("subscription_id")
    if subscription_id:
        service = SubscriptionService(db)
        subscription = await service.get_subscription(user_id)
        if subscription:
            subscription.status = "active"
            subscription.paddle_transaction_id = data.get("id")
            # La période sera mise à jour via subscription.updated
            await db.commit()

    logger.info(f"Transaction completed for user {user_id}")


async def handle_payment_failed(data: dict, db: AsyncSession):
    """Gère un échec de paiement."""
    custom_data = data.get("custom_data", {})
    user_id = custom_data.get("user_id")

    if not user_id:
        return

    user_id = int(user_id)
    service = SubscriptionService(db)
    subscription = await service.get_subscription(user_id)

    if subscription:
        subscription.status = "past_due"
        await db.commit()

    logger.info(f"Payment failed for user {user_id}")


def parse_datetime(dt_string: str | None) -> datetime | None:
    """Parse une date ISO depuis Paddle."""
    if not dt_string:
        return None
    try:
        # Paddle utilise le format ISO 8601
        return datetime.fromisoformat(dt_string.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None
