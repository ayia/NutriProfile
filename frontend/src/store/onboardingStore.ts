import { create } from 'zustand'
import type { ProfileStep1, ProfileStep2, ProfileStep3, ProfileStep4, ProfileCreate } from '@/types/profile'

// Nombre d'étapes réduit à 3 pour un onboarding plus rapide
const TOTAL_STEPS = 3

interface OnboardingState {
  currentStep: number
  step1: Partial<ProfileStep1>
  step2: Partial<ProfileStep2>
  step3: Partial<ProfileStep3>
  step4: Partial<ProfileStep4>
  skippedOptional: boolean

  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  skipToEnd: () => void

  setStep1: (data: Partial<ProfileStep1>) => void
  setStep2: (data: Partial<ProfileStep2>) => void
  setStep3: (data: Partial<ProfileStep3>) => void
  setStep4: (data: Partial<ProfileStep4>) => void

  getFullProfile: () => ProfileCreate | null
  reset: () => void
}

const initialState = {
  currentStep: 1,
  step1: {},
  step2: {},
  step3: {
    diet_type: 'omnivore' as const,
    allergies: [],
    excluded_foods: [],
    favorite_foods: [],
  },
  step4: {
    medical_conditions: [],
    medications: [],
  },
  skippedOptional: false,
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  skipToEnd: () => set({ currentStep: TOTAL_STEPS, skippedOptional: true }),

  setStep1: (data) => set((state) => ({ step1: { ...state.step1, ...data } })),
  setStep2: (data) => set((state) => ({ step2: { ...state.step2, ...data } })),
  setStep3: (data) => set((state) => ({ step3: { ...state.step3, ...data } })),
  setStep4: (data) => set((state) => ({ step4: { ...state.step4, ...data } })),

  getFullProfile: () => {
    const { step1, step2, step3, step4 } = get()

    // Vérifier que les champs requis sont présents
    if (!step1.age || !step1.gender || !step1.height_cm || !step1.weight_kg) {
      return null
    }
    if (!step2.activity_level || !step2.goal) {
      return null
    }

    return {
      age: step1.age,
      gender: step1.gender,
      height_cm: step1.height_cm,
      weight_kg: step1.weight_kg,
      activity_level: step2.activity_level,
      goal: step2.goal,
      target_weight_kg: step2.target_weight_kg,
      diet_type: step3.diet_type || 'omnivore',
      allergies: step3.allergies || [],
      excluded_foods: step3.excluded_foods || [],
      favorite_foods: step3.favorite_foods || [],
      medical_conditions: step4.medical_conditions || [],
      medications: step4.medications || [],
    } as ProfileCreate
  },

  reset: () => set(initialState),
}))
