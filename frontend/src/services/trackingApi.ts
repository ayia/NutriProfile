import { api } from './api'
import type {
  ActivityLog,
  ActivityLogCreate,
  WeightLog,
  WeightLogCreate,
  Goal,
  GoalCreate,
  DailyStats,
  WeeklyStats,
  ProgressData,
  ActivityTypeSummary,
  TrackingSummary,
  WeeklyChartData,
} from '@/types/tracking'

export const trackingApi = {
  // Activities
  createActivity: async (data: ActivityLogCreate): Promise<ActivityLog> => {
    const response = await api.post('/tracking/activities', data)
    return response.data
  },

  getActivities: async (
    startDate?: string,
    endDate?: string,
    activityType?: string,
    limit = 50
  ): Promise<ActivityLog[]> => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    if (activityType) params.append('activity_type', activityType)
    params.append('limit', limit.toString())

    const response = await api.get(`/tracking/activities?${params.toString()}`)
    return response.data
  },

  updateActivity: async (activityId: number, data: Partial<ActivityLog>): Promise<ActivityLog> => {
    const response = await api.patch(`/tracking/activities/${activityId}`, data)
    return response.data
  },

  deleteActivity: async (activityId: number): Promise<void> => {
    await api.delete(`/tracking/activities/${activityId}`)
  },

  // Weight
  createWeightLog: async (data: WeightLogCreate): Promise<WeightLog> => {
    const response = await api.post('/tracking/weight', data)
    return response.data
  },

  getWeightLogs: async (limit = 30): Promise<WeightLog[]> => {
    const response = await api.get(`/tracking/weight?limit=${limit}`)
    return response.data
  },

  // Goals
  createGoal: async (data: GoalCreate): Promise<Goal> => {
    const response = await api.post('/tracking/goals', data)
    return response.data
  },

  getGoals: async (activeOnly = true): Promise<Goal[]> => {
    const response = await api.get(`/tracking/goals?active_only=${activeOnly}`)
    return response.data
  },

  updateGoal: async (goalId: number, data: Partial<Goal>): Promise<Goal> => {
    const response = await api.patch(`/tracking/goals/${goalId}`, data)
    return response.data
  },

  deleteGoal: async (goalId: number): Promise<void> => {
    await api.delete(`/tracking/goals/${goalId}`)
  },

  // Stats
  getDailyStats: async (date: string): Promise<DailyStats> => {
    const response = await api.get(`/tracking/stats/daily/${date}`)
    return response.data
  },

  getWeeklyStats: async (): Promise<WeeklyStats> => {
    const response = await api.get('/tracking/stats/weekly')
    return response.data
  },

  getProgressData: async (days = 30): Promise<ProgressData> => {
    const response = await api.get(`/tracking/stats/progress?days=${days}`)
    return response.data
  },

  getActivitiesBreakdown: async (days = 30): Promise<ActivityTypeSummary[]> => {
    const response = await api.get(`/tracking/stats/activities-breakdown?days=${days}`)
    return response.data
  },

  getSummary: async (): Promise<TrackingSummary> => {
    const response = await api.get('/tracking/summary')
    return response.data
  },

  getWeeklyChartData: async (): Promise<WeeklyChartData> => {
    const response = await api.get('/tracking/stats/weekly-chart')
    return response.data
  },

  // Water
  addWater: async (date: string, amountMl: number): Promise<{ water_ml: number }> => {
    const response = await api.post(`/vision/daily/${date}/water`, { amount_ml: amountMl })
    return response.data
  },
}
