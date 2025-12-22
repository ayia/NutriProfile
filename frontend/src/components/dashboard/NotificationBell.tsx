import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardApi } from '@/services/dashboardApi'
import type { Notification } from '@/types/dashboard'

interface NotificationBellProps {
  notifications: Notification[]
  unreadCount: number
}

export function NotificationBell({ notifications, unreadCount }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const markReadMutation = useMutation({
    mutationFn: dashboardApi.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: dashboardApi.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins}min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    return `Il y a ${diffDays}j`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <span className="text-3xl">🔕</span>
                  <p className="mt-2 text-sm">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markReadMutation.mutate(notification.id)
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <span className="text-xl flex-shrink-0">
                        {notification.icon || '📢'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {notification.title}
                        </div>
                        {notification.message && (
                          <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {notification.message}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.created_at)}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
