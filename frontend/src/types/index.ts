export interface User {
  id: number
  email: string
  name: string
  is_active: boolean
  preferred_language: string
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  name: string
  preferred_language?: string
}

export interface AuthToken {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface ApiError {
  detail: string
}

// Subscription types
export type SubscriptionTier = 'free' | 'premium' | 'pro'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due' | 'paused'

export interface SubscriptionStatusResponse {
  tier: SubscriptionTier
  status: SubscriptionStatus | null
  renews_at: string | null
  cancel_at_period_end: boolean
  is_active: boolean
}

export interface LimitInfo {
  limit: number
  period: 'day' | 'week' | 'total' | 'boolean'
}

export interface UsageLimits {
  vision_analyses: LimitInfo
  recipe_generations: LimitInfo
  coach_messages: LimitInfo
  history_days: LimitInfo
}

// Full tier limits including boolean features
export interface FullTierLimits extends UsageLimits {
  export_pdf: LimitInfo
  meal_plans: LimitInfo
  advanced_stats: LimitInfo
  priority_support: LimitInfo
  dedicated_support: LimitInfo
  api_access: LimitInfo
}

export interface FullTierLimitsResponse {
  free: FullTierLimits
  premium: FullTierLimits
  pro: FullTierLimits
}

export interface TierLimitsResponse {
  free: UsageLimits
  premium: UsageLimits
  pro: UsageLimits
}

export interface UsageBase {
  vision_analyses: number
  recipe_generations: number
  coach_messages: number
}

export interface UsageStatusResponse {
  tier: SubscriptionTier
  limits: UsageLimits
  usage: UsageBase
  reset_at: string | null
}

export interface LimitCheckResult {
  allowed: boolean
  used: number
  limit: number
  remaining: number
}

export interface PricingPlan {
  tier: SubscriptionTier
  name: string
  description: string
  price_monthly: number
  price_yearly: number
  variant_id_monthly: string
  variant_id_yearly: string
  features: string[]
  popular: boolean
}

export interface PricingResponse {
  plans: PricingPlan[]
  currency: string
}
