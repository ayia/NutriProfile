# Déploiement

Déployer NutriProfile sur Fly.io.

## Prérequis

- [ ] Fly CLI installé (`flyctl`)
- [ ] Authentifié sur Fly.io (`fly auth login`)
- [ ] Tous les tests passent
- [ ] Variables d'environnement configurées

## Déploiement Backend

```bash
cd backend

# Vérifier la configuration
fly status

# Déployer
fly deploy

# Vérifier les logs
fly logs

# Vérifier le health check
curl https://nutriprofile-api.fly.dev/health
```

## Déploiement Frontend

```bash
cd frontend

# Build de production
npm run build

# Déployer
fly deploy

# Vérifier
curl https://nutriprofile.fly.dev
```

## Base de Données

```bash
# Migrations
fly ssh console -C "cd /app && alembic upgrade head"

# Backup
fly postgres backup create

# Connexion
fly postgres connect -a nutriprofile-db
```

## Variables d'Environnement

```bash
# Lister
fly secrets list

# Ajouter
fly secrets set KEY=value

# Supprimer
fly secrets unset KEY
```

## Secrets Monétisation (Lemon Squeezy)

```bash
# Configuration paiement
fly secrets set LEMONSQUEEZY_API_KEY=xxx
fly secrets set LEMONSQUEEZY_WEBHOOK_SECRET=xxx
fly secrets set LEMONSQUEEZY_STORE_ID=xxx

# Variant IDs produits
fly secrets set LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID=xxx
fly secrets set LEMONSQUEEZY_PREMIUM_YEARLY_VARIANT_ID=xxx
fly secrets set LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=xxx
fly secrets set LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID=xxx
```

## Rollback

```bash
# Voir les versions
fly releases

# Rollback
fly deploy --image registry.fly.io/nutriprofile:v{N}
```

## Checklist Déploiement

- [ ] Tests passent en local
- [ ] Build réussi
- [ ] Migrations appliquées
- [ ] Health check OK
- [ ] Monitoring configuré
- [ ] SSL/TLS actif
- [ ] Secrets Lemon Squeezy configurés (si monétisation)
- [ ] Webhook URL configuré dans dashboard Lemon Squeezy
