# Guide d'Implémentation Monétisation NutriProfile

## Contexte

- **Développeur**: Auto-entrepreneur au Maroc
- **Plateforme de paiement**: **Lemon Squeezy** (Merchant of Record)
- **Raison**: Stripe non disponible au Maroc, Lemon Squeezy gère TVA/taxes
- **Statut**: ✅ Implémenté et fonctionnel

---

## Architecture Système

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NOUVEAU UTILISATEUR                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ Inscription
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TRIAL 14 JOURS PREMIUM                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Création User avec trial_ends_at = now + 14 jours                 │    │
│  │ • subscription_tier = "free" (valeur par défaut)                    │    │
│  │ • get_effective_tier() retourne "premium" si trial actif            │    │
│  │ • Accès complet aux features Premium pendant 14 jours               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ▼                                   ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│     TRIAL EXPIRE (14 jours)   │       │      UPGRADE PENDANT TRIAL    │
│  ┌─────────────────────────┐  │       │  ┌─────────────────────────┐  │
│  │ • Retombe sur tier Free │  │       │  │ • Checkout Lemon Squeezy│  │
│  │ • Limites Free actives  │  │       │  │ • Webhook crée Subscript│  │
│  │ • Modal upgrade affiché │  │       │  │ • subscription_tier MAJ │  │
│  └─────────────────────────┘  │       │  │ • Trial ignoré si payé  │  │
└───────────────────────────────┘       │  └─────────────────────────┘  │
                                        └───────────────────────────────┘
```

---

## Modèle de Données

### Table `users`

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    preferred_language VARCHAR(5) DEFAULT 'en',
    subscription_tier VARCHAR(20) DEFAULT 'free',  -- free/premium/pro (tier payé)
    trial_ends_at TIMESTAMP WITH TIME ZONE,        -- Fin du trial (14j après inscription)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Table `subscriptions`

```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    tier VARCHAR(20) NOT NULL,                     -- free/premium/pro
    status VARCHAR(20) DEFAULT 'active',           -- active/cancelled/expired/past_due/paused
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    -- Lemon Squeezy IDs
    ls_subscription_id VARCHAR(100) UNIQUE,
    ls_customer_id VARCHAR(100),
    ls_variant_id VARCHAR(100),
    ls_order_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Table `usage_tracking`

```sql
CREATE TABLE usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date DATE NOT NULL,
    vision_analyses INTEGER DEFAULT 0,
    recipe_generations INTEGER DEFAULT 0,
    coach_messages INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, date)
);
```

---

## Logique de Détermination du Tier

### Backend: `get_effective_tier()`

```python
# backend/app/services/subscription.py

async def get_effective_tier(self, user_id: int) -> str:
    """
    Détermine le tier effectif de l'utilisateur.
    Ordre de priorité:
    1. Subscription payée active → tier de la subscription
    2. Trial actif → "premium"
    3. Sinon → "free"
    """
    user = await self.db.get(User, user_id)
    if not user:
        return "free"

    # 1. Vérifier subscription payée
    subscription = await self._get_subscription(user_id)
    if subscription and subscription.status == SubscriptionStatus.ACTIVE:
        if subscription.tier in [SubscriptionTier.PREMIUM, SubscriptionTier.PRO]:
            return subscription.tier.value

    # 2. Vérifier trial actif
    if user.trial_ends_at and datetime.now(timezone.utc) < user.trial_ends_at:
        return "premium"

    # 3. Défaut: free
    return user.subscription_tier or "free"
```

### Frontend: Affichage du Trial

```typescript
// Logique dans TrialBanner.tsx
interface TrialInfo {
  is_trial: boolean;
  trial_ends_at: string | null;
  days_remaining: number | null;
}

// Afficher seulement si:
// - is_trial === true
// - Pas d'abonnement payé actif
// - days_remaining > 0
```

---

## Limites par Tier

