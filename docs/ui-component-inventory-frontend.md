# Inventaire des Composants UI - Frontend NutriProfile

**Date de génération** : 2026-01-27
**Framework** : React 18.2.0 + TypeScript 5.3.3
**Nombre total de composants** : 74

---

## 📚 Table des Matières

1. [Authentication](#authentication) - Composants d'authentification
2. [Layout](#layout) - Structure et navigation
3. [Dashboard](#dashboard) - Tableau de bord principal
4. [Vision](#vision) - Analyse photo repas
5. [Recipes](#recipes) - Génération recettes
6. [Tracking](#tracking) - Suivi activité/poids
7. [Onboarding](#onboarding) - Parcours d'onboarding
8. [Subscription](#subscription) - Monétisation
9. [Pro](#pro) - Features Pro
10. [Common](#common) - Composants réutilisables
11. [UI](#ui) - Design system de base
12. [Legal](#legal) - Pages légales
13. [PWA](#pwa) - Progressive Web App

---

## 🔐 Authentication

**Répertoire** : `components/auth/`

| Composant | Description | Props |
|-----------|-------------|-------|
| `ProtectedRoute` | HOC pour routes nécessitant authentification | `children: ReactNode` |
| `ProfileRequiredRoute` | HOC pour routes nécessitant profil complet | `children: ReactNode` |
| `HomeRedirect` | Redirection intelligente après login | - |

**Utilisation** :
```tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <ProfileRequiredRoute>
      <DashboardPage />
    </ProfileRequiredRoute>
  </ProtectedRoute>
} />
```

---

## 🏗️ Layout

**Répertoire** : `components/layout/`

| Composant | Description | Responsive |
|-----------|-------------|-----------|
| `Header` | Header principal avec navigation | ✅ Mobile/Desktop |
| `BottomNav` | Navigation mobile (sticky bottom) | ✅ Mobile only |
| `Sidebar` | Sidebar navigation (desktop) | ✅ Desktop only |
| `Footer` | Footer avec liens | ✅ Responsive |
| `Container` | Container responsive avec padding | ✅ Responsive |

**Breakpoints** :
- Mobile: < 768px → BottomNav visible
- Desktop: >= 768px → Sidebar visible

---

## 📊 Dashboard

**Répertoire** : `components/dashboard/`

### Composants Principaux (16 composants)

| Composant | Description | Features |
|-----------|-------------|----------|
| `HeroCard` | Card principale avec infos utilisateur | Avatar, level, XP |
| `ProfileSummaryBanner` | Résumé nutritionnel du jour | Calories, macros, progression |
| `StatsRing` | Anneau de progression (calories) | Animation SVG |
| `WeeklyChart` | Graphique de la semaine | Chart.js, responsive |
| `AdaptiveStatsGrid` | Grille adaptative de stats | Auto-layout |
| `LevelProgress` | Barre de progression niveau/XP | Gamification |
| `PersonalizedInsights` | Insights IA personnalisés | Coach IA |
| `HealthAlerts` | Alertes santé importantes | Notifications |
| `CoachCard` | Card avec conseil du coach | IA |
| `QuickActions` | Boutons d'actions rapides | Scan, recipe, track |
| `ScannerCard` | Card accès scanner photo | CTA principal |
| `NotificationBell` | Cloche de notifications | Badge count |
| `DashboardSkeleton` | Skeleton loader | Loading state |

**Composition** :
```tsx
<HeroCard user={user} />
<ProfileSummaryBanner profile={profile} />
<AdaptiveStatsGrid>
  <StatsRing value={caloriesConsumed} max={caloriesTarget} />
  <WeeklyChart data={weekData} />
</AdaptiveStatsGrid>
<PersonalizedInsights insights={insights} />
<HealthAlerts alerts={alerts} />
```

---

## 📸 Vision

**Répertoire** : `components/vision/`

### Composants d'Analyse (15+ composants)

| Composant | Description | Features |
|-----------|-------------|----------|
| `ImageUploader` | Upload photo repas | Drag & drop, preview |
| `AnalysisResult` | Résultats d'analyse IA | Aliments détectés, nutrition |
| `EditFoodItemModal` | Modal édition aliment | Autocomplete, calcul temps réel |
| `FoodLogCard` | Card log repas sauvegardé | Expand/collapse, edit, delete |
| `FoodItemExpandableCard` | Card aliment expandable | Détails nutrition |
| `ManualMealBuilder` | Constructeur manuel de repas | Alternative à scan IA |
| `BarcodeScanner` | Scan code-barres | Camera API |
| `FavoriteMealsList` | Liste repas favoris | Quick log |
| `GalleryPhotoCard` | Card photo dans galerie | Thumbnail, metadata |
| `GalleryFilters` | Filtres galerie (date, meal type) | Filter UI |
| `NutritionSourceBadge` | Badge source données (IA/manual) | Visual indicator |

**Workflow typique** :
```
ImageUploader → API IA → AnalysisResult →
  [Edit via EditFoodItemModal] → Save → FoodLogCard
```

**Features clés** :
- ✅ Upload photo (camera/gallery)
- ✅ Analyse multi-modèles (BLIP-2 + LLaVA)
- ✅ Édition aliments avec autocomplete
- ✅ Calcul nutrition temps réel
- ✅ Historique avec galerie
- ✅ Scan code-barres

---

## 🍳 Recipes

**Répertoire** : `components/recipes/`

| Composant | Description | Features |
|-----------|-------------|----------|
| `RecipeGenerator` | Formulaire génération recette | Ingrédients, preferences |
| `RecipeCard` | Card recette générée | Image, temps, difficulté |
| `RecipeDetails` | Vue détaillée recette | Instructions, nutrition |
| `RecipeFilters` | Filtres recettes (cuisine, difficulté) | Filter UI |
| `FavoriteRecipesList` | Liste recettes favorites | Tri, recherche |
| `RecipeIngredientsList` | Liste ingrédients avec quantités | Shopping list |

**Flux génération** :
```
RecipeGenerator (form) → API IA → RecipeCard →
  RecipeDetails (full view) → Favorite/Cook
```

---

## 📈 Tracking

**Répertoire** : `components/tracking/`

| Composant | Description | Features |
|-----------|-------------|----------|
| `ActivityForm` | Formulaire log activité | Type, durée, intensité |
| `ActivityCard` | Card activité loggée | Calories brûlées |
| `WeightForm` | Formulaire log poids | Poids, % graisse, masse |
| `WeightChart` | Graphique évolution poids | Chart.js, trends |
| `GoalCard` | Card objectif | Progress bar, edit |
| `GoalForm` | Formulaire création objectif | Type, target, period |

---

## 🎓 Onboarding

**Répertoire** : `components/onboarding/`

**Wizard 5 étapes** :

| Composant | Étape | Données |
|-----------|-------|---------|
| `Step1Personal` | 1/5 | Âge, sexe, taille, poids |
| `Step2Activity` | 2/5 | Niveau d'activité |
| `Step3Goals` | 3/5 | Objectifs fitness |
| `Step4Diet` | 4/5 | Type régime, allergies |
| `Step5Summary` | 5/5 | Récap + calcul BMR/TDEE |

**Features** :
- ✅ Navigation step-by-step
- ✅ Validation par étape
- ✅ Progression visuelle
- ✅ Skip option (trial users)

---

## 💳 Subscription

**Répertoire** : `components/subscription/`

| Composant | Description | Features |
|-----------|-------------|----------|
| `PricingCard` | Card plan tarifaire | Free/Premium/Pro |
| `PricingComparison` | Table comparaison features | ✓/✗ par tier |
| `SubscriptionStatus` | Badge statut abonnement | Active/Trial/Cancelled |
| `TrialBanner` | Bannière trial Premium | Countdown jours restants |
| `UsageLimitBanner` | Bannière limite atteinte | CTA upgrade |
| `CheckoutButton` | Bouton checkout Lemon Squeezy | Redirect externe |

**Tiers** :
- **Free** : 3 analyses/jour, 2 recettes/semaine
- **Premium** : Illimité analyses, 10 recettes/semaine, 5€/mois
- **Pro** : Tout illimité + export PDF + plans repas, 10€/mois

---

## 🌟 Pro

**Répertoire** : `components/pro/`

| Composant | Description | Tier Required |
|-----------|-------------|---------------|
| `PDFExportButton` | Bouton export PDF rapport | Pro |
| `MealPlanGenerator` | Générateur plan alimentaire | Pro |
| `MealPlanCalendar` | Calendrier plan repas | Pro |
| `AdvancedStats` | Statistiques avancées | Premium/Pro |

---

## 🔧 Common

**Répertoire** : `components/common/`

**Composants réutilisables** :

| Composant | Description | Usage |
|-----------|-------------|-------|
| `LoadingSpinner` | Spinner de chargement | Loading states |
| `EmptyState` | État vide avec illustration | Listes vides |
| `ErrorBoundary` | Catch erreurs React | Error handling |
| `ConfirmDialog` | Dialogue de confirmation | Actions destructives |
| `ToastContainer` | Container pour toasts (sonner) | Notifications |

---

## 🎨 UI

**Répertoire** : `components/ui/`

**Design System de base (15+ composants)** :

| Composant | Description | Variants |
|-----------|-------------|----------|
| `Button` | Bouton principal | primary, secondary, ghost, outline |
| `Input` | Champ de saisie | text, email, password, number |
| `Card` | Container card | default, outlined, elevated |
| `Badge` | Badge/tag | success, warning, error, info |
| `Avatar` | Avatar utilisateur | image, initials, size variants |
| `Progress` | Barre de progression | linear, circular |
| `Skeleton` | Skeleton loader | text, rectangle, circle |
| `Tabs` | Navigation tabs | default, pills |
| `Select` | Dropdown select | single, multi |
| `Checkbox` | Case à cocher | controlled, uncontrolled |
| `Radio` | Bouton radio | controlled, uncontrolled |
| `Switch` | Toggle switch | boolean |
| `Dialog` | Dialogue modal | center, fullscreen |
| `Tooltip` | Tooltip informatif | top, bottom, left, right |
| `Accordion` | Accordion expandable | single, multiple |

**Utilisation** :
```tsx
import { Button, Card, Badge } from '@/components/ui'

<Card>
  <Badge variant="success">Active</Badge>
  <Button variant="primary">Save</Button>
</Card>
```

---

## 📜 Legal

**Répertoire** : `components/legal/`

| Composant | Description |
|-----------|-------------|
| `TermsOfService` | Conditions d'utilisation |
| `PrivacyPolicy` | Politique de confidentialité |
| `RefundPolicy` | Politique de remboursement |
| `CookieConsent` | Bannière consentement cookies |

**i18n** : Toutes les pages légales sont traduites en 7 langues.

---

## 📱 PWA

**Répertoire** : `components/pwa/`

| Composant | Description |
|-----------|-------------|
| `InstallPrompt` | Prompt installation PWA |
| `UpdateNotification` | Notification mise à jour disponible |
| `OfflineBanner` | Bannière mode hors-ligne |

---

## 🎨 Design System

### Couleurs
- **Primary** : Bleu (nutrition, action)
- **Success** : Vert (objectifs atteints)
- **Warning** : Orange (limites)
- **Error** : Rouge (erreurs)
- **Neutral** : Gris (texte, backgrounds)

### Typographie
- **Font** : Inter (system font fallback)
- **Sizes** : xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl

### Spacing
- **Scale** : 0.25rem (4px) → 2rem (32px)
- **Breakpoints** : Mobile-first (sm, md, lg, xl)

### Animations
- **Transitions** : 150ms ease-in-out
- **Loading** : Skeleton loaders
- **Hover** : Subtle scale/color change

---

## 📊 Résumé

| Catégorie | Nombre de Composants |
|-----------|----------------------|
| Authentication | 3 |
| Layout | 5 |
| Dashboard | 16 |
| Vision | 15 |
| Recipes | 6 |
| Tracking | 6 |
| Onboarding | 5 |
| Subscription | 6 |
| Pro | 4 |
| Common | 5 |
| UI (Design System) | 15 |
| Legal | 4 |
| PWA | 3 |
| **TOTAL** | **74** |

---

## 🔄 Patterns d'Architecture

### Composition
```tsx
// Pattern de composition hiérarchique
<Layout>
  <Header />
  <Container>
    <DashboardPage>
      <HeroCard />
      <StatsGrid>
        <StatsRing />
        <WeeklyChart />
      </StatsGrid>
    </DashboardPage>
  </Container>
  <BottomNav />
</Layout>
```

### State Management
- **Server State** : React Query (@tanstack/react-query)
- **Client State** : Zustand stores
- **Form State** : React Hook Form
- **URL State** : React Router search params

### Data Flow
```
User Action → Component →
  [React Query mutation] → API →
  [Cache update] → Component re-render
```

---

*Document généré automatiquement par le workflow document-project*
*74 composants React documentés*
