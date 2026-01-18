/**
 * Service de recherche nutritionnelle hybride multi-couche
 *
 * Architecture optimisée (corrigée):
 * 1. COUCHE 0: Base statique bundlée (500+ aliments, 0ms)
 * 2. COUCHE 1: IndexedDB local (0-5ms) avec validation
 * 3. COUCHE 2: Cache LRU mémoire (résultats API uniquement)
 * 4. COUCHE 3: Traduction HuggingFace (si nécessaire)
 * 5. COUCHE 4: API waterfall (USDA → OFF → LLM) avec validation
 *
 * Debounce adaptatif: 150ms local, 800ms API
 */

import {
  STATIC_FOODS,
  searchStaticFoodByName,
  calculateNutritionFromStatic
} from '@/data/nutrition-static'

import {
  nutritionDB,
  findFoodWithFallback,
  searchFoods as searchIndexedDB,
  upsertFood,
  validateNutritionData,
  type NutritionEntry
} from './nutritionDB'

import { searchNutrition, nutritionCache } from './nutritionApi'

// ==========================================
// Types
// ==========================================

export interface NutritionResult {
  found: boolean
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  source: 'static' | 'indexeddb' | 'cache' | 'usda' | 'off' | 'llm' | 'not_found'
  confidence: number
  portion_size_g: number
  /** Temps de réponse en ms */
  responseTime: number
}

export interface SearchSuggestion {
  name: string
  nameLocalized: string
  source: 'static' | 'indexeddb'
  confidence: number
}

// ==========================================
// Configuration
// ==========================================

const CONFIG = {
  /** Debounce pour recherche locale (statique + IndexedDB) */
  LOCAL_DEBOUNCE_MS: 150,
  /** Debounce pour recherche API */
  API_DEBOUNCE_MS: 800,
  /** Nombre max de suggestions autocomplete */
  MAX_SUGGESTIONS: 10,
  /** Confiance minimum pour enrichissement IndexedDB */
  MIN_CONFIDENCE_FOR_ENRICHMENT: 0.75,
  /** Langues qui nécessitent traduction vers EN pour l'API */
  TRANSLATE_LANGUAGES: ['zh', 'ar'],
  /** Langues supportées nativement par USDA/OFF */
  NATIVE_API_LANGUAGES: ['en', 'fr', 'de', 'es', 'pt']
}

// ==========================================
// Initialisation - Chargement base statique dans IndexedDB
// ==========================================

let staticLoaded = false

/**
 * Charge la base statique dans IndexedDB au premier lancement
 * Cette opération est idempotente (ne duplique pas les données)
 */
export async function initializeStaticDatabase(): Promise<void> {
  if (staticLoaded) return

  try {
    // Vérifier si déjà initialisé
    const existingCount = await nutritionDB.foods
      .where('source')
      .equals('static')
      .count()

    if (existingCount >= Object.keys(STATIC_FOODS).length * 0.9) {
      console.log('[NutritionSearch] Base statique déjà chargée:', existingCount, 'entrées')
      staticLoaded = true
      return
    }

    console.log('[NutritionSearch] Chargement de la base statique...')

    // Charger tous les aliments statiques dans IndexedDB
    const entries: Omit<NutritionEntry, 'id' | 'createdAt' | 'usageCount'>[] = []

    for (const [_key, food] of Object.entries(STATIC_FOODS)) {
      // Ajouter pour chaque langue disponible
      for (const [lang, name] of Object.entries(food.names)) {
        if (name) {
          entries.push({
            name: name.toLowerCase(),
            language: lang,
            calories: food.cal,
            protein: food.p,
            carbs: food.c,
            fat: food.f,
            fiber: food.fi,
            source: 'static',
            confidence: 1.0 // Confiance maximale pour données vérifiées
          })
        }
      }
    }

    // Bulk insert (plus rapide)
    await nutritionDB.foods.bulkPut(
      entries.map(e => ({
        ...e,
        createdAt: new Date(),
        usageCount: 0
      }))
    )

    console.log('[NutritionSearch] Base statique chargée:', entries.length, 'entrées')
    staticLoaded = true
  } catch (error) {
    console.error('[NutritionSearch] Erreur chargement base statique:', error)
  }
}

// ==========================================
// Recherche hybride principale
// ==========================================

