import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { profileApi } from '@/services/profileApi'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import type { Profile, ProfileCreate, ActivityLevel, Goal, DietType } from '@/types/profile'
import { ACTIVITY_LABELS, GOAL_LABELS, DIET_LABELS, COMMON_ALLERGIES, COMMON_MEDICAL_CONDITIONS, COMMON_MEDICATIONS } from '@/types/profile'

type SettingsTab = 'profile' | 'account' | 'notifications' | 'privacy'

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
    mutationFn: profileApi.updateProfile,
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

  // Scroll reveal animation
  useEffect(() => {
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

    return () => observerRef.current?.disconnect()
  }, [activeTab])

  const tabs: { id: SettingsTab; label: string; icon: string; color: string }[] = [
    { id: 'profile', label: t('tabs.profile'), icon: '👤', color: 'from-primary-500 to-emerald-500' },
    { id: 'account', label: t('tabs.account'), icon: '🔐', color: 'from-secondary-500 to-cyan-500' },
    { id: 'notifications', label: t('tabs.notifications'), icon: '🔔', color: 'from-warning-500 to-amber-500' },
    { id: 'privacy', label: t('tabs.privacy'), icon: '🛡️', color: 'from-indigo-500 to-purple-500' },
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
        {/* En-tête avec avatar - Enhanced */}
        <div className="glass-card p-8 mb-8 animate-fade-in">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-emerald-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-xl transform group-hover:scale-105 transition-transform">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
              {profileQuery.data?.goal && (
                <span className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-sm font-medium rounded-full shadow-lg">
                  <span>🎯</span>
                  {GOAL_LABELS[profileQuery.data.goal]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation par onglets - Enhanced */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : 'glass-card text-gray-600 hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5'
              }`}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <span className={`text-lg ${activeTab === tab.id ? 'animate-bounce-soft' : ''}`}>{tab.icon}</span>
              <span>{tab.label}</span>
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
                  <span className="text-4xl">⚠️</span>
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
                      <span>Suppression...</span>
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
      icon: '📏',
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
      icon: '🎯',
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
      icon: '🥗',
      color: 'from-primary-500 to-emerald-500',
      fields: [
        { key: 'diet_type', label: t('profile.dietType'), value: profile?.diet_type ? DIET_LABELS[profile.diet_type] : '-' },
        { key: 'allergies', label: t('profile.allergies'), value: profile?.allergies?.join(', ') || t('profile.noAllergies') },
      ],
    },
    {
      id: 'health',
      title: t('profile.health'),
      icon: '🏥',
      color: 'from-rose-500 to-pink-500',
      fields: [
        { key: 'medical_conditions', label: t('profile.medicalConditions'), value: profile?.medical_conditions?.map(c => COMMON_MEDICAL_CONDITIONS.find(mc => mc.key === c)?.label || c).join(', ') || t('profile.noConditions') },
        { key: 'medications', label: t('profile.medications'), value: profile?.medications?.join(', ') || t('profile.noMedications') },
      ],
    },
  ]

  return (
    <div className="divide-y divide-gray-100">
      {sections.map((section, index) => (
        <div key={section.id} className="p-6 reveal" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{section.icon}</span>
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

              {section.id === 'diet' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.dietType')}</label>
                    <select
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      defaultValue={profile?.diet_type}
                      {...register('diet_type')}
                    >
                      {(Object.keys(DIET_LABELS) as DietType[]).map((key) => (
                        <option key={key} value={key}>{DIET_LABELS[key]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">{t('profile.allergies')}</label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_ALLERGIES.map((allergy) => (
                        <label key={allergy} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm cursor-pointer transition-colors group">
                          <input
                            type="checkbox"
                            defaultChecked={profile?.allergies?.includes(allergy)}
                            className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
                          />
                          <span className="group-hover:text-gray-900">{allergy}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {section.id === 'health' && (
                <HealthSectionForm
                  profile={profile}
                  onSave={(data) => {
                    onUpdate(data)
                    setEditSection(null)
                  }}
                  isUpdating={isUpdating}
                />
              )}

              {/* Bouton de soumission générique - pas pour la section health qui a son propre bouton */}
              {section.id !== 'health' && (
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      t('profile.save')
                    )}
                  </button>
                </div>
              )}
            </form>
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
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('profile.nutritionalNeeds')}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NutritionCard
            label={t('profile.calories')}
            value={profile?.daily_calories}
            unit="kcal"
            icon="🔥"
            color="from-accent-500 to-amber-500"
          />
          <NutritionCard
            label={t('profile.protein')}
            value={profile?.protein_g}
            unit="g"
            icon="💪"
            color="from-secondary-500 to-cyan-500"
          />
          <NutritionCard
            label={t('profile.carbs')}
            value={profile?.carbs_g}
            unit="g"
            icon="🌾"
            color="from-warning-500 to-amber-500"
          />
          <NutritionCard
            label={t('profile.fat')}
            value={profile?.fat_g}
            unit="g"
            icon="🥑"
            color="from-error-500 to-rose-500"
          />
        </div>
      </div>
    </div>
  )
}

function NutritionCard({ label, value, unit, icon, color }: { label: string; value: number | null | undefined; unit: string; icon: string; color: string }) {
  return (
    <div className="glass-card p-5 text-center hover-lift group">
      <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
        <span className="text-xl">{icon}</span>
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
    onSave({
      medical_conditions: selectedConditions,
      medications: selectedMedications,
    })
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
            <span className="text-2xl">📲</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('account.installApp')}</h3>
        </div>

        {isStandalone ? (
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
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
              <span>📲</span>
              {t('account.installButton')}
            </button>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="p-6 reveal" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">✉️</span>
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
              <span className="text-2xl">🔒</span>
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

      {/* Suppression du compte */}
      <div className="p-6 bg-gradient-to-r from-error-50 to-rose-50 reveal" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-error-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">⚠️</span>
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
    { key: 'dailyReminder' as const, label: t('notifications.dailyReminder'), description: t('notifications.dailyReminderDesc'), icon: '⏰', color: 'from-secondary-500 to-cyan-500' },
    { key: 'weeklyReport' as const, label: t('notifications.weeklyReport'), description: t('notifications.weeklyReportDesc'), icon: '📈', color: 'from-primary-500 to-emerald-500' },
    { key: 'newRecipes' as const, label: t('notifications.newRecipes'), description: t('notifications.newRecipesDesc'), icon: '🍽️', color: 'from-accent-500 to-amber-500' },
    { key: 'achievements' as const, label: t('notifications.achievements'), description: t('notifications.achievementsDesc'), icon: '🏆', color: 'from-warning-500 to-amber-500' },
    { key: 'tips' as const, label: t('notifications.tips'), description: t('notifications.tipsDesc'), icon: '💡', color: 'from-indigo-500 to-purple-500' },
  ]

  return (
    <div className="divide-y divide-gray-100">
      {notificationOptions.map((option, index) => (
        <div key={option.key} className="p-6 flex items-center justify-between reveal" style={{ animationDelay: `${0.05 * (index + 1)}s` }}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <span className="text-2xl">{option.icon}</span>
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
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('privacy.yourData')}</h3>
        </div>
        <p className="text-gray-600 mb-6">
          {t('privacy.gdprNote')}
        </p>
        <button className="px-6 py-3 glass-card text-gray-700 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <span>📥</span>
          {t('privacy.downloadData')}
        </button>
      </div>

      <div className="p-6 reveal" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🔐</span>
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
            <span className="text-2xl">📄</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('privacy.legalDocs')}</h3>
        </div>
        <div className="space-y-3">
          <Link to="/privacy" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-all group">
            <span className="text-xl group-hover:scale-110 transition-transform">🔒</span>
            <span className="font-medium">{t('privacy.privacyPolicy')}</span>
            <span className="ml-auto text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link to="/terms" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-all group">
            <span className="text-xl group-hover:scale-110 transition-transform">📜</span>
            <span className="font-medium">{t('privacy.termsOfService')}</span>
            <span className="ml-auto text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <a href="#" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-all group">
            <span className="text-xl group-hover:scale-110 transition-transform">🍪</span>
            <span className="font-medium">{t('privacy.cookiePolicy')}</span>
            <span className="ml-auto text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </div>
  )
}
