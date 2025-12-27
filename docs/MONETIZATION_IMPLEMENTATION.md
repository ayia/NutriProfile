# Guide d'Implémentation Monétisation NutriProfile

## Contexte

- **Développeur**: Auto-entrepreneur au Maroc
- **Plateforme de paiement**: **Paddle** (Merchant of Record)
- **Raison**: Stripe non disponible au Maroc, Paddle gère TVA/taxes

---

## GUIDE RAPIDE - Configuration Paddle

### Étape 1: Créer un compte Paddle

1. Va sur **https://www.paddle.com**
2. Clique sur **"Get Started"**
3. Crée un compte **Seller** (pas buyer)
4. Paddle supporte le Maroc comme pays de résidence

### Étape 2: Créer les Produits

Dans le dashboard Paddle > **Catalog > Products** :

| Produit | Prix | Type | Price ID |
|---------|------|------|----------|
| Premium Mensuel | 4.99€/mois | Subscription | `pri_xxx` |
| Premium Annuel | 39.99€/an | Subscription | `pri_xxx` |
| Pro Mensuel | 9.99€/mois | Subscription | `pri_xxx` |
| Pro Annuel | 79.99€/an | Subscription | `pri_xxx` |

### Étape 3: Obtenir les Clés API

1. **Settings > API Keys** : Créer une clé API
2. **Settings > Notifications** : Créer un webhook
   - URL : `https://nutriprofile-api.fly.dev/api/v1/webhooks/paddle`
   - Events : Tous les events `subscription.*` et `transaction.*`
3. Copier le **Webhook Secret**

### Étape 4: Configurer Fly.io

```bash
flyctl secrets set PADDLE_API_KEY="pdl_xxx" --app nutriprofile-api
flyctl secrets set PADDLE_WEBHOOK_SECRET="pdl_ntfset_xxx" --app nutriprofile-api
flyctl secrets set PADDLE_ENVIRONMENT="sandbox" --app nutriprofile-api
flyctl secrets set PADDLE_PREMIUM_MONTHLY_PRICE_ID="pri_xxx" --app nutriprofile-api
flyctl secrets set PADDLE_PREMIUM_YEARLY_PRICE_ID="pri_xxx" --app nutriprofile-api
flyctl secrets set PADDLE_PRO_MONTHLY_PRICE_ID="pri_xxx" --app nutriprofile-api
flyctl secrets set PADDLE_PRO_YEARLY_PRICE_ID="pri_xxx" --app nutriprofile-api
```

### Étape 5: Appliquer la Migration

```bash
flyctl ssh console --app nutriprofile-api
cd /app && alembic upgrade head
```

### Étape 6: Déployer

```bash
cd backend && fly deploy
cd ../frontend && fly deploy
```

### Étape 7: Tester

1. Mode sandbox : utiliser carte test `4000 0566 5566 5556`
2. Vérifier les webhooks dans le dashboard Paddle
3. Passer en production quand prêt

---

## Architecture Paiement

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UTILISATEUR                                  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │ PricingPage    │  │ CheckoutModal  │  │ SubscriptionMgr│        │
│  │ (Grille prix)  │  │ (Paddle.js)    │  │ (Portail)      │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────────┐               ┌───────────────────────┐
│   PADDLE              │               │   BACKEND (FastAPI)   │
│   ┌───────────────┐   │   Webhook     │   ┌───────────────┐   │
│   │ Checkout Page │   │──────────────>│   │ /webhooks/    │   │
│   │ Customer Mgmt │   │               │   │   paddle      │   │
│   │ Billing       │   │               │   └───────────────┘   │
│   └───────────────┘   │               └───────────────────────┘
└───────────────────────┘                           │
                                                    ▼
                                        ┌───────────────────────┐
                                        │    PostgreSQL         │
                                        │  - User.tier          │
                                        │  - Subscription       │
                                        │  - UsageTracking      │
                                        └───────────────────────┘
