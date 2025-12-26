# Plan d'Internationalisation (i18n) - NutriProfile

## Vue d'Ensemble

**Langues cibles** : Anglais (default), Francais, Allemand, Espagnol, Portugais, Chinois, Arabe

**Statut actuel** : 100% Francais, aucune infrastructure i18n
**Estimation** : 1,240+ chaines a traduire (61 fichiers)

---

## 1. Architecture i18n Proposee

### 1.1 Frontend - react-i18next

```
frontend/
├── src/
│   ├── i18n/
│   │   ├── index.ts              # Configuration i18next
│   │   ├── languageDetector.ts   # Detection automatique
│   │   └── locales/
│   │       ├── en/
│   │       │   ├── common.json       # UI commune
│   │       │   ├── auth.json         # Login/Register
│   │       │   ├── dashboard.json    # Dashboard
│   │       │   ├── tracking.json     # Suivi
│   │       │   ├── recipes.json      # Recettes
│   │       │   ├── vision.json       # Analyse photo
│   │       │   ├── onboarding.json   # Profil creation
│   │       │   ├── settings.json     # Parametres
│   │       │   └── validation.json   # Messages erreur
│   │       ├── fr/
│   │       ├── de/
│   │       ├── es/
│   │       ├── pt/
│   │       ├── zh/
│   │       └── ar/
│   └── components/
│       └── LanguageSwitcher.tsx  # Selecteur de langue
```

### 1.2 Backend - JSON + Pydantic

```
backend/
└── app/
    ├── i18n/
    │   ├── __init__.py           # Module i18n
    │   ├── translator.py         # Classe Translator
    │   └── locales/
    │       ├── en.json           # Anglais
    │       ├── fr.json           # Francais
    │       ├── de.json           # Allemand
    │       ├── es.json           # Espagnol
    │       ├── pt.json           # Portugais
    │       ├── zh.json           # Chinois
    │       └── ar.json           # Arabe
    └── agents/
        └── prompts/              # Prompts par langue
            ├── en/
            │   ├── profiling.txt
            │   ├── coach.txt
            │   ├── recipe.txt
            │   └── vision.txt
            └── fr/
                └── ...
```

---

## 2. Inventaire des Fichiers a Modifier

### 2.1 Frontend - Pages (9 fichiers, ~190 chaines)

| Fichier | Chaines | Priorite |
|---------|---------|----------|
| `LoginPage.tsx` | 15 | HAUTE |
| `RegisterPage.tsx` | 20 | HAUTE |
| `HomePage.tsx` | 50 | HAUTE |
| `MainDashboardPage.tsx` | 25 | HAUTE |
| `DashboardPage.tsx` | 15 | HAUTE |
| `TrackingPage.tsx` | 15 | MOYENNE |
| `RecipesPage.tsx` | 10 | MOYENNE |
| `VisionPage.tsx` | 10 | HAUTE |
| `SettingsPage.tsx` | 20 | HAUTE |
| `ForgotPasswordPage.tsx` | 10 | MOYENNE |

### 2.2 Frontend - Composants (28 fichiers, ~250 chaines)

**Onboarding** (6 fichiers, ~80 chaines)
- `OnboardingWizard.tsx`
- `Step1BasicInfo.tsx`
- `Step2Activity.tsx`
- `Step3Diet.tsx`
- `Step4Health.tsx`
- `Step5Summary.tsx`

**Tracking** (6 fichiers, ~75 chaines)
- `ActivityForm.tsx`
- `WeightForm.tsx`
- `WaterForm.tsx`
- `GoalForm.tsx`
- `GoalCard.tsx`
- `ProgressChart.tsx`

**Dashboard** (9 fichiers, ~75 chaines)
- `HeroCard.tsx`
- `CoachCard.tsx`
- `ScannerCard.tsx`
- `WeeklyChart.tsx`
- `StatsRing.tsx`
- `LevelProgress.tsx`
- `QuickActions.tsx`
- `NotificationBell.tsx`
- `DashboardSkeleton.tsx`

**Vision** (3 fichiers, ~45 chaines)
- `ImageUploader.tsx`
- `AnalysisResult.tsx`
- `FoodLogCard.tsx`

**Recipes** (2 fichiers, ~23 chaines)
- `RecipeGenerator.tsx`
- `RecipeCard.tsx`

