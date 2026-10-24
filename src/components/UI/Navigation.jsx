import React from 'react'
import Button from './Button'

const Navigation = ({ currentScreen, onScreenChange, onOpenBuild }) => {
  return (
    <nav className="bottom-tab-bar" aria-label="Bottom Navigation">
      <button
        className={`tab-bar-item ${currentScreen === 'city' ? 'active' : ''}`}
        onClick={() => onScreenChange('city')}
      >
        <span className="tab-icon">🏙️</span>
        <span className="tab-label">City</span>
      </button>

      <button
        className={`tab-bar-item ${currentScreen === 'market' ? 'active' : ''}`}
        onClick={() => onScreenChange('market')}
      >
        <span className="tab-icon">🛒</span>
        <span className="tab-label">Market</span>
      </button>

      <button
        className="tab-bar-item build-action-btn"
        onClick={onOpenBuild}
        title="Open Construction Menu"
      >
        <div className="build-icon-bubble">
          <span className="tab-icon">🔨</span>
        </div>
        <span className="tab-label">Build</span>
      </button>

      <button
        className={`tab-bar-item ${currentScreen === 'research' ? 'active' : ''}`}
        onClick={() => onScreenChange('research')}
      >
        <span className="tab-icon">💡</span>
        <span className="tab-label">Research</span>
      </button>

      <button
        className={`tab-bar-item settings-item ${currentScreen === 'settings' ? 'active' : ''}`}
        onClick={() => onScreenChange('settings')}
        title="Settings"
        aria-label="Settings"
      >
        <span className="tab-icon gear-icon">⚙️</span>
      </button>
    </nav>
  )
}

export default Navigation