```

---

## Documentation Legacy (Ancienne version Lemon Squeezy)

### Phase 1: Configuration Lemon Squeezy (OBSOLÈTE)

1. **Créer compte Lemon Squeezy**
   - Inscription sur lemonsqueezy.com
   - Vérification identité (passeport/CIN)
   - Configuration payout vers compte bancaire marocain

2. **Créer les produits**
   ```
   Produits à créer dans dashboard Lemon Squeezy:

   ABONNEMENTS:
   - Premium Mensuel: 4.99€/mois
   - Premium Annuel: 39.99€/an (33% économie)
   - Pro Mensuel: 9.99€/mois
   - Pro Annuel: 79.99€/an (33% économie)

   ONE-TIME (futurs):
   - Pack Recettes: 2.99€
   - Rapport PDF: 1.99€
   ```

3. **Récupérer les clés API**
   - API Key (dashboard > Settings > API)
   - Webhook Secret (dashboard > Settings > Webhooks)
   - Store ID et Variant IDs des produits

### Phase 2: Backend - Modèles et Schémas

```python
# backend/app/models/subscription.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    PREMIUM = "premium"
    PRO = "pro"

class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PAST_DUE = "past_due"

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    # Lemon Squeezy IDs
    ls_subscription_id = Column(String, unique=True)
    ls_customer_id = Column(String)
    ls_variant_id = Column(String)

    tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)

    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)
    cancel_at_period_end = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subscription")
```

```python
# backend/app/models/usage.py

class UsageTracking(Base):
    __tablename__ = "usage_tracking"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, default=date.today)

    # Compteurs quotidiens
    vision_analyses = Column(Integer, default=0)
    recipe_generations = Column(Integer, default=0)
    coach_messages = Column(Integer, default=0)

    # Index unique par user/date
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='unique_user_date'),
    )
```

```python
# Ajouter à backend/app/models/user.py

class User(Base):
    # ... champs existants ...

    # Nouveau champ
    subscription_tier = Column(
        Enum(SubscriptionTier),
        default=SubscriptionTier.FREE
    )

    subscription = relationship("Subscription", back_populates="user", uselist=False)
```

### Phase 3: Backend - Service Subscription

```python
# backend/app/services/subscription.py

from app.models.subscription import SubscriptionTier

# Limites par tier
TIER_LIMITS = {
    SubscriptionTier.FREE: {
        "vision_analyses": 3,      # par jour
        "recipe_generations": 2,   # par semaine
        "coach_messages": 1,       # par jour
        "history_days": 7,         # jours d'historique
    },
    SubscriptionTier.PREMIUM: {
        "vision_analyses": -1,     # illimité
        "recipe_generations": 10,  # par semaine
        "coach_messages": 5,       # par jour
        "history_days": 90,
    },
    SubscriptionTier.PRO: {
        "vision_analyses": -1,
        "recipe_generations": -1,
        "coach_messages": -1,
        "history_days": -1,        # illimité
    }
}

class SubscriptionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_limit(
        self,
        user_id: int,
        action: str
    ) -> tuple[bool, int, int]:
        """
        Vérifie si l'utilisateur peut effectuer l'action.
        Retourne: (autorisé, utilisé, limite)
        """
        user = await self.get_user(user_id)
        tier = user.subscription_tier
        limit = TIER_LIMITS[tier][action]

        if limit == -1:
            return True, 0, -1

        usage = await self.get_daily_usage(user_id, action)
        return usage < limit, usage, limit

    async def increment_usage(self, user_id: int, action: str):
        """Incrémente le compteur d'usage."""
        today = date.today()
        usage = await self.db.execute(
            select(UsageTracking)
            .where(UsageTracking.user_id == user_id)
            .where(UsageTracking.date == today)
        )
        usage = usage.scalar_one_or_none()

        if not usage:
            usage = UsageTracking(user_id=user_id, date=today)
            self.db.add(usage)

        setattr(usage, action, getattr(usage, action) + 1)
        await self.db.commit()
```

### Phase 4: Backend - Webhook Lemon Squeezy

```python
# backend/app/api/v1/webhooks.py

