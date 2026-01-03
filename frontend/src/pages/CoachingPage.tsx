import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  RefreshCw,
  Trophy,
  Lightbulb,
  Target,
  BarChart3,
  Brain,
  MessageSquare,
  Check,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Activity,
  Clock,
  Utensils,
  Send,
  Zap,
  Lock,
  type LucideIcon
} from 'lucide-react'
import { UsageBanner, USAGE_QUERY_KEY } from '@/components/subscription/UsageBanner'
import { api, subscriptionApi } from '@/services/api'

type Tab = 'chat' | 'tips' | 'challenges' | 'summary'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Tip {
  category: string
  message: string
  priority: string
  emoji: string
  action: string | null
}

interface Challenge {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  points: number
  progress: number
  target: number
  completed: boolean
  emoji: string
}

interface WeeklySummary {
  avg_calories: number
  avg_protein: number
  avg_carbs: number
  avg_fat: number
  total_activities: number
  activity_minutes: number
  meals_logged: number
  streak_days: number
  progress_message: string
}

export function CoachingPage() {
  const { t } = useTranslation('coaching')
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Usage query for checking limits
  const usageQuery = useQuery({
    queryKey: USAGE_QUERY_KEY,
    queryFn: subscriptionApi.getUsage,
    staleTime: 30 * 1000,
  })

  const coachLimit = usageQuery.data?.limits.coach_messages?.limit ?? 1
  const coachUsed = usageQuery.data?.usage.coach_messages ?? 0
  const isLimitReached = coachLimit !== -1 && coachUsed >= coachLimit
  const isPremium = coachLimit === -1

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await api.post<{ response: string }>('/coaching/chat', { message })
      return response.data
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }
      setChatMessages(prev => [...prev, assistantMessage])
      // Invalidate usage query to refresh limits
      queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEY })
    },
  })

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // Add welcome message on first load
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        id: 'welcome',
        role: 'assistant',
        content: t('chat.welcome'),
        timestamp: new Date(),
      }])
    }
  }, [t])

  const handleSendMessage = () => {
    if (!inputMessage.trim() || chatMutation.isPending || isLimitReached) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    }
    setChatMessages(prev => [...prev, userMessage])
    setInputMessage('')
    chatMutation.mutate(inputMessage.trim())
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (isLimitReached) return
    setInputMessage(suggestion)
  }

  const tipsQuery = useQuery({
    queryKey: ['coaching', 'tips'],
    queryFn: async () => {
      const response = await api.get<Tip[]>('/coaching/tips')
      return response.data
    },
    enabled: activeTab === 'tips',
  })

  const challengesQuery = useQuery({
    queryKey: ['coaching', 'challenges'],
    queryFn: async () => {
      const response = await api.get<Challenge[]>('/coaching/challenges')
      return response.data
    },
    enabled: activeTab === 'challenges',
  })

  const summaryQuery = useQuery({
    queryKey: ['coaching', 'weekly-summary'],
    queryFn: async () => {
      const response = await api.get<WeeklySummary>('/coaching/weekly-summary')
      return response.data
    },
    enabled: activeTab === 'summary',
  })

  const tabs: { id: Tab; label: string; IconComponent: LucideIcon }[] = [
    { id: 'chat', label: t('tabs.chat'), IconComponent: MessageSquare },
    { id: 'tips', label: t('tabs.tips'), IconComponent: Lightbulb },
    { id: 'challenges', label: t('tabs.challenges'), IconComponent: Target },
    { id: 'summary', label: t('tabs.summary'), IconComponent: BarChart3 },
  ]

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

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'hard':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-green-100 text-green-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] md:w-[500px] md:h-[500px] bg-gradient-to-br from-primary-100/40 to-emerald-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[150px] h-[150px] sm:w-[280px] sm:h-[280px] md:w-[400px] md:h-[400px] bg-gradient-to-br from-accent-100/40 to-amber-100/40 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-card text-primary-700 text-sm font-medium mb-4">
                <Brain className="w-4 h-4 animate-pulse" />
                {t('subtitle')}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                {t('title')}
              </h1>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 glass-card">
              <span className="text-primary-600 font-medium">{t('aiActive')}</span>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success-500"></span>
              </span>
            </div>
          </div>
        </div>

        {/* Usage Banner */}
        <div className="mb-6">
          <UsageBanner action="coach_messages" showAlways />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-emerald-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                  : 'glass-card text-gray-600 hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5'
              }`}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <tab.IconComponent className={`w-5 h-5 ${activeTab === tab.id ? 'animate-bounce-soft' : ''}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="glass-card p-4 sm:p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('chat.title')}</h2>
                <p className="text-sm text-gray-500">{t('chat.subtitle')}</p>
              </div>
              {isPremium && (
                <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-xs font-bold rounded-full">
                  {t('chat.premiumBadge')}
                </span>
              )}
            </div>

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="h-[400px] overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-xl"
            >
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-br-md'
                        : 'bg-white shadow-sm border border-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <Brain className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-primary-600">AI Coach</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-sm border border-gray-100 p-3 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Brain className="w-3 h-3 text-white animate-pulse" />
                      </div>
                      <span className="text-sm text-gray-500">{t('chat.thinking')}</span>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {chatMutation.isError && (
                <div className="flex justify-start">
                  <div className="bg-red-50 border border-red-200 p-3 rounded-2xl">
                    <p className="text-sm text-red-600">{t('chat.error')}</p>
                    <button
                      onClick={() => chatMutation.reset()}
                      className="text-xs text-red-700 underline mt-1"
                    >
                      {t('chat.retry')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Limit Reached Message */}
            {isLimitReached && (
              <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 font-medium">{t('chat.limitReached')}</p>
                  </div>
                  <Link
                    to="/pricing"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    Premium
                  </Link>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {chatMessages.length <= 1 && !isLimitReached && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">{t('chat.suggestions.title')}</p>
                <div className="flex flex-wrap gap-2">
                  {['meal', 'calories', 'protein', 'tips'].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleSuggestionClick(t(`chat.suggestions.${key}`))}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-colors"
                    >
                      {t(`chat.suggestions.${key}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder={t('chat.placeholder')}
                disabled={isLimitReached || chatMutation.isPending}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLimitReached || chatMutation.isPending}
                className="px-4 py-3 bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('tips.title')}</h2>
                <p className="text-sm text-gray-500">{t('tips.subtitle')}</p>
              </div>
              <button
                onClick={() => tipsQuery.refetch()}
                disabled={tipsQuery.isFetching}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${tipsQuery.isFetching ? 'animate-spin' : ''}`} />
                {t('tips.refresh')}
              </button>
            </div>

            {tipsQuery.isLoading && (
              <div className="glass-card p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">{t('tips.loading')}</p>
              </div>
            )}

            {tipsQuery.error && (
              <div className="glass-card p-6 border-red-200 bg-red-50">
                <p className="text-red-600 font-medium">{t('tips.error')}</p>
                <button
                  onClick={() => tipsQuery.refetch()}
                  className="mt-2 text-sm text-red-700 underline"
                >
                  {t('tips.retry')}
                </button>
              </div>
            )}

            {tipsQuery.data && tipsQuery.data.length === 0 && (
              <div className="glass-card p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">{t('tips.noTips')}</p>
              </div>
            )}

            {tipsQuery.data && tipsQuery.data.map((tip, index) => (
              <div
                key={index}
                className={`border-l-4 rounded-r-xl p-4 glass-card ${getPriorityColor(tip.priority)} animate-fade-in-up`}
                style={{ animationDelay: `${0.05 * (index + 1)}s` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{tip.emoji}</span>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{t(`tipMessages.${tip.message}`, tip.message)}</p>
                    {tip.action && (
                      <button className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                        <span>→</span> {t(`tipActions.${tip.action}`, tip.action)}
                      </button>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tip.priority === 'high' ? 'bg-red-100 text-red-700' :
                    tip.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {t(`priority.${tip.priority}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('challenges.title')}</h2>
              <p className="text-sm text-gray-500">{t('challenges.subtitle')}</p>
            </div>

            {challengesQuery.isLoading && (
              <div className="glass-card p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">{t('challenges.loading')}</p>
              </div>
            )}

            {challengesQuery.error && (
              <div className="glass-card p-6 border-red-200 bg-red-50">
                <p className="text-red-600 font-medium">{t('challenges.error')}</p>
                <button
                  onClick={() => challengesQuery.refetch()}
                  className="mt-2 text-sm text-red-700 underline"
                >
                  {t('challenges.retry')}
                </button>
              </div>
            )}

            {challengesQuery.data && challengesQuery.data.map((challenge, index) => (
              <div
                key={challenge.id}
                className={`glass-card p-4 animate-fade-in-up ${challenge.completed ? 'ring-2 ring-green-500 bg-green-50/50' : ''}`}
                style={{ animationDelay: `${0.05 * (index + 1)}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center text-2xl">
                    {challenge.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900">{t(`challengeMessages.${challenge.id}_title`, challenge.title)}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyBadge(challenge.difficulty)}`}>
                          {t(`difficulty.${challenge.difficulty}`)}
                        </span>
                        <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
                          <Trophy className="h-4 w-4" />
                          {challenge.points} {t('challenges.points')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{t(`challengeMessages.${challenge.id}_desc`, challenge.description)}</p>

                    {/* Progress bar */}
                    <div className="relative">
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            challenge.completed
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-primary-500 to-emerald-500'
                          }`}
                          style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {t('challenges.progress', { current: challenge.progress, target: challenge.target })}
                        </span>
                        {challenge.completed && (
                          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                            <Check className="w-3 h-3" /> {t('challenges.completed')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('summary.title')}</h2>
              <p className="text-sm text-gray-500">{t('summary.subtitle')}</p>
            </div>

            {summaryQuery.isLoading && (
              <div className="glass-card p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">{t('summary.loading')}</p>
              </div>
            )}

            {summaryQuery.error && (
              <div className="glass-card p-6 border-red-200 bg-red-50">
                <p className="text-red-600 font-medium">{t('summary.error')}</p>
                <button
                  onClick={() => summaryQuery.refetch()}
                  className="mt-2 text-sm text-red-700 underline"
                >
                  {t('summary.retry')}
                </button>
              </div>
            )}

            {summaryQuery.data && (
              <>
                {/* Progress message */}
                <div className="glass-card p-6 bg-gradient-to-r from-primary-50 to-emerald-50">
                  <p className="text-lg font-medium text-primary-800">{t(`progressMessages.${summaryQuery.data.progress_message}`, summaryQuery.data.progress_message)}</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-4 text-center">
                    <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold text-gray-900">{Math.round(summaryQuery.data.avg_calories)}</div>
                    <div className="text-xs text-gray-500">{t('summary.avgCalories')}</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Dumbbell className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <div className="text-2xl font-bold text-gray-900">{summaryQuery.data.avg_protein}g</div>
                    <div className="text-xs text-gray-500">{t('summary.avgProtein')}</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Wheat className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                    <div className="text-2xl font-bold text-gray-900">{summaryQuery.data.avg_carbs}g</div>
                    <div className="text-xs text-gray-500">{t('summary.avgCarbs')}</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Droplet className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold text-gray-900">{summaryQuery.data.avg_fat}g</div>
                    <div className="text-xs text-gray-500">{t('summary.avgFat')}</div>
                  </div>
                </div>

                {/* Activity stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-4 text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold text-gray-900">{summaryQuery.data.total_activities}</div>
                    <div className="text-xs text-gray-500">{t('summary.activities')}</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold text-gray-900">{summaryQuery.data.activity_minutes}</div>
                    <div className="text-xs text-gray-500">{t('summary.activityMinutes')}</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Utensils className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                    <div className="text-2xl font-bold text-gray-900">{summaryQuery.data.meals_logged}</div>
                    <div className="text-xs text-gray-500">{t('summary.mealsLogged')}</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold text-gray-900">{summaryQuery.data.streak_days}</div>
                    <div className="text-xs text-gray-500">{t('summary.streakDays')}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