**Layout** (3 fichiers, ~21 chaines)
- `Header.tsx`
- `BottomNav.tsx`
- `Layout.tsx`

### 2.3 Frontend - Types/Constantes (5 fichiers, ~70 chaines)

| Fichier | Constantes | Chaines |
|---------|------------|---------|
| `dashboard.ts` | STREAK_LABELS, LEVEL_TITLES | 14 |
| `tracking.ts` | ACTIVITY_TYPES, INTENSITY_LABELS, GOAL_TYPES | 20 |
| `foodLog.ts` | MEAL_TYPE_LABELS | 4 |
| `recipe.ts` | MEAL_TYPE_LABELS | 4 |
| `profile.ts` | ACTIVITY_LABELS, GOAL_LABELS, DIET_LABELS, COMMON_ALLERGIES | 25 |

### 2.4 Backend - Agents/Prompts (5 fichiers, ~800+ mots)

| Agent | Description | Mots |
|-------|-------------|------|
| `profiling.py` | Analyse profil nutritionnel | 200 |
| `coach.py` | Coaching motivationnel | 300 |
| `recipe.py` | Generation recettes | 250 |
| `vision.py` | Analyse images | 150 |
| `base.py` | Keywords raisonnement | 20 |

**CRITIQUE** : Les prompts doivent etre dans la langue de l'utilisateur pour que l'IA reponde correctement.

### 2.5 Backend - API Endpoints (8 fichiers, ~40 chaines)

| Fichier | Messages Erreur |
|---------|----------------|
| `auth.py` | 5 |
| `vision.py` | 5 |
| `dashboard.py` | 3 |
| `recipes.py` | 5 |
| `profiles.py` | 5 |
| `tracking.py` | 5 |
| `coaching.py` | 3 |
| `health.py` | 2 |

### 2.6 Backend - Schemas (6 fichiers, ~50 chaines)

Descriptions de champs Pydantic (moins prioritaire).

---

## 3. Implementation Technique

### 3.1 Frontend - Configuration i18next

```typescript
// frontend/src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'de', 'es', 'pt', 'zh', 'ar'],
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    // Namespaces par defaut
    ns: ['common', 'auth', 'dashboard', 'tracking', 'recipes', 'vision', 'onboarding', 'settings', 'validation'],
    defaultNS: 'common',
  });

export default i18n;
```

### 3.2 Frontend - Composant LanguageSwitcher

```typescript
// frontend/src/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Francais', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Espanol', flag: '🇪🇸' },
  { code: 'pt', name: 'Portugues', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    // Sauvegarder dans le profil utilisateur si connecte
    localStorage.setItem('language', lng);
    // Mettre a jour la direction pour l'arabe
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="px-3 py-2 border rounded-lg"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### 3.3 Frontend - Exemple Migration Composant

**AVANT** (hardcode):
```typescript
// components/vision/ImageUploader.tsx
<h3>Scannez votre repas</h3>
<p>Glissez une photo ici ou utilisez votre appareil</p>
<Button>Prendre une photo</Button>
<Button>Galerie</Button>
```

**APRES** (i18n):
```typescript
// components/vision/ImageUploader.tsx
import { useTranslation } from 'react-i18next';

export function ImageUploader() {
  const { t } = useTranslation('vision');

  return (
    <>
      <h3>{t('scan.title')}</h3>
      <p>{t('scan.description')}</p>
      <Button>{t('scan.takePhoto')}</Button>
      <Button>{t('scan.gallery')}</Button>
    </>
  );
}
```

**Fichier traduction** (locales/en/vision.json):
```json
{
  "scan": {
    "title": "Scan your meal",
    "description": "Drag a photo here or use your device",
    "takePhoto": "Take a photo",
    "gallery": "Gallery",
    "analyzing": "AI analyzing... please wait!",
    "tips": {
      "title": "Tips for better analysis:",
      "lighting": "Well-lit photo, top view",
      "visible": "All food visible in frame",
      "shadows": "Avoid reflections and strong shadows"
    }
  },
  "analysis": {
    "complete": "Analysis complete",
    "confidence": "Confidence",
    "calories": "Calories",
    "protein": "Protein",
    "carbs": "Carbs",
    "fat": "Fat"
  }
}
```

### 3.4 Backend - Module Translator

```python
# backend/app/i18n/__init__.py
import json
from pathlib import Path
from functools import lru_cache

SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'es', 'pt', 'zh', 'ar']
DEFAULT_LANGUAGE = 'en'

class Translator:
    def __init__(self):
        self.translations: dict[str, dict] = {}
        self._load_translations()

    def _load_translations(self):
        locales_dir = Path(__file__).parent / 'locales'
        for lang in SUPPORTED_LANGUAGES:
            file_path = locales_dir / f'{lang}.json'
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    self.translations[lang] = json.load(f)

    def get(self, key: str, lang: str = DEFAULT_LANGUAGE, **kwargs) -> str:
        """Get translated string with optional interpolation."""
        if lang not in self.translations:
            lang = DEFAULT_LANGUAGE

        # Navigate nested keys: "errors.auth.invalid_credentials"
        keys = key.split('.')
        value = self.translations.get(lang, {})
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k, key)
            else:
                return key

        # Interpolation
        if kwargs and isinstance(value, str):
            value = value.format(**kwargs)

        return value if isinstance(value, str) else key

@lru_cache()
def get_translator() -> Translator:
    return Translator()

def t(key: str, lang: str = DEFAULT_LANGUAGE, **kwargs) -> str:
    """Shortcut function for translation."""
    return get_translator().get(key, lang, **kwargs)
```

### 3.5 Backend - Prompts Multilingues

```python
# backend/app/agents/prompts/loader.py
from pathlib import Path

def load_prompt(agent_name: str, language: str = 'en') -> str:
    """Load prompt template for agent in specified language."""
    prompts_dir = Path(__file__).parent

    # Try requested language, fallback to English
    prompt_file = prompts_dir / language / f'{agent_name}.txt'
    if not prompt_file.exists():
        prompt_file = prompts_dir / 'en' / f'{agent_name}.txt'

    if prompt_file.exists():
        return prompt_file.read_text(encoding='utf-8')

    raise FileNotFoundError(f"Prompt not found for {agent_name}")
```

**Exemple prompt** (prompts/en/vision.txt):
```
You are an expert nutritionist analyzing a food image.

Analyze this food image and identify all visible foods.
For each detected food, estimate:
- Name of the food
- Approximate quantity (in grams or standard units)
- Nutritional values (calories, protein, carbs, fat)

Be precise and consider portion sizes visible in the image.
If you're unsure about a food, indicate a lower confidence score.

Respond in {language}.
```

**Exemple prompt** (prompts/fr/vision.txt):
```
Tu es un expert nutritionniste analysant une image de nourriture.

Analyse cette image et identifie tous les aliments visibles.
Pour chaque aliment detecte, estime:
- Nom de l'aliment
- Quantite approximative (en grammes ou unites standard)
- Valeurs nutritionnelles (calories, proteines, glucides, lipides)

Sois precis et considere les portions visibles dans l'image.
Si tu n'es pas sur d'un aliment, indique un score de confiance plus bas.

Reponds en {language}.
```

### 3.6 Backend - Agent avec Langue

```python
# backend/app/agents/vision.py
from app.agents.prompts.loader import load_prompt

class VisionAgent(BaseAgent):
    def __init__(self, language: str = 'en'):
        self.language = language
        self.system_prompt = load_prompt('vision', language)

    async def analyze(self, image_base64: str) -> VisionResult:
        # Le prompt inclut la langue pour la reponse
        prompt = self.system_prompt.format(language=self._get_language_name())
        # ... rest of analysis

    def _get_language_name(self) -> str:
        names = {
            'en': 'English',
            'fr': 'French',
            'de': 'German',
            'es': 'Spanish',
            'pt': 'Portuguese',
            'zh': 'Chinese',
            'ar': 'Arabic'
        }
        return names.get(self.language, 'English')
```

### 3.7 API - Header Accept-Language

```python
# backend/app/api/deps.py
from fastapi import Header

def get_language(accept_language: str = Header(default='en')) -> str:
    """Extract language from Accept-Language header."""
    # Parse "fr-FR,fr;q=0.9,en;q=0.8" -> "fr"
    if accept_language:
        primary = accept_language.split(',')[0].split('-')[0].lower()
        if primary in SUPPORTED_LANGUAGES:
            return primary
    return 'en'

# Usage in endpoint
@router.post("/vision/analyze")
async def analyze_image(
    data: ImageAnalyzeRequest,
    language: str = Depends(get_language),
    current_user: User = Depends(get_current_user),
):
    agent = VisionAgent(language=language)
    result = await agent.analyze(data.image_base64)
    return result
```

### 3.8 Frontend - Envoi de la Langue

```typescript
// frontend/src/services/api.ts
import i18n from '@/i18n';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor pour ajouter la langue
api.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = i18n.language;
  return config;
});
```

---

## 4. Schema Base de Donnees

### 4.1 Ajout Preference Langue Utilisateur

```python
# backend/app/models/user.py
class User(Base):
    # ... existing fields
    preferred_language = Column(String(5), default='en')
```

### 4.2 Migration Alembic

```python
# alembic/versions/xxx_add_user_language.py
def upgrade():
    op.add_column('users', sa.Column('preferred_language', sa.String(5), default='en'))

def downgrade():
    op.drop_column('users', 'preferred_language')
```

---

## 5. Support RTL (Arabe)

### 5.1 Configuration Tailwind

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
}
```

### 5.2 Classes RTL

```typescript
// Utiliser les classes RTL-aware
<div className="ml-4 rtl:mr-4 rtl:ml-0">
  {/* Marge a gauche en LTR, a droite en RTL */}
</div>

// Ou utiliser les nouvelles classes logiques
<div className="ms-4"> {/* margin-start */}
  {/* Fonctionne automatiquement en RTL */}
</div>
```

### 5.3 Detection Direction

```typescript
// App.tsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return <RouterProvider router={router} />;
}
```

---

## 6. Plan de Migration - Phases

### Phase 1 : Infrastructure (2 jours)

**Frontend:**
- [ ] Installer `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `i18next-http-backend`
- [ ] Creer structure dossiers `/src/i18n/locales/`
- [ ] Configurer i18next dans `main.tsx`
- [ ] Creer `LanguageSwitcher` composant
- [ ] Ajouter selecteur langue dans Settings et Header

**Backend:**
- [ ] Creer module `/app/i18n/`
- [ ] Creer classe `Translator`
- [ ] Creer dossier `/app/agents/prompts/`
- [ ] Ajouter `preferred_language` au modele User
- [ ] Migration Alembic

### Phase 2 : Extraction Chaines (3 jours)

**Frontend:**
- [ ] Extraire toutes les chaines des Pages (9 fichiers)
- [ ] Extraire chaines des Composants (28 fichiers)
- [ ] Migrer constantes des Types (5 fichiers)
- [ ] Creer fichiers JSON anglais (langue de base)
- [ ] Creer fichiers JSON francais (copie actuelle)

**Backend:**
- [ ] Extraire prompts agents vers fichiers `.txt`
- [ ] Extraire messages erreur vers `en.json`/`fr.json`
- [ ] Mettre a jour agents pour utiliser `load_prompt()`

### Phase 3 : Integration Composants (4 jours)

- [ ] Wrapper chaque composant avec `useTranslation()`
- [ ] Remplacer textes hardcodes par `t('key')`
- [ ] Tester chaque page en EN et FR
- [ ] Verifier interpolations (variables dans textes)

### Phase 4 : Traductions (3 jours)

Utiliser un service de traduction (DeepL API, Google Translate API, ou manuel):

- [ ] Allemand (de)
- [ ] Espagnol (es)
- [ ] Portugais (pt)
- [ ] Chinois (zh)
- [ ] Arabe (ar)

**Estimation** : ~1,200 chaines x 5 nouvelles langues = 6,000 traductions

### Phase 5 : Support RTL + Tests (2 jours)

- [ ] Installer `tailwindcss-rtl`
- [ ] Ajuster layouts pour RTL
- [ ] Tester interface arabe
- [ ] Tests E2E toutes langues

### Phase 6 : Deploy + QA (1 jour)

- [ ] Deploy staging
- [ ] Tests utilisateurs
- [ ] Corrections bugs
- [ ] Deploy production

---

## 7. Estimation Temps Total

| Phase | Duree | Effort |
|-------|-------|--------|
| Infrastructure | 2 jours | Backend + Frontend setup |
| Extraction | 3 jours | Tedieux mais simple |
| Integration | 4 jours | Le plus long |
| Traductions | 3 jours | Peut etre parallelise |
| RTL + Tests | 2 jours | Arabe specifique |
| Deploy | 1 jour | Validation finale |
| **TOTAL** | **15 jours** | ~2-3 semaines |

---

## 8. Outils Recommandes

### 8.1 Traduction

| Outil | Usage | Cout |
|-------|-------|------|
| DeepL API | Traduction auto haute qualite | 5.49€/M caracteres |
| Google Translate API | Alternative moins chere | 20$/M caracteres |
| Crowdin | Gestion traductions collaborative | Gratuit open source |
| i18next-parser | Extraction auto des clefs | Gratuit |

### 8.2 Validation

```bash
# Verifier les clefs manquantes
npx i18next-parser

