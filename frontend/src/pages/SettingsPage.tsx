import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { profileApi } from '@/services/profileApi'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import type { Profile, ProfileCreate, ActivityLevel, Goal, DietType } from '@/types/profile'
import { ACTIVITY_LABELS, GOAL_LABELS, DIET_LABELS, COMMON_ALLERGIES } from '@/types/profile'

type SettingsTab = 'profile' | 'account' | 'notifications' | 'privacy'

export function SettingsPage() {
  const { t } = useTranslation('settings')
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  })

  const updateProfileMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const deleteProfileMutation = useMutation({
    mutationFn: profileApi.deleteProfile,
    onSuccess: () => {
      logout()
    },
  })

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'profile', label: t('tabs.profile'), icon: '👤' },
    { id: 'account', label: t('tabs.account'), icon: '🔐' },
    { id: 'notifications', label: t('tabs.notifications'), icon: '🔔' },
    { id: 'privacy', label: t('tabs.privacy'), icon: '🛡️' },
  ]

  const handleDeleteAccount = () => {
    if (deleteConfirmText === t('account.deletePlaceholder')) {
      deleteProfileMutation.mutate()
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* En-tête avec avatar */}
      <div className="card-elevated p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 gradient-vitality rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-elevated">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="heading-2">{user?.name}</h1>
            <p className="body-md">{user?.email}</p>
            {profileQuery.data?.goal && (
              <span className="badge-primary mt-2">
                {GOAL_LABELS[profileQuery.data.goal]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all font-medium ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-card'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="card-elevated overflow-hidden">
        {activeTab === 'profile' && (
          <ProfileSettings
            profile={profileQuery.data}
            isLoading={profileQuery.isLoading}
            onUpdate={(data) => updateProfileMutation.mutate(data)}
            isUpdating={updateProfileMutation.isPending}
          />
        )}

        {activeTab === 'account' && (
          <AccountSettings
            user={user}
            onDeleteClick={() => setShowDeleteModal(true)}
          />
        )}

        {activeTab === 'notifications' && <NotificationSettings />}

        {activeTab === 'privacy' && <PrivacySettings />}
      </div>

      {/* Modal de suppression de compte */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in shadow-elevated">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="heading-3 mb-2">
                {t('account.deleteTitle')}
              </h3>
              <p className="body-md">
                {t('account.deleteConfirm')}
              </p>
            </div>

            <div className="mb-6">
              <label className="label mb-2 block">
                {t('account.typeDelete')} <span className="font-bold text-error-600">{t('account.deletePlaceholder')}</span> {t('account.toConfirm')}
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="input focus:ring-error-500"
                placeholder={t('account.deletePlaceholder')}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
              >
                {t('profile.cancel')}
              </Button>
              <Button
                variant="primary"
                className="flex-1 !bg-error-500 hover:!bg-error-600"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== t('account.deletePlaceholder')}
                isLoading={deleteProfileMutation.isPending}
              >
                {t('account.deleteAccount')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Composant Paramètres du Profil
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonLoader className="h-8 w-48 rounded-xl" />
        <SkeletonLoader className="h-24 rounded-xl" />
        <SkeletonLoader className="h-24 rounded-xl" />
        <SkeletonLoader className="h-24 rounded-xl" />
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
      icon: '📏',
      fields: [
        { key: 'age', label: t('profile.age'), value: profile?.age, suffix: t('profile.ageUnit') },
        { key: 'height_cm', label: t('profile.height'), value: profile?.height_cm, suffix: t('profile.heightUnit') },
        { key: 'weight_kg', label: t('profile.weight'), value: profile?.weight_kg, suffix: t('profile.weightUnit') },
      ],
    },
    {
      id: 'goals',
      title: t('profile.goals'),
      icon: '🎯',
      fields: [
        { key: 'goal', label: t('profile.goal'), value: profile?.goal ? GOAL_LABELS[profile.goal] : '-' },
        { key: 'target_weight_kg', label: t('profile.targetWeight'), value: profile?.target_weight_kg, suffix: t('profile.weightUnit') },
        { key: 'activity_level', label: t('profile.activity'), value: profile?.activity_level ? ACTIVITY_LABELS[profile.activity_level] : '-' },
      ],
    },
    {
      id: 'diet',
      title: t('profile.diet'),
      icon: '🥗',
      fields: [
        { key: 'diet_type', label: t('profile.dietType'), value: profile?.diet_type ? DIET_LABELS[profile.diet_type] : '-' },
        { key: 'allergies', label: t('profile.allergies'), value: profile?.allergies?.join(', ') || t('profile.noAllergies') },
      ],
    },
  ]

  return (
    <div className="divide-y divide-neutral-100">
      {sections.map((section) => (
        <div key={section.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{section.icon}</span>
              <h3 className="heading-4">{section.title}</h3>
            </div>
            <button
              onClick={() => setEditSection(editSection === section.id ? null : section.id)}
              className="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors"
            >
              {editSection === section.id ? t('profile.cancel') : t('profile.modify')}
            </button>
          </div>

          {editSection === section.id ? (
            <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
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
                    <label className="label mb-2 block">{t('profile.goal')}</label>
                    <select
                      className="input"
                      defaultValue={profile?.goal}
                      {...register('goal')}
                    >
                      {(Object.keys(GOAL_LABELS) as Goal[]).map((key) => (
                        <option key={key} value={key}>{GOAL_LABELS[key]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label mb-2 block">{t('profile.activityLevel')}</label>
                    <select
                      className="input"
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

              {section.id === 'diet' && (
                <div className="space-y-4">
                  <div>
                    <label className="label mb-2 block">{t('profile.dietType')}</label>
                    <select
                      className="input"
                      defaultValue={profile?.diet_type}
                      {...register('diet_type')}
                    >
                      {(Object.keys(DIET_LABELS) as DietType[]).map((key) => (
                        <option key={key} value={key}>{DIET_LABELS[key]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label mb-2 block">{t('profile.allergies')}</label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_ALLERGIES.map((allergy) => (
                        <label key={allergy} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full text-sm cursor-pointer hover:bg-neutral-200 transition-colors">
                          <input
                            type="checkbox"
                            defaultChecked={profile?.allergies?.includes(allergy)}
                            className="rounded text-primary-500"
                          />
                          {allergy}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={isUpdating}>
                  {t('profile.save')}
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4">
              {section.fields.map((field) => (
                <div key={field.key} className="flex justify-between items-center py-2">
                  <span className="body-md">{field.label}</span>
                  <span className="font-medium text-neutral-800">
                    {field.value || '-'} {field.suffix && field.value ? field.suffix : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Besoins nutritionnels calculés */}
      <div className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📊</span>
          <h3 className="heading-4">{t('profile.nutritionalNeeds')}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NutritionCard
            label={t('profile.calories')}
            value={profile?.daily_calories}
            unit="kcal"
            color="bg-accent-100 text-accent-700"
          />
          <NutritionCard
            label={t('profile.protein')}
            value={profile?.protein_g}
            unit="g"
            color="bg-secondary-100 text-secondary-700"
          />
          <NutritionCard
            label={t('profile.carbs')}
            value={profile?.carbs_g}
            unit="g"
            color="bg-warning-100 text-warning-700"
          />
          <NutritionCard
            label={t('profile.fat')}
            value={profile?.fat_g}
            unit="g"
            color="bg-error-100 text-error-700"
          />
        </div>
      </div>
    </div>
  )
}

function NutritionCard({ label, value, unit, color }: { label: string; value: number | null | undefined; unit: string; color: string }) {
  return (
    <div className={`${color} rounded-2xl p-4 text-center`}>
      <div className="text-2xl font-bold">{value || '-'}</div>
      <div className="text-sm font-medium">{unit}</div>
      <div className="text-xs mt-1 opacity-75">{label}</div>
    </div>
  )
}

// Composant Paramètres du Compte
interface AccountSettingsProps {
  user: { name?: string; email?: string } | null | undefined
  onDeleteClick: () => void
}

function AccountSettings({ user, onDeleteClick }: AccountSettingsProps) {
  const { t } = useTranslation('settings')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  return (
    <div className="divide-y divide-neutral-100">
      {/* Email */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">✉️</span>
          <h3 className="heading-4">{t('account.email')}</h3>
        </div>
        <p className="body-md">{user?.email}</p>
        <p className="body-sm mt-2">
          {t('account.emailNote')}
        </p>
      </div>

      {/* Mot de passe */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <h3 className="heading-4">{t('account.password')}</h3>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors"
          >
            {showPasswordForm ? t('profile.cancel') : t('profile.modify')}
          </button>
        </div>

        {showPasswordForm ? (
          <form className="space-y-4 max-w-md">
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
            <div className="flex justify-end">
              <Button type="submit">
                {t('account.changePassword')}
              </Button>
            </div>
          </form>
        ) : (
          <p className="body-md">••••••••••••</p>
        )}
      </div>

      {/* Suppression du compte */}
      <div className="p-6 bg-error-50">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚠️</span>
          <h3 className="font-semibold text-error-700">{t('account.dangerZone')}</h3>
        </div>
        <p className="body-md mb-4">
          {t('account.deleteWarning')}
        </p>
        <Button
          variant="outline"
          className="!border-error-500 !text-error-600 hover:!bg-error-100"
          onClick={onDeleteClick}
        >
          {t('account.deleteAccount')}
        </Button>
      </div>
    </div>
  )
}

// Composant Paramètres des Notifications
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
    { key: 'dailyReminder' as const, label: t('notifications.dailyReminder'), description: t('notifications.dailyReminderDesc'), icon: '⏰' },
    { key: 'weeklyReport' as const, label: t('notifications.weeklyReport'), description: t('notifications.weeklyReportDesc'), icon: '📈' },
    { key: 'newRecipes' as const, label: t('notifications.newRecipes'), description: t('notifications.newRecipesDesc'), icon: '🍽️' },
    { key: 'achievements' as const, label: t('notifications.achievements'), description: t('notifications.achievementsDesc'), icon: '🏆' },
    { key: 'tips' as const, label: t('notifications.tips'), description: t('notifications.tipsDesc'), icon: '💡' },
  ]

  return (
    <div className="divide-y divide-neutral-100">
      {notificationOptions.map((option) => (
        <div key={option.key} className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{option.icon}</span>
            <div>
              <h4 className="font-medium text-neutral-800">{option.label}</h4>
              <p className="body-sm">{option.description}</p>
            </div>
          </div>
          <button
            onClick={() => toggleSetting(option.key)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings[option.key] ? 'bg-primary-500' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                settings[option.key] ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      ))}

      <div className="p-6">
        <Button className="w-full md:w-auto">
          {t('notifications.savePreferences')}
        </Button>
      </div>
    </div>
  )
}

// Composant Paramètres de Confidentialité
function PrivacySettings() {
  const { t } = useTranslation('settings')

  return (
    <div className="divide-y divide-neutral-100">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📋</span>
          <h3 className="heading-4">{t('privacy.yourData')}</h3>
        </div>
        <p className="body-md mb-4">
          {t('privacy.gdprNote')}
        </p>
        <Button variant="outline">
          {t('privacy.downloadData')}
        </Button>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔐</span>
          <h3 className="heading-4">{t('privacy.dataSharing')}</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 rounded text-primary-500" />
            <div>
              <p className="font-medium text-neutral-800">{t('privacy.serviceImprovement')}</p>
              <p className="body-sm">{t('privacy.serviceImprovementDesc')}</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 rounded text-primary-500" />
            <div>
              <p className="font-medium text-neutral-800">{t('privacy.anonymousStats')}</p>
              <p className="body-sm">{t('privacy.anonymousStatsDesc')}</p>
            </div>
          </label>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📄</span>
          <h3 className="heading-4">{t('privacy.legalDocs')}</h3>
        </div>
        <div className="space-y-2">
          <a href="#" className="block text-primary-500 hover:text-primary-600 transition-colors">{t('privacy.privacyPolicy')}</a>
          <a href="#" className="block text-primary-500 hover:text-primary-600 transition-colors">{t('privacy.termsOfService')}</a>
          <a href="#" className="block text-primary-500 hover:text-primary-600 transition-colors">{t('privacy.cookiePolicy')}</a>
        </div>
      </div>
    </div>
  )
}
