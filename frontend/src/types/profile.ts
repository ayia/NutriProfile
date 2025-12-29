export type Gender = 'male' | 'female' | 'other'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Goal = 'lose_weight' | 'maintain' | 'gain_muscle' | 'improve_health'
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean'

export interface ProfileStep1 {
  age: number
  gender: Gender
  height_cm: number
  weight_kg: number
}

export interface ProfileStep2 {
  activity_level: ActivityLevel
  goal: Goal
  target_weight_kg?: number
}

export interface ProfileStep3 {
  diet_type: DietType
  allergies: string[]
  excluded_foods: string[]
  favorite_foods: string[]
}

export interface ProfileStep4 {
  medical_conditions: string[]
  medications: string[]
}

export interface ProfileCreate extends ProfileStep1, ProfileStep2, ProfileStep3, ProfileStep4 {}

export interface NutritionCalculation {
  bmr: number
  tdee: number
  daily_calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  confidence: number
}

export interface Profile extends ProfileCreate {
  id: number
  user_id: number
  bmr: number | null
  tdee: number | null
  daily_calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  is_complete: boolean
  created_at: string
  updated_at: string
}

export interface ProfileSummary {
  has_profile: boolean
  is_complete: boolean
  daily_calories: number | null
  goal: Goal | null
  diet_type: DietType | null
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sédentaire (peu ou pas d\'exercice)',
  light: 'Légèrement actif (1-3 jours/sem)',
  moderate: 'Modérément actif (3-5 jours/sem)',
  active: 'Très actif (6-7 jours/sem)',
  very_active: 'Extrêmement actif (athlète)',
}

export const GOAL_LABELS: Record<Goal, string> = {
  lose_weight: 'Perdre du poids',
  maintain: 'Maintenir mon poids',
  gain_muscle: 'Prendre du muscle',
  improve_health: 'Améliorer ma santé',
}

export const DIET_LABELS: Record<DietType, string> = {
  omnivore: 'Omnivore',
  vegetarian: 'Végétarien',
  vegan: 'Végétalien',
  pescatarian: 'Pescétarien',
  keto: 'Keto',
  paleo: 'Paléo',
  mediterranean: 'Méditerranéen',
}

export const COMMON_ALLERGIES = [
  'Gluten',
  'Lactose',
  'Arachides',
  'Fruits à coque',
  'Oeufs',
  'Poisson',
  'Crustacés',
  'Soja',
  'Sésame',
]

export const COMMON_MEDICAL_CONDITIONS = [
  { key: 'diabetes', label: 'Diabète', icon: '🩸' },
  { key: 'hypertension', label: 'Hypertension', icon: '❤️' },
  { key: 'heart_disease', label: 'Maladie cardiaque', icon: '🫀' },
  { key: 'kidney_disease', label: 'Maladie rénale', icon: '🫘' },
  { key: 'cholesterol', label: 'Cholestérol élevé', icon: '🧪' },
  { key: 'obesity', label: 'Obésité', icon: '⚖️' },
  { key: 'anemia', label: 'Anémie', icon: '🔴' },
  { key: 'thyroid', label: 'Problème thyroïdien', icon: '🦋' },
  { key: 'digestive', label: 'Problèmes digestifs', icon: '🫃' },
  { key: 'celiac', label: 'Maladie cœliaque', icon: '🌾' },
]

export const COMMON_MEDICATIONS = [
  'Metformine',
  'Insuline',
  'Antihypertenseurs',
  'Statines',
  'Anticoagulants',
  'Antidépresseurs',
  'Corticoïdes',
  'Diurétiques',
]
