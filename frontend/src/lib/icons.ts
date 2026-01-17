/**
 * Centralized Icon Mapping for NutriProfile
 *
 * This file provides consistent Lucide icon mappings across the entire app.
 * Using SVG icons instead of emojis for:
 * - Cross-device consistency
 * - Full color/size control
 * - Smooth animations
 * - Professional appearance
 */

import {
  // Navigation
  LayoutDashboard,
  Camera,
  TrendingUp,
  TrendingDown,
  ChefHat,
  User,
  Settings,
  LogOut,
  SkipForward,

  // Macros & Nutrition
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Droplets,
  Utensils,
  Beef,

  // Meal Types
  Sunrise,
  Sun,
  Moon,
  Apple,

  // Activities
  Activity,
  Footprints,
  Bike,
  Waves,
  Mountain,
  Music,
  CircleDot,
  Goal,
  Trophy,
  Medal,

  // Tracking & Goals
  Scale,
  Target,

  // Stats & Charts
  BarChart3,

  // Actions
  Plus,
  Minus,
  Search,
  ScanLine,
  Scan,
  Edit,
  Edit3,
  Trash2,
  Check,
  X,
  Image,
  Download,
  FileDown,
  Calculator,
  Database,

  // Streaks & Gamification
  Zap,
  Star,
  Crown,
  Heart,
  Sparkles,

  // Status & Feedback
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Loader2,
  AlertTriangle,

  // Health & Body
  HeartPulse,
  Leaf,

  // Recipe & Food
  Egg,
  Salad,
  Carrot,
  Package,
  Clock,
  Calendar,
  FileText,
  Scroll,
  Bell,
  BellOff,
  Megaphone,
  MessageSquare,
  Lightbulb,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Unlock,
  Shield,
  Gift,
  Rocket,
  BadgeCheck,
  UserPlus,
  RefreshCw,
  Bot,
  ThumbsUp,
  Meh,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Save,
  Hand,
  Brain,
  Key,
  ShoppingCart,
  Play,

  type LucideIcon,
} from 'lucide-react'

// ============================================================================
// MACRO NUTRIENTS
// ============================================================================

export const MACRO_ICONS = {
  calories: Flame,
  protein: Dumbbell,
  carbs: Wheat,
  fat: Droplet,
  water: Droplets,
  fiber: Leaf,
} as const

export const MACRO_COLORS = {
  calories: 'text-orange-500',
  protein: 'text-blue-500',
  carbs: 'text-amber-500',
  fat: 'text-purple-500',
  water: 'text-cyan-500',
  fiber: 'text-green-500',
} as const

export const MACRO_BG_COLORS = {
  calories: 'bg-orange-100',
  protein: 'bg-blue-100',
  carbs: 'bg-amber-100',
  fat: 'bg-purple-100',
  water: 'bg-cyan-100',
  fiber: 'bg-green-100',
} as const

export const MACRO_GRADIENTS = {
  calories: 'from-orange-500 to-red-500',
  protein: 'from-blue-500 to-indigo-500',
  carbs: 'from-amber-500 to-yellow-500',
  fat: 'from-purple-500 to-pink-500',
  water: 'from-cyan-500 to-blue-500',
  fiber: 'from-green-500 to-emerald-500',
} as const

// ============================================================================
// MEAL TYPES
// ============================================================================

export const MEAL_TYPE_ICONS: Record<string, LucideIcon> = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
  snack: Apple,
} as const

export const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: 'text-amber-500',
  lunch: 'text-yellow-500',
  dinner: 'text-indigo-500',
  snack: 'text-rose-500',
} as const

export const MEAL_TYPE_BG_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-100',
  lunch: 'bg-yellow-100',
  dinner: 'bg-indigo-100',
  snack: 'bg-rose-100',
} as const

export function getMealTypeIcon(type: string): LucideIcon {
  return MEAL_TYPE_ICONS[type] || Utensils
}

export function getMealTypeColor(type: string): string {
  return MEAL_TYPE_COLORS[type] || 'text-gray-500'
}

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

export const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  walking: Footprints,
  running: Activity,
  cycling: Bike,
  swimming: Waves,
  gym: Dumbbell,
  yoga: Heart, // Representing mindfulness
  hiking: Mountain,
  dancing: Music,
  tennis: CircleDot,
  football: Goal,
  basketball: Target,
  other: Activity,
} as const

export const ACTIVITY_COLORS: Record<string, string> = {
  walking: 'text-green-500',
  running: 'text-orange-500',
  cycling: 'text-blue-500',
  swimming: 'text-cyan-500',
  gym: 'text-purple-500',
  yoga: 'text-pink-500',
  hiking: 'text-emerald-500',
  dancing: 'text-fuchsia-500',
  tennis: 'text-yellow-500',
  football: 'text-lime-500',
  basketball: 'text-amber-500',
  other: 'text-gray-500',
} as const

export const ACTIVITY_GRADIENTS: Record<string, string> = {
  walking: 'from-green-500 to-emerald-500',
  running: 'from-orange-500 to-red-500',
  cycling: 'from-blue-500 to-indigo-500',
  swimming: 'from-cyan-500 to-blue-500',
  gym: 'from-purple-500 to-indigo-500',
  yoga: 'from-pink-500 to-rose-500',
  hiking: 'from-emerald-500 to-teal-500',
  dancing: 'from-fuchsia-500 to-pink-500',
  tennis: 'from-yellow-500 to-amber-500',
  football: 'from-lime-500 to-green-500',
  basketball: 'from-amber-500 to-orange-500',
  other: 'from-gray-500 to-slate-500',
} as const

// ============================================================================
// GOAL TYPES
// ============================================================================

export const GOAL_ICONS: Record<string, LucideIcon> = {
  weight: Scale,
  calories: Flame,
  steps: Footprints,
  activity: Activity,
  water: Droplets,
} as const

export const GOAL_COLORS: Record<string, string> = {
  weight: 'text-indigo-500',
  calories: 'text-orange-500',
  steps: 'text-green-500',
  activity: 'text-blue-500',
  water: 'text-cyan-500',
} as const

// ============================================================================
// STREAK TYPES
// ============================================================================

export const STREAK_ICONS: Record<string, LucideIcon> = {
  logging: Camera,
  activity: Activity,
  water: Droplets,
  weight: Scale,
  recipes: ChefHat,
  default: Zap,
} as const

export const STREAK_COLORS: Record<string, string> = {
  logging: 'text-orange-500',
  activity: 'text-green-500',
  water: 'text-cyan-500',
  weight: 'text-indigo-500',
  recipes: 'text-amber-500',
  default: 'text-yellow-500',
} as const

// ============================================================================
// ACHIEVEMENTS & GAMIFICATION
// ============================================================================

export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  beginner: Star,
  intermediate: Medal,
  advanced: Trophy,
  expert: Crown,
  streak: Zap,
  milestone: Target,
  special: Sparkles,
  default: Star,
} as const

export const LEVEL_ICONS: Record<string, LucideIcon> = {
  bronze: Medal,
  silver: Medal,
  gold: Trophy,
  platinum: Crown,
  diamond: Sparkles,
} as const

// ============================================================================
// QUICK ACTIONS
// ============================================================================

export const ACTION_ICONS = {
  scan: Camera,
  search: Search,
  water: Droplets,
  activity: Activity,
  weight: Scale,
  stats: BarChart3,
  recipes: ChefHat,
  add: Plus,
  edit: Edit,
  delete: Trash2,
} as const

// ============================================================================
// STATUS ICONS
// ============================================================================

export const STATUS_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  help: HelpCircle,
  loading: Loader2,
} as const

export const STATUS_COLORS = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  help: 'text-gray-500',
  loading: 'text-primary-500',
} as const

// ============================================================================
// NAVIGATION
// ============================================================================

export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  vision: Camera,
  tracking: TrendingUp,
  recipes: ChefHat,
  settings: Settings,
  profile: User,
  logout: LogOut,
} as const

// ============================================================================
// EMPTY STATES
// ============================================================================

export const EMPTY_STATE_ICONS = {
  noData: BarChart3,
  noActivities: Activity,
  noMeals: Utensils,
  noRecipes: ChefHat,
  noGoals: Target,
  noWeight: Scale,
  error: AlertCircle,
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getActivityIcon(type: string): LucideIcon {
  return ACTIVITY_ICONS[type] || ACTIVITY_ICONS.other
}

export function getActivityColor(type: string): string {
  return ACTIVITY_COLORS[type] || ACTIVITY_COLORS.other
}

export function getActivityGradient(type: string): string {
  return ACTIVITY_GRADIENTS[type] || ACTIVITY_GRADIENTS.other
}

export function getGoalIcon(type: string): LucideIcon {
  return GOAL_ICONS[type] || Target
}

export function getGoalColor(type: string): string {
  return GOAL_COLORS[type] || 'text-gray-500'
}

export function getStreakIcon(type: string): LucideIcon {
  return STREAK_ICONS[type] || STREAK_ICONS.default
}

export function getAchievementIcon(level: string): LucideIcon {
  return ACHIEVEMENT_ICONS[level] || ACHIEVEMENT_ICONS.default
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Re-export commonly used icons for convenience
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Droplets,
  Beef,
  Activity,
  Footprints,
  Bike,
  Waves,
  Mountain,
  Scale,
  Target,
  Trophy,
  Medal,
  Crown,
  Star,
  Zap,
  Sparkles,
  Camera,
  ScanLine,
  Scan,
  BarChart3,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Heart,
  HeartPulse,
  Loader2,
  ChefHat,
  User,
  Settings,
  TrendingUp,
  TrendingDown,
  // Meal types
  Sunrise,
  Sun,
  Moon,
  Apple,
  Utensils,
  // Actions & UI
  Image,
  Download,
  FileDown,
  Calculator,
  Search,
  Edit,
  Edit3,
  Trash2,
  Database,
  // Recipe & Food
  Egg,
  Salad,
  Carrot,
  Package,
  Clock,
  Calendar,
  FileText,
  Scroll,
  Bell,
  BellOff,
  Megaphone,
  MessageSquare,
  Lightbulb,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Unlock,
  Shield,
  Gift,
  Rocket,
  BadgeCheck,
  UserPlus,
  RefreshCw,
  Info,
  HelpCircle,
  Leaf,
  Bot,
  ThumbsUp,
  Meh,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Save,
  Hand,
  Brain,
  Key,
  ShoppingCart,
  SkipForward,
  Play,
  type LucideIcon,
}
