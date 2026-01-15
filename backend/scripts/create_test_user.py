"""
Script pour créer un utilisateur de test avec plan Pro.
Usage: python scripts/create_test_user.py
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone

# Ajouter le dossier parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.database import async_session_maker
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionTier, SubscriptionStatus
from app.api.v1.auth import get_password_hash


async def create_test_user():
    """Créer un utilisateur de test avec plan Pro."""

    # Informations utilisateur
    email = "badre.zouiri@gmail.com"
    password = "badre.zouiri@gmail.com"
    name = "Badre Zouiri (Test Pro)"

    async with async_session_maker() as db:
        try:
            # Vérifier si l'utilisateur existe déjà
            result = await db.execute(select(User).where(User.email == email))
            existing_user = result.scalar_one_or_none()

            if existing_user:
                print(f"⚠️  L'utilisateur {email} existe déjà (ID: {existing_user.id})")
                print(f"   Vérification de l'abonnement...")

                # Vérifier l'abonnement
                sub_result = await db.execute(
                    select(Subscription).where(Subscription.user_id == existing_user.id)
                )
                existing_sub = sub_result.scalar_one_or_none()

                if existing_sub:
                    if existing_sub.tier == SubscriptionTier.PRO and existing_sub.status == SubscriptionStatus.ACTIVE:
                        print(f"✅ L'utilisateur a déjà un plan Pro actif!")
                        return
                    else:
                        print(f"   Abonnement actuel: {existing_sub.tier} ({existing_sub.status})")
                        print(f"   Mise à jour vers Pro...")

                        # Mettre à jour l'abonnement
                        existing_sub.tier = SubscriptionTier.PRO
                        existing_sub.status = SubscriptionStatus.ACTIVE
                        existing_sub.current_period_start = datetime.now(timezone.utc)
                        existing_sub.current_period_end = datetime.now(timezone.utc) + timedelta(days=365)
                        existing_sub.cancel_at_period_end = False

                        await db.commit()
                        print(f"✅ Abonnement mis à jour vers Pro!")
                        return
                else:
                    print(f"   Aucun abonnement trouvé, création...")

                    # Créer un abonnement Pro
                    subscription = Subscription(
                        user_id=existing_user.id,
                        tier=SubscriptionTier.PRO,
                        status=SubscriptionStatus.ACTIVE,
                        current_period_start=datetime.now(timezone.utc),
                        current_period_end=datetime.now(timezone.utc) + timedelta(days=365),
                        cancel_at_period_end=False
                    )
                    db.add(subscription)
                    await db.commit()
                    print(f"✅ Abonnement Pro créé!")
                    return

            # Créer un nouvel utilisateur
            print(f"📝 Création de l'utilisateur {email}...")

            hashed_password = get_password_hash(password)

            user = User(
                email=email,
                hashed_password=hashed_password,
                name=name,
                is_active=True,
                subscription_tier="free",  # Tier par défaut
                trial_ends_at=None,  # Pas de trial pour les comptes test
                preferred_language="fr"
            )

            db.add(user)
            await db.flush()  # Pour obtenir l'ID

            print(f"✅ Utilisateur créé (ID: {user.id})")

            # Créer l'abonnement Pro
            print(f"📝 Création de l'abonnement Pro...")

            subscription = Subscription(
                user_id=user.id,
                tier=SubscriptionTier.PRO,
                status=SubscriptionStatus.ACTIVE,
                current_period_start=datetime.now(timezone.utc),
                current_period_end=datetime.now(timezone.utc) + timedelta(days=365),  # 1 an
                cancel_at_period_end=False
            )

            db.add(subscription)
            await db.commit()

            print(f"✅ Abonnement Pro créé!")
            print(f"\n🎉 Utilisateur de test créé avec succès!")
            print(f"\n📧 Email: {email}")
            print(f"🔑 Mot de passe: {password}")
            print(f"👤 Nom: {name}")
            print(f"🌟 Plan: Pro (1 an)")
            print(f"\n🔗 Connectez-vous sur http://localhost:5173")

        except Exception as e:
            print(f"❌ Erreur: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Création d'un utilisateur de test avec plan Pro")
    print("=" * 60)
    print()

    asyncio.run(create_test_user())

    print()
    print("=" * 60)
