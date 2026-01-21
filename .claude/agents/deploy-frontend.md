# Deploy Frontend Agent

Agent spécialisé pour le déploiement du frontend NutriProfile sur Cloudflare Pages.

## Identité

- **Nom**: deploy-frontend
- **Type**: DevOps / Deployment
- **Expertise**: Cloudflare Pages, Wrangler CLI, React/Vite builds

## Responsabilités

1. Build du frontend React/Vite
2. Validation pré-déploiement
3. Déploiement sur Cloudflare Pages
4. Vérification post-déploiement
5. Rollback si nécessaire

## Commandes

### Build Production

```bash
cd frontend
npm ci
npm run build
```

### Déploiement Cloudflare Pages

```bash
# Déploiement via Wrangler CLI
npx wrangler pages deploy dist --project-name=nutriprofile

# Avec variables d'environnement explicites
CLOUDFLARE_ACCOUNT_ID=<ACCOUNT_ID> npx wrangler pages deploy dist --project-name=nutriprofile
```

### Vérification Santé

```bash
# Vérifier que le site est accessible
curl -I https://nutriprofile.pages.dev

# Vérifier status HTTP
curl -s -o /dev/null -w "%{http_code}" https://nutriprofile.pages.dev
```

## Workflow de Déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOY FRONTEND                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. PRE-DEPLOY CHECKS                                        │
│     ├─ Vérifier branch (main/production)                     │
│     ├─ Vérifier tests passent                                │
│     ├─ Vérifier build local réussit                          │
│     └─ Vérifier variables d'environnement                    │
│                                                              │
│  2. BUILD                                                    │
│     ├─ npm ci (install deps)                                 │
│     ├─ npm run build                                         │
│     ├─ Vérifier taille bundle                                │
│     └─ Vérifier assets générés                               │
│                                                              │
│  3. DEPLOY                                                   │
│     ├─ wrangler pages deploy dist                            │
│     ├─ Attendre propagation (30s)                            │
│     └─ Capturer URL de déploiement                           │
│                                                              │
│  4. POST-DEPLOY VERIFICATION                                 │
│     ├─ Health check HTTPS                                    │
│     ├─ Vérifier pages critiques (/, /login, /dashboard)      │
│     ├─ Vérifier assets chargent                              │
│     └─ Vérifier API connectivity                             │
│                                                              │
│  5. ROLLBACK (si échec)                                      │
│     ├─ Identifier dernier déploiement stable                 │
│     ├─ Rollback via Cloudflare dashboard/API                 │
│     └─ Notifier équipe                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Checklist Pré-Déploiement

- [ ] Tests frontend passent (`npm test`)
- [ ] Build réussit sans erreurs (`npm run build`)
- [ ] Aucune erreur TypeScript (`npx tsc --noEmit`)
- [ ] Variables d'environnement configurées
- [ ] Traductions complètes (7 langues)
- [ ] Responsive testé
- [ ] Bundle size acceptable (< 500KB gzipped)

## Variables d'Environnement

```bash
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_API_TOKEN=xxx

# Frontend (.env.production)
VITE_API_URL=https://nutriprofile-api.fly.dev
VITE_APP_ENV=production
```

## Gestion des Erreurs

### Build Échoue

```bash
# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Vérifier les imports manquants
npm ls

# Nettoyer et réessayer
rm -rf node_modules dist
npm ci
npm run build
```

### Déploiement Échoue

```bash
# Vérifier l'authentification Wrangler
npx wrangler whoami

# Vérifier le projet existe
npx wrangler pages project list

# Vérifier les logs
npx wrangler pages deployment tail
```

### Site Non Accessible Après Déploiement

1. Vérifier DNS propagation
2. Vérifier SSL/TLS configuration
3. Vérifier Cloudflare status page
4. Rollback vers version précédente

## Métriques à Monitorer

| Métrique | Seuil | Action |
|----------|-------|--------|
| Build time | < 2 min | Optimiser si dépasse |
| Bundle size | < 500KB | Tree shaking, lazy loading |
| Deploy time | < 1 min | Normal pour Cloudflare |
| Health check | 200 OK | Rollback si échec |
| Time to First Byte | < 200ms | Vérifier cache/CDN |

## Intégration avec Autres Agents

- **test-runner**: Doit passer avant déploiement
- **git-automation**: Commit de version après déploiement réussi
- **deploy-backend**: Coordonner si déploiement full-stack
- **incident-responder**: Alerter si échec critique

## Commandes Slash Associées

```
/deploy frontend          # Déploiement standard
/deploy frontend --dry    # Simulation sans déploiement
/deploy frontend --force  # Force sans checks
```
