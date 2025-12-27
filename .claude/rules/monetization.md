---
paths: backend/app/api/v1/subscriptions.py, backend/app/api/v1/webhooks.py, backend/app/services/subscription.py, backend/app/models/subscription.py, frontend/src/components/subscription/**, frontend/src/pages/PricingPage.tsx
---

# Règles Monétisation NutriProfile

## Contexte Business

- Développeur auto-entrepreneur au Maroc
- Plateforme de paiement : Lemon Squeezy (Merchant of Record)
- Devise : EUR (conversion automatique vers MAD par Lemon Squeezy)

## Tiers d'Abonnement

```
GRATUIT (0€)
├── 3 analyses photo/jour
├── 2 recettes/semaine
├── 1 conseil coach/jour
└── Historique 7 jours

PREMIUM (4.99€/mois ou 39.99€/an)
├── Analyses photo illimitées
├── 10 recettes/semaine
├── 5 conseils coach/jour
└── Historique 90 jours

PRO (9.99€/mois ou 79.99€/an)
├── Tout illimité
├── Historique illimité
├── Export PDF (futur)
└── Plans repas IA (futur)
```

## Implémentation Backend

### Vérification des Limites
```python
# TOUJOURS vérifier avant action limitée
sub_service = SubscriptionService(db)
allowed, used, limit = await sub_service.check_limit(user_id, "action")
if not allowed:
    raise HTTPException(status_code=429, detail={
        "error": "limit_reached",
        "used": used,
        "limit": limit,
        "upgrade_url": "/pricing"
    })
```

### Webhook Sécurité
```python
# TOUJOURS vérifier signature HMAC
signature = request.headers.get("X-Signature")
expected = hmac.new(secret, body, hashlib.sha256).hexdigest()
if not hmac.compare_digest(signature, expected):
    raise HTTPException(401)
```

## Implémentation Frontend

### Gestion HTTP 429
```typescript
// Intercepter dans api.ts
if (error.response?.status === 429) {
  const { limit, used, upgrade_url } = error.response.data;
  // Afficher modal upgrade
  showUpgradeModal({ limit, used, upgradeUrl: upgrade_url });
}
```

### Checkout Flow
1. User clique "S'abonner" → POST /subscriptions/checkout
2. Backend retourne checkout_url Lemon Squeezy
3. Redirect vers checkout externe
4. Après paiement → Webhook met à jour tier
5. User redirigé vers /dashboard avec nouveau tier

## Variables d'Environnement

```
LEMONSQUEEZY_API_KEY=xxx
LEMONSQUEEZY_WEBHOOK_SECRET=xxx
LEMONSQUEEZY_STORE_ID=xxx
LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID=xxx
LEMONSQUEEZY_PREMIUM_YEARLY_VARIANT_ID=xxx
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=xxx
LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID=xxx
```

## Traductions i18n Requises

```json
{
  "subscription": {
    "free": { "name": "Gratuit", "description": "..." },
    "premium": { "name": "Premium", "description": "..." },
    "pro": { "name": "Pro", "description": "..." },
    "features": {
      "unlimited_vision": "Analyses photo illimitées",
      "recipes_per_week": "{count} recettes/semaine"
    }
  },
  "usage": {
    "limitReached": "Limite atteinte pour {feature}",
    "upgrade": "Passer à Premium"
  }
}
```

## Règles Importantes

1. JAMAIS stocker les infos carte côté serveur (Lemon Squeezy gère)
2. TOUJOURS utiliser webhook pour màj tier (pas le frontend)
3. TOUJOURS logger les événements webhook pour audit
4. Reset des compteurs usage à minuit UTC
5. Les limites "semaine" = reset le lundi à minuit UTC
