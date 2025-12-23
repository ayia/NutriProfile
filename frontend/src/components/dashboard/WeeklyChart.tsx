interface DayData {
  day: string
  shortDay: string
  calories: number
  target: number
}

interface WeeklyChartProps {
  data?: DayData[]
  title?: string
}

// Données de démonstration si pas de données fournies
const defaultData: DayData[] = [
  { day: 'Lundi', shortDay: 'Lu', calories: 1850, target: 2000 },
  { day: 'Mardi', shortDay: 'Ma', calories: 2100, target: 2000 },
  { day: 'Mercredi', shortDay: 'Me', calories: 1920, target: 2000 },
  { day: 'Jeudi', shortDay: 'Je', calories: 1780, target: 2000 },
  { day: 'Vendredi', shortDay: 'Ve', calories: 2200, target: 2000 },
  { day: 'Samedi', shortDay: 'Sa', calories: 2350, target: 2000 },
  { day: 'Dimanche', shortDay: 'Di', calories: 0, target: 2000 },
]

export function WeeklyChart({ data = defaultData, title = 'Cette semaine' }: WeeklyChartProps) {
  const maxValue = Math.max(...data.map(d => Math.max(d.calories, d.target)))
  const today = new Date().getDay()
  const todayIndex = today === 0 ? 6 : today - 1 // Convertir dimanche=0 en index 6

  const getBarColor = (calories: number, target: number) => {
    const ratio = calories / target
    if (ratio > 1.1) return 'bg-red-400' // Dépassement
    if (ratio >= 0.9) return 'bg-green-500' // Dans la cible
    if (ratio >= 0.7) return 'bg-yellow-400' // Un peu en dessous
    return 'bg-blue-400' // En dessous
  }

  const average = Math.round(data.filter(d => d.calories > 0).reduce((acc, d) => acc + d.calories, 0) / data.filter(d => d.calories > 0).length) || 0
  const targetAverage = data[0]?.target || 2000

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-gray-600">Dans la cible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded" />
            <span className="text-gray-600">Dépassement</span>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((day, index) => {
          const height = day.calories > 0 ? (day.calories / maxValue) * 100 : 0
          const targetHeight = (day.target / maxValue) * 100
          const isToday = index === todayIndex

          return (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full h-36 flex items-end">
                {/* Ligne de target */}
                <div
                  className="absolute w-full border-t-2 border-dashed border-gray-300"
                  style={{ bottom: `${targetHeight}%` }}
                />

                {/* Barre de calories */}
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    getBarColor(day.calories, day.target)
                  } ${isToday ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
                  style={{ height: `${height}%` }}
                >
                  {/* Tooltip au hover */}
                  <div className="opacity-0 hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity">
                    {day.calories} kcal
                  </div>
                </div>
              </div>

              {/* Label jour */}
              <span className={`text-xs ${isToday ? 'font-bold text-primary-600' : 'text-gray-500'}`}>
                {day.shortDay}
              </span>
            </div>
          )
        })}
      </div>

      {/* Stats résumé */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{average}</div>
          <div className="text-xs text-gray-500">Moyenne kcal</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{targetAverage}</div>
          <div className="text-xs text-gray-500">Objectif kcal</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${average <= targetAverage ? 'text-green-600' : 'text-red-600'}`}>
            {average <= targetAverage ? '-' : '+'}{Math.abs(average - targetAverage)}
          </div>
          <div className="text-xs text-gray-500">Différence</div>
        </div>
      </div>
    </div>
  )
}
