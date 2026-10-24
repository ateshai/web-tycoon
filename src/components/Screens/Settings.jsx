import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../../store/settingsStore'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'

const Settings = () => {
  const { t } = useTranslation()
  const {
    soundEnabled,
    musicEnabled,
    soundVolume,
    musicVolume,
    theme,
    notifications,
    language,
    toggleSound,
    toggleMusic,
    updateSoundSettings,
    setTheme,
    toggleNotifications,
    setLanguage,
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
        <h1>{t('settings.title')}</h1>
        <p className="settings-subtitle">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="settings-layout">
        {/* Audio Settings Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="card-header-icon">🔊</span>
            <div>
              <h2>{t('settings.audioTitle')}</h2>
              <p>{t('settings.audioDesc')}</p>
            </div>
          </div>

          <div className="settings-card-body">
            {/* Sound FX Toggle */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">{t('settings.soundFx')}</span>
                <span className="setting-desc">{t('settings.soundFxDesc')}</span>
              </div>
              <button
                type="button"
                className={`modern-toggle ${soundEnabled ? 'active' : ''}`}
                onClick={toggleSound}
                aria-label={t('settings.soundFx')}
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            {/* Sound FX Volume */}
            <div className={`setting-row slider-row ${!soundEnabled ? 'disabled' : ''}`}>
              <div className="setting-info">
                <span className="setting-name">{t('settings.soundVolume')}</span>
                <span className="setting-desc">{t('settings.soundVolumeDesc')}</span>
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
                <span className="setting-name">{t('settings.music')}</span>
                <span className="setting-desc">{t('settings.musicDesc')}</span>
              </div>
              <button
                type="button"
                className={`modern-toggle ${musicEnabled ? 'active' : ''}`}
                onClick={toggleMusic}
                aria-label={t('settings.music')}
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            {/* Music Volume */}
            <div className={`setting-row slider-row ${!musicEnabled ? 'disabled' : ''}`}>
              <div className="setting-info">
                <span className="setting-name">{t('settings.musicVolume')}</span>
                <span className="setting-desc">{t('settings.musicVolumeDesc')}</span>
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
              <h2>{t('settings.interfaceTitle')}</h2>
              <p>{t('settings.interfaceDesc')}</p>
            </div>
          </div>

          <div className="settings-card-body">
            {/* Language Selector */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">{t('settings.language')}</span>
                <span className="setting-desc">{t('settings.languageDesc')}</span>
              </div>
              <div className="theme-selector-group">
                <button
                  type="button"
                  className={`theme-chip ${language === 'tr' ? 'active' : ''}`}
                  onClick={() => setLanguage('tr')}
                >
                  🇹🇷 Türkçe
                </button>
                <button
                  type="button"
                  className={`theme-chip ${language === 'en' ? 'active' : ''}`}
                  onClick={() => setLanguage('en')}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">{t('settings.theme')}</span>
                <span className="setting-desc">{t('settings.themeDesc')}</span>
              </div>
              <div className="theme-selector-group">
                <button
                  type="button"
                  className={`theme-chip ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  {t('settings.dark')}
                </button>
                <button
                  type="button"
                  className={`theme-chip ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  {t('settings.light')}
                </button>
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">{t('settings.notifications')}</span>
                <span className="setting-desc">{t('settings.notificationsDesc')}</span>
              </div>
              <button
                type="button"
                className={`modern-toggle ${notifications ? 'active' : ''}`}
                onClick={toggleNotifications}
                aria-label={t('settings.notifications')}
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
              <h2>{t('settings.dangerTitle')}</h2>
              <p>{t('settings.dangerDesc')}</p>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="setting-row danger-row">
              <div className="setting-info">
                <span className="setting-name">{t('settings.resetTitle')}</span>
                <span className="setting-desc">
                  {t('settings.resetDesc')}
                </span>
                {resetSuccess && (
                  <span className="reset-success-msg">{t('settings.resetSuccess')}</span>
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
                      {t('settings.resetConfirmBtn')}
                    </button>
                    <button
                      type="button"
                      className="cancel-reset-btn"
                      onClick={() => setResetConfirm(false)}
                    >
                      {t('settings.cancelBtn')}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => setResetConfirm(true)}
                  >
                    {t('settings.resetBtn')}
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