# Linter pour JSON
npm install -D eslint-plugin-i18n-json
```

---

## 9. Fichiers de Traduction - Structure

### 9.1 common.json (UI partagee)

```json
{
  "loading": "Loading...",
  "error": "An error occurred",
  "save": "Save",
  "cancel": "Cancel",
  "delete": "Delete",
  "edit": "Edit",
  "confirm": "Confirm",
  "back": "Back",
  "next": "Next",
  "submit": "Submit",
  "search": "Search",
  "noResults": "No results found",
  "yes": "Yes",
  "no": "No"
}
```

### 9.2 auth.json

```json
{
  "login": {
    "title": "Welcome back!",
    "subtitle": "Sign in to continue",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot password?",
    "signIn": "Sign in",
    "noAccount": "Don't have an account?",
    "createAccount": "Create account",
    "orContinueWith": "Or continue with"
  },
  "register": {
    "title": "Create account",
    "subtitle": "Start your nutrition journey",
    "name": "Full name",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm password",
    "terms": "I agree to the Terms of Service",
    "privacy": "Privacy Policy",
    "signUp": "Sign up",
    "hasAccount": "Already have an account?"
  },
  "errors": {
    "invalidCredentials": "Invalid email or password",
    "emailExists": "This email is already registered",
    "weakPassword": "Password must be at least 8 characters",
    "passwordMismatch": "Passwords do not match"
  }
}
```

### 9.3 dashboard.json

```json
{
  "greeting": {
    "morning": "Good morning",
    "afternoon": "Good afternoon",
    "evening": "Good evening"
  },
  "stats": {
    "calories": "Calories",
    "protein": "Protein",
    "carbs": "Carbs",
    "fat": "Fat",
    "water": "Water",
    "remaining": "remaining",
    "consumed": "consumed"
  },
  "streak": {
    "logging": "Tracking",
    "activity": "Activity",
    "water": "Hydration",
    "calories": "Calories",
    "days": "days"
  },
  "level": {
    "1": "Beginner",
    "2": "Apprentice",
    "3": "Initiate",
    "4": "Regular",
    "5": "Confirmed",
    "6": "Expert",
    "7": "Master",
    "8": "Champion",
    "9": "Legend",
    "10": "Fitness God"
  },
  "quickActions": {
    "scan": "Scan meal",
    "water": "Log water",
    "weight": "Log weight",
    "activity": "Log activity"
  }
}
```

---

## 10. Checklist Finale

### Pre-Implementation
- [ ] Valider architecture avec l'equipe
- [ ] Choisir outil de traduction
- [ ] Definir glossaire termes techniques (calories, macros, etc.)

### Implementation
- [ ] Phase 1: Infrastructure
- [ ] Phase 2: Extraction
- [ ] Phase 3: Integration
- [ ] Phase 4: Traductions
- [ ] Phase 5: RTL
- [ ] Phase 6: Deploy

### Post-Implementation
- [ ] Documentation pour ajout nouvelles langues
- [ ] Workflow pour mise a jour traductions
- [ ] Monitoring erreurs i18n (clefs manquantes)

---

## 11. Commandes de Demarrage

```bash
# Frontend - Installation
cd frontend
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
npm install -D i18next-parser

# Backend - Aucune installation requise (JSON natif Python)

# Extraction automatique des clefs (apres migration)
npx i18next-parser
```

---

*Ce plan permet une implementation progressive et testable de l'internationalisation.*
