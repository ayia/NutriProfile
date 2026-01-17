"""Tests pour les webhooks Lemon Squeezy."""

import pytest
import hmac
import hashlib
import json
from datetime import datetime, timedelta, timezone
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.subscription import Subscription, SubscriptionStatus
from app.services.subscription import SubscriptionService
from app.config import get_settings

settings = get_settings()


def create_webhook_signature(payload: dict, secret: str) -> str:
    """Crée une signature HMAC valide pour un webhook Lemon Squeezy."""
    body = json.dumps(payload).encode()
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Crée un utilisateur de test."""
    user = User(
        email="webhook@example.com",
        hashed_password="hashed",
        name="Webhook User",
        subscription_tier="free"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.mark.asyncio
async def test_webhook_signature_validation_success(client: AsyncClient, test_user: User):
    """Test que la signature HMAC valide passe la vérification."""
    payload = {
        "meta": {
            "event_name": "subscription_created",
            "custom_data": {"user_id": str(test_user.id)}
        },
        "data": {
            "id": "sub_123",
            "type": "subscriptions",
            "attributes": {
                "status": "active",
                "variant_id": settings.LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID,
                "customer_id": "cust_123",
                "renews_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
            }
        }
    }

    # Créer signature valide
    signature = create_webhook_signature(payload, settings.LEMONSQUEEZY_WEBHOOK_SECRET)

    response = await client.post(
        "/api/v1/webhooks/lemonsqueezy",
        json=payload,
        headers={"X-Signature": signature}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["event"] == "subscription_created"


@pytest.mark.asyncio
async def test_webhook_signature_validation_failure(client: AsyncClient, test_user: User):
    """Test qu'une signature invalide est rejetée."""
    payload = {
        "meta": {
            "event_name": "subscription_created",
            "custom_data": {"user_id": str(test_user.id)}
        },
        "data": {
            "id": "sub_123",
            "type": "subscriptions",
            "attributes": {
                "status": "active",
                "variant_id": settings.LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID,
            }
        }
    }

    # Signature invalide
    invalid_signature = "invalid_signature_12345"

    response = await client.post(
        "/api/v1/webhooks/lemonsqueezy",
        json=payload,
        headers={"X-Signature": invalid_signature}
    )

    # Doit retourner 401 Unauthorized
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_subscription_created_webhook(client: AsyncClient, db_session: AsyncSession, test_user: User):
    """Test du webhook subscription_created."""
    now = datetime.now(timezone.utc)
    renews_at = now + timedelta(days=30)

    payload = {
        "meta": {
            "event_name": "subscription_created",
            "custom_data": {"user_id": str(test_user.id)}
        },
        "data": {
            "id": "sub_new_123",
            "type": "subscriptions",
            "attributes": {
                "status": "active",
                "variant_id": settings.LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID,
                "customer_id": "cust_new_123",
                "renews_at": renews_at.isoformat()
            }
        }
    }

    signature = create_webhook_signature(payload, settings.LEMONSQUEEZY_WEBHOOK_SECRET)

    response = await client.post(
        "/api/v1/webhooks/lemonsqueezy",
        json=payload,
        headers={"X-Signature": signature}
    )

    assert response.status_code == 200

    # Vérifier que la subscription a été créée
    result = await db_session.execute(
        select(Subscription).where(Subscription.user_id == test_user.id)
    )
    subscription = result.scalar_one_or_none()

    assert subscription is not None
    assert subscription.tier.value == "premium"
    assert subscription.status == SubscriptionStatus.ACTIVE

    # Vérifier que le tier utilisateur est mis à jour
    await db_session.refresh(test_user)
    assert test_user.subscription_tier == "premium"


@pytest.mark.asyncio
async def test_subscription_cancelled_webhook(client: AsyncClient, db_session: AsyncSession, test_user: User):
    """Test du webhook subscription_cancelled."""
    # Créer une subscription active
    subscription = Subscription(
        user_id=test_user.id,
        tier="premium",
        status=SubscriptionStatus.ACTIVE,
        ls_subscription_id="sub_to_cancel",
        current_period_end=datetime.now(timezone.utc) + timedelta(days=15)
    )
    db_session.add(subscription)
    await db_session.commit()

    # Webhook d'annulation
    payload = {
        "meta": {
            "event_name": "subscription_cancelled",
            "custom_data": {"user_id": str(test_user.id)}
        },
        "data": {
            "id": "sub_to_cancel",
            "type": "subscriptions",
            "attributes": {
                "status": "cancelled",
                "ends_at": (datetime.now(timezone.utc) + timedelta(days=15)).isoformat()
            }
        }
    }

    signature = create_webhook_signature(payload, settings.LEMONSQUEEZY_WEBHOOK_SECRET)

    response = await client.post(
        "/api/v1/webhooks/lemonsqueezy",
        json=payload,
        headers={"X-Signature": signature}
    )

    assert response.status_code == 200

    # Vérifier que cancel_at_period_end est True
    await db_session.refresh(subscription)
    assert subscription.cancel_at_period_end is True


