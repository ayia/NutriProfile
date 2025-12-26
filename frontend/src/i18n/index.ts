import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations
import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'
import enDashboard from './locales/en/dashboard.json'
import enTracking from './locales/en/tracking.json'
import enVision from './locales/en/vision.json'
import enRecipes from './locales/en/recipes.json'
import enOnboarding from './locales/en/onboarding.json'
import enSettings from './locales/en/settings.json'
import enHome from './locales/en/home.json'

import frCommon from './locales/fr/common.json'
import frAuth from './locales/fr/auth.json'
import frDashboard from './locales/fr/dashboard.json'
import frTracking from './locales/fr/tracking.json'
import frVision from './locales/fr/vision.json'
import frRecipes from './locales/fr/recipes.json'
import frOnboarding from './locales/fr/onboarding.json'
import frSettings from './locales/fr/settings.json'
import frHome from './locales/fr/home.json'

import deCommon from './locales/de/common.json'
import deAuth from './locales/de/auth.json'
import deDashboard from './locales/de/dashboard.json'
import deTracking from './locales/de/tracking.json'
import deVision from './locales/de/vision.json'
import deRecipes from './locales/de/recipes.json'
import deOnboarding from './locales/de/onboarding.json'
import deSettings from './locales/de/settings.json'
import deHome from './locales/de/home.json'

import esCommon from './locales/es/common.json'
import esAuth from './locales/es/auth.json'
import esDashboard from './locales/es/dashboard.json'
import esTracking from './locales/es/tracking.json'
import esVision from './locales/es/vision.json'
import esRecipes from './locales/es/recipes.json'
import esOnboarding from './locales/es/onboarding.json'
import esSettings from './locales/es/settings.json'
import esHome from './locales/es/home.json'

import ptCommon from './locales/pt/common.json'
import ptAuth from './locales/pt/auth.json'
import ptDashboard from './locales/pt/dashboard.json'
import ptTracking from './locales/pt/tracking.json'
import ptVision from './locales/pt/vision.json'
import ptRecipes from './locales/pt/recipes.json'
import ptOnboarding from './locales/pt/onboarding.json'
import ptSettings from './locales/pt/settings.json'
import ptHome from './locales/pt/home.json'

import zhCommon from './locales/zh/common.json'
import zhAuth from './locales/zh/auth.json'
import zhDashboard from './locales/zh/dashboard.json'
import zhTracking from './locales/zh/tracking.json'
import zhVision from './locales/zh/vision.json'
import zhRecipes from './locales/zh/recipes.json'
import zhOnboarding from './locales/zh/onboarding.json'
import zhSettings from './locales/zh/settings.json'
import zhHome from './locales/zh/home.json'

import arCommon from './locales/ar/common.json'
import arAuth from './locales/ar/auth.json'
import arDashboard from './locales/ar/dashboard.json'
import arTracking from './locales/ar/tracking.json'
import arVision from './locales/ar/vision.json'
import arRecipes from './locales/ar/recipes.json'
import arOnboarding from './locales/ar/onboarding.json'
import arSettings from './locales/ar/settings.json'
import arHome from './locales/ar/home.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', dir: 'ltr' },
  { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    tracking: enTracking,
    vision: enVision,
    recipes: enRecipes,
    onboarding: enOnboarding,
    settings: enSettings,
    home: enHome,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    dashboard: frDashboard,
    tracking: frTracking,
    vision: frVision,
    recipes: frRecipes,
    onboarding: frOnboarding,
    settings: frSettings,
    home: frHome,
  },
  de: {
    common: deCommon,
    auth: deAuth,
    dashboard: deDashboard,
    tracking: deTracking,
    vision: deVision,
    recipes: deRecipes,
    onboarding: deOnboarding,
    settings: deSettings,
    home: deHome,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    dashboard: esDashboard,
    tracking: esTracking,
    vision: esVision,
    recipes: esRecipes,
    onboarding: esOnboarding,
    settings: esSettings,
    home: esHome,
  },
  pt: {
    common: ptCommon,
    auth: ptAuth,
    dashboard: ptDashboard,
    tracking: ptTracking,
    vision: ptVision,
    recipes: ptRecipes,
    onboarding: ptOnboarding,
    settings: ptSettings,
    home: ptHome,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    dashboard: zhDashboard,
    tracking: zhTracking,
    vision: zhVision,
    recipes: zhRecipes,
    onboarding: zhOnboarding,
    settings: zhSettings,
    home: zhHome,
  },
  ar: {
    common: arCommon,
    auth: arAuth,
    dashboard: arDashboard,
    tracking: arTracking,
    vision: arVision,
    recipes: arRecipes,
    onboarding: arOnboarding,
    settings: arSettings,
    home: arHome,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    ns: ['common', 'auth', 'dashboard', 'tracking', 'vision', 'recipes', 'onboarding', 'settings', 'home'],
    defaultNS: 'common',
  })

// Update document direction when language changes
i18n.on('languageChanged', (lng) => {
  const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === lng)
  document.documentElement.dir = langConfig?.dir || 'ltr'
  document.documentElement.lang = lng
})

export default i18n
