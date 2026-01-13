# Quick Start - Développement Features NutriProfile

## 🚀 Pour Démarrer une Nouvelle Feature

### Étape 1: Analyser la Complexité

```
Feature SIMPLE (1-3 fichiers, <500 lignes)?
  └─> Implémenter directement sans décomposition

Feature COMPLEXE (>5 fichiers, >2000 lignes)?
  └─> Utiliser le processus de décomposition ci-dessous
```

---

### Étape 2: Si Feature Complexe → Décomposition

1. **Copier le template**:
   ```bash
   cp docs/FEATURE_TEMPLATE.md docs/MY_FEATURE.md
   ```

2. **Remplir le template**:
   - Contexte et objectifs
   - Décomposition en tâches (≤2000 mots, ≤5 fichiers par tâche)
   - Critères de succès mesurables

3. **Valider la décomposition**:
   - [ ] Chaque tâche est autonome ou dépendances claires
   - [ ] Pas plus de 5 fichiers par tâche
   - [ ] Description ≤ 2,000 mots par tâche
   - [ ] Critères de succès vérifiables

---

### Étape 3: Implémenter Tâche par Tâche

Pour chaque tâche:

```typescript
// 1. Créer les fichiers
// 2. Implémenter le code
// 3. Ajouter les traductions i18n (7 langues)
// 4. Écrire les tests
// 5. Vérifier coverage ≥ 80%
// 6. Passer à la tâche suivante
```

**Prompt à utiliser avec Claude Code**:

```
Tâche [N]: [Nom de la tâche]

Objectif: [Description]

Fichiers:
- Créer: [chemin/fichier1]
- Modifier: [chemin/fichier2]

Implémentation:
[Détails de l'implémentation]

Critères de succès:
- [ ] [Critère 1]
- [ ] [Critère 2]
- [ ] Tests passent
- [ ] Coverage ≥ 80%

Important:
- TOUJOURS internationaliser avec useTranslation('namespace')
- Utiliser composants existants (Button, Input, etc.)
- Pattern modal natif si besoin (pas de shadcn Dialog)
- Responsive mobile-first
- Types TypeScript stricts
```

---

### Étape 4: Tests et Validation

Après chaque tâche:

```bash
# Tests
cd frontend
npm test                    # Tous les tests doivent passer
npm run test:coverage       # Coverage ≥ 80%

# Build
npm run build               # Aucune erreur TypeScript

# Lint
npm run lint                # Aucune erreur ESLint
```

**Checklist rapide**:
- [ ] Tests passent (51/51 ou plus)
- [ ] Coverage ≥ 80% statements/functions/lines
- [ ] Coverage ≥ 75% branches
- [ ] Aucun texte codé en dur
- [ ] 7 langues i18n complètes
- [ ] Responsive testé (375px, 768px, 1024px+)
- [ ] Aucune erreur TypeScript/ESLint

---

### Étape 5: Documentation et Commit

```bash
# 1. Mettre à jour CLAUDE.md
# Ajouter la feature dans "Fonctionnalités Implémentées"

# 2. Git commit
git add .
git commit -m "feat(module): description courte

- Détail 1
- Détail 2
- Tests: X tests ajoutés, coverage Y%

🤖 Generated with Claude Code"

# 3. Déployer si prêt
fly deploy -c frontend/fly.toml    # Frontend
fly deploy -c backend/fly.toml     # Backend (si changements)
```

---

## 📚 Références Rapides

### Documentation

| Document | Utilisation |
|----------|-------------|
| [CLAUDE.md](../CLAUDE.md) | Vue d'ensemble projet, règles critiques |
| [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) | Guide complet, standards, méthodologie |
| [FEATURE_TEMPLATE.md](./FEATURE_TEMPLATE.md) | Template vierge pour nouvelles features |
| [EXAMPLE_VISION_FOOD_EDITING.md](./EXAMPLE_VISION_FOOD_EDITING.md) | Exemple réel de décomposition |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture technique |
| [API.md](./API.md) | Documentation API backend |

### Commandes Utiles

```bash
# Frontend
cd frontend
npm run dev                 # Serveur dev (http://localhost:5173)
npm test                    # Tests
npm run test:watch          # Tests en mode watch
npm run test:ui             # Interface UI Vitest
npm run test:coverage       # Rapport coverage
npm run build               # Build production
npm run lint                # Linter

# Backend
cd backend
uvicorn app.main:app --reload  # Serveur dev (http://localhost:8000)
pytest                      # Tests backend
pytest --cov                # Coverage
alembic upgrade head        # Appliquer migrations
alembic revision --autogenerate -m "description"  # Créer migration

# Déploiement
fly deploy -c frontend/fly.toml    # Déployer frontend
fly deploy -c backend/fly.toml     # Déployer backend
fly logs -a nutriprofile-api       # Logs backend
```

---

