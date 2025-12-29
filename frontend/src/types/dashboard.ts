export interface CoachAdvice {
  message: string
  category: 'nutrition' | 'activity' | 'hydration' | 'motivation' | 'tip'
  priority: 'low' | 'medium' | 'high'
  action: string | null
  emoji: string
}

export interface CoachResponse {
  greeting: string
  summary: string
  advices: CoachAdvice[]
  motivation_quote: string | null
  confidence: number
}

export interface Achievement {
  id: number
  achievement_type: string
  name: string
  description: string | null
  icon: string
  points: number
  unlocked_at: string
  seen: boolean
}

export interface Streak {
  id: number
  streak_type: string
  current_count: number
  best_count: number
  last_date: string | null
}

export interface Notification {
  id: number
  notification_type: string
  title: string
  message: string | null
  icon: string | null
  action_url: string | null
  data: Record<string, unknown> | null
  read: boolean
  created_at: string
}

export interface UserStats {
  total_points: number
  level: number
  xp_current: number
  xp_next_level: number
  xp_percent: number
  total_meals_logged: number
  total_activities: number
  total_recipes_generated: number
  total_photos_analyzed: number
  best_streak_logging: number
  best_streak_activity: number
  achievements_count: number
}

export interface QuickStats {
  calories_today: number
  calories_target: number
  calories_percent: number
  protein_today: number
  protein_target: number
  protein_percent: number
  // Glucides - important pour diabétiques
  carbs_today: number
  carbs_target: number
  carbs_percent: number
  // Lipides - important pour santé cardiaque
  fat_today: number
  fat_target: number
  fat_percent: number
  water_today: number
  water_target: number
  water_percent: number
  activity_today: number
  activity_target: number
  activity_percent: number
  calories_burned: number
  meals_today: number
  streak_days: number
}

// Personnalisation Types

export interface PriorityWidget {
  id: string
  type: 'health' | 'goal' | 'diet' | 'general'
  priority: number
  reason: string
  source: 'medical_condition' | 'goal' | 'diet_type' | 'age'
}

export interface PersonalizedStat {
  id: string
  priority: number
  reason: string
}

export interface HealthAlert {
  type: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  icon: string
  action?: string | null
  show_always?: boolean
}

export interface PersonalizedInsight {
  type: string
  title: string
  message: string
  icon: string
  priority: number
}

export interface UIConfig {
  show_carbs_prominently: boolean
  show_fat_breakdown: boolean
  show_sodium_tracker: boolean
  show_hydration_prominently: boolean
  show_activity_prominently: boolean
  show_weight_tracker: boolean
  primary_color_theme: string
  stats_layout: 'standard' | 'compact' | 'detailed'
}

export interface PersonalizationData {
  profile_summary: string
  health_context: string[]
  priority_widgets: PriorityWidget[]
  personalized_stats: PersonalizedStat[]
  health_alerts: HealthAlert[]
  insights: PersonalizedInsight[]
  ui_config: UIConfig
}

export interface DashboardData {
  user_name: string
  quick_stats: QuickStats
  coach_advice: CoachResponse | null
  user_stats: UserStats
  recent_achievements: Achievement[]
  active_streaks: Streak[]
  unread_notifications: number
  notifications: Notification[]
  // Personnalisation basée sur le profil complet
  personalization: PersonalizationData | null
}

export const STREAK_LABELS: Record<string, { name: string; icon: string }> = {
  logging: { name: 'Suivi', icon: '📝' },
  activity: { name: 'Activité', icon: '🏃' },
  water: { name: 'Hydratation', icon: '💧' },
  calories: { name: 'Calories', icon: '🎯' },
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Débutant',
  2: 'Apprenti',
  3: 'Initié',
  4: 'Régulier',
  5: 'Confirmé',
  6: 'Expert',
  7: 'Maître',
  8: 'Champion',
  9: 'Légende',
  10: 'Dieu du fitness',
}