/**
 * Recherche nutritionnelle hybride multi-couche
 *
 * @param foodName Nom de l'aliment
 * @param quantityG Quantité en grammes
 * @param language Code langue ISO (fr, en, de, es, pt, zh, ar)
 * @returns Résultat nutritionnel avec source et confiance
 */
export async function searchNutritionHybrid(
  foodName: string,
  quantityG: number,
  language: string = 'en'
): Promise<NutritionResult> {
  const startTime = performance.now()
  const normalizedName = foodName.toLowerCase().trim()

  // S'assurer que la base statique est initialisée
  await initializeStaticDatabase()

  // ==========================================
  // COUCHE 0: Base statique (0ms)
  // ==========================================
  const staticResults = searchStaticFoodByName(normalizedName, language, 1)
  if (staticResults.length > 0) {
    const { entry } = staticResults[0]
    const nutrition = calculateNutritionFromStatic(entry, quantityG)

    return {
      found: true,
      food_name: entry.names[language as keyof typeof entry.names] || entry.names.en,
      ...nutrition,
      source: 'static',
      confidence: 1.0,
      portion_size_g: quantityG,
      responseTime: performance.now() - startTime
    }
  }

  // ==========================================
  // COUCHE 1: IndexedDB local (0-5ms)
  // ==========================================
  const indexedDBResult = await findFoodWithFallback(normalizedName, language)
  if (indexedDBResult) {
    const factor = quantityG / 100

    return {
      found: true,
      food_name: indexedDBResult.name,
      calories: Math.round(indexedDBResult.calories * factor),
      protein: Math.round(indexedDBResult.protein * factor * 10) / 10,
      carbs: Math.round(indexedDBResult.carbs * factor * 10) / 10,
      fat: Math.round(indexedDBResult.fat * factor * 10) / 10,
      fiber: Math.round(indexedDBResult.fiber * factor * 10) / 10,
      source: 'indexeddb',
      confidence: indexedDBResult.confidence,
      portion_size_g: quantityG,
      responseTime: performance.now() - startTime
    }
  }

  // ==========================================
  // COUCHE 2: Cache LRU API (0ms si hit)
  // ==========================================
  const cacheKey = { food_name: normalizedName, quantity_g: quantityG, language }
  const cached = nutritionCache.get(cacheKey)
  if (cached && cached.found) {
    return {
      found: true,
      food_name: cached.food_name,
      calories: cached.calories,
      protein: cached.protein,
      carbs: cached.carbs,
      fat: cached.fat,
      fiber: cached.fiber,
      source: 'cache',
      confidence: cached.confidence,
      portion_size_g: cached.portion_size_g,
      responseTime: performance.now() - startTime
    }
  }

  // ==========================================
  // COUCHE 3 & 4: API avec traduction si nécessaire
  // ==========================================
  try {
    // Note: La traduction sera gérée côté backend pour éviter
    // les appels API supplémentaires côté client
    // Le backend utilisera HuggingFace NLLB-200 pour traduire
    // les langues non supportées (zh, ar) vers l'anglais

    // Appel API (USDA → OFF → LLM en cascade côté backend)
    const apiResult = await searchNutrition({
      food_name: normalizedName,
      quantity_g: quantityG,
      language: language
    })

    // Valider et enrichir IndexedDB si résultat fiable
    if (apiResult.found && apiResult.confidence >= CONFIG.MIN_CONFIDENCE_FOR_ENRICHMENT) {
      const validationEntry = {
        calories: apiResult.calories / (quantityG / 100),
        protein: apiResult.protein / (quantityG / 100),
        carbs: apiResult.carbs / (quantityG / 100),
        fat: apiResult.fat / (quantityG / 100),
        confidence: apiResult.confidence
      }

      if (validateNutritionData(validationEntry)) {
        // Enrichir IndexedDB pour les prochaines recherches
        await upsertFood({
          name: normalizedName,
          language,
          calories: Math.round(apiResult.calories / (quantityG / 100)),
          protein: Math.round(apiResult.protein / (quantityG / 100) * 10) / 10,
          carbs: Math.round(apiResult.carbs / (quantityG / 100) * 10) / 10,
          fat: Math.round(apiResult.fat / (quantityG / 100) * 10) / 10,
          fiber: Math.round(apiResult.fiber / (quantityG / 100) * 10) / 10,
          source: apiResult.source as 'usda' | 'off' | 'llm',
          confidence: apiResult.confidence
        })
      }
    }

    return {
      found: apiResult.found,
      food_name: apiResult.food_name,
      calories: apiResult.calories,
      protein: apiResult.protein,
      carbs: apiResult.carbs,
      fat: apiResult.fat,
      fiber: apiResult.fiber,
      source: apiResult.source as NutritionResult['source'],
      confidence: apiResult.confidence,
      portion_size_g: apiResult.portion_size_g,
      responseTime: performance.now() - startTime
    }
  } catch (error) {
    console.error('[NutritionSearch] Erreur API:', error)

    // Fallback: retourner not_found
    return {
      found: false,
      food_name: normalizedName,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      source: 'not_found',
      confidence: 0,
      portion_size_g: quantityG,
      responseTime: performance.now() - startTime
    }
  }
}

