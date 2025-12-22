import { api } from './api'
import type {
  Recipe,
  RecipeGenerateRequest,
  RecipeGenerateResponse,
  Favorite,
  RecipeHistory,
} from '@/types/recipe'

export const recipeApi = {
  generate: async (data: RecipeGenerateRequest): Promise<RecipeGenerateResponse> => {
    const response = await api.post<RecipeGenerateResponse>('/recipes/generate', data)
    return response.data
  },

  getById: async (id: number): Promise<Recipe> => {
    const response = await api.get<Recipe>(`/recipes/${id}`)
    return response.data
  },

  getHistory: async (limit = 10, offset = 0): Promise<RecipeHistory[]> => {
    const response = await api.get<RecipeHistory[]>('/recipes/history', {
      params: { limit, offset },
    })
    return response.data
  },

  // Favoris
  getFavorites: async (limit = 20, offset = 0): Promise<Favorite[]> => {
    const response = await api.get<Favorite[]>('/recipes/favorites/', {
      params: { limit, offset },
    })
    return response.data
  },

  addFavorite: async (recipeId: number, notes?: string, rating?: number): Promise<Favorite> => {
    const response = await api.post<Favorite>('/recipes/favorites', {
      recipe_id: recipeId,
      notes,
      rating,
    })
    return response.data
  },

  removeFavorite: async (recipeId: number): Promise<void> => {
    await api.delete(`/recipes/favorites/${recipeId}`)
  },

  updateFavorite: async (recipeId: number, notes?: string, rating?: number): Promise<Favorite> => {
    const response = await api.patch<Favorite>(`/recipes/favorites/${recipeId}`, {
      recipe_id: recipeId,
      notes,
      rating,
    })
    return response.data
  },
}
