export interface Ingredient {
  name: string
  quantity: string
}

export interface Recipe {
  id: number
  title: string
  description: string | null
  image_url: string | null
  ingredients: Ingredient[]
  instructions: string[]
  prep_time: number
  cook_time: number
  total_time: number
  servings: number
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  tags: string[]
  meal_type: string
  is_generated: boolean
  confidence_score: number | null
  created_at: string
}

export interface RecipeGenerateRequest {
  ingredients: string[]
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  max_prep_time: number
  servings: number
}

export interface RecipeGenerateResponse {
  recipe: Recipe
  confidence: number
  model_used: string
  used_fallback: boolean
}

export interface Favorite {
  id: number
  recipe_id: number
  notes: string | null
  rating: number | null
  created_at: string
  recipe: Recipe
}

export interface RecipeHistory {
  id: number
  recipe_id: number
  input_ingredients: string[]
  meal_type: string | null
  created_at: string
  recipe: Recipe
}

export const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation',
}

export const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
}
