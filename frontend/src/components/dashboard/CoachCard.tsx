import type { CoachResponse } from '@/types/dashboard'

interface CoachCardProps {
  advice: CoachResponse
}

export function CoachCard({ advice }: CoachCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      default:
        return 'border-l-green-500 bg-green-50'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧑‍⚕️</span>
          <div>
            <h3 className="font-semibold">{advice.greeting}</h3>
            <p className="text-primary-100 text-sm mt-1">{advice.summary}</p>
          </div>
        </div>
      </div>

      {/* Conseils */}
      <div className="p-4 space-y-3">
        {advice.advices.map((item, index) => (
          <div
            key={index}
            className={`border-l-4 rounded-r-lg p-3 ${getPriorityColor(item.priority)}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl flex-shrink-0">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{item.message}</p>
                {item.action && (
                  <button className="text-xs text-primary-600 hover:text-primary-700 mt-1 font-medium">
                    → {item.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Citation motivation */}
      {advice.motivation_quote && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600 italic">"{advice.motivation_quote}"</p>
          </div>
        </div>
      )}
    </div>
  )
}