```python
TIER_LIMITS = {
    "free": {
        "vision_analyses": {"limit": 3, "period": "day"},
        "recipe_generations": {"limit": 2, "period": "week"},
        "coach_messages": {"limit": 1, "period": "day"},
        "history_days": {"limit": 7, "period": "total"},
        "export_pdf": {"limit": 0},
        "meal_plans": {"limit": 0},
        "advanced_stats": {"limit": 0},
        "priority_support": {"limit": 0},
    },
    "premium": {
        "vision_analyses": {"limit": -1, "period": "day"},      # illimité
        "recipe_generations": {"limit": 10, "period": "week"},
        "coach_messages": {"limit": 5, "period": "day"},
        "history_days": {"limit": 90, "period": "total"},
        "export_pdf": {"limit": 0},
        "meal_plans": {"limit": 0},
        "advanced_stats": {"limit": 1},
        "priority_support": {"limit": 1},
    },
    "pro": {
        "vision_analyses": {"limit": -1, "period": "day"},
        "recipe_generations": {"limit": -1, "period": "week"},
        "coach_messages": {"limit": -1, "period": "day"},
        "history_days": {"limit": -1, "period": "total"},
        "export_pdf": {"limit": 1},
        "meal_plans": {"limit": 1},
        "advanced_stats": {"limit": 1},
        "priority_support": {"limit": 1},
        "dedicated_support": {"limit": 1},
    }
}
```

---

## Endpoints API

### Statut Subscription

```
GET /api/v1/subscriptions/status

Response:
{
  "tier": "premium",           // Tier effectif (incluant trial)
  "status": "active",          // active/cancelled/expired/none
  "is_active": true,
  "renews_at": null,
  "cancel_at_period_end": false,
  "is_trial": true,            // NOUVEAU: Est en période trial
  "trial_ends_at": "2026-01-18T12:00:00Z",  // NOUVEAU
  "days_remaining": 14         // NOUVEAU: Jours restants trial
}
```

### Usage

```
GET /api/v1/subscriptions/usage

Response:
{
  "tier": "premium",
  "is_trial": true,
  "trial_days_remaining": 14,
  "limits": {
    "vision_analyses": {"limit": -1, "period": "day", "used": 5},
    "recipe_generations": {"limit": 10, "period": "week", "used": 3},
    ...
  }
}
```

### Pricing

```
GET /api/v1/subscriptions/pricing

Response:
{
  "plans": [
    {
      "tier": "free",
      "price_monthly": 0,
      "price_yearly": 0,
      "features": ["vision_3", "recipes_2", ...]
    },
    {
      "tier": "premium",
      "price_monthly": 5,
      "price_yearly": 40,
      "variant_id_monthly": "1191083",
      "variant_id_yearly": "1191081",
      "features": ["vision_unlimited", "recipes_10", ...],
      "popular": true
    },
    {
      "tier": "pro",
      "price_monthly": 10,
      "price_yearly": 80,
      "variant_id_monthly": "1191076",
      "variant_id_yearly": "1191055",
      "features": ["vision_unlimited", "recipes_unlimited", ...]
    }
  ],
  "currency": "EUR"
}
```

---

## Flow d'Inscription avec Trial

### Backend: `auth.py`

```python
@router.post("/register")
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # 1. Créer l'utilisateur
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        name=user_data.name,
        subscription_tier="free",  # Tier par défaut
        trial_ends_at=datetime.now(timezone.utc) + timedelta(days=14)  # Trial 14 jours
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    # 2. Retourner token + info trial
    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "trial_ends_at": user.trial_ends_at.isoformat(),
            "is_trial": True
        }
    }
```

---

## Composants Frontend Trial

### TrialBanner

```tsx
// frontend/src/components/subscription/TrialBanner.tsx

export function TrialBanner() {
  const { t } = useTranslation('pricing');
  const { data: status } = useSubscriptionStatus();

  if (!status?.is_trial || status.days_remaining === null) {
    return null;
  }

  const isExpiringSoon = status.days_remaining <= 3;

  return (
    <div className={cn(
      "rounded-lg p-4 flex items-center justify-between",
      isExpiringSoon
        ? "bg-orange-100 border-orange-300"
        : "bg-primary-100 border-primary-300"
    )}>
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5" />
        <div>
          <p className="font-medium">
            {t('trial.title', { days: status.days_remaining })}
          </p>
          <p className="text-sm text-gray-600">
            {t('trial.description')}
          </p>
        </div>
      </div>
      <Link to="/pricing">
        <Button size="sm">
          {t('trial.upgrade')}
        </Button>
      </Link>
    </div>
  );
}
```

### Traductions i18n

```json
// pricing.json (toutes les 7 langues)
{
  "trial": {
    "title": "{{days}} jours restants dans votre essai Premium",
    "titleExpired": "Votre essai Premium a expiré",
    "description": "Profitez de toutes les fonctionnalités Premium",
    "upgrade": "Passer à Premium",
    "daysRemaining": "{{count}} jour restant",
    "daysRemaining_plural": "{{count}} jours restants"
  }
}
```

---

## Webhooks Lemon Squeezy

### Events Gérés