## 🎯 Exemples de Prompts

### Prompt Simple (Feature Simple)

```
Ajouter un bouton "Partager" sur la page RecipesPage qui copie le lien de la recette dans le presse-papiers.

Fichiers à modifier:
- frontend/src/pages/RecipesPage.tsx

Requirements:
- Utiliser le composant Button existant
- Icône Share2 de lucide-react
- Toast de confirmation avec sonner
- i18n complet (namespace 'recipes')
- Types TypeScript stricts
- Responsive mobile
```

### Prompt Complexe (Feature Décomposée)

```
@docs/MY_FEATURE.md

Exécuter la Tâche 1 décrite dans le document ci-dessus.

Important:
- Suivre EXACTEMENT les spécifications
- Respecter les contraintes (≤5 fichiers, ≤2000 mots)
- Vérifier les critères de succès avant de terminer
- Tests obligatoires avec coverage ≥ 80%
- i18n pour les 7 langues
```

---

## ⚠️ Pièges à Éviter

### ❌ Ne PAS Faire

```tsx
// 1. Texte codé en dur
<h1>Edit food</h1>  // ❌

// 2. Utiliser shadcn components inexistants
import { Dialog } from '@/components/ui/dialog'  // ❌ N'existe pas!

// 3. Types any
function update(data: any) { }  // ❌

// 4. Tailles fixes non-responsive
<div className="w-[500px] p-6">  // ❌ Overflow mobile

// 5. Oublier les tests
// ❌ Code sans tests = feature incomplète
```

### ✅ À la Place

```tsx
// 1. i18n obligatoire
const { t } = useTranslation('vision')
<h1>{t('editFood')}</h1>  // ✅

// 2. Pattern modal natif du projet
<div className="fixed inset-0 z-50">  // ✅

// 3. Types stricts
function update(data: UpdateData): Promise<Result> { }  // ✅

// 4. Responsive mobile-first
<div className="w-full max-w-[calc(100vw-24px)] sm:max-w-md p-2 sm:p-4">  // ✅

// 5. Tests avec coverage
describe('MyFeature', () => {
  it('works correctly', () => { })  // ✅
})
```

---

## 🔥 Workflow Optimal

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Analyser Feature                                          │
│    └─> Simple ou Complexe?                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│ Simple           │           │ Complexe         │
│ └─> Implémenter  │           │ └─> Décomposer   │
│     directement  │           │     en tâches    │
└────────┬─────────┘           └────────┬─────────┘
         │                              │
         │         ┌────────────────────┘
         │         │
         ▼         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Implémenter Tâche                                         │
│    ├─> Code                                                  │
│    ├─> Tests (coverage ≥ 80%)                               │
│    ├─> i18n (7 langues)                                     │
│    └─> Validation                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Vérifier Checklist                                        │
│    ├─> Tests passent ✅                                      │
│    ├─> Coverage ≥ 80% ✅                                     │
│    ├─> i18n complet ✅                                       │
│    ├─> Responsive ✅                                         │
│    └─> TypeScript strict ✅                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Documentation & Commit                                    │
│    ├─> Mettre à jour CLAUDE.md                              │
│    ├─> Git commit avec message descriptif                    │
│    └─> Déployer si prêt                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Exemple Réel: Vision Food Editing

**Situation**: Feature complexe (14 fichiers, ~4000 lignes)

**Solution**: Décomposition en 5 tâches

**Résultat**:
- ✅ 51 tests passés (100%)
- ✅ Coverage: 98.49% (modal), 100% (nutrition)
- ✅ Feature complète en 17 heures (vs estimation 19h)
- ✅ Aucune régression
- ✅ Déployée en production

**Voir**: [EXAMPLE_VISION_FOOD_EDITING.md](./EXAMPLE_VISION_FOOD_EDITING.md)

---

## 📞 Besoin d'Aide?

1. **Lire la documentation**:
   - [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Guide complet
   - [EXAMPLE_VISION_FOOD_EDITING.md](./EXAMPLE_VISION_FOOD_EDITING.md) - Exemple réel

2. **Consulter l'exemple**:
   - Étude de cas complète avec décomposition, code, tests

3. **Utiliser le template**:
   - [FEATURE_TEMPLATE.md](./FEATURE_TEMPLATE.md) - Copier et remplir

4. **Demander à Claude Code**:
   ```
   J'ai lu la documentation (DEVELOPMENT_GUIDE.md) et je souhaite implémenter [Feature].
   Comment décomposer cette feature selon la méthodologie du projet?
   ```

---

## 🚀 Prêt à Commencer!

1. Copier `FEATURE_TEMPLATE.md`
2. Remplir avec votre feature
3. Décomposer si complexe
4. Implémenter tâche par tâche
5. Tester, documenter, commit!

**Bonne chance! 🎉**

---

**Dernière mise à jour**: 13 Janvier 2026
