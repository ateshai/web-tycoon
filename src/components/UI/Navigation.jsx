import React from 'react'
import { useTranslation } from 'react-i18next'
import Button from './Button'

import styles from './Navigation.module.css'

const Navigation = ({ currentScreen, onScreenChange, onOpenBuild }) => {
  const { t } = useTranslation()

  return (
    <nav className={styles.bottomTabBar} aria-label="Bottom Navigation">
      <button
        className={`${styles.tabBarItem} ${currentScreen === 'city' ? styles.active : ''}`}
        onClick={() => onScreenChange('city')}
      >
        <span className={styles.tabIcon}>🏙️</span>
        <span className={styles.tabLabel}>{t('nav.city')}</span>
      </button>

      <button
        className={`${styles.tabBarItem} ${currentScreen === 'market' ? styles.active : ''}`}
        onClick={() => onScreenChange('market')}
      >
        <span className={styles.tabIcon}>🛒</span>
        <span className={styles.tabLabel}>{t('nav.market')}</span>
      </button>

      <button
        className={`${styles.tabBarItem} ${styles.buildActionBtn}`}
        onClick={onOpenBuild}
        title={t('city.openBuildMenu')}
      >
        <div className={styles.buildIconBubble}>
          <span className={styles.tabIcon}>🔨</span>
        </div>
        <span className={styles.tabLabel}>{t('nav.build')}</span>
      </button>

      <button
        className={`${styles.tabBarItem} ${currentScreen === 'research' ? styles.active : ''}`}
        onClick={() => onScreenChange('research')}
      >
        <span className={styles.tabIcon}>💡</span>
        <span className={styles.tabLabel}>{t('nav.research')}</span>
      </button>

      <button
        className={`${styles.tabBarItem} ${styles.settingsItem || ''} ${currentScreen === 'settings' ? styles.active : ''}`}
        onClick={() => onScreenChange('settings')}
        title={t('nav.settings')}
        aria-label={t('nav.settings')}
      >
        <span className={`${styles.tabIcon} ${styles.gearIcon}`}>⚙️</span>
      </button>
    </nav>
  )
}

export default Navigation