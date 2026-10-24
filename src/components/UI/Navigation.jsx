import React from 'react'
import { useTranslation } from 'react-i18next'
import Button from './Button'

const Navigation = ({ currentScreen, onScreenChange, onOpenBuild }) => {
  const { t } = useTranslation()

  return (
    <nav className="bottom-tab-bar" aria-label="Bottom Navigation">
      <button
        className={`tab-bar-item ${currentScreen === 'city' ? 'active' : ''}`}
        onClick={() => onScreenChange('city')}
      >
        <span className="tab-icon">🏙️</span>
        <span className="tab-label">{t('nav.city')}</span>
      </button>

      <button
        className={`tab-bar-item ${currentScreen === 'market' ? 'active' : ''}`}
        onClick={() => onScreenChange('market')}
      >
        <span className="tab-icon">🛒</span>
        <span className="tab-label">{t('nav.market')}</span>
      </button>

      <button
        className="tab-bar-item build-action-btn"
        onClick={onOpenBuild}
        title={t('city.openBuildMenu')}
      >
        <div className="build-icon-bubble">
          <span className="tab-icon">🔨</span>
        </div>
        <span className="tab-label">{t('nav.build')}</span>
      </button>

      <button
        className={`tab-bar-item ${currentScreen === 'research' ? 'active' : ''}`}
        onClick={() => onScreenChange('research')}
      >
        <span className="tab-icon">💡</span>
        <span className="tab-label">{t('nav.research')}</span>
      </button>

      <button
        className={`tab-bar-item settings-item ${currentScreen === 'settings' ? 'active' : ''}`}
        onClick={() => onScreenChange('settings')}
        title={t('nav.settings')}
        aria-label={t('nav.settings')}
      >
        <span className="tab-icon gear-icon">⚙️</span>
      </button>
    </nav>
  )
}

export default Navigation