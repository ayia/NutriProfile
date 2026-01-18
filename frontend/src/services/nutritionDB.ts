/**
 * Service de base de données nutritionnelle locale avec IndexedDB (Dexie.js)
 *
 * Architecture multi-couche optimisée:
 * - Couche 0: Base statique bundlée (500 aliments, ~250KB)
 * - Couche 1: IndexedDB pour enrichissement progressif
 * - Validation avant enrichissement (confiance > 0.75, cohérence macros)
 *
 * Supporte 7 langues: FR, EN, DE, ES, PT, ZH, AR
 */

import Dexie, { type Table } from 'dexie'

// ==========================================
// Types
// ==========================================

export interface NutritionEntry {
  id?: number
  /** Nom normalisé (lowercase, trimmed) */
  name: string
  /** Code langue ISO (fr, en, de, es, pt, zh, ar) */
  language: string
  /** Calories pour 100g */
  calories: number
  /** Protéines en g pour 100g */
  protein: number
  /** Glucides en g pour 100g */
  carbs: number
  /** Lipides en g pour 100g */
  fat: number
  /** Fibres en g pour 100g */
  fiber: number
  /** Source: static (bundlé), usda, off, llm, user */
  source: 'static' | 'usda' | 'off' | 'llm' | 'user'
  /** Score de confiance 0-1 */
  confidence: number
  /** Date d'ajout */
  createdAt: Date
  /** Nombre de fois utilisé */
  usageCount: number
}

export interface TranslationEntry {
  id?: number
  /** Terme original */
  originalTerm: string
  /** Langue source */
  fromLang: string
  /** Langue cible */
  toLang: string
  /** Terme traduit */
  translatedTerm: string
  /** Date de cache */
  createdAt: Date
}

// ==========================================
// Database Schema
// ==========================================

class NutritionDatabase extends Dexie {
  foods!: Table<NutritionEntry>
  translations!: Table<TranslationEntry>

  constructor() {
    super('NutriProfileDB')

    this.version(1).stores({
      // Index composé pour recherche rapide par nom+langue
      foods: '++id, [name+language], name, language, source, confidence, usageCount',
      // Index pour cache traduction
      translations: '++id, [originalTerm+fromLang+toLang], createdAt'
    })
  }
}

// Instance singleton
export const nutritionDB = new NutritionDatabase()

// ==========================================
// Validation des données nutritionnelles
// ==========================================

/**
 * Valide la cohérence des données nutritionnelles
 * Règles:
 * - Calories ≈ 4*protein + 4*carbs + 9*fat (±20%)
 * - Valeurs dans plages réalistes
 */
export function validateNutritionData(entry: Partial<NutritionEntry>): boolean {
  const { calories, protein, carbs, fat, confidence } = entry

  // Toutes les valeurs doivent être définies
  if (
    calories === undefined ||
    protein === undefined ||
    carbs === undefined ||
    fat === undefined
  ) {
    return false
  }

  // Confiance minimum 0.75
  if (confidence !== undefined && confidence < 0.75) {
    return false
  }

  // Plages réalistes (pour 100g)
  if (calories < 0 || calories > 900) return false // Max: huile pure ~900 kcal
  if (protein < 0 || protein > 100) return false
  if (carbs < 0 || carbs > 100) return false
  if (fat < 0 || fat > 100) return false

  // Cohérence calories vs macros (±25% de tolérance)
  const calculatedCalories = protein * 4 + carbs * 4 + fat * 9
  const tolerance = 0.25
  const minExpected = calculatedCalories * (1 - tolerance)
  const maxExpected = calculatedCalories * (1 + tolerance)

  if (calories < minExpected || calories > maxExpected) {
    console.warn(
      `[NutritionDB] Validation échouée: calories ${calories} vs calculé ${calculatedCalories.toFixed(0)}`
    )
    return false
  }

  return true
}

// ==========================================
// CRUD Operations
// ==========================================

/**
 * Recherche un aliment par nom et langue
 */
export async function findFood(
  name: string,
  language: string
): Promise<NutritionEntry | undefined> {
  const normalizedName = name.toLowerCase().trim()

  const result = await nutritionDB.foods
    .where('[name+language]')
    .equals([normalizedName, language])
    .first()

  // Incrémenter le compteur d'usage si trouvé
  if (result?.id) {
    await nutritionDB.foods.update(result.id, {
      usageCount: (result.usageCount || 0) + 1
    })
  }

  return result
}

/**
 * Recherche avec fallback sur anglais si non trouvé dans la langue demandée
 */
export async function findFoodWithFallback(
  name: string,
  language: string
): Promise<NutritionEntry | undefined> {
  // 1. Chercher dans la langue demandée
  let result = await findFood(name, language)
  if (result) return result

  // 2. Fallback sur anglais
  if (language !== 'en') {
    result = await findFood(name, 'en')
    if (result) return result
  }

  // 3. Recherche floue (commence par)
  const normalizedName = name.toLowerCase().trim()
  const fuzzyResults = await nutritionDB.foods
    .where('name')
    .startsWith(normalizedName)
    .filter(f => f.language === language || f.language === 'en')
    .sortBy('confidence')

  return fuzzyResults[fuzzyResults.length - 1] // Meilleure confiance
}

/**
 * Recherche multiple (autocomplete)
 */
