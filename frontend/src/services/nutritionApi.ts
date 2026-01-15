/**
 * Service API pour recherche nutritionnelle.
 *
 * Utilise le waterfall backend :
 * 1. USDA FoodData Central API (300k aliments)
 * 2. Agent LLM Nutrition (HuggingFace)
 * 3. not_found → saisie manuelle frontend
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

/**
 * Recherche les informations nutritionnelles pour un aliment.
 *
 * @param request - Nom de l'aliment, quantité, contexte optionnel
 * @returns Informations nutritionnelles ou not_found
 */
export async function searchNutrition(
  request: NutritionSearchRequest
): Promise<NutritionSearchResponse> {
  const response = await api.post<NutritionSearchResponse>(
    '/nutrition/search',
    request
  )
  return response.data
}
