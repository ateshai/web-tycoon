import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../../store/settingsStore'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'

import styles from './Settings.module.css'

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
  const cityName = useGameStore(state => state.cityName)
  const setCityName = useGameStore(state => state.setCityName)
  const addNotification = useGameStore(state => state.addNotification)

  const [cityInput, setCityInput] = useState(cityName || '')
  const [cityUpdated, setCityUpdated] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  // Sync cityInput when cityName updates
  React.useEffect(() => {
    if (cityName) {
      setCityInput(cityName)
    }
  }, [cityName])

  const handleSaveCityName = () => {
    const trimmed = cityInput.trim()
    if (!trimmed) return
    setCityName(trimmed)
    setCityUpdated(true)
    addNotification({
      type: 'success',
      icon: '🏛️',
      title: t('settings.cityNameUpdated', 'Şehir İsmi Güncellendi'),
      message: trimmed,
      duration: 3000
    })
    setTimeout(() => setCityUpdated(false), 2500)
  }

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
    <div className={`screen ${styles.settingsView}`}>
      <div className={styles.settingsHeader}>
        <h1>{t('settings.title')}</h1>
        <p className={styles.settingsSubtitle}>
          {t('settings.subtitle')}
        </p>
      </div>

      <div className={styles.settingsLayout}>
        {/* Audio Settings Card */}
        <div className={styles.settingsCard}>
          <div className={styles.settingsCardHeader}>
            <span className={styles.cardHeaderIcon}>🔊</span>
            <div>
              <h2>{t('settings.audioTitle')}</h2>
              <p>{t('settings.audioDesc')}</p>
            </div>
          </div>

          <div className={styles.settingsCardBody}>
            {/* Sound FX Toggle */}
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>{t('settings.soundFx')}</span>
                <span className={styles.settingDesc}>{t('settings.soundFxDesc')}</span>
              </div>
              <button
                type="button"
                className={`${styles.modernToggle} ${soundEnabled ? styles.active : ''}`}
                onClick={toggleSound}
                aria-label={t('settings.soundFx')}
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>

            {/* Sound FX Volume */}
            <div className={`${styles.settingRow} ${styles.sliderRow} ${!soundEnabled ? styles.disabled : ''}`}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>{t('settings.soundVolume')}</span>
                <span className={styles.settingDesc}>{t('settings.soundVolumeDesc')}</span>
              </div>
              <div className={styles.sliderControl}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  disabled={!soundEnabled}
                  onChange={(e) => updateSoundSettings({ soundVolume: parseFloat(e.target.value) })}
                  className={styles.modernSlider}
                />
                <span className={styles.sliderValuePill}>{Math.round(soundVolume * 100)}%</span>
              </div>
            </div>

            {/* Music Toggle */}
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>{t('settings.music')}</span>
                <span className={styles.settingDesc}>{t('settings.musicDesc')}</span>
              </div>
              <button
                type="button"
                className={`${styles.modernToggle} ${musicEnabled ? styles.active : ''}`}
                onClick={toggleMusic}
                aria-label={t('settings.music')}
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>

            {/* Music Volume */}
            <div className={`${styles.settingRow} ${styles.sliderRow} ${!musicEnabled ? styles.disabled : ''}`}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>{t('settings.musicVolume')}</span>
                <span className={styles.settingDesc}>{t('settings.musicVolumeDesc')}</span>
              </div>
              <div className={styles.sliderControl}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  disabled={!musicEnabled}
                  onChange={(e) => updateSoundSettings({ musicVolume: parseFloat(e.target.value) })}
                  className={styles.modernSlider}
                />
                <span className={styles.sliderValuePill}>{Math.round(musicVolume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Display & Interface Card */}
        <div className={styles.settingsCard}>
          <div className={styles.settingsCardHeader}>
            <span className={styles.cardHeaderIcon}>🖥️</span>
            <div>
              <h2>{t('settings.interfaceTitle')}</h2>
              <p>{t('settings.interfaceDesc')}</p>
            </div>
          </div>

          <div className={styles.settingsCardBody}>
            {/* Language Selector */}
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>{t('settings.language')}</span>
                <span className={styles.settingDesc}>{t('settings.languageDesc')}</span>
              </div>
              <div className={styles.themeSelectorGroup}>
                <button
                  type="button"
                  className={`${styles.themeChip} ${language === 'tr' ? styles.active : ''}`}
                  onClick={() => setLanguage('tr')}
                >
                  🇹🇷 Türkçe
                </button>
                <button
                  type="button"
                  className={`${styles.themeChip} ${language === 'en' ? styles.active : ''}`}
                  onClick={() => setLanguage('en')}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>{t('settings.theme')}</span>
                <span className={styles.settingDesc}>{t('settings.themeDesc')}</span>
              </div>
              <div className={styles.themeSelectorGroup}>
                <button
                  type="button"
                  className={`${styles.themeChip} ${theme === 'dark' ? styles.active : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  {t('settings.dark')}
                </button>
                <button
                  type="button"
                  className={`${styles.themeChip} ${theme === 'light' ? styles.active : ''}`}
                  onClick={() => setTheme('light')}
                >
                  {t('settings.light')}
                </button>
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>{t('settings.notifications')}</span>
                <span className={styles.settingDesc}>{t('settings.notificationsDesc')}</span>
              </div>
              <button
                type="button"
                className={`${styles.modernToggle} ${notifications ? styles.active : ''}`}
                onClick={toggleNotifications}
                aria-label={t('settings.notifications')}
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>
          </div>
        </div>

        {/* City Management Card */}
        <div className={styles.settingsCard}>
          <div className={styles.settingsCardHeader}>
            <span className={styles.cardHeaderIcon}>🏛️</span>
            <div>
              <h2>{t('settings.cityTitle', 'Şehir Yönetimi')}</h2>
              <p>{t('settings.cityDesc', 'Şehrinizin resmi adını özelleştirin')}</p>
            </div>
          </div>

          <div className={styles.settingsCardBody}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>{t('settings.cityNameLabel', 'Şehir İsmi')}</span>
                <span className={styles.settingDesc}>
                  {t('settings.cityNameDesc', 'Header alanında ve resmi kayıtlarda görüntülenen isim')}
                </span>
                {cityUpdated && (
                  <span className={styles.resetSuccessMsg}>✓ {t('settings.cityNameUpdated', 'Şehir ismi güncellendi!')}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder={t('startModal.inputPlaceholder', 'Şehir ismi...')}
                  maxLength={30}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    minWidth: '160px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCityName()
                  }}
                />
                <button
                  type="button"
                  className={styles.dangerButton}
                  style={{
                    backgroundColor: 'rgba(76, 175, 80, 0.15)',
                    borderColor: 'rgba(76, 175, 80, 0.4)',
                    color: '#4caf50'
                  }}
                  onClick={handleSaveCityName}
                >
                  {t('settings.saveCityName', 'Kaydet')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Data & Danger Zone Card */}
        <div className={`${styles.settingsCard} ${styles.dangerZoneCard}`}>
          <div className={styles.settingsCardHeader}>
            <span className={styles.cardHeaderIcon}>⚠️</span>
            <div>
              <h2>{t('settings.dangerTitle')}</h2>
              <p>{t('settings.dangerDesc')}</p>
            </div>
          </div>

          <div className={styles.settingsCardBody}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>{t('settings.resetTitle')}</span>
                <span className={styles.settingDesc}>
                  {t('settings.resetDesc')}
                </span>
                {resetSuccess && (
                  <span className={styles.resetSuccessMsg}>{t('settings.resetSuccess')}</span>
                )}
              </div>
              <div>
                {resetConfirm ? (
                  <div className={styles.confirmButtons}>
                    <button
                      type="button"
                      className={styles.confirmResetBtn}
                      onClick={handleResetGame}
                    >
                      {t('settings.resetConfirmBtn')}
                    </button>
                    <button
                      type="button"
                      className={styles.cancelResetBtn}
                      onClick={() => setResetConfirm(false)}
                    >
                      {t('settings.cancelBtn')}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.dangerButton}
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