from fastapi import APIRouter, Request, HTTPException
import hmac
import hashlib

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/lemonsqueezy")
async def lemonsqueezy_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # Vérifier signature
    signature = request.headers.get("X-Signature")
    body = await request.body()

    expected = hmac.new(
        settings.LEMONSQUEEZY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    event_name = payload["meta"]["event_name"]

    # Router les événements
    handlers = {
        "subscription_created": handle_subscription_created,
        "subscription_updated": handle_subscription_updated,
        "subscription_cancelled": handle_subscription_cancelled,
        "subscription_resumed": handle_subscription_resumed,
        "subscription_expired": handle_subscription_expired,
        "order_created": handle_order_created,
    }

    handler = handlers.get(event_name)
    if handler:
        await handler(payload, db)

    return {"status": "ok"}

async def handle_subscription_created(payload: dict, db: AsyncSession):
    """Nouvel abonnement créé."""
    data = payload["data"]["attributes"]
    custom_data = payload["meta"]["custom_data"]
    user_id = custom_data["user_id"]

    # Mapper variant_id vers tier
    variant_id = str(data["variant_id"])
    tier = VARIANT_TO_TIER.get(variant_id, SubscriptionTier.FREE)

    # Créer subscription
    subscription = Subscription(
        user_id=user_id,
        ls_subscription_id=str(data["id"]),
        ls_customer_id=str(data["customer_id"]),
        ls_variant_id=variant_id,
        tier=tier,
        status=SubscriptionStatus.ACTIVE,
        current_period_start=datetime.fromisoformat(data["renews_at"]),
    )

    db.add(subscription)

    # Mettre à jour user tier
    user = await db.get(User, user_id)
    user.subscription_tier = tier

    await db.commit()
```

### Phase 5: Backend - Endpoints Subscription

```python
# backend/app/api/v1/subscriptions.py

from fastapi import APIRouter, Depends
import httpx

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.get("/status")
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retourne le statut d'abonnement de l'utilisateur."""
    subscription = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = subscription.scalar_one_or_none()

    return {
        "tier": current_user.subscription_tier,
        "status": subscription.status if subscription else "none",
        "renews_at": subscription.current_period_end if subscription else None,
        "cancel_at_period_end": subscription.cancel_at_period_end if subscription else False,
    }

@router.get("/usage")
async def get_usage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retourne l'utilisation actuelle et les limites."""
    tier = current_user.subscription_tier
    limits = TIER_LIMITS[tier]

    today = date.today()
    usage = await db.execute(
        select(UsageTracking)
        .where(UsageTracking.user_id == current_user.id)
        .where(UsageTracking.date == today)
    )
    usage = usage.scalar_one_or_none()

    return {
        "tier": tier,
        "limits": limits,
        "usage": {
            "vision_analyses": usage.vision_analyses if usage else 0,
            "recipe_generations": usage.recipe_generations if usage else 0,
            "coach_messages": usage.coach_messages if usage else 0,
        }
    }

@router.post("/checkout")
async def create_checkout(
    variant_id: str,
    current_user: User = Depends(get_current_user)
):
    """Crée une URL de checkout Lemon Squeezy."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.lemonsqueezy.com/v1/checkouts",
            headers={
                "Authorization": f"Bearer {settings.LEMONSQUEEZY_API_KEY}",
                "Content-Type": "application/vnd.api+json",
            },
            json={
                "data": {
                    "type": "checkouts",
                    "attributes": {
                        "checkout_data": {
                            "custom": {
                                "user_id": str(current_user.id)
                            }
                        }
                    },
                    "relationships": {
                        "store": {
                            "data": {
                                "type": "stores",
                                "id": settings.LEMONSQUEEZY_STORE_ID
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

        data = response.json()
        return {"checkout_url": data["data"]["attributes"]["url"]}

@router.post("/portal")
async def get_customer_portal(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retourne l'URL du portail client pour gérer l'abonnement."""
    subscription = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = subscription.scalar_one_or_none()

    if not subscription:
        raise HTTPException(status_code=404, detail="No subscription found")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.lemonsqueezy.com/v1/subscriptions/{subscription.ls_subscription_id}/customer-portal",
            headers={
                "Authorization": f"Bearer {settings.LEMONSQUEEZY_API_KEY}",
            }
        )

        data = response.json()
        return {"portal_url": data["data"]["attributes"]["url"]}
```

### Phase 6: Frontend - Composants

```typescript
// frontend/src/components/subscription/PricingCard.tsx

interface PricingCardProps {
  tier: 'premium' | 'pro';
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  variantId: string;
  popular?: boolean;
}

export function PricingCard({
  tier,
  price,
  period,
  features,
  variantId,
  popular
}: PricingCardProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { checkout_url } = await api.post('/subscriptions/checkout', {
        variant_id: variantId
      });
      window.location.href = checkout_url;
    } catch (error) {
      toast.error(t('subscription.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn(
      "p-6",
      popular && "border-primary border-2 relative"
    )}>
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          {t('subscription.popular')}
        </Badge>
      )}

      <h3 className="text-2xl font-bold">{t(`subscription.${tier}.name`)}</h3>

      <div className="mt-4">
        <span className="text-4xl font-bold">{price}€</span>
        <span className="text-muted-foreground">
          /{t(`subscription.${period}`)}
        </span>
      </div>

      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span>{t(`subscription.features.${feature}`)}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full mt-6"
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" /> : t('subscription.subscribe')}
      </Button>
    </Card>
  );
}
```

```typescript
// frontend/src/components/subscription/UsageBanner.tsx

