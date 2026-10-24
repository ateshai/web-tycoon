import React, { useState } from 'react'
import { useSettingsStore } from '../../store/settingsStore'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'

const Settings = () => {
  const {
    soundEnabled,
    musicEnabled,
    soundVolume,
    musicVolume,
    theme,
    notifications,
    toggleSound,
    toggleMusic,
    updateSoundSettings,
    setTheme,
    toggleNotifications,
  } = useSettingsStore()

  const initializeGame = useGameStore(state => state.initialize)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleResetGame = () => {
    if (!resetConfirm) {
      setResetConfirm(true)
      return
    }
    initializeGame()
    setResetConfirm(false)
    setResetSuccess(true)
    setTimeout(() => setResetSuccess(false), 3000)
  }

  return (
    <div className="screen settings-view">
      <div className="settings-header">
        <h1>⚙️ Game Settings</h1>
        <p className="settings-subtitle">
          Customize your audio levels, visual preferences, and game management options.
        </p>
      </div>

      <div className="settings-layout">
        {/* Audio Settings Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="card-header-icon">🔊</span>
            <div>
              <h2>Audio Preferences</h2>
              <p>Control background music and interactive sound effects</p>
            </div>
          </div>

          <div className="settings-card-body">
            {/* Sound FX Toggle */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">Sound Effects</span>
                <span className="setting-desc">Play clicks, purchase sounds, and notifications</span>
              </div>
              <button
                type="button"
                className={`modern-toggle ${soundEnabled ? 'active' : ''}`}
                onClick={toggleSound}
                aria-label="Toggle Sound Effects"
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            {/* Sound FX Volume */}
            <div className={`setting-row slider-row ${!soundEnabled ? 'disabled' : ''}`}>
              <div className="setting-info">
                <span className="setting-name">Sound Volume</span>
                <span className="setting-desc">Adjust sound effects volume</span>
              </div>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  disabled={!soundEnabled}
                  onChange={(e) => updateSoundSettings({ soundVolume: parseFloat(e.target.value) })}
                  className="modern-slider"
                />
                <span className="slider-value-pill">{Math.round(soundVolume * 100)}%</span>
              </div>
            </div>

            {/* Music Toggle */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">Ambient Music</span>
                <span className="setting-desc">Play relaxing background soundtrack</span>
              </div>
              <button
                type="button"
                className={`modern-toggle ${musicEnabled ? 'active' : ''}`}
                onClick={toggleMusic}
                aria-label="Toggle Ambient Music"
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            {/* Music Volume */}
            <div className={`setting-row slider-row ${!musicEnabled ? 'disabled' : ''}`}>
              <div className="setting-info">
                <span className="setting-name">Music Volume</span>
                <span className="setting-desc">Adjust music playback volume</span>
              </div>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  disabled={!musicEnabled}
                  onChange={(e) => updateSoundSettings({ musicVolume: parseFloat(e.target.value) })}
                  className="modern-slider"
                />
                <span className="slider-value-pill">{Math.round(musicVolume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Display & Interface Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="card-header-icon">🖥️</span>
            <div>
              <h2>Interface & Notifications</h2>
              <p>Appearance and notification alerts</p>
            </div>
          </div>

          <div className="settings-card-body">
            {/* Theme Selector */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">Theme Appearance</span>
                <span className="setting-desc">Select visual color mode</span>
              </div>
              <div className="theme-selector-group">
                <button
                  type="button"
                  className={`theme-chip ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  🌙 Dark
                </button>
                <button
                  type="button"
                  className={`theme-chip ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  ☀️ Light
                </button>
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">Game Notifications</span>
                <span className="setting-desc">Show research and milestone toasts</span>
              </div>
              <button
                type="button"
                className={`modern-toggle ${notifications ? 'active' : ''}`}
                onClick={toggleNotifications}
                aria-label="Toggle Notifications"
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </div>
        </div>

        {/* Game Data & Danger Zone Card */}
        <div className="settings-card danger-zone-card">
          <div className="settings-card-header">
            <span className="card-header-icon">⚠️</span>
            <div>
              <h2>Game Data & Storage</h2>
              <p>Manage your local save data and progress</p>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="setting-row danger-row">
              <div className="setting-info">
                <span className="setting-name">Reset City & Progress</span>
                <span className="setting-desc">
                  Reset money, buildings, and resources back to default initial values.
                </span>
                {resetSuccess && (
                  <span className="reset-success-msg">✓ Game data reset successfully!</span>
                )}
              </div>
              <div className="danger-actions">
                {resetConfirm ? (
                  <div className="confirm-buttons">
                    <button
                      type="button"
                      className="confirm-reset-btn"
                      onClick={handleResetGame}
                    >
                      Yes, Reset!
                    </button>
                    <button
                      type="button"
                      className="cancel-reset-btn"
                      onClick={() => setResetConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => setResetConfirm(true)}
                  >
                    Reset Game
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings