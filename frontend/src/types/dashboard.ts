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
  water_today: number
  water_target: number
  water_percent: number
  activity_today: number
  activity_target: number
  activity_percent: number
  meals_today: number
  streak_days: number
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
