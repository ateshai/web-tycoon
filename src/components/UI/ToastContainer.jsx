import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import { useSettingsStore } from '../../store/settingsStore'

const ToastContainer = () => {
  const { t } = useTranslation()
  const notifications = useGameStore(state => state.notifications || [])
  const removeNotification = useGameStore(state => state.removeNotification)
  const notificationsEnabled = useSettingsStore(state => state.notifications ?? true)

  if (!notificationsEnabled || notifications.length === 0) {
    return null
  }

  return (
    <div className="toast-container" aria-live="polite">
      {notifications.map(toast => {
        const isSuccess = toast.type === 'success'
        return (
          <div
            key={toast.id}
            className={`toast-item ${isSuccess ? 'toast-success' : 'toast-info'}`}
            role="alert"
          >
            <div className="toast-icon-wrap">
              <span className="toast-icon">{toast.icon}</span>
            </div>

            <div className="toast-content">
              <div className="toast-header-row">
                <span className="toast-title">{toast.title}</span>
                {toast.badge && (
                  <span className={`toast-badge ${isSuccess ? 'badge-gain' : 'badge-spend'}`}>
                    {toast.badge}
                  </span>
                )}
              </div>
              <p className="toast-message">{toast.message}</p>
            </div>

            <button
              className="toast-close-btn"
              onClick={() => removeNotification(toast.id)}
              aria-label={t('settings.cancelBtn')}
            >
              ✕
            </button>

            <div className="toast-progress-track">
              <div
                className={`toast-progress-bar ${isSuccess ? 'bar-success' : 'bar-info'}`}
                style={{ animationDuration: `${toast.duration || 3500}ms` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ToastContainer
