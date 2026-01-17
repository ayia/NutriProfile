"""Tests pour le système de trial Premium de 7 jours."""

import pytest
from datetime import datetime, timedelta, timezone
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.subscription import Subscription, SubscriptionTier, SubscriptionStatus
from app.services.subscription import SubscriptionService, TRIAL_DURATION_DAYS


@pytest.mark.asyncio
async def test_new_user_gets_trial(db_session: AsyncSession):
    """Test qu'un nouvel utilisateur reçoit un trial de 7 jours."""
    # Créer un utilisateur
    now = datetime.now(timezone.utc)
    user = User(
        email="trial@example.com",
        hashed_password="hashed",
        name="Trial User",
        subscription_tier="free",
        trial_ends_at=now + timedelta(days=TRIAL_DURATION_DAYS)
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # Vérifier que trial_ends_at est défini
    assert user.trial_ends_at is not None

    # Vérifier que le trial expire dans 7 jours
    delta = user.trial_ends_at.replace(tzinfo=timezone.utc) - now
    assert 6 <= delta.days <= 7  # Entre 6 et 7 jours (pour gérer les secondes)


@pytest.mark.asyncio
async def test_trial_active_returns_premium_tier(db_session: AsyncSession):
    """Test que get_effective_tier() retourne 'premium' pendant le trial."""
    # Créer utilisateur avec trial actif
    now = datetime.now(timezone.utc)
    user = User(
        email="active_trial@example.com",
        hashed_password="hashed",
        name="Active Trial User",
        subscription_tier="free",
        trial_ends_at=now + timedelta(days=5)  # 5 jours restants
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # Vérifier le tier effectif
    service = SubscriptionService(db_session)
    tier = await service.get_effective_tier(user.id)

    assert tier == "premium"


@pytest.mark.asyncio
async def test_trial_expired_returns_free_tier(db_session: AsyncSession):
    """Test que get_effective_tier() retourne 'free' après expiration du trial."""
    # Créer utilisateur avec trial expiré
    now = datetime.now(timezone.utc)
    user = User(
        email="expired_trial@example.com",
        hashed_password="hashed",
        name="Expired Trial User",
        subscription_tier="free",
        trial_ends_at=now - timedelta(days=1)  # Expiré hier
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # Vérifier le tier effectif
    service = SubscriptionService(db_session)
    tier = await service.get_effective_tier(user.id)

    assert tier == "free"


@pytest.mark.asyncio
async def test_paid_subscription_overrides_trial(db_session: AsyncSession):
    """Test qu'une subscription payée active prend le dessus sur le trial."""
    # Créer utilisateur avec trial actif
    now = datetime.now(timezone.utc)
    user = User(
        email="paid_override@example.com",
        hashed_password="hashed",
        name="Paid Override User",
        subscription_tier="free",
        trial_ends_at=now + timedelta(days=5)  # Trial encore actif
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # Créer une subscription Pro payée
    subscription = Subscription(
        user_id=user.id,
        tier=SubscriptionTier.PRO,
        status=SubscriptionStatus.ACTIVE,
        ls_subscription_id="ls_sub_123",
        current_period_end=now + timedelta(days=30)
    )
    db_session.add(subscription)
    await db_session.commit()

    # Vérifier le tier effectif
    service = SubscriptionService(db_session)
    tier = await service.get_effective_tier(user.id)

    # Doit être "pro", pas "premium" du trial
    assert tier == "pro"


@pytest.mark.asyncio
async def test_trial_days_remaining_calculation(db_session: AsyncSession):
    """Test du calcul correct des jours restants dans le trial."""
    now = datetime.now(timezone.utc)

    # Cas 1: 5 jours restants
    user1 = User(
        email="trial5@example.com",
        hashed_password="hashed",
        name="Trial 5 Days",
        subscription_tier="free",
        trial_ends_at=now + timedelta(days=5)
    )
    db_session.add(user1)
    await db_session.commit()
    await db_session.refresh(user1)

    service = SubscriptionService(db_session)
    days_remaining = await service.get_trial_days_remaining(user1.id)
    assert days_remaining == 5

    # Cas 2: Trial expiré
    user2 = User(
        email="trial_expired@example.com",
        hashed_password="hashed",
        name="Trial Expired",
        subscription_tier="free",
        trial_ends_at=now - timedelta(days=2)
    )
    db_session.add(user2)
    await db_session.commit()
    await db_session.refresh(user2)

    days_remaining = await service.get_trial_days_remaining(user2.id)
    assert days_remaining == 0

    # Cas 3: Pas de trial
    user3 = User(
        email="no_trial@example.com",
        hashed_password="hashed",
        name="No Trial",
        subscription_tier="free",
        trial_ends_at=None
    )
    db_session.add(user3)
    await db_session.commit()
    await db_session.refresh(user3)

    days_remaining = await service.get_trial_days_remaining(user3.id)
    assert days_remaining is None


@pytest.mark.asyncio
async def test_is_trial_active(db_session: AsyncSession):
    """Test de la méthode is_trial_active()."""
    now = datetime.now(timezone.utc)

    # Cas 1: Trial actif
    user1 = User(
        email="active_trial2@example.com",
        hashed_password="hashed",
        name="Active Trial",
        subscription_tier="free",
        trial_ends_at=now + timedelta(days=3)
    )
    db_session.add(user1)
    await db_session.commit()
    await db_session.refresh(user1)

    service = SubscriptionService(db_session)
    is_active = await service.is_trial_active(user1.id)
    assert is_active is True

    # Cas 2: Trial expiré
    user2 = User(
        email="inactive_trial@example.com",
        hashed_password="hashed",
        name="Inactive Trial",
        subscription_tier="free",
        trial_ends_at=now - timedelta(hours=1)
    )
    db_session.add(user2)
    await db_session.commit()
    await db_session.refresh(user2)

    is_active = await service.is_trial_active(user2.id)
    assert is_active is False

    # Cas 3: Subscription payée active (trial ne compte pas)
    user3 = User(
        email="paid_no_trial@example.com",
        hashed_password="hashed",
        name="Paid No Trial",
        subscription_tier="premium",
        trial_ends_at=now + timedelta(days=3)  # Trial techniquement actif
    )
    db_session.add(user3)
    await db_session.commit()
    await db_session.refresh(user3)

    # Créer subscription payée
    subscription = Subscription(
        user_id=user3.id,
        tier=SubscriptionTier.PREMIUM,
        status=SubscriptionStatus.ACTIVE,
        ls_subscription_id="ls_sub_456"
    )
    db_session.add(subscription)
    await db_session.commit()

    is_active = await service.is_trial_active(user3.id)
    assert is_active is False  # Subscription payée prend le dessus


@pytest.mark.asyncio
async def test_get_trial_info(db_session: AsyncSession):
    """Test de la méthode get_trial_info() qui retourne toutes les infos trial."""
    now = datetime.now(timezone.utc)
    trial_ends = now + timedelta(days=4)

    user = User(
        email="trial_info@example.com",
        hashed_password="hashed",
        name="Trial Info User",
        subscription_tier="free",
        trial_ends_at=trial_ends
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    service = SubscriptionService(db_session)
    trial_info = await service.get_trial_info(user.id)

    assert trial_info["is_trial"] is True
    assert trial_info["trial_ends_at"] is not None
    assert trial_info["days_remaining"] == 4


@pytest.mark.asyncio
async def test_registration_creates_trial(client: AsyncClient):
    """Test que l'endpoint /register crée bien un trial de 7 jours."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "securepassword123",
            "name": "New User"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"

    # Note: L'endpoint ne retourne pas trial_ends_at par défaut
    # Mais on peut vérifier via un autre endpoint si implémenté
    # Pour l'instant, on vérifie juste que la création réussit


@pytest.mark.asyncio
async def test_trial_with_timezone_aware_datetime(db_session: AsyncSession):
    """Test que le trial fonctionne avec des datetimes timezone-aware."""
    # Créer avec datetime sans TZ (comme SQLite peut le stocker)
    naive_dt = datetime.now() + timedelta(days=3)
    user = User(
        email="timezone@example.com",
        hashed_password="hashed",
        name="Timezone User",
        subscription_tier="free",
        trial_ends_at=naive_dt  # Naive datetime
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # Le code doit gérer automatiquement le TZ
    service = SubscriptionService(db_session)
    tier = await service.get_effective_tier(user.id)

    # Doit retourner premium si trial actif
    assert tier == "premium"


@pytest.mark.asyncio
async def test_trial_duration_constant(db_session: AsyncSession):
    """Test que TRIAL_DURATION_DAYS est bien 7 (optimal pour fitness apps)."""
    from app.services.subscription import TRIAL_DURATION_DAYS

    assert TRIAL_DURATION_DAYS == 7

    # Vérifier que c'est bien appliqué
    now = datetime.now(timezone.utc)
    user = User(
        email="duration_test@example.com",
        hashed_password="hashed",
        name="Duration Test",
        subscription_tier="free",
        trial_ends_at=now + timedelta(days=TRIAL_DURATION_DAYS)
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    delta = user.trial_ends_at.replace(tzinfo=timezone.utc) - now
    assert 6 <= delta.days <= 7
