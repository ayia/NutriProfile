/**
 * Centralized Query Keys for React Query
 *
 * This file provides a consistent and type-safe way to manage query keys
 * across the application. It ensures proper cache invalidation and
 * data synchronization between pages.
 */

export const queryKeys = {
  // Dashboard - main overview data
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    weekly: () => [...queryKeys.dashboard.all, 'weekly'] as const,
  },

  // Tracking - activities, water, weight, goals
  tracking: {
    all: ['tracking'] as const,
    summary: (date?: string) => [...queryKeys.tracking.all, 'summary', date] as const,
    activities: () => [...queryKeys.tracking.all, 'activities'] as const,
    activityDetail: (id: number) => [...queryKeys.tracking.all, 'activity', id] as const,
    water: (date?: string) => [...queryKeys.tracking.all, 'water', date] as const,
    weight: () => [...queryKeys.tracking.all, 'weight'] as const,
    goals: () => [...queryKeys.tracking.all, 'goals'] as const,
  },

  // Vision - meal analysis
  vision: {
    all: ['vision'] as const,
    dailyMeals: (date?: string) => ['dailyMeals', date] as const,
    foodLogs: () => ['foodLogs', 'history'] as const,
    history: () => [...queryKeys.vision.all, 'history'] as const,
    analysis: (id: number) => [...queryKeys.vision.all, 'analysis', id] as const,
  },

  // Recipes
  recipes: {
    all: ['recipes'] as const,
    list: () => [...queryKeys.recipes.all, 'list'] as const,
    favorites: () => [...queryKeys.recipes.all, 'favorites'] as const,
    detail: (id: number) => [...queryKeys.recipes.all, 'detail', id] as const,
  },

  // User profile
  profile: {
    all: ['profile'] as const,
    me: () => [...queryKeys.profile.all, 'me'] as const,
  },

  // Subscription
  subscription: {
    all: ['subscription'] as const,
    status: () => [...queryKeys.subscription.all, 'status'] as const,
    usage: () => [...queryKeys.subscription.all, 'usage'] as const,
  },

  // Coaching
  coaching: {
    all: ['coaching'] as const,
    tips: () => [...queryKeys.coaching.all, 'tips'] as const,
    challenges: () => [...queryKeys.coaching.all, 'challenges'] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
  },
} as const

/**
 * Invalidation Groups - Use these to invalidate related queries together
 *
 * When a mutation affects multiple areas, use these groups to ensure
 * all related data is refreshed.
 */
export const invalidationGroups = {
  // After adding water, activity, or weight - refresh tracking + dashboard
  trackingUpdate: [
    queryKeys.tracking.all,
    queryKeys.dashboard.all,
    ['activities'] as const,  // TrackingPage uses this directly
    ['weight'] as const,      // TrackingPage uses this directly
    ['goals'] as const,       // GoalCard uses this directly
    ['weeklyChart'] as const, // WeeklyChart component
  ],

  // After analyzing a meal - refresh vision + dashboard + tracking
  mealAnalysis: [
    queryKeys.vision.all,
    ['dailyMeals'] as const,  // Also invalidate dailyMeals queries
    ['foodLogs'] as const,    // Also invalidate foodLogs queries
    queryKeys.dashboard.all,
    queryKeys.tracking.all,
    ['weeklyChart'] as const, // WeeklyChart component - meal logs affect weekly stats
  ],

  // After generating a recipe - refresh recipes + dashboard
  recipeGeneration: [
    queryKeys.recipes.all,
    queryKeys.dashboard.all,
  ],

  // After profile update - may affect calculations everywhere
  profileUpdate: [
    queryKeys.profile.all,
    queryKeys.dashboard.all,
    queryKeys.tracking.all,
  ],

  // After any gamification event (achievement, streak)
  gamification: [
    queryKeys.dashboard.all,
    queryKeys.notifications.all,
  ],
} as const

/**
 * Helper function to invalidate a group of queries
 */
export function getInvalidationQueries(group: keyof typeof invalidationGroups) {
  return invalidationGroups[group]
}
