/**
 * Service API pour recherche nutritionnelle avec cache LRU intelligent.
 *
 * Workflow optimisé :
 * 1. Cache LRU en mémoire (0ms) - évite les appels répétés
 * 2. USDA FoodData Central API (300k aliments)
 * 3. Agent LLM Nutrition (HuggingFace)
 * 4. not_found → activation automatique mode manuel frontend
 *
 * Améliorations Phase 1:
 * - Cache LRU avec TTL de 5 minutes
 * - Debounce réduit à 300ms (dans les composants)
 * - Gestion automatique de not_found
 */

import { api } from './api'

export interface NutritionSearchRequest {
  food_name: string
  quantity_g: number
  context?: string
  language?: string  // ISO code: en, fr, ar, de, es, pt, zh
}

export interface NutritionSearchResponse {
  found: boolean
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  source: 'usda' | 'llm' | 'not_found'
  confidence: number
  portion_size_g: number
}

// ==========================================
// LRU Cache Implementation
// ==========================================

interface CacheEntry {
  data: NutritionSearchResponse
  timestamp: number
}

class NutritionLRUCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly maxSize: number
  private readonly ttlMs: number

  constructor(maxSize = 100, ttlMinutes = 5) {
    this.maxSize = maxSize
    this.ttlMs = ttlMinutes * 60 * 1000
  }

  /**
   * Génère une clé unique pour une requête
   */
  private generateKey(request: NutritionSearchRequest): string {
    const normalizedName = request.food_name.toLowerCase().trim()
    return `${normalizedName}|${request.quantity_g}|${request.language || 'en'}`
  }

  /**
   * Vérifie si une entrée est expirée
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.ttlMs
  }

  /**
   * Récupère une entrée du cache
   */
  get(request: NutritionSearchRequest): NutritionSearchResponse | null {
    const key = this.generateKey(request)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    // LRU: move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.data
  }

  /**
   * Ajoute une entrée au cache
   */
  set(request: NutritionSearchRequest, data: NutritionSearchResponse): void {
    const key = this.generateKey(request)

    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Efface le cache (utile pour tests ou refresh forcé)
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Retourne les stats du cache (pour debugging)
   */
  getStats(): { size: number; maxSize: number; ttlMs: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttlMs: this.ttlMs,
    }
  }
}

// Instance singleton du cache
const nutritionCache = new NutritionLRUCache(100, 5)

// Export pour tests et debugging
export { nutritionCache }

// ==========================================
// API Functions
// ==========================================

/**
 * Recherche les informations nutritionnelles pour un aliment.
 * Utilise d'abord le cache LRU, puis l'API si non trouvé.
 *
 * @param request - Nom de l'aliment, quantité, contexte optionnel
 * @returns Informations nutritionnelles ou not_found
 */
export async function searchNutrition(
  request: NutritionSearchRequest
): Promise<NutritionSearchResponse> {
  // 1. Check cache first (0ms)
  const cached = nutritionCache.get(request)
  if (cached) {
    console.log('[NutritionCache] HIT:', request.food_name)
    return cached
  }

  console.log('[NutritionCache] MISS:', request.food_name)

  // 2. Call API
  const response = await api.post<NutritionSearchResponse>(
    '/nutrition/search',
    request
  )

  // 3. Cache the result (even not_found to avoid repeated calls)
  nutritionCache.set(request, response.data)

  return response.data
}

/**
 * Recherche avec cache - version explicite
 * (Alias pour clarté dans le code)
 */
export const searchNutritionCached = searchNutrition

/**
 * Recherche sans cache (force un appel API frais)
 */
export async function searchNutritionFresh(
  request: NutritionSearchRequest
): Promise<NutritionSearchResponse> {
  const response = await api.post<NutritionSearchResponse>(
    '/nutrition/search',
    request
  )

  // Update cache with fresh data
  nutritionCache.set(request, response.data)

  return response.data
}

/**
 * Efface le cache nutrition (utile après changement de langue par exemple)
 */
export function clearNutritionCache(): void {
  nutritionCache.clear()
  console.log('[NutritionCache] Cleared')
}

// ==========================================
// Translation API (NLLB-200)
// ==========================================

export interface TranslationRequest {
  text: string
  source_lang: string  // ISO code: en, fr, ar, de, es, pt, zh
  target_lang?: string // Default: en
}

export interface TranslationResponse {
  original: string
  translated: string
  source_lang: string
  target_lang: string
  from_cache?: boolean
}

export interface FoodTranslationRequest {
  food_name: string
  language: string  // ISO code: en, fr, ar, de, es, pt, zh
}

export interface SupportedLanguagesResponse {
  languages: Record<string, string>
  cache_stats: {
    size: number
    languages_cached: string[]
  }
}

/**
 * Traduit un texte d'une langue vers une autre avec NLLB-200.
 *
 * NLLB-200 (No Language Left Behind) est un modèle de traduction de Facebook/Meta
 * spécialisé pour la traduction haute qualité entre 200 langues.
 *
 * @param request - Texte à traduire, langue source et cible
 * @returns Texte traduit avec métadonnées
 */
export async function translateText(
  request: TranslationRequest
): Promise<TranslationResponse> {
  const response = await api.post<TranslationResponse>(
    '/nutrition/translate',
    request
  )
  return response.data
}

/**
 * Traduit un nom d'aliment vers l'anglais pour recherche USDA/OFF.
 *
 * Utilise NLLB-200 pour les langues nécessitant traduction (zh, ar)
 * et retourne l'original pour les langues supportées nativement par USDA/OFF.
 *
 * @param request - Nom de l'aliment et langue source
 * @returns Nom traduit en anglais
 */
export async function translateFoodToEnglish(
  request: FoodTranslationRequest
): Promise<TranslationResponse> {
  const response = await api.post<TranslationResponse>(
    '/nutrition/translate/food',
    request
  )
  return response.data
}

/**
 * Retourne les langues supportées par le service de traduction NLLB-200.
 *
 * @returns Liste des langues avec leurs codes NLLB et statistiques du cache
 */
export async function getSupportedLanguages(): Promise<SupportedLanguagesResponse> {
  const response = await api.get<SupportedLanguagesResponse>(
    '/nutrition/translate/languages'
  )
  return response.data
}

// ==========================================
// Utility: Check if translation needed
// ==========================================

/**
 * Langues qui nécessitent traduction pour recherche USDA/OFF.
 * zh (Chinois) et ar (Arabe) ne sont pas supportées nativement.
 */
export const LANGUAGES_REQUIRING_TRANSLATION = ['zh', 'ar']

/**
 * Vérifie si une langue nécessite traduction vers l'anglais.
 *
 * @param language - Code langue ISO
 * @returns true si traduction nécessaire (zh, ar)
 */
export function needsTranslation(language: string): boolean {
  return LANGUAGES_REQUIRING_TRANSLATION.includes(language.toLowerCase())
}
