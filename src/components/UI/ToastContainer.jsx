import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import { useSettingsStore } from '../../store/settingsStore'

import styles from './ToastContainer.module.css'

const ToastContainer = () => {
  const { t } = useTranslation()
  const notifications = useGameStore(state => state.notifications || [])
  const removeNotification = useGameStore(state => state.removeNotification)
  const notificationsEnabled = useSettingsStore(state => state.notifications ?? true)

  if (!notificationsEnabled || notifications.length === 0) {
    return null
  }

  return (
    <div className={styles.toastContainer} aria-live="polite">
      {notifications.map(toast => {
        const isSuccess = toast.type === 'success'
        return (
          <div
            key={toast.id}
            className={`${styles.toastItem} ${isSuccess ? styles.toastSuccess : styles.toastInfo}`}
            role="alert"
          >
            <div className={styles.toastIconWrap}>
              <span className={styles.toastIcon}>{toast.icon}</span>
            </div>

            <div className={styles.toastContent}>
              <div className={styles.toastHeaderRow}>
                <span className={styles.toastTitle}>{toast.title}</span>
                {toast.badge && (
                  <span className={`${styles.toastBadge} ${isSuccess ? styles.badgeGain : styles.badgeSpend}`}>
                    {toast.badge}
                  </span>
                )}
              </div>
              <p className={styles.toastMessage}>{toast.message}</p>
            </div>

            <button
              className={styles.toastCloseBtn}
              onClick={() => removeNotification(toast.id)}
              aria-label={t('settings.cancelBtn')}
            >
              ✕
            </button>

            <div className={styles.toastProgressTrack}>
              <div
                className={`${styles.toastProgressBar} ${isSuccess ? styles.barSuccess : styles.barInfo}`}
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
