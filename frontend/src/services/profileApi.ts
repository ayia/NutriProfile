import { api } from './api'
import type { Profile, ProfileCreate, ProfileSummary, NutritionCalculation } from '@/types/profile'

export const profileApi = {
  getProfile: async (): Promise<Profile> => {
    const response = await api.get<Profile>('/profiles/me')
    return response.data
  },

  getSummary: async (): Promise<ProfileSummary> => {
    const response = await api.get<ProfileSummary>('/profiles/me/summary')
    return response.data
  },

  createProfile: async (data: ProfileCreate): Promise<Profile> => {
    const response = await api.post<Profile>('/profiles/', data)
    return response.data
  },

  updateProfile: async (data: Partial<ProfileCreate>): Promise<Profile> => {
    console.log('[profileApi.updateProfile] Request data:', data)
    const response = await api.put<Profile>('/profiles/me', data)
    console.log('[profileApi.updateProfile] Response:', response.data)
    return response.data
  },

  deleteProfile: async (): Promise<void> => {
    await api.delete('/profiles/me')
  },

  analyzeProfile: async (): Promise<{
    analysis: {
      nutrition: NutritionCalculation
      recommendations: string[]
      warnings: string[]
      deficiencies: string[]
    }
    confidence: number
    model_used: string
    used_fallback: boolean
  }> => {
    const response = await api.post('/profiles/me/analyze')
    return response.data
  },

  calculateNutrition: async (data: ProfileCreate): Promise<NutritionCalculation> => {
    const response = await api.post<NutritionCalculation>('/profiles/calculate', data)
    return response.data
  },
}
