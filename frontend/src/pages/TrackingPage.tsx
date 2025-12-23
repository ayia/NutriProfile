import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { trackingApi } from '@/services/trackingApi'
import { ProgressChart } from '@/components/tracking/ProgressChart'
import { ActivityForm } from '@/components/tracking/ActivityForm'
import { WeightForm } from '@/components/tracking/WeightForm'
import { GoalForm } from '@/components/tracking/GoalForm'
import { GoalCard } from '@/components/tracking/GoalCard'
import { Button } from '@/components/ui/Button'
import { ACTIVITY_TYPES, INTENSITY_LABELS } from '@/types/tracking'

type Tab = 'overview' | 'activities' | 'weight' | 'goals'
type Modal = 'activity' | 'weight' | 'goal' | null

export function TrackingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [activeModal, setActiveModal] = useState<Modal>(null)
  const [chartPeriod, setChartPeriod] = useState<7 | 14 | 30>(30)

  const summaryQuery = useQuery({
    queryKey: ['tracking', 'summary'],
    queryFn: trackingApi.getSummary,
  })

  const progressQuery = useQuery({
    queryKey: ['tracking', 'progress', chartPeriod],
    queryFn: () => trackingApi.getProgressData(chartPeriod),
  })

  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: () => trackingApi.getActivities(),
    enabled: activeTab === 'activities',
  })

  const weightsQuery = useQuery({
    queryKey: ['weight'],
    queryFn: () => trackingApi.getWeightLogs(),
  })

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'activities', label: 'Activités', icon: '🏃' },
    { id: 'weight', label: 'Poids', icon: '⚖️' },
    { id: 'goals', label: 'Objectifs', icon: '🎯' },
  ]

  const summary = summaryQuery.data
  const progress = progressQuery.data

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Suivi</h1>
        <p className="text-gray-600 mt-2">
          Suivez votre progression et atteignez vos objectifs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-6">
          {/* Stats du jour */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Aujourd'hui</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">
                  {summary.today.calories_consumed}
                </div>
                <div className="text-xs text-gray-500">kcal consommées</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {summary.today.calories_burned}
                </div>
                <div className="text-xs text-gray-500">kcal brûlées</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {summary.today.activity_minutes}
                </div>
                <div className="text-xs text-gray-500">min d'activité</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600">
                  {summary.today.water_ml}
                </div>
                <div className="text-xs text-gray-500">ml d'eau</div>
              </div>
            </div>
          </div>

          {/* Graphiques */}
          {progress && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Progression</h3>
                <div className="flex gap-1">
                  {([7, 14, 30] as const).map((days) => (
                    <Button
                      key={days}
                      size="sm"
                      variant={chartPeriod === days ? 'primary' : 'ghost'}
                      onClick={() => setChartPeriod(days)}
                    >
                      {days}j
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm text-gray-600 mb-2">Calories</h4>
                  <ProgressChart data={progress} metric="calories" color="#10B981" />
                </div>
                <div>
                  <h4 className="text-sm text-gray-600 mb-2">Activité (minutes)</h4>
                  <ProgressChart data={progress} metric="activity_minutes" color="#F59E0B" />
                </div>
                <div>
                  <h4 className="text-sm text-gray-600 mb-2">Poids</h4>
                  <ProgressChart data={progress} metric="weight" color="#6366F1" />
                </div>
              </div>
            </div>
          )}

          {/* Stats semaine */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Cette semaine</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Moyenne calories</div>
                <div className="text-xl font-semibold">
                  {Math.round(summary.week.avg_calories_consumed)} kcal
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total activité</div>
                <div className="text-xl font-semibold">
                  {summary.week.total_activity_minutes} min
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total pas</div>
                <div className="text-xl font-semibold">
                  {summary.week.total_steps.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Évolution poids</div>
                <div className={`text-xl font-semibold ${
                  summary.week.weight_change === null
                    ? 'text-gray-400'
                    : summary.week.weight_change > 0
                    ? 'text-red-500'
                    : summary.week.weight_change < 0
                    ? 'text-green-500'
                    : ''
                }`}>
                  {summary.week.weight_change !== null
                    ? `${summary.week.weight_change > 0 ? '+' : ''}${summary.week.weight_change.toFixed(1)} kg`
                    : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Répartition activités */}
          {summary.activity_breakdown.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Répartition des activités (30j)</h3>
              <div className="space-y-3">
                {summary.activity_breakdown.map((activity) => (
                  <div key={activity.activity_type} className="flex items-center gap-3">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{activity.name}</span>
                        <span className="text-gray-500">{activity.total_duration} min</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{
                            width: `${(activity.total_duration / summary.activity_breakdown[0].total_duration) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{activity.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="flex gap-3">
            <Button onClick={() => setActiveModal('activity')} className="flex-1">
              + Activité
            </Button>
            <Button onClick={() => setActiveModal('weight')} variant="outline" className="flex-1">
              + Poids
            </Button>
          </div>
        </div>
      )}

      {/* Activités */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setActiveModal('activity')}>
              + Nouvelle activité
            </Button>
          </div>

          {activitiesQuery.isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}

          {activitiesQuery.data?.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <span className="text-4xl">🏃</span>
              <p className="text-gray-600 mt-4">Aucune activité enregistrée</p>
              <Button className="mt-4" onClick={() => setActiveModal('activity')}>
                Ajouter une activité
              </Button>
            </div>
          )}

          {activitiesQuery.data?.map((activity) => {
            const activityInfo = ACTIVITY_TYPES[activity.activity_type] || ACTIVITY_TYPES.other
            return (
              <div key={activity.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{activityInfo.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activityInfo.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                        {INTENSITY_LABELS[activity.intensity]}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(activity.activity_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{activity.duration_minutes} min</div>
                    <div className="text-sm text-orange-600">
                      {activity.calories_burned} kcal
                    </div>
                  </div>
                </div>
                {activity.notes && (
                  <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {activity.notes}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Poids */}
      {activeTab === 'weight' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setActiveModal('weight')}>
              + Nouvelle pesée
            </Button>
          </div>

          {progress && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Évolution du poids</h3>
              <ProgressChart data={progress} metric="weight" color="#6366F1" height={250} />
            </div>
          )}

          {weightsQuery.isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}

          {weightsQuery.data?.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <span className="text-4xl">⚖️</span>
              <p className="text-gray-600 mt-4">Aucune pesée enregistrée</p>
              <Button className="mt-4" onClick={() => setActiveModal('weight')}>
                Ajouter une pesée
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {weightsQuery.data?.map((log, index) => {
              const prev = weightsQuery.data?.[index + 1]
              const diff = prev ? log.weight_kg - prev.weight_kg : null

              return (
                <div key={log.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.log_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </div>
                    <div className="text-xl font-semibold">{log.weight_kg} kg</div>
                  </div>
                  <div className="text-right">
                    {diff !== null && (
                      <div className={`text-sm font-medium ${
                        diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                      </div>
                    )}
                    {log.body_fat_percent && (
                      <div className="text-xs text-gray-500">
                        {log.body_fat_percent}% MG
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Objectifs */}
      {activeTab === 'goals' && summary && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setActiveModal('goal')}>
              + Nouvel objectif
            </Button>
          </div>

          {summary.goals.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <span className="text-4xl">🎯</span>
              <p className="text-gray-600 mt-4">Aucun objectif défini</p>
              <Button className="mt-4" onClick={() => setActiveModal('goal')}>
                Créer un objectif
              </Button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {summary.goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {activeModal === 'activity' && 'Nouvelle activité'}
                {activeModal === 'weight' && 'Nouvelle pesée'}
                {activeModal === 'goal' && 'Nouvel objectif'}
              </h3>

              {activeModal === 'activity' && (
                <ActivityForm
                  onSuccess={() => setActiveModal(null)}
                  onCancel={() => setActiveModal(null)}
                />
              )}

              {activeModal === 'weight' && (
                <WeightForm
                  onSuccess={() => setActiveModal(null)}
                  onCancel={() => setActiveModal(null)}
                  currentWeight={weightsQuery.data?.[0]?.weight_kg}
                />
              )}

              {activeModal === 'goal' && (
                <GoalForm
                  onSuccess={() => setActiveModal(null)}
                  onCancel={() => setActiveModal(null)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading global */}
      {summaryQuery.isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement...</p>
        </div>
      )}
    </div>
  )
}
