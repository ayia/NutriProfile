/**
 * Nutrition Reference Database
 *
 * Contains nutritional values per 100g for common foods
 * Used for automatic nutrition calculation when users edit food items
 */

export interface NutritionValues {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

/**
 * Nutrition reference table (per 100g)
 * Values sourced from USDA FoodData Central and CIQUAL (French food composition table)
 */
export const NUTRITION_REFERENCE: Record<string, NutritionValues> = {
  // Grains & Starches
  "riz": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  "pâtes": { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
  "pain": { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  "quinoa": { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8 },
  "pomme de terre": { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.1 },
  "patate douce": { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },

  // Proteins
  "poulet": { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  "boeuf": { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
  "porc": { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0 },
  "saumon": { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  "thon": { calories: 144, protein: 23, carbs: 0, fat: 5, fiber: 0 },
  "oeuf": { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  "tofu": { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },

  // Vegetables
  "brocoli": { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  "carotte": { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  "tomate": { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  "salade": { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 },
  "épinard": { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  "haricots verts": { calories: 31, protein: 1.8, carbs: 7, fat: 0.1, fiber: 2.7 },

  // Fruits
  "pomme": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
  "banane": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  "orange": { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
  "fraise": { calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2 },

  // Dairy
  "lait": { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
  "yaourt": { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
  "fromage": { calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0 },

  // Legumes
  "lentilles": { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9 },
  "pois chiches": { calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6 },
  "haricots": { calories: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 6.4 },

  // Nuts & Seeds
  "amandes": { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5 },
  "noix": { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7 },

  // Common prepared foods
  "pizza": { calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3 },
  "sandwich": { calories: 250, protein: 12, carbs: 30, fat: 8, fiber: 2 },
}

/**
 * List of all available foods for autocomplete
 */
export const COMMON_FOODS = Object.keys(NUTRITION_REFERENCE).sort()

/**
 * Default nutrition values when food is not in reference database
 */
export const DEFAULT_NUTRITION: NutritionValues = {
  calories: 100,
  protein: 3,
  carbs: 15,
  fat: 3,
  fiber: 1,
}

/**
 * Unit conversion factors to grams
 */
const UNIT_CONVERSIONS: Record<string, number> = {
  g: 1,
  ml: 1, // Assume density ~1 for liquids
  portion: 150,
  piece: 100,
  cup: 240,
  tbsp: 15,
  tsp: 5,
}

/**
 * Convert quantity with unit to grams
 * @param quantity - Numeric quantity
 * @param unit - Unit of measurement
 * @returns Equivalent weight in grams
 */
export function convertToGrams(quantity: number, unit: string): number {
  const factor = UNIT_CONVERSIONS[unit.toLowerCase()] || 100
  return quantity * factor
}

/**
 * Calculate nutrition values for a given food item
 * @param foodName - Name of the food (case-insensitive)
 * @param quantity - Numeric quantity
 * @param unit - Unit of measurement
 * @returns Calculated nutrition values based on the reference database
 */
export function calculateNutrition(
  foodName: string,
  quantity: number,
  unit: string
): NutritionValues {
  // Normalize food name (lowercase, trim)
  const normalizedName = foodName.toLowerCase().trim()

  // Get reference values (or use defaults if not found)
  const reference = NUTRITION_REFERENCE[normalizedName] || DEFAULT_NUTRITION

  // Convert to grams
  const portionSizeInGrams = convertToGrams(quantity, unit)

  // Calculate factor (reference is per 100g)
  const factor = portionSizeInGrams / 100

  // Calculate actual values
  return {
    calories: Math.round(reference.calories * factor),
    protein: parseFloat((reference.protein * factor).toFixed(1)),
    carbs: parseFloat((reference.carbs * factor).toFixed(1)),
    fat: parseFloat((reference.fat * factor).toFixed(1)),
    fiber: parseFloat((reference.fiber * factor).toFixed(1)),
  }
}

/**
 * Search for foods matching a query (case-insensitive, partial match)
 * @param query - Search query
 * @param maxResults - Maximum number of results to return
 * @returns Array of matching food names
 */
export function searchFoods(query: string, maxResults: number = 10): string[] {
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) {
    return COMMON_FOODS.slice(0, maxResults)
  }

  return COMMON_FOODS
    .filter(food => food.includes(normalizedQuery))
    .slice(0, maxResults)
}
