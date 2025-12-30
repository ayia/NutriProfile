import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TourState {
  hasSeenDashboardTour: boolean
  hasSeenVisionTour: boolean
  hasSeenRecipesTour: boolean
  hasSeenTrackingTour: boolean
  currentTour: string | null
  setTourCompleted: (tourName: string) => void
  startTour: (tourName: string) => void
  endTour: () => void
  resetAllTours: () => void
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      hasSeenDashboardTour: false,
      hasSeenVisionTour: false,
      hasSeenRecipesTour: false,
      hasSeenTrackingTour: false,
      currentTour: null,

      setTourCompleted: (tourName: string) => {
        set((state) => ({
          ...state,
          [`hasSeen${tourName.charAt(0).toUpperCase() + tourName.slice(1)}Tour`]: true,
          currentTour: null,
        }))
      },

      startTour: (tourName: string) => {
        set({ currentTour: tourName })
      },

      endTour: () => {
        set({ currentTour: null })
      },

      resetAllTours: () => {
        set({
          hasSeenDashboardTour: false,
          hasSeenVisionTour: false,
          hasSeenRecipesTour: false,
          hasSeenTrackingTour: false,
          currentTour: null,
        })
      },
    }),
    {
      name: 'tour-storage',
    }
  )
)
