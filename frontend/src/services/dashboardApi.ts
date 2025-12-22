import { api } from './api'
import type {
  DashboardData,
  CoachResponse,
  Achievement,
  Notification,
} from '@/types/dashboard'

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard/')
    return response.data
  },

  getCoachAdvice: async (): Promise<CoachResponse> => {
    const response = await api.get('/dashboard/coach')
    return response.data
  },

  // Notifications
  getNotifications: async (unreadOnly = false, limit = 20): Promise<Notification[]> => {
    const response = await api.get(`/dashboard/notifications?unread_only=${unreadOnly}&limit=${limit}`)
    return response.data
  },

  markNotificationRead: async (notificationId: number): Promise<void> => {
    await api.post(`/dashboard/notifications/${notificationId}/read`)
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await api.post('/dashboard/notifications/read-all')
  },

  // Achievements
  getAchievements: async (): Promise<Achievement[]> => {
    const response = await api.get('/dashboard/achievements')
    return response.data
  },

  markAchievementSeen: async (achievementId: number): Promise<void> => {
    await api.post(`/dashboard/achievements/${achievementId}/seen`)
  },
}
