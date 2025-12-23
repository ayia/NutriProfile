export interface ActivityLog {
  id: number
  user_id: number
  activity_type: string
  name: string | null
  duration_minutes: number
  intensity: 'light' | 'moderate' | 'intense'
  calories_burned: number | null
  calories_source: string
  distance_km: number | null
  steps: number | null
  heart_rate_avg: number | null
  notes: string | null
  activity_date: string
  created_at: string
}

export interface ActivityLogCreate {
  activity_type: string
  name?: string
  duration_minutes: number
  intensity: 'light' | 'moderate' | 'intense'
  calories_burned?: number
  distance_km?: number
  steps?: number
  heart_rate_avg?: number
  notes?: string
  activity_date?: string
}

export interface WeightLog {
  id: number
  user_id: number
  weight_kg: number
  body_fat_percent: number | null
  muscle_mass_kg: number | null
  notes: string | null
  log_date: string
  created_at: string
}

export interface WeightLogCreate {
  weight_kg: number
  body_fat_percent?: number
  muscle_mass_kg?: number
  notes?: string
  log_date?: string
}

export interface Goal {
  id: number
  user_id: number
  goal_type: string
  target_value: number
  current_value: number
  unit: string
  period: 'daily' | 'weekly' | 'monthly'
  start_date: string
  end_date: string | null
  is_active: boolean
  is_completed: boolean
  completed_at: string | null
  progress_percent: number | null
  created_at: string
}

export interface GoalCreate {
  goal_type: string
  target_value: number
  unit: string
  period?: 'daily' | 'weekly' | 'monthly'
  start_date?: string
  end_date?: string
}

export interface DailyStats {
  date: string
  calories_consumed: number
  calories_burned: number
  net_calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  water_ml: number
  steps: number
  activity_minutes: number
  meals_count: number
}

export interface WeeklyStats {
  start_date: string
  end_date: string
  avg_calories_consumed: number
  avg_calories_burned: number
  total_activity_minutes: number
  total_steps: number
  weight_change: number | null
  days_logged: number
}

export interface ProgressData {
  dates: string[]
  calories: number[]
  protein: number[]
  weight: (number | null)[]
  activity_minutes: number[]
}

export interface ActivityTypeSummary {
  activity_type: string
  name: string
  icon: string
  total_duration: number
  total_calories: number
  count: number
}

export interface TrackingSummary {
  today: DailyStats
  week: WeeklyStats
  goals: Goal[]
  recent_activities: ActivityLog[]
  recent_weights: WeightLog[]
  activity_breakdown: ActivityTypeSummary[]
}

export const ACTIVITY_TYPES: Record<string, { name: string; icon: string }> = {
  running: { name: 'Course', icon: '🏃' },
  walking: { name: 'Marche', icon: '🚶' },
  cycling: { name: 'Vélo', icon: '🚴' },
  swimming: { name: 'Natation', icon: '🏊' },
  gym: { name: 'Musculation', icon: '🏋️' },
  yoga: { name: 'Yoga', icon: '🧘' },
  hiking: { name: 'Randonnée', icon: '🥾' },
  dancing: { name: 'Danse', icon: '💃' },
  tennis: { name: 'Tennis', icon: '🎾' },
  football: { name: 'Football', icon: '⚽' },
  basketball: { name: 'Basketball', icon: '🏀' },
  other: { name: 'Autre', icon: '🏅' },
}

export const INTENSITY_LABELS: Record<string, string> = {
  light: 'Léger',
  moderate: 'Modéré',
  intense: 'Intense',
}

export const GOAL_TYPES: Record<string, { name: string; icon: string; unit: string }> = {
  weight: { name: 'Poids', icon: '⚖️', unit: 'kg' },
  calories: { name: 'Calories', icon: '🔥', unit: 'kcal' },
  steps: { name: 'Pas', icon: '👣', unit: 'pas' },
  activity: { name: 'Activité', icon: '🏃', unit: 'min' },
  water: { name: 'Eau', icon: '💧', unit: 'ml' },
}

export interface WeeklyChartDay {
  day: string
  shortDay: string
  date: string
  calories: number
  target: number
  protein: number
  carbs: number
  fat: number
}

export interface WeeklyChartData {
  days: WeeklyChartDay[]
  calorie_target: number
}
