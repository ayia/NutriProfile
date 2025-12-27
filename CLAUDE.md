# NutriProfile

Application web de profilage nutritionnel avec architecture multi-agents LLM.

## État du Projet (Décembre 2025)

**Phase actuelle**: Monétisation - Implémentation système de paiement
**Statut**: Application fonctionnelle, prête pour monétisation

### Fonctionnalités Implémentées
- Authentification JWT complète
- Profil nutritionnel (BMR/TDEE Mifflin-St Jeor)
- Analyse photo repas (BLIP-2, LLaVA)
- Génération recettes IA (Mistral, Llama, Mixtral)
- Suivi activité + poids
- Coach IA personnalisé
- Gamification (badges, streaks, niveaux 1-50)
- Dashboard statistiques
- Multi-langue (FR/EN)

### À Implémenter (Monétisation)
- Système de paiement Lemon Squeezy
- Limites par tier (gratuit/premium/pro)
- Export PDF
- Plans alimentaires IA
- Intégration objets connectés

## Stack Technique

- Backend : Python 3.11+, FastAPI, SQLAlchemy 2.0 async, Alembic
- Frontend : React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Base de données : PostgreSQL (Fly Postgres)
- IA : Hugging Face Inference API, multi-agents avec consensus
- Déploiement : Fly.io
- Paiements : Lemon Squeezy (Maroc supporté)

## Règles Critiques

- TOUJOURS utiliser Pydantic pour les schémas avant de coder
- TOUJOURS créer les tests unitaires avec chaque fonctionnalité
- JAMAIS de code sans type hints Python
- JAMAIS déployer sans health check endpoint
- Chaque agent LLM doit avoir un fallback et un score de confiance
- Les limites freemium doivent être vérifiées côté backend

## Règles d'Internationalisation (i18n)

**IMPORTANT**: Toute chaîne de texte visible par l'utilisateur DOIT être internationalisée.

### Règles obligatoires
- JAMAIS de texte codé en dur dans les composants React
- TOUJOURS utiliser `useTranslation()` avec le namespace approprié
- TOUJOURS ajouter les traductions dans TOUTES les 7 langues: fr, en, de, es, pt, zh, ar
- TOUJOURS vérifier les fichiers i18n existants avant de créer de nouvelles clés

### Langues supportées
| Code | Langue | Direction |
|------|--------|-----------|
| fr | Français | LTR |
| en | Anglais | LTR |
| de | Allemand | LTR |
| es | Espagnol | LTR |
| pt | Portugais | LTR |
| zh | Chinois | LTR |
| ar | Arabe | RTL |

### Namespaces i18n
- `common` - Actions, navigation, unités, erreurs génériques
- `auth` - Authentification (login, register, forgot password)
- `dashboard` - Tableau de bord
- `tracking` - Suivi activité/poids
- `vision` - Analyse photo IA
- `recipes` - Génération de recettes
- `onboarding` - Onboarding utilisateur
- `settings` - Paramètres
- `home` - Page d'accueil publique
- `pricing` - Tarification
- `terms` - Conditions d'utilisation
- `privacy` - Politique de confidentialité
- `refund` - Politique de remboursement
- `pro` - Fonctionnalités Pro

### Exemple d'utilisation
```tsx
// Bon exemple
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation('recipes')
  return <h1>{t('title')}</h1>
}

// Mauvais exemple - NE JAMAIS FAIRE
function BadComponent() {
  return <h1>Recettes</h1> // Texte codé en dur!
}
```

### Checklist avant commit
- [ ] Aucune chaîne de texte codée en dur
- [ ] Traductions ajoutées pour les 7 langues
- [ ] Namespace approprié utilisé
- [ ] Clés de traduction cohérentes avec les fichiers existants

## Commandes

```bash
# Développement
cd backend && uvicorn app.main:app --reload  # Serveur dev
cd frontend && npm run dev                    # Frontend dev

# Base de données
cd backend && alembic upgrade head           # Migrations DB
cd backend && alembic revision --autogenerate -m "description"

# Déploiement
fly deploy -c backend/fly.toml               # Backend
fly deploy -c frontend/fly.toml              # Frontend

# Tests
cd backend && pytest                         # Tests backend
cd frontend && npm test                      # Tests frontend
```

## Structure Projet

```
nutriprofile/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Endpoints (auth, users, profiles, vision, recipes, tracking, dashboard, coaching)
│   │   ├── models/          # SQLAlchemy (user, profile, food_log, recipe, activity, gamification)
│   │   ├── schemas/         # Pydantic
│   │   ├── agents/          # Multi-agents IA (base, orchestrator, consensus, vision, recipe, coach, profiling)
│   │   └── services/        # Logique métier
│   ├── alembic/             # Migrations
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── pages/           # 11 pages (Home, Login, Register, Onboarding, Dashboard, Vision, Recipes, Tracking, Settings...)
│   │   ├── components/      # UI components
│   │   ├── services/        # API calls
│   │   ├── store/           # Zustand
│   │   └── i18n/            # Traductions
│   └── public/
└── docs/                    # Documentation
```

## Documentation

- @docs/ARCHITECTURE.md - Architecture technique détaillée
- @docs/AGENTS.md - Système multi-agents IA
- @docs/API.md - Documentation API
- @docs/MONETIZATION_REPORT.md - Stratégie monétisation (Maroc)
- @docs/MONETIZATION_IMPLEMENTATION.md - Plan technique paiements

## Contexte Business (Maroc)

- **Paiements**: Lemon Squeezy (Maroc supporté, 5% + 0.50$)
- **Statut légal**: Auto-Entrepreneur recommandé (1% impôt)
- **Objectif Y1**: 500-2000€/mois récurrents

## Workflow Développement

1. Lire la documentation pertinente avant toute implémentation
2. Créer schéma Pydantic → modèle SQLAlchemy → endpoint → test
3. Vérifier les limites freemium dans chaque endpoint concerné
4. Tester localement avant déploiement
5. Mettre à jour la documentation après changements majeurs