@pytest.mark.asyncio
async def test_subscription_expired_webhook(client: AsyncClient, db_session: AsyncSession, test_user: User):
    """Test du webhook subscription_expired - l'utilisateur retombe sur tier free."""
    # Créer une subscription active
    subscription = Subscription(
        user_id=test_user.id,
        tier="premium",
        status=SubscriptionStatus.ACTIVE,
        ls_subscription_id="sub_to_expire"
    )
    db_session.add(subscription)
    test_user.subscription_tier = "premium"
    await db_session.commit()

    # Webhook d'expiration
    payload = {
        "meta": {
            "event_name": "subscription_expired",
            "custom_data": {"user_id": str(test_user.id)}
        },
        "data": {
            "id": "sub_to_expire",
            "type": "subscriptions",
            "attributes": {
                "status": "expired"
            }
        }
    }

    signature = create_webhook_signature(payload, settings.LEMONSQUEEZY_WEBHOOK_SECRET)

    response = await client.post(
        "/api/v1/webhooks/lemonsqueezy",
        json=payload,
        headers={"X-Signature": signature}
    )

    assert response.status_code == 200

    # Vérifier que la subscription est expirée
    await db_session.refresh(subscription)
    assert subscription.status == SubscriptionStatus.CANCELLED
    assert subscription.tier.value == "free"

    # Vérifier que le user tier est free
    await db_session.refresh(test_user)
    assert test_user.subscription_tier == "free"


@pytest.mark.asyncio
async def test_subscription_resumed_webhook(client: AsyncClient, db_session: AsyncSession, test_user: User):
    """Test du webhook subscription_resumed - réactivation après annulation."""
    # Créer une subscription annulée
    subscription = Subscription(
        user_id=test_user.id,
        tier="premium",
        status=SubscriptionStatus.CANCELLED,
        ls_subscription_id="sub_to_resume",
        cancel_at_period_end=True
    )
    db_session.add(subscription)
    await db_session.commit()

    # Webhook de reprise
    now = datetime.now(timezone.utc)
    payload = {
        "meta": {
            "event_name": "subscription_resumed",
            "custom_data": {"user_id": str(test_user.id)}
        },
        "data": {
            "id": "sub_to_resume",
            "type": "subscriptions",
            "attributes": {
                "status": "active",
                "variant_id": settings.LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID,
                "renews_at": (now + timedelta(days=30)).isoformat()
            }
        }
    }

    signature = create_webhook_signature(payload, settings.LEMONSQUEEZY_WEBHOOK_SECRET)

    response = await client.post(
        "/api/v1/webhooks/lemonsqueezy",
        json=payload,
        headers={"X-Signature": signature}
    )

    assert response.status_code == 200

    # Vérifier que la subscription est réactivée
    await db_session.refresh(subscription)
    assert subscription.status == SubscriptionStatus.ACTIVE


@pytest.mark.asyncio
async def test_webhook_idempotency(client: AsyncClient, db_session: AsyncSession, test_user: User):
    """Test que les webhooks sont idempotents - pas de doublon si même event envoyé 2x."""
    now = datetime.now(timezone.utc)
    payload = {
        "meta": {
            "event_name": "subscription_created",
            "custom_data": {"user_id": str(test_user.id)}
        },
        "data": {
            "id": "sub_idempotent_123",
            "type": "subscriptions",
            "attributes": {
                "status": "active",
                "variant_id": settings.LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID,
                "customer_id": "cust_idempotent",
                "renews_at": (now + timedelta(days=30)).isoformat()
            }
        }
    }

    signature = create_webhook_signature(payload, settings.LEMONSQUEEZY_WEBHOOK_SECRET)

    # Premier envoi
    response1 = await client.post(
        "/api/v1/webhooks/lemonsqueezy",
        json=payload,
        headers={"X-Signature": signature}
    )
    assert response1.status_code == 200

    # Deuxième envoi (même payload)
    response2 = await client.post(
        "/api/v1/webhooks/lemonsqueezy",
        json=payload,
        headers={"X-Signature": signature}
    )
    assert response2.status_code == 200

    # Vérifier qu'il n'y a qu'une seule subscription
    result = await db_session.execute(
        select(Subscription).where(Subscription.user_id == test_user.id)
    )
    subscriptions = result.scalars().all()
    assert len(subscriptions) == 1