export async function searchFoods(
  query: string,
  language: string,
  limit: number = 10
): Promise<NutritionEntry[]> {
  const normalizedQuery = query.toLowerCase().trim()

  if (normalizedQuery.length < 2) return []

  // Recherche par préfixe
  const results = await nutritionDB.foods
    .where('name')
    .startsWith(normalizedQuery)
    .filter(f => f.language === language || f.language === 'en')
    .limit(limit * 2) // Prendre plus pour filtrer
    .toArray()

  // Trier par usage puis confiance, limiter
  return results
    .sort((a, b) => {
      // Prioriser la langue exacte
      if (a.language === language && b.language !== language) return -1
      if (b.language === language && a.language !== language) return 1
      // Puis par usage
      if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount
      // Puis par confiance
      return b.confidence - a.confidence
    })
    .slice(0, limit)
}

/**
 * Ajoute ou met à jour un aliment avec validation
 */
export async function upsertFood(
  entry: Omit<NutritionEntry, 'id' | 'createdAt' | 'usageCount'>
): Promise<number | null> {
  // Valider avant insertion
  if (!validateNutritionData(entry)) {
    console.warn('[NutritionDB] Rejet aliment invalide:', entry.name)
    return null
  }

  const normalizedName = entry.name.toLowerCase().trim()

  // Vérifier si existe déjà
  const existing = await nutritionDB.foods
    .where('[name+language]')
    .equals([normalizedName, entry.language])
    .first()

  if (existing?.id) {
    // Mettre à jour seulement si meilleure confiance
    if (entry.confidence > existing.confidence) {
      await nutritionDB.foods.update(existing.id, {
        ...entry,
        name: normalizedName,
        usageCount: existing.usageCount + 1
      })
      console.log(`[NutritionDB] MAJ: ${entry.name} (${entry.language})`)
    }
    return existing.id
  }

  // Nouvelle entrée
  const id = await nutritionDB.foods.add({
    ...entry,
    name: normalizedName,
    createdAt: new Date(),
    usageCount: 1
  })

  console.log(`[NutritionDB] Ajouté: ${entry.name} (${entry.language})`)
  return id
}

// ==========================================
// Cache Traduction
// ==========================================

/**
 * Récupère une traduction du cache
 */
export async function getCachedTranslation(
  term: string,
  fromLang: string,
  toLang: string
): Promise<string | null> {
  const result = await nutritionDB.translations
    .where('[originalTerm+fromLang+toLang]')
    .equals([term.toLowerCase(), fromLang, toLang])
    .first()

  return result?.translatedTerm || null
}

/**
 * Cache une traduction
 */
export async function cacheTranslation(
  originalTerm: string,
  fromLang: string,
  toLang: string,
  translatedTerm: string
): Promise<void> {
  const existing = await nutritionDB.translations
    .where('[originalTerm+fromLang+toLang]')
    .equals([originalTerm.toLowerCase(), fromLang, toLang])
    .first()

  if (!existing) {
    await nutritionDB.translations.add({
      originalTerm: originalTerm.toLowerCase(),
      fromLang,
      toLang,
      translatedTerm: translatedTerm.toLowerCase(),
      createdAt: new Date()
    })
  }
}

// ==========================================
// Statistiques & Maintenance
// ==========================================

/**
 * Statistiques de la base
 */
export async function getDBStats(): Promise<{
  totalFoods: number
  byLanguage: Record<string, number>
  bySource: Record<string, number>
  translationsCount: number
}> {
  const foods = await nutritionDB.foods.toArray()
  const translations = await nutritionDB.translations.count()

  const byLanguage: Record<string, number> = {}
  const bySource: Record<string, number> = {}

  foods.forEach(f => {
    byLanguage[f.language] = (byLanguage[f.language] || 0) + 1
    bySource[f.source] = (bySource[f.source] || 0) + 1
  })

  return {
    totalFoods: foods.length,
    byLanguage,
    bySource,
    translationsCount: translations
  }
}

/**
 * Nettoie les entrées de faible qualité (confiance < 0.6, non utilisées depuis 90 jours)
 */
export async function cleanupLowQualityEntries(): Promise<number> {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const toDelete = await nutritionDB.foods
    .filter(f =>
      f.source !== 'static' && // Ne jamais supprimer les statiques
      f.confidence < 0.6 &&
      f.createdAt < ninetyDaysAgo &&
      f.usageCount < 3
    )
    .primaryKeys()

  await nutritionDB.foods.bulkDelete(toDelete)
  console.log(`[NutritionDB] Nettoyage: ${toDelete.length} entrées supprimées`)
  return toDelete.length
}

/**
 * Exporte la base pour backup
 */
export async function exportDatabase(): Promise<{
  foods: NutritionEntry[]
  translations: TranslationEntry[]
}> {
  return {
    foods: await nutritionDB.foods.toArray(),
    translations: await nutritionDB.translations.toArray()
  }
}

/**
 * Importe des données (merge)
 */
export async function importDatabase(data: {
  foods?: Omit<NutritionEntry, 'id'>[]
  translations?: Omit<TranslationEntry, 'id'>[]
}): Promise<void> {
  if (data.foods) {
    for (const food of data.foods) {
      await upsertFood(food as Omit<NutritionEntry, 'id' | 'createdAt' | 'usageCount'>)
    }
  }

  if (data.translations) {
    for (const t of data.translations) {
      await cacheTranslation(t.originalTerm, t.fromLang, t.toLang, t.translatedTerm)
    }
  }
}
