import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { profileApi } from '@/services/profileApi'
import { subscriptionApi } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import type { Profile, ProfileCreate, ActivityLevel, Goal, DietType } from '@/types/profile'
import { ACTIVITY_LABELS, GOAL_LABELS, DIET_LABELS, COMMON_ALLERGIES, COMMON_MEDICAL_CONDITIONS, COMMON_MEDICATIONS } from '@/types/profile'
import { SUPPORTED_LANGUAGES } from '@/i18n'
import i18n from '@/i18n'
import {
  User,
  Lock,
  Bell,
  Shield,
  Target,
  Ruler,
  Salad,
  Heart,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  BarChart3,
  Mail,
  Smartphone,
  AlertTriangle,
  Clock,
  TrendingUp,
  ChefHat,
  Trophy,
  Lightbulb,
  FileText,
  Download,
  KeyRound,
  Cookie,
  CheckCircle,
  Star,
  Medal,
  Crown,
  Sparkles,
  Zap,
  CreditCard,
  Camera,
  MessageCircle,
  History,
  ArrowRight,
  Sun,
  Moon,
  Monitor,
  Languages,
  Palette,
  type LucideIcon,
} from 'lucide-react'

type SettingsTab = 'profile' | 'subscription' | 'account' | 'notifications' | 'privacy'

