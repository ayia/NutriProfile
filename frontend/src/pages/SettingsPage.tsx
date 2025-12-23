import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { profileApi } from '@/services/profileApi'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import type { Profile, ProfileCreate, ActivityLevel, Goal, DietType } from '@/types/profile'
import { ACTIVITY_LABELS, GOAL_LABELS, DIET_LABELS, COMMON_ALLERGIES } from '@/types/profile'

type SettingsTab = 'profile' | 'account' | 'notifications' | 'privacy'

export function SettingsPage() {
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
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'account', label: 'Compte', icon: '🔐' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Confidentialité', icon: '🛡️' },
  ]

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'SUPPRIMER') {
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
                Supprimer votre compte
              </h3>
              <p className="body-md">
                Cette action est irréversible. Toutes vos données seront supprimées définitivement.
              </p>
            </div>

            <div className="mb-6">
              <label className="label mb-2 block">
                Tapez <span className="font-bold text-error-600">SUPPRIMER</span> pour confirmer
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="input focus:ring-error-500"
                placeholder="SUPPRIMER"
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
                Annuler
              </Button>
              <Button
                variant="primary"
                className="flex-1 !bg-error-500 hover:!bg-error-600"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'SUPPRIMER'}
                isLoading={deleteProfileMutation.isPending}
              >
                Supprimer
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
      title: 'Informations physiques',
      icon: '📏',
      fields: [
        { key: 'age', label: 'Âge', value: profile?.age, suffix: 'ans' },
        { key: 'height_cm', label: 'Taille', value: profile?.height_cm, suffix: 'cm' },
        { key: 'weight_kg', label: 'Poids', value: profile?.weight_kg, suffix: 'kg' },
      ],
    },
    {
      id: 'goals',
      title: 'Objectifs',
      icon: '🎯',
      fields: [
        { key: 'goal', label: 'Objectif', value: profile?.goal ? GOAL_LABELS[profile.goal] : '-' },
        { key: 'target_weight_kg', label: 'Poids cible', value: profile?.target_weight_kg, suffix: 'kg' },
        { key: 'activity_level', label: 'Activité', value: profile?.activity_level ? ACTIVITY_LABELS[profile.activity_level] : '-' },
      ],
    },
    {
      id: 'diet',
      title: 'Régime alimentaire',
      icon: '🥗',
      fields: [
        { key: 'diet_type', label: 'Type de régime', value: profile?.diet_type ? DIET_LABELS[profile.diet_type] : '-' },
        { key: 'allergies', label: 'Allergies', value: profile?.allergies?.join(', ') || 'Aucune' },
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
              {editSection === section.id ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {editSection === section.id ? (
            <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
              {section.id === 'physical' && (
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    id="age"
                    type="number"
                    label="Âge"
                    defaultValue={profile?.age}
                    {...register('age', { valueAsNumber: true })}
                  />
                  <Input
                    id="height_cm"
                    type="number"
                    label="Taille (cm)"
                    defaultValue={profile?.height_cm}
                    {...register('height_cm', { valueAsNumber: true })}
                  />
                  <Input
                    id="weight_kg"
                    type="number"
                    label="Poids (kg)"
                    step="0.1"
                    defaultValue={profile?.weight_kg}
                    {...register('weight_kg', { valueAsNumber: true })}
                  />
                </div>
              )}

              {section.id === 'goals' && (
                <div className="space-y-4">
                  <div>
                    <label className="label mb-2 block">Objectif</label>
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
                    <label className="label mb-2 block">Niveau d'activité</label>
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
                    label="Poids cible (kg)"
                    step="0.1"
                    defaultValue={profile?.target_weight_kg}
                    {...register('target_weight_kg', { valueAsNumber: true })}
                  />
                </div>
              )}

              {section.id === 'diet' && (
                <div className="space-y-4">
                  <div>
                    <label className="label mb-2 block">Type de régime</label>
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
                    <label className="label mb-2 block">Allergies</label>
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
                  Enregistrer
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
          <h3 className="heading-4">Besoins nutritionnels quotidiens</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NutritionCard
            label="Calories"
            value={profile?.daily_calories}
            unit="kcal"
            color="bg-accent-100 text-accent-700"
          />
          <NutritionCard
            label="Protéines"
            value={profile?.protein_g}
            unit="g"
            color="bg-secondary-100 text-secondary-700"
          />
          <NutritionCard
            label="Glucides"
            value={profile?.carbs_g}
            unit="g"
            color="bg-warning-100 text-warning-700"
          />
          <NutritionCard
            label="Lipides"
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
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  return (
    <div className="divide-y divide-neutral-100">
      {/* Email */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">✉️</span>
          <h3 className="heading-4">Adresse email</h3>
        </div>
        <p className="body-md">{user?.email}</p>
        <p className="body-sm mt-2">
          L'adresse email ne peut pas être modifiée pour des raisons de sécurité.
        </p>
      </div>

      {/* Mot de passe */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <h3 className="heading-4">Mot de passe</h3>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors"
          >
            {showPasswordForm ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        {showPasswordForm ? (
          <form className="space-y-4 max-w-md">
            <Input
              id="current_password"
              type="password"
              label="Mot de passe actuel"
              placeholder="••••••••"
            />
            <Input
              id="new_password"
              type="password"
              label="Nouveau mot de passe"
              placeholder="••••••••"
            />
            <Input
              id="confirm_password"
              type="password"
              label="Confirmer le nouveau mot de passe"
              placeholder="••••••••"
            />
            <div className="flex justify-end">
              <Button type="submit">
                Changer le mot de passe
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
          <h3 className="font-semibold text-error-700">Zone de danger</h3>
        </div>
        <p className="body-md mb-4">
          La suppression de votre compte est irréversible. Toutes vos données (profil, historique, recettes sauvegardées) seront définitivement supprimées.
        </p>
        <Button
          variant="outline"
          className="!border-error-500 !text-error-600 hover:!bg-error-100"
          onClick={onDeleteClick}
        >
          Supprimer mon compte
        </Button>
      </div>
    </div>
  )
}

// Composant Paramètres des Notifications
function NotificationSettings() {
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
    { key: 'dailyReminder' as const, label: 'Rappel quotidien', description: 'Recevoir un rappel pour enregistrer vos repas', icon: '⏰' },
    { key: 'weeklyReport' as const, label: 'Rapport hebdomadaire', description: 'Résumé de votre semaine nutritionnelle', icon: '📈' },
    { key: 'newRecipes' as const, label: 'Nouvelles recettes', description: 'Suggestions de recettes personnalisées', icon: '🍽️' },
    { key: 'achievements' as const, label: 'Succès et badges', description: 'Notifications quand vous débloquez un succès', icon: '🏆' },
    { key: 'tips' as const, label: 'Conseils nutrition', description: 'Astuces et conseils de notre coach IA', icon: '💡' },
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
          Enregistrer les préférences
        </Button>
      </div>
    </div>
  )
}

// Composant Paramètres de Confidentialité
function PrivacySettings() {
  return (
    <div className="divide-y divide-neutral-100">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📋</span>
          <h3 className="heading-4">Vos données</h3>
        </div>
        <p className="body-md mb-4">
          Conformément au RGPD, vous avez le droit d'accéder à vos données personnelles et de les télécharger.
        </p>
        <Button variant="outline">
          Télécharger mes données
        </Button>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔐</span>
          <h3 className="heading-4">Partage des données</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 rounded text-primary-500" />
            <div>
              <p className="font-medium text-neutral-800">Amélioration du service</p>
              <p className="body-sm">Autoriser l'utilisation anonyme de mes données pour améliorer les algorithmes</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 rounded text-primary-500" />
            <div>
              <p className="font-medium text-neutral-800">Statistiques anonymes</p>
              <p className="body-sm">Partager des statistiques anonymes pour la recherche en nutrition</p>
            </div>
          </label>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📄</span>
          <h3 className="heading-4">Documents légaux</h3>
        </div>
        <div className="space-y-2">
          <a href="#" className="block text-primary-500 hover:text-primary-600 transition-colors">Politique de confidentialité</a>
          <a href="#" className="block text-primary-500 hover:text-primary-600 transition-colors">Conditions d'utilisation</a>
          <a href="#" className="block text-primary-500 hover:text-primary-600 transition-colors">Politique des cookies</a>
        </div>
      </div>
    </div>
  )
}
