import { api } from './api'
import type {
  ImageAnalyzeRequest,
  ImageAnalyzeResponse,
  FoodLog,
  FoodLogCreate,
  FoodItemCreate,
  FoodItem,
  FoodItemUpdate,
  DailyMeals,
  AnalysisSaveRequest,
  RecentFoodsResponse,
  FavoriteFoodsResponse,
  FavoriteFoodCreate,
  FavoriteFood,
  BarcodeSearchResponse,
} from '@/types/foodLog'

export const visionApi = {
  // Analyse d'image
  analyzeImage: async (data: ImageAnalyzeRequest): Promise<ImageAnalyzeResponse> => {
    const response = await api.post('/vision/analyze', data)
    return response.data
  },

  // Sauvegarder un repas analysé (après confirmation utilisateur)
  // Utilise le nouvel endpoint qui ne reconsomme pas de crédit
  saveMeal: async (data: AnalysisSaveRequest): Promise<FoodLog> => {
    const response = await api.post('/vision/logs/save', data)
    return response.data
  },

  // Food Logs
  getLogs: async (date?: string, mealType?: string, limit = 20): Promise<FoodLog[]> => {
    const params = new URLSearchParams()
    if (date) params.append('filter_date', date)
    if (mealType) params.append('meal_type', mealType)
    params.append('limit', limit.toString())

    const response = await api.get(`/vision/logs?${params.toString()}`)
    return response.data
  },

  getLog: async (logId: number): Promise<FoodLog> => {
    const response = await api.get(`/vision/logs/${logId}`)
    return response.data
  },

  createLog: async (data: FoodLogCreate): Promise<FoodLog> => {
    const response = await api.post('/vision/logs', data)
    return response.data
  },

  updateLog: async (logId: number, data: Partial<FoodLog>): Promise<FoodLog> => {
    const response = await api.patch(`/vision/logs/${logId}`, data)
    return response.data
  },

  deleteLog: async (logId: number): Promise<void> => {
    await api.delete(`/vision/logs/${logId}`)
  },

  // Food Items
  addItem: async (logId: number, data: FoodItemCreate): Promise<FoodItem> => {
    const response = await api.post(`/vision/logs/${logId}/items`, data)
    return response.data
  },

  updateItem: async (itemId: number, data: FoodItemUpdate): Promise<FoodItem> => {
    const response = await api.patch(`/vision/items/${itemId}`, data)
    return response.data
  },

  deleteItem: async (itemId: number): Promise<void> => {
    await api.delete(`/vision/items/${itemId}`)
  },

  // Daily
  getDailyMeals: async (date: string): Promise<DailyMeals> => {
    const response = await api.get(`/vision/daily/${date}`)
    return response.data
  },

  addWater: async (date: string, amountMl: number): Promise<{ water_ml: number }> => {
    const response = await api.post(`/vision/daily/${date}/water`, { amount_ml: amountMl })
    return response.data
  },

  // Recent Foods
  getRecentFoods: async (limit = 20): Promise<RecentFoodsResponse> => {
    const response = await api.get(`/vision/recent-foods?limit=${limit}`)
    return response.data
  },

  // Favorites
  getFavorites: async (): Promise<FavoriteFoodsResponse> => {
    const response = await api.get('/vision/favorites')
    return response.data
  },

  addFavorite: async (data: FavoriteFoodCreate): Promise<FavoriteFood> => {
    const response = await api.post('/vision/favorites', data)
    return response.data
  },

  removeFavorite: async (foodName: string): Promise<void> => {
    await api.delete(`/vision/favorites/${encodeURIComponent(foodName)}`)
  },

  checkFavorite: async (foodName: string): Promise<{ is_favorite: boolean; name: string }> => {
    const response = await api.get(`/vision/favorites/check/${encodeURIComponent(foodName)}`)
    return response.data
  },

  // Barcode Scanner (Open Food Facts)
  searchBarcode: async (barcode: string): Promise<BarcodeSearchResponse> => {
    const response = await api.get(`/vision/barcode/${encodeURIComponent(barcode)}`)
    return response.data
  },
}

// Helper pour convertir une image en base64
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Enlever le préfixe "data:image/...;base64,"
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Helper pour compresser une image avant envoi
export async function compressImage(file: File, maxWidth = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Convertir en base64 JPEG avec qualité 0.8
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      const base64 = dataUrl.split(',')[1]
      resolve(base64)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