export function UsageBanner() {
  const { t } = useTranslation();
  const { data: usage } = useQuery({
    queryKey: ['subscription', 'usage'],
    queryFn: () => api.get('/subscriptions/usage'),
  });

  if (!usage || usage.tier !== 'free') return null;

  const visionUsed = usage.usage.vision_analyses;
  const visionLimit = usage.limits.vision_analyses;
  const percentage = (visionUsed / visionLimit) * 100;

  if (percentage < 70) return null;

  return (
    <Alert variant={percentage >= 100 ? "destructive" : "warning"}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {percentage >= 100
          ? t('usage.limitReached', { feature: t('features.vision') })
          : t('usage.approaching', { used: visionUsed, limit: visionLimit })
        }
        <Button variant="link" asChild>
          <Link to="/pricing">{t('usage.upgrade')}</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

### Phase 7: Intégration dans les Endpoints Existants

```python
# Modifier backend/app/api/v1/vision.py

from app.services.subscription import SubscriptionService

@router.post("/analyze")
async def analyze_meal(
    image: UploadFile,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # NOUVEAU: Vérifier limite
    sub_service = SubscriptionService(db)
    allowed, used, limit = await sub_service.check_limit(
        current_user.id,
        "vision_analyses"
    )

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "limit_reached",
                "used": used,
                "limit": limit,
                "upgrade_url": "/pricing"
            }
        )

    # ... logique existante ...

    # NOUVEAU: Incrémenter usage après succès
    await sub_service.increment_usage(current_user.id, "vision_analyses")

    return result
```

## Variables d'Environnement

```bash
# Ajouter à backend/.env et fly secrets

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_STORE_ID=your_store_id

# Variant IDs (à récupérer après création produits)
LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID=xxx
LEMONSQUEEZY_PREMIUM_YEARLY_VARIANT_ID=xxx
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=xxx
LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID=xxx
```

## Déploiement

```bash
# 1. Créer migration
cd backend
alembic revision --autogenerate -m "add subscription tables"
alembic upgrade head

# 2. Configurer secrets Fly.io
fly secrets set LEMONSQUEEZY_API_KEY=xxx
fly secrets set LEMONSQUEEZY_WEBHOOK_SECRET=xxx
fly secrets set LEMONSQUEEZY_STORE_ID=xxx

# 3. Déployer
fly deploy

# 4. Configurer webhook dans Lemon Squeezy
# URL: https://nutriprofile-api.fly.dev/api/v1/webhooks/lemonsqueezy
# Events: subscription_created, subscription_updated, subscription_cancelled, etc.
```

## Checklist Implémentation

- [ ] Créer compte Lemon Squeezy et vérifier identité
- [ ] Créer produits (4 abonnements)
- [ ] Récupérer clés API et variant IDs
- [ ] Implémenter modèles Subscription et UsageTracking
- [ ] Créer migration Alembic
- [ ] Implémenter SubscriptionService
- [ ] Implémenter webhook endpoint
- [ ] Implémenter endpoints /subscriptions/*
- [ ] Ajouter vérification limites aux endpoints existants
- [ ] Créer composants frontend (PricingPage, PricingCard, UsageBanner)
- [ ] Ajouter traductions i18n
- [ ] Configurer secrets Fly.io
- [ ] Configurer webhook dans Lemon Squeezy
- [ ] Tester flux complet en mode test
- [ ] Déployer en production

## Tests

```python
# tests/test_subscription.py

@pytest.mark.asyncio
async def test_free_user_has_limits():
    user = await create_test_user(tier="free")
    service = SubscriptionService(db)

    # Première analyse OK
    allowed, used, limit = await service.check_limit(user.id, "vision_analyses")
    assert allowed is True
    assert limit == 3

    # Simuler 3 utilisations
    for _ in range(3):
        await service.increment_usage(user.id, "vision_analyses")

    # 4ème bloquée
    allowed, used, limit = await service.check_limit(user.id, "vision_analyses")
    assert allowed is False
    assert used == 3

@pytest.mark.asyncio
async def test_premium_user_unlimited_vision():
    user = await create_test_user(tier="premium")
    service = SubscriptionService(db)

    allowed, _, limit = await service.check_limit(user.id, "vision_analyses")
    assert allowed is True
    assert limit == -1  # illimité
```