| Event | Action |
|-------|--------|
| `subscription_created` | Créer Subscription, MAJ tier, annuler trial |
| `subscription_updated` | MAJ period dates |
| `subscription_cancelled` | Marquer cancelled |
| `subscription_expired` | Marquer expired, tier → free |
| `subscription_resumed` | Réactiver, tier → subscription.tier |

### Endpoint

```
POST /api/v1/webhooks/lemonsqueezy

Headers:
  X-Signature: <HMAC-SHA256 signature>

Body: Lemon Squeezy webhook payload
```

---

## Configuration Lemon Squeezy

### Variables d'Environnement (Fly.io Secrets)

```bash
LEMONSQUEEZY_API_KEY=eyJ0eXAi...
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_...
LEMONSQUEEZY_STORE_ID=123456

# Variant IDs (produits créés dans Lemon Squeezy dashboard)
LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID=1191083
LEMONSQUEEZY_PREMIUM_YEARLY_VARIANT_ID=1191081
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=1191076
LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID=1191055
```

### Produits

| Produit | Prix | Variant ID |
|---------|------|------------|
| Premium Mensuel | 5€/mois (55 MAD) | 1191083 |
| Premium Annuel | 40€/an (440 MAD) | 1191081 |
| Pro Mensuel | 10€/mois (110 MAD) | 1191076 |
| Pro Annuel | 80€/an (880 MAD) | 1191055 |

---

## Déploiement

### Migration Alembic

```bash
# Créer migration pour trial_ends_at
cd backend
alembic revision --autogenerate -m "add trial_ends_at to users"

# Appliquer
alembic upgrade head
```

### Déployer Backend

```bash
cd backend
flyctl deploy --app nutriprofile-api
```

### Frontend (auto-deploy via Cloudflare)

```bash
git add -A
git commit -m "feat: add 14-day premium trial"
git push  # Cloudflare Pages auto-deploy
```

---

## Tests

### Test Trial Actif

```python
@pytest.mark.asyncio
async def test_new_user_gets_trial():
    # Créer utilisateur
    user = await create_user(email="test@example.com")

    # Vérifier trial_ends_at est dans 14 jours
    assert user.trial_ends_at is not None
    delta = user.trial_ends_at - datetime.now(timezone.utc)
    assert 13 < delta.days <= 14

    # Vérifier tier effectif = premium
    service = SubscriptionService(db)
    tier = await service.get_effective_tier(user.id)
    assert tier == "premium"

@pytest.mark.asyncio
async def test_trial_expired_returns_free():
    # Créer utilisateur avec trial expiré
    user = await create_user(
        email="test@example.com",
        trial_ends_at=datetime.now(timezone.utc) - timedelta(days=1)
    )

    # Vérifier tier effectif = free
    service = SubscriptionService(db)
    tier = await service.get_effective_tier(user.id)
    assert tier == "free"

@pytest.mark.asyncio
async def test_paid_subscription_overrides_trial():
    # Créer utilisateur avec trial actif
    user = await create_user(trial_ends_at=datetime.now(timezone.utc) + timedelta(days=7))

    # Ajouter subscription Pro
    await create_subscription(user_id=user.id, tier="pro", status="active")

    # Vérifier tier effectif = pro (pas premium du trial)
    service = SubscriptionService(db)
    tier = await service.get_effective_tier(user.id)
    assert tier == "pro"
```

---

## Checklist Implémentation Trial

### Backend
- [x] Ajouter champ `trial_ends_at` à User model
- [x] Créer migration Alembic
- [x] Implémenter `get_effective_tier()` avec logique trial
- [x] MAJ inscription pour définir trial_ends_at
- [x] MAJ `/subscriptions/status` avec is_trial, days_remaining
- [x] MAJ `/subscriptions/usage` avec info trial

### Frontend
- [x] Créer composant TrialBanner
- [x] Afficher trial dans Settings
- [x] Afficher trial dans Dashboard header
- [x] Modal upgrade quand trial expire
- [x] Traductions 7 langues

### Déploiement
- [x] Appliquer migration en production
- [x] Déployer backend
- [x] Déployer frontend

---

## Métriques à Suivre

| Métrique | Description | Objectif |
|----------|-------------|----------|
| Trial Start Rate | % inscrits qui commencent trial | 100% (automatique) |
| Trial-to-Paid | % trial qui convertissent | 15-25% |
| Day 0 Conversion | % qui paient le jour 1 | 5-10% |
| Churn Post-Trial | % qui partent après trial | <50% |