// ==========================================
// Autocomplete / Suggestions
// ==========================================

/**
 * Recherche des suggestions pour l'autocomplete
 * Utilise uniquement les couches locales (0-5ms)
 *
 * @param query Terme de recherche
 * @param language Code langue
 * @returns Liste de suggestions triées par pertinence
 */
export async function searchSuggestions(
  query: string,
  language: string = 'en'
): Promise<SearchSuggestion[]> {
  if (query.length < 2) return []

  await initializeStaticDatabase()

  const suggestions: SearchSuggestion[] = []
  const seen = new Set<string>()

  // 1. Base statique
  const staticResults = searchStaticFoodByName(query, language, CONFIG.MAX_SUGGESTIONS)
  for (const { entry } of staticResults) {
    const name = entry.names.en
    const nameLocalized = entry.names[language as keyof typeof entry.names] || entry.names.en

    if (!seen.has(name)) {
      seen.add(name)
      suggestions.push({
        name,
        nameLocalized,
        source: 'static',
        confidence: 1.0
      })
    }
  }

  // 2. IndexedDB (aliments enrichis)
  if (suggestions.length < CONFIG.MAX_SUGGESTIONS) {
    const indexedResults = await searchIndexedDB(
      query,
      language,
      CONFIG.MAX_SUGGESTIONS - suggestions.length
    )

    for (const entry of indexedResults) {
      if (!seen.has(entry.name)) {
        seen.add(entry.name)
        suggestions.push({
          name: entry.name,
          nameLocalized: entry.name,
          source: 'indexeddb',
          confidence: entry.confidence
        })
      }
    }
  }

  return suggestions.slice(0, CONFIG.MAX_SUGGESTIONS)
}

// ==========================================
// Utilitaires
// ==========================================

/**
 * Vérifie si une langue nécessite une traduction pour l'API
 */
export function languageNeedsTranslation(language: string): boolean {
  return CONFIG.TRANSLATE_LANGUAGES.includes(language)
}

/**
 * Retourne les statistiques du système de recherche
 */
export async function getSearchStats(): Promise<{
  staticCount: number
  indexedDBCount: number
  cacheStats: { size: number; maxSize: number }
}> {
  const indexedDBCount = await nutritionDB.foods.count()
  const cacheStats = nutritionCache.getStats()

  return {
    staticCount: Object.keys(STATIC_FOODS).length,
    indexedDBCount,
    cacheStats: {
      size: cacheStats.size,
      maxSize: cacheStats.maxSize
    }
  }
}

/**
 * Nettoie les données obsolètes (à appeler périodiquement)
 */
export async function cleanupOldData(): Promise<void> {
  // Nettoyer les entrées de faible qualité dans IndexedDB
  const { cleanupLowQualityEntries } = await import('./nutritionDB')
  await cleanupLowQualityEntries()

  // Le cache LRU se nettoie automatiquement (TTL)
}

// ==========================================
// Hook de debounce adaptatif
// ==========================================

/**
 * Retourne le délai de debounce optimal selon la source probable
 */
export function getOptimalDebounce(query: string, language: string): number {
  // Recherche courte = probablement dans la base statique
  if (query.length <= 3) {
    return CONFIG.LOCAL_DEBOUNCE_MS
  }

  // Vérifier rapidement si match statique probable
  const hasStaticMatch = searchStaticFoodByName(query, language, 1).length > 0
  if (hasStaticMatch) {
    return CONFIG.LOCAL_DEBOUNCE_MS
  }

  // Sinon, debounce plus long pour éviter les appels API inutiles
  return CONFIG.API_DEBOUNCE_MS
}