@pytest.mark.asyncio
async def test_webhook_payment_success(client: AsyncClient, db_session: AsyncSession, test_user: User):
    """Test du webhook subscription_payment_success."""
    # Créer subscription en past_due
    subscription = Subscription(
        user_id=test_user.id,
        tier="premium",
        status=SubscriptionStatus.PAST_DUE,
        ls_subscription_id="sub_payment_success"
    )
    db_session.add(subscription)
    await db_session.commit()

    # Webhook de paiement réussi
    now = datetime.now(timezone.utc)
    payload = {
        "meta": {
            "event_name": "subscription_payment_success",
            "custom_data": {"user_id": str(test_user.id)}
        },
        "data": {
            "id": "sub_payment_success",
            "type": "subscriptions",
            "attributes": {
                "status": "active",
                "renews_at": (now + timedelta(days=30)).isoformat()
            }
        }
    }

    signature = create_webhook_signature(payload, settings.LEMONSQUEEZY_WEBHOOK_SECRET)

    response = await client.post(
        "/api/v1/webhooks/lemonsqueezy",
        json=payload,
        headers={"X-Signature": signature}
    )

    assert response.status_code == 200

    # Vérifier que le statut est repassé à active
    await db_session.refresh(subscription)
    assert subscription.status == SubscriptionStatus.ACTIVE


@pytest.mark.asyncio
async def test_webhook_payment_failed(client: AsyncClient, db_session: AsyncSession, test_user: User):
    """Test du webhook subscription_payment_failed."""
    # Créer subscription active
    subscription = Subscription(
        user_id=test_user.id,
        tier="premium",
        status=SubscriptionStatus.ACTIVE,
        ls_subscription_id="sub_payment_failed"
    )
    db_session.add(subscription)
    await db_session.commit()

    # Webhook de paiement échoué
    payload = {
        "meta": {
            "event_name": "subscription_payment_failed",
            "custom_data": {"user_id": str(test_user.id)}
        },
        "data": {
            "id": "sub_payment_failed",
            "type": "subscriptions",
            "attributes": {
                "status": "past_due"
            }
        }
    }

    signature = create_webhook_signature(payload, settings.LEMONSQUEEZY_WEBHOOK_SECRET)

    response = await client.post(
        "/api/v1/webhooks/lemonsqueezy",
        json=payload,
        headers={"X-Signature": signature}
    )

    assert response.status_code == 200

    # Vérifier que le statut est past_due
    await db_session.refresh(subscription)
    assert subscription.status == SubscriptionStatus.PAST_DUE


@pytest.mark.asyncio
async def test_webhook_without_user_id(client: AsyncClient):
    """Test qu'un webhook sans user_id ne fait pas planter l'app."""
    payload = {
        "meta": {
            "event_name": "subscription_created",
            "custom_data": {}  # Pas de user_id
        },
        "data": {
            "id": "sub_no_user",
            "type": "subscriptions",
            "attributes": {
                "status": "active",
                "variant_id": settings.LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID,
            }
        }
    }

    signature = create_webhook_signature(payload, settings.LEMONSQUEEZY_WEBHOOK_SECRET)

    response = await client.post(
        "/api/v1/webhooks/lemonsqueezy",
        json=payload,
        headers={"X-Signature": signature}
    )

    # Doit retourner 200 mais ne rien faire (logged)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_webhook_pro_tier_creation(client: AsyncClient, db_session: AsyncSession, test_user: User):
    """Test de création d'une subscription Pro via webhook."""
    now = datetime.now(timezone.utc)
    payload = {
        "meta": {
            "event_name": "subscription_created",
            "custom_data": {"user_id": str(test_user.id)}
        },
        "data": {
            "id": "sub_pro_123",
            "type": "subscriptions",
            "attributes": {
                "status": "active",
                "variant_id": settings.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID,
                "customer_id": "cust_pro_123",
                "renews_at": (now + timedelta(days=30)).isoformat()
            }
        }
    }

    signature = create_webhook_signature(payload, settings.LEMONSQUEEZY_WEBHOOK_SECRET)

    response = await client.post(
        "/api/v1/webhooks/lemonsqueezy",
        json=payload,
        headers={"X-Signature": signature}
    )

    assert response.status_code == 200

    # Vérifier que le tier est Pro
    result = await db_session.execute(
        select(Subscription).where(Subscription.user_id == test_user.id)
    )
    subscription = result.scalar_one_or_none()

    assert subscription is not None
    assert subscription.tier.value == "pro"
    assert subscription.status == SubscriptionStatus.ACTIVE
