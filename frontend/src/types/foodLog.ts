export interface FoodItem {
  id: number
  name: string
  quantity: string
  unit: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  fiber: number | null
  source: 'ai' | 'manual' | 'database'
  confidence: number | null
  is_verified: boolean
}

export interface FoodLog {
  id: number
  user_id: number
  image_url: string | null
  image_analyzed: boolean
  meal_type: MealType
  meal_date: string
  description: string | null
  detected_items: DetectedItem[] | null
  confidence_score: number | null
  model_used: string | null
  total_calories: number | null
  total_protein: number | null
  total_carbs: number | null
  total_fat: number | null
  total_fiber: number | null
  user_corrected: boolean
  items: FoodItem[]
  created_at: string
}

export interface DetectedItem {
  name: string
  quantity: string
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence: number
}

export interface ImageAnalyzeRequest {
  image_base64: string
  meal_type: MealType
  save_to_log: boolean
}

export interface ImageAnalyzeResponse {
  success: boolean
  description: string
  meal_type: MealType | null
  items: DetectedItem[]
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  confidence: number
  model_used: string
  food_log_id: number | null
}

export interface DailyNutrition {
  id: number
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  total_fiber: number
  target_calories: number | null
  target_protein: number | null
  target_carbs: number | null
  target_fat: number | null
  meals_count: number
  water_ml: number
  calories_percent: number | null
  protein_percent: number | null
  carbs_percent: number | null
  fat_percent: number | null
}

export interface DailyMeals {
  date: string
  meals: FoodLog[]
  nutrition: DailyNutrition | null
}

export interface FoodItemCreate {
  name: string
  quantity: string
  unit: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
}

export interface FoodLogCreate {
  meal_type: MealType
  meal_date?: string
  description?: string
  items?: FoodItemCreate[]
}

export interface FoodItemUpdate {
  name?: string
  quantity?: string
  unit?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  is_verified?: boolean
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation',
}

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
}