export function SettingsPage() {
  const { t } = useTranslation('settings')
  const { t: tCommon } = useTranslation('common')
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const observerRef = useRef<IntersectionObserver | null>(null)

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<ProfileCreate>) => {
      return profileApi.updateProfile(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success(tCommon('toast.profileUpdated'))
    },
    onError: () => {
      toast.error(tCommon('toast.saveError'))
    },
  })

  const deleteProfileMutation = useMutation({
    mutationFn: profileApi.deleteProfile,
    onSuccess: () => {
      logout()
    },
  })

  // Scroll reveal animation - re-run when profile data loads or tab changes
  useEffect(() => {
    // Small delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
            }
          })
        },
        { threshold: 0.1 }
      )

      document.querySelectorAll('.reveal').forEach((el) => {
        observerRef.current?.observe(el)
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      observerRef.current?.disconnect()
    }
  }, [activeTab, profileQuery.data])

  const tabs: { id: SettingsTab; label: string; IconComponent: LucideIcon; color: string }[] = [
    { id: 'profile', label: t('tabs.profile'), IconComponent: User, color: 'from-primary-500 to-emerald-500' },
    { id: 'subscription', label: t('tabs.subscription'), IconComponent: CreditCard, color: 'from-violet-500 to-purple-500' },
    { id: 'account', label: t('tabs.account'), IconComponent: Lock, color: 'from-secondary-500 to-cyan-500' },
    { id: 'notifications', label: t('tabs.notifications'), IconComponent: Bell, color: 'from-warning-500 to-amber-500' },
    { id: 'privacy', label: t('tabs.privacy'), IconComponent: Shield, color: 'from-indigo-500 to-purple-500' },
  ]

  const handleDeleteAccount = () => {
    if (deleteConfirmText === t('account.deletePlaceholder')) {
      deleteProfileMutation.mutate()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-100/40 to-emerald-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-secondary-100/40 to-cyan-100/40 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête avec avatar - Enhanced & Responsive */}
        <div className="glass-card p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-emerald-400 rounded-xl sm:rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl font-bold shadow-xl transform group-hover:scale-105 transition-transform">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{user?.name}</h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base truncate">{user?.email}</p>
              {profileQuery.data?.goal && (
                <span className="inline-flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-xs sm:text-sm font-medium rounded-full shadow-lg">
                  <Target className="w-4 h-4" />
                  <span className="truncate max-w-[150px] sm:max-w-none">{GOAL_LABELS[profileQuery.data.goal]}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation par onglets - Enhanced & Responsive */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 animate-fade-in-up scrollbar-hide" style={{ animationDelay: '0.1s' }}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : 'glass-card text-gray-600 hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5'
              }`}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <tab.IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === tab.id ? 'animate-bounce-soft' : ''}`} />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu des onglets - Enhanced */}
        <div className="glass-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {activeTab === 'profile' && (
            <ProfileSettings
              profile={profileQuery.data}
              isLoading={profileQuery.isLoading}
              onUpdate={(data) => updateProfileMutation.mutate(data)}
              isUpdating={updateProfileMutation.isPending}
            />
          )}

          {activeTab === 'subscription' && <SubscriptionSettings />}

          {activeTab === 'account' && (
            <AccountSettings
              user={user}
              onDeleteClick={() => setShowDeleteModal(true)}
            />
          )}

          {activeTab === 'notifications' && <NotificationSettings />}

          {activeTab === 'privacy' && <PrivacySettings />}
        </div>

        {/* Modal de suppression de compte - Enhanced */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/50 animate-scale-in">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-error-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <AlertTriangle className="w-10 h-10 text-error-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {t('account.deleteTitle')}
                </h3>
                <p className="text-gray-500">
                  {t('account.deleteConfirm')}
                </p>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('account.typeDelete')} <span className="font-bold text-error-600">"{t('account.deletePlaceholder')}"</span> {t('account.toConfirm')}
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-error-500 focus:border-error-500 transition-all"
                  placeholder={t('account.deletePlaceholder')}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmText('')
                  }}
                  className="flex-1 px-6 py-4 glass-card text-gray-700 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  {t('profile.cancel')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== t('account.deletePlaceholder') || deleteProfileMutation.isPending}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-error-500 to-rose-500 text-white rounded-2xl font-semibold shadow-lg shadow-error-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {deleteProfileMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('account.deleting')}</span>
                    </>
                  ) : (
                    t('account.deleteAccount')
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant Paramètres du Profil - Enhanced
interface ProfileSettingsProps {
  profile: Profile | undefined
  isLoading: boolean
  onUpdate: (data: Partial<ProfileCreate>) => void
  isUpdating: boolean
}

function ProfileSettings({ profile, isLoading, onUpdate, isUpdating }: ProfileSettingsProps) {
  const { t } = useTranslation('settings')
  const [editSection, setEditSection] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<Partial<ProfileCreate>>()

  // Calculate profile completion percentage and badges
  const calculateCompletion = () => {
    if (!profile) return { percentage: 0, completedBadges: [], nextBadge: null }

    const fields = [
      { filled: !!profile.age, category: 'basic' },
      { filled: !!profile.height_cm, category: 'basic' },
      { filled: !!profile.weight_kg, category: 'basic' },
      { filled: !!profile.goal, category: 'goals' },
      { filled: !!profile.activity_level, category: 'goals' },
      { filled: !!profile.diet_type, category: 'diet' },
      { filled: profile.allergies && profile.allergies.length > 0, category: 'diet' },
      { filled: profile.medical_conditions && profile.medical_conditions.length > 0, category: 'health' },
    ]

    const filledCount = fields.filter(f => f.filled).length
    const percentage = Math.round((filledCount / fields.length) * 100)

    // Define badges
    const allBadges = [
      { id: 'starter', name: t('gamification.badges.starter'), icon: Star, color: 'from-yellow-400 to-amber-500', threshold: 25, xp: 10 },
      { id: 'explorer', name: t('gamification.badges.explorer'), icon: Medal, color: 'from-blue-400 to-indigo-500', threshold: 50, xp: 25 },
      { id: 'dedicated', name: t('gamification.badges.dedicated'), icon: Trophy, color: 'from-purple-400 to-pink-500', threshold: 75, xp: 50 },
      { id: 'champion', name: t('gamification.badges.champion'), icon: Crown, color: 'from-amber-400 to-orange-500', threshold: 100, xp: 100 },
    ]

    const completedBadges = allBadges.filter(b => percentage >= b.threshold)
    const nextBadge = allBadges.find(b => percentage < b.threshold)
    const totalXP = completedBadges.reduce((sum, b) => sum + b.xp, 0)

    return { percentage, completedBadges, nextBadge, totalXP, allBadges }
  }

  const { percentage, completedBadges, nextBadge, totalXP, allBadges } = calculateCompletion()

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <SkeletonLoader className="h-10 w-56 rounded-xl" />
        <SkeletonLoader className="h-32 rounded-2xl" />
        <SkeletonLoader className="h-32 rounded-2xl" />
        <SkeletonLoader className="h-32 rounded-2xl" />
      </div>
    )
  }

  const handleSave = (data: Partial<ProfileCreate>) => {
    onUpdate(data)
    setEditSection(null)
    reset()
  }

  const sections = [
    {
      id: 'physical',
      title: t('profile.physicalInfo'),
      IconComponent: Ruler,
      color: 'from-secondary-500 to-cyan-500',
      fields: [
        { key: 'age', label: t('profile.age'), value: profile?.age, suffix: t('profile.ageUnit') },
        { key: 'height_cm', label: t('profile.height'), value: profile?.height_cm, suffix: t('profile.heightUnit') },
        { key: 'weight_kg', label: t('profile.weight'), value: profile?.weight_kg, suffix: t('profile.weightUnit') },
      ],
    },
    {
      id: 'goals',
      title: t('profile.goals'),
      IconComponent: Target,
      color: 'from-accent-500 to-amber-500',
      fields: [
        { key: 'goal', label: t('profile.goal'), value: profile?.goal ? GOAL_LABELS[profile.goal] : '-' },
        { key: 'target_weight_kg', label: t('profile.targetWeight'), value: profile?.target_weight_kg, suffix: t('profile.weightUnit') },
        { key: 'activity_level', label: t('profile.activity'), value: profile?.activity_level ? ACTIVITY_LABELS[profile.activity_level] : '-' },
      ],
    },
    {
      id: 'diet',
      title: t('profile.diet'),
      IconComponent: Salad,
      color: 'from-primary-500 to-emerald-500',
      fields: [
        { key: 'diet_type', label: t('profile.dietType'), value: profile?.diet_type ? DIET_LABELS[profile.diet_type] : '-' },
        { key: 'allergies', label: t('profile.allergies'), value: profile?.allergies?.join(', ') || t('profile.noAllergies') },
      ],
    },
    {
      id: 'health',
      title: t('profile.health'),
      IconComponent: Heart,
      color: 'from-rose-500 to-pink-500',
      fields: [
        { key: 'medical_conditions', label: t('profile.medicalConditions'), value: profile?.medical_conditions?.map(c => COMMON_MEDICAL_CONDITIONS.find(mc => mc.key === c)?.label || c).join(', ') || t('profile.noConditions') },
        { key: 'medications', label: t('profile.medications'), value: profile?.medications?.join(', ') || t('profile.noMedications') },
      ],
    },
  ]

  return (
    <div className="divide-y divide-gray-100">
      {/* Gamification - Profile Completion */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 reveal">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t('gamification.title')}</h3>
            <p className="text-sm text-gray-500">{t('gamification.subtitle')}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg">
            <Zap className="w-4 h-4 text-white" />
            <span className="font-bold text-white">{totalXP} XP</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">{t('gamification.progress')}</span>
            <span className="text-sm font-bold text-indigo-600">{percentage}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          {nextBadge && (
            <p className="text-xs text-gray-500 mt-2">
              {t('gamification.nextBadge', { badge: nextBadge.name, points: nextBadge.threshold - percentage })}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="grid grid-cols-4 gap-3">
          {allBadges?.map((badge) => {
            const isUnlocked = completedBadges?.some(b => b.id === badge.id)
            const BadgeIcon = badge.icon

            return (
              <div
                key={badge.id}
                className={`relative flex flex-col items-center p-3 rounded-xl transition-all ${
                  isUnlocked
                    ? 'bg-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                    : 'bg-gray-100/50 opacity-50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    isUnlocked
                      ? `bg-gradient-to-br ${badge.color} shadow-lg`
                      : 'bg-gray-300'
                  }`}
                >
                  <BadgeIcon className={`w-6 h-6 ${isUnlocked ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <span className={`text-xs font-medium text-center ${isUnlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                  {badge.name}
                </span>
                <span className={`text-xs ${isUnlocked ? 'text-indigo-500' : 'text-gray-400'}`}>
                  +{badge.xp} XP
                </span>
                {isUnlocked && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {sections.map((section, index) => (
        <div key={section.id} className="p-6 reveal" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <section.IconComponent className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
            </div>
            <button
              onClick={() => setEditSection(editSection === section.id ? null : section.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                editSection === section.id
                  ? 'bg-gray-100 text-gray-600'
                  : 'text-primary-600 hover:bg-primary-50'
              }`}
            >
              {editSection === section.id ? t('profile.cancel') : t('profile.modify')}
            </button>
          </div>

          {editSection === section.id ? (
            <>
              {section.id === 'health' ? (
                <HealthSectionForm
                  profile={profile}
                  onSave={(data) => {
                    onUpdate(data)
                    setEditSection(null)
                  }}
                  isUpdating={isUpdating}
                />
              ) : section.id === 'diet' ? (
                <DietSectionForm
                  profile={profile}
                  onSave={(data) => {
                    onUpdate(data)
                    setEditSection(null)
                  }}
                  isUpdating={isUpdating}
                />
              ) : (
            <form onSubmit={handleSubmit(handleSave)} className="space-y-4 animate-fade-in">
              {section.id === 'physical' && (
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    id="age"
                    type="number"
                    label={t('profile.age')}
                    defaultValue={profile?.age}
                    {...register('age', { valueAsNumber: true })}
                  />
                  <Input
                    id="height_cm"
                    type="number"
                    label={`${t('profile.height')} (${t('profile.heightUnit')})`}
                    defaultValue={profile?.height_cm}
                    {...register('height_cm', { valueAsNumber: true })}
                  />
                  <Input
                    id="weight_kg"
                    type="number"
                    label={`${t('profile.weight')} (${t('profile.weightUnit')})`}
                    step="0.1"
                    defaultValue={profile?.weight_kg}
                    {...register('weight_kg', { valueAsNumber: true })}
                  />
                </div>
              )}

              {section.id === 'goals' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.goal')}</label>
                    <select
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      defaultValue={profile?.goal}
                      {...register('goal')}
                    >
                      {(Object.keys(GOAL_LABELS) as Goal[]).map((key) => (
                        <option key={key} value={key}>{GOAL_LABELS[key]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.activityLevel')}</label>
                    <select
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      defaultValue={profile?.activity_level}
                      {...register('activity_level')}
                    >
                      {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((key) => (
                        <option key={key} value={key}>{ACTIVITY_LABELS[key]}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    id="target_weight_kg"
                    type="number"
                    label={`${t('profile.targetWeight')} (${t('profile.weightUnit')})`}
                    step="0.1"
                    defaultValue={profile?.target_weight_kg}
                    {...register('target_weight_kg', { valueAsNumber: true })}
                  />
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('profile.saving')}</span>
                    </>
                  ) : (
                    t('profile.save')
                  )}
                </button>
              </div>
            </form>
              )}
            </>
          ) : (
            <div className="grid gap-4">
              {section.fields.map((field) => (
                <div key={field.key} className="flex justify-between items-center py-3 px-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                  <span className="text-gray-600">{field.label}</span>
                  <span className="font-semibold text-gray-900">
                    {field.value || '-'} {field.suffix && field.value ? field.suffix : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Besoins nutritionnels calculés - Enhanced */}
      <div className="p-6 bg-gradient-to-r from-primary-50 via-emerald-50 to-cyan-50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('profile.nutritionalNeeds')}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NutritionCard
            label={t('profile.calories')}
            value={profile?.daily_calories}
            unit="kcal"
            IconComponent={Flame}
            color="from-accent-500 to-amber-500"
          />
          <NutritionCard
            label={t('profile.protein')}
            value={profile?.protein_g}
            unit="g"
            IconComponent={Dumbbell}
            color="from-secondary-500 to-cyan-500"
          />
          <NutritionCard
            label={t('profile.carbs')}
            value={profile?.carbs_g}
            unit="g"
            IconComponent={Wheat}
            color="from-warning-500 to-amber-500"
          />
          <NutritionCard
            label={t('profile.fat')}
            value={profile?.fat_g}
            unit="g"
            IconComponent={Droplet}
            color="from-error-500 to-rose-500"
          />
        </div>
      </div>
    </div>
  )
}

function NutritionCard({ label, value, unit, IconComponent, color }: { label: string; value: number | null | undefined; unit: string; IconComponent: LucideIcon; color: string }) {
  return (
    <div className="glass-card p-5 text-center hover-lift group">
      <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-900">{value || '-'}</div>
      <div className="text-sm font-medium text-gray-500">{unit}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  )
}

// Composant formulaire section Santé
interface HealthSectionFormProps {
  profile: Profile | undefined
  onSave: (data: Partial<ProfileCreate>) => void
  isUpdating: boolean
}

function HealthSectionForm({ profile, onSave, isUpdating }: HealthSectionFormProps) {
  const { t } = useTranslation('settings')
  const [selectedConditions, setSelectedConditions] = useState<string[]>(profile?.medical_conditions || [])
  const [selectedMedications, setSelectedMedications] = useState<string[]>(profile?.medications || [])
  const [customMedication, setCustomMedication] = useState('')

  const toggleCondition = (key: string) => {
    setSelectedConditions(prev =>
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    )
  }

  const toggleMedication = (med: string) => {
    setSelectedMedications(prev =>
      prev.includes(med) ? prev.filter(m => m !== med) : [...prev, med]
    )
  }

  const addCustomMedication = () => {
    if (customMedication.trim() && !selectedMedications.includes(customMedication.trim())) {
      setSelectedMedications(prev => [...prev, customMedication.trim()])
      setCustomMedication('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      medical_conditions: selectedConditions,
      medications: selectedMedications,
    }
    onSave(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Conditions médicales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('profile.medicalConditions')}
        </label>
        <p className="text-xs text-gray-500 mb-3">{t('profile.medicalConditionsDesc')}</p>
        <div className="grid grid-cols-2 gap-2">
          {COMMON_MEDICAL_CONDITIONS.map((condition) => (
            <label
              key={condition.key}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm cursor-pointer transition-all ${
                selectedConditions.includes(condition.key)
                  ? 'bg-rose-100 border-2 border-rose-400 text-rose-700'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedConditions.includes(condition.key)}
                onChange={() => toggleCondition(condition.key)}
                className="sr-only"
              />
              <span className="text-lg">{condition.icon}</span>
              <span className="font-medium">{condition.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Médicaments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('profile.medications')}
        </label>
        <p className="text-xs text-gray-500 mb-3">{t('profile.medicationsDesc')}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {COMMON_MEDICATIONS.map((med) => (
            <label
              key={med}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                selectedMedications.includes(med)
                  ? 'bg-indigo-100 border border-indigo-400 text-indigo-700'
                  : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMedications.includes(med)}
                onChange={() => toggleMedication(med)}
                className="sr-only"
              />
              <span>{med}</span>
            </label>
          ))}
        </div>

        {/* Custom medication input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customMedication}
            onChange={(e) => setCustomMedication(e.target.value)}
            placeholder={t('profile.addMedication')}
            className="flex-1 px-4 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomMedication())}
          />
          <button
            type="button"
            onClick={addCustomMedication}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
          >
            +
          </button>
        </div>

        {/* Selected custom medications */}
        {selectedMedications.filter(m => !COMMON_MEDICATIONS.includes(m)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedMedications.filter(m => !COMMON_MEDICATIONS.includes(m)).map((med) => (
              <span
                key={med}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
              >
                {med}
                <button
                  type="button"
                  onClick={() => toggleMedication(med)}
                  className="ml-1 hover:text-indigo-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isUpdating}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isUpdating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('profile.saving')}</span>
            </>
          ) : (
            t('profile.save')
          )}
        </button>
      </div>
    </form>
  )
}

// Composant formulaire section Régime alimentaire
interface DietSectionFormProps {
  profile: Profile | undefined
  onSave: (data: Partial<ProfileCreate>) => void
  isUpdating: boolean
}

function DietSectionForm({ profile, onSave, isUpdating }: DietSectionFormProps) {
  const { t } = useTranslation('settings')
  const [selectedDietType, setSelectedDietType] = useState<DietType>(profile?.diet_type || 'omnivore')
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(profile?.allergies || [])

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev =>
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      diet_type: selectedDietType,
      allergies: selectedAllergies,
    }
    onSave(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Type de régime */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.dietType')}</label>
        <select
          className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          value={selectedDietType}
          onChange={(e) => setSelectedDietType(e.target.value as DietType)}
        >
          {(Object.keys(DIET_LABELS) as DietType[]).map((key) => (
            <option key={key} value={key}>{DIET_LABELS[key]}</option>
          ))}
        </select>
      </div>

      {/* Allergies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">{t('profile.allergies')}</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.map((allergy) => (
            <label
              key={allergy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer transition-all ${
                selectedAllergies.includes(allergy)
                  ? 'bg-primary-100 border-2 border-primary-400 text-primary-700'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAllergies.includes(allergy)}
                onChange={() => toggleAllergy(allergy)}
                className="sr-only"
              />
              <span>{allergy}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isUpdating}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isUpdating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('profile.saving')}</span>
            </>
          ) : (
            t('profile.save')
          )}
        </button>
      </div>
    </form>
  )
}

// Composant Paramètres du Compte - Enhanced
interface AccountSettingsProps {
  user: { name?: string; email?: string } | null | undefined
  onDeleteClick: () => void
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

function AccountSettings({ user, onDeleteClick }: AccountSettingsProps) {
  const { t } = useTranslation('settings')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Vérifier si déjà installé en mode standalone
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsStandalone(isInStandaloneMode)

    // Détecter iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
    setIsIOS(isIOSDevice)

    // Écouter l'événement beforeinstallprompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsStandalone(true)
      }
      setDeferredPrompt(null)
    }
  }

  return (
    <div className="divide-y divide-gray-100">
      {/* Installation PWA */}
      <div className="p-6 reveal">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('account.installApp')}</h3>
        </div>

        {isStandalone ? (
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="font-medium text-emerald-700">{t('account.appInstalled')}</p>
                <p className="text-sm text-emerald-600 mt-1">{t('account.appInstalledDesc')}</p>
              </div>
            </div>
          </div>
        ) : isIOS ? (
          <div className="space-y-4">
            <p className="text-gray-600">{t('account.installAppDesc')}</p>
            <div className="p-4 rounded-xl bg-gray-50/80">
              <p className="font-medium text-gray-700 mb-3">{t('account.iosInstallTitle')}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-blue-600">1</span>
                  </div>
                  <span className="text-sm text-gray-600">{t('account.iosInstallStep1')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
                    <span className="text-emerald-600">2</span>
                  </div>
                  <span className="text-sm text-gray-600">{t('account.iosInstallStep2')}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">{t('account.installAppDesc')}</p>
            <button
              onClick={handleInstall}
              disabled={!deferredPrompt}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
            >
              <Smartphone className="w-5 h-5" />
              {t('account.installButton')}
            </button>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="p-6 reveal" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('account.email')}</h3>
        </div>
        <div className="p-4 rounded-xl bg-gray-50/80">
          <p className="text-lg font-medium text-gray-900">{user?.email}</p>
          <p className="text-sm text-gray-500 mt-2">
            {t('account.emailNote')}
          </p>
        </div>
      </div>

      {/* Mot de passe */}
      <div className="p-6 reveal" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('account.password')}</h3>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showPasswordForm
                ? 'bg-gray-100 text-gray-600'
                : 'text-primary-600 hover:bg-primary-50'
            }`}
          >
            {showPasswordForm ? t('profile.cancel') : t('profile.modify')}
          </button>
        </div>

        {showPasswordForm ? (
          <form className="space-y-4 max-w-md animate-fade-in">
            <Input
              id="current_password"
              type="password"
              label={t('account.currentPassword')}
              placeholder="••••••••"
            />
            <Input
              id="new_password"
              type="password"
              label={t('account.newPassword')}
              placeholder="••••••••"
            />
            <Input
              id="confirm_password"
              type="password"
              label={t('account.confirmPassword')}
              placeholder="••••••••"
            />
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-warning-500 to-amber-500 text-white rounded-xl font-semibold shadow-lg shadow-warning-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                {t('account.changePassword')}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-gray-50/80">
            <p className="text-lg text-gray-400">••••••••••••</p>
          </div>
        )}
      </div>

      {/* Preferences - Language & Theme */}
      <PreferencesSection />

      {/* Suppression du compte */}
      <div className="p-6 bg-gradient-to-r from-error-50 to-rose-50 reveal" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-error-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-error-700">{t('account.dangerZone')}</h3>
        </div>
        <p className="text-gray-600 mb-6">
          {t('account.deleteWarning')}
        </p>
        <button
          onClick={onDeleteClick}
          className="px-6 py-3 border-2 border-error-300 text-error-600 rounded-xl font-semibold hover:bg-error-100 transition-all"
        >
          {t('account.deleteAccount')}
        </button>
      </div>
    </div>
  )
}

// Composant Paramètres des Notifications - Enhanced
function NotificationSettings() {
  const { t } = useTranslation('settings')
  const [settings, setSettings] = useState({
    dailyReminder: true,
    weeklyReport: true,
    newRecipes: false,
    achievements: true,
    tips: false,
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const notificationOptions = [
    { key: 'dailyReminder' as const, label: t('notifications.dailyReminder'), description: t('notifications.dailyReminderDesc'), IconComponent: Clock, color: 'from-secondary-500 to-cyan-500' },
    { key: 'weeklyReport' as const, label: t('notifications.weeklyReport'), description: t('notifications.weeklyReportDesc'), IconComponent: TrendingUp, color: 'from-primary-500 to-emerald-500' },
    { key: 'newRecipes' as const, label: t('notifications.newRecipes'), description: t('notifications.newRecipesDesc'), IconComponent: ChefHat, color: 'from-accent-500 to-amber-500' },
    { key: 'achievements' as const, label: t('notifications.achievements'), description: t('notifications.achievementsDesc'), IconComponent: Trophy, color: 'from-warning-500 to-amber-500' },
    { key: 'tips' as const, label: t('notifications.tips'), description: t('notifications.tipsDesc'), IconComponent: Lightbulb, color: 'from-indigo-500 to-purple-500' },
  ]

  return (
    <div className="divide-y divide-gray-100">
      {notificationOptions.map((option, index) => (
        <div key={option.key} className="p-6 flex items-center justify-between reveal" style={{ animationDelay: `${0.05 * (index + 1)}s` }}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <option.IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{option.label}</h4>
              <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
            </div>
          </div>
          <button
            onClick={() => toggleSetting(option.key)}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
              settings[option.key]
                ? 'bg-gradient-to-r from-primary-500 to-emerald-500 shadow-lg shadow-primary-500/30'
                : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                settings[option.key] ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      ))}

      <div className="p-6 reveal" style={{ animationDelay: '0.3s' }}>
        <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
          {t('notifications.savePreferences')}
        </button>
      </div>
    </div>
  )
}

// Composant Paramètres de Confidentialité - Enhanced
function PrivacySettings() {
  const { t } = useTranslation('settings')

  return (
    <div className="divide-y divide-gray-100">
      <div className="p-6 reveal">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('privacy.yourData')}</h3>
        </div>
        <p className="text-gray-600 mb-6">
          {t('privacy.gdprNote')}
        </p>
        <button className="px-6 py-3 glass-card text-gray-700 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <Download className="w-5 h-5" />
          {t('privacy.downloadData')}
        </button>
      </div>

      <div className="p-6 reveal" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('privacy.dataSharing')}</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 cursor-pointer transition-colors group">
            <input type="checkbox" className="w-5 h-5 mt-0.5 rounded text-primary-500 focus:ring-primary-500" />
            <div>
              <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{t('privacy.serviceImprovement')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('privacy.serviceImprovementDesc')}</p>
            </div>
          </label>
          <label className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 cursor-pointer transition-colors group">
            <input type="checkbox" className="w-5 h-5 mt-0.5 rounded text-primary-500 focus:ring-primary-500" />
            <div>
              <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{t('privacy.anonymousStats')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('privacy.anonymousStatsDesc')}</p>
            </div>
          </label>
        </div>
      </div>

      <div className="p-6 reveal" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('privacy.legalDocs')}</h3>
        </div>
        <div className="space-y-3">
          <Link to="/privacy" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-all group">
            <Lock className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{t('privacy.privacyPolicy')}</span>
            <span className="ml-auto text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link to="/terms" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-all group">
            <FileText className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{t('privacy.termsOfService')}</span>
            <span className="ml-auto text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <a href="#" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-all group">
            <Cookie className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{t('privacy.cookiePolicy')}</span>
            <span className="ml-auto text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </div>
  )
}

// Composant Préférences (Langue et Thème)
function PreferencesSection() {
  const { t } = useTranslation('settings')
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en')
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const stored = localStorage.getItem('theme')
    return (stored as 'light' | 'dark' | 'system') || 'system'
  })

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
    setCurrentLanguage(langCode)
    localStorage.setItem('i18nextLng', langCode)
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    // Apply theme
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
  }

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: t('preferences.themes.light') },
    { value: 'dark' as const, icon: Moon, label: t('preferences.themes.dark') },
    { value: 'system' as const, icon: Monitor, label: t('preferences.themes.system') },
  ]

  return (
    <>
      {/* Language Selector */}
      <div className="p-6 reveal" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <Languages className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t('preferences.language')}</h3>
            <p className="text-sm text-gray-500">{t('preferences.languageDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                currentLanguage === lang.code
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-50/80 hover:bg-gray-100/80 text-gray-700'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Selector */}
      <div className="p-6 reveal" style={{ animationDelay: '0.17s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t('preferences.theme')}</h3>
            <p className="text-sm text-gray-500">{t('preferences.themeDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all ${
                  theme === option.value
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-50/80 hover:bg-gray-100/80 text-gray-700'
                }`}
              >
                <Icon className="w-8 h-8" />
                <span className="font-medium">{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

// Composant Paramètres Abonnement - Enhanced
function SubscriptionSettings() {
  const { t } = useTranslation('settings')

  // Fetch real usage data from API
  const { data: usageData, isLoading } = useQuery({
    queryKey: ['usage'],
    queryFn: subscriptionApi.getUsage,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  // Use real data from API or defaults
  const currentTier = (usageData?.tier || 'free') as 'free' | 'premium' | 'pro'
  const usage = {
    visionAnalyses: {
      used: usageData?.usage?.vision_analyses || 0,
      limit: usageData?.limits?.vision_analyses?.limit ?? 3,
    },
    recipeGeneration: {
      used: usageData?.usage?.recipe_generations || 0,
      limit: usageData?.limits?.recipe_generations?.limit ?? 2,
    },
    coachMessages: {
      used: usageData?.usage?.coach_messages || 0,
      limit: usageData?.limits?.coach_messages?.limit ?? 1,
    },
  }

  const tierLimits = {
    free: {
      visionAnalyses: 3,
      recipeGeneration: 2,
      coachMessages: 1,
      historyDays: 7,
    },
    premium: {
      visionAnalyses: -1, // unlimited
      recipeGeneration: 10,
      coachMessages: 5,
      historyDays: 90,
    },
    pro: {
      visionAnalyses: -1,
      recipeGeneration: -1,
      coachMessages: -1,
      historyDays: -1,
    },
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-xl mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const features = [
    {
      key: 'visionAnalyses',
      icon: Camera,
      color: 'from-violet-500 to-purple-500',
      getValue: (tier: 'free' | 'premium' | 'pro') =>
        tierLimits[tier].visionAnalyses === -1
          ? t('subscription.features.unlimited')
          : `${tierLimits[tier].visionAnalyses}${t('subscription.features.perDay')}`
    },
    {
      key: 'recipeGeneration',
      icon: ChefHat,
      color: 'from-amber-500 to-orange-500',
      getValue: (tier: 'free' | 'premium' | 'pro') =>
        tierLimits[tier].recipeGeneration === -1
          ? t('subscription.features.unlimited')
          : `${tierLimits[tier].recipeGeneration}${t('subscription.features.perWeek')}`
    },
    {
      key: 'coachMessages',
      icon: MessageCircle,
      color: 'from-emerald-500 to-teal-500',
      getValue: (tier: 'free' | 'premium' | 'pro') =>
        tierLimits[tier].coachMessages === -1
          ? t('subscription.features.unlimited')
          : `${tierLimits[tier].coachMessages}${t('subscription.features.perDay')}`
    },
    {
      key: 'historyDays',
      icon: History,
      color: 'from-blue-500 to-indigo-500',
      getValue: (tier: 'free' | 'premium' | 'pro') =>
        tierLimits[tier].historyDays === -1
          ? t('subscription.features.unlimited')
          : `${tierLimits[tier].historyDays} ${t('subscription.features.days')}`
    },
  ]

  const tierColors = {
    free: 'from-gray-400 to-gray-500',
    premium: 'from-violet-500 to-purple-500',
    pro: 'from-amber-500 to-orange-500',
  }

  const tierIcons = {
    free: Star,
    premium: Crown,
    pro: Zap,
  }

  const TierIcon = tierIcons[currentTier]

  return (
    <div className="divide-y divide-gray-100">
      {/* Current Plan */}
      <div className="p-6 reveal">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 bg-gradient-to-br ${tierColors[currentTier]} rounded-xl flex items-center justify-center shadow-lg`}>
            <TierIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t('subscription.currentPlan')}</h3>
            <p className="text-sm text-gray-500">{t(`subscription.${currentTier}.description`)}</p>
          </div>
          <div className="ml-auto">
            <span className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${tierColors[currentTier]} shadow-lg`}>
              {t(`subscription.${currentTier}.name`)}
            </span>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="p-6 reveal" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('subscription.features.title')}</h3>
        </div>

        <div className="grid gap-4">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon
            return (
              <div
                key={feature.key}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
                style={{ animationDelay: `${0.05 * (index + 1)}s` }}
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center shadow-md`}>
                  <FeatureIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">{t(`subscription.features.${feature.key}`)}</span>
                <span className="ml-auto font-bold text-gray-900">{feature.getValue(currentTier)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's Usage (only for free tier) */}
      {currentTier === 'free' && (
        <div className="p-6 reveal" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('subscription.usage.title')}</h3>
          </div>

          <div className="space-y-4">
            {Object.entries(usage).map(([key, value]) => {
              const percentage = (value.used / value.limit) * 100
              const isNearLimit = percentage >= 70
              const isAtLimit = percentage >= 100

              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t(`subscription.features.${key}`)}</span>
                    <span className={`font-medium ${isAtLimit ? 'text-error-600' : isNearLimit ? 'text-warning-600' : 'text-gray-900'}`}>
                      {value.used} / {value.limit} {t('subscription.usage.used')}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAtLimit
                          ? 'bg-gradient-to-r from-error-500 to-rose-500'
                          : isNearLimit
                            ? 'bg-gradient-to-r from-warning-500 to-amber-500'
                            : 'bg-gradient-to-r from-primary-500 to-emerald-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upgrade CTA (only for non-pro tiers) */}
      {currentTier !== 'pro' && (
        <div className="p-6 bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50 reveal" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('subscription.upgrade.title')}</h3>
          </div>

          <p className="text-gray-600 mb-4">{t('subscription.upgrade.benefits')}</p>

          <ul className="space-y-3 mb-6">
            {['benefit1', 'benefit2', 'benefit3', 'benefit4'].map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-gray-700">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span>{t(`subscription.upgrade.${benefit}`)}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-4">
            {currentTier === 'free' && (
              <Link
                to="/pricing"
                className="flex-1 px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-2xl font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                {t('subscription.upgrade.cta')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            <Link
              to="/pricing"
              className={`${currentTier === 'free' ? 'flex-1' : 'w-full'} px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2`}
            >
              <Zap className="w-5 h-5" />
              {t('subscription.upgrade.ctaPro')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}

      {/* Manage Subscription (for paid tiers) */}
      {currentTier !== 'free' && (
        <div className="p-6 reveal" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('subscription.manage.title')}</h3>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('subscription.manage.renewsOn')}</p>
                <p className="font-bold text-gray-900">15 janvier 2025</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                {t('subscription.status.active')}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 px-6 py-3 glass-card text-gray-700 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">
              {t('subscription.manage.manageButton')}
            </button>
            <button className="px-6 py-3 border-2 border-error-300 text-error-600 rounded-xl font-semibold hover:bg-error-50 transition-all">
              {t('subscription.manage.cancelButton')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
