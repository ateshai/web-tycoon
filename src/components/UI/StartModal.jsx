import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import { playGameStartSound } from '../../logic/audio'
import { formatNumber } from '../../logic/utils'
import styles from './StartModal.module.css'

const SUGGESTED_NAMES = {
  tr: [
    'Konstantinopolis',
    'Atlantis',
    'Novigrad',
    'İskenderiye',
    'Eldoria',
    'Valyria',
    'Olimpos',
    'Karakurum',
    'Altın Vadi',
    'Kartal Yuvası',
    'Zümrüt Kent',
    'Gümüş Tepe',
    'Akdeniz İncisi',
  ],
  en: [
    'Constantinople',
    'Atlantis',
    'Novigrad',
    'Alexandria',
    'Eldoria',
    'Valyria',
    'Olympus',
    'Karakorum',
    'Golden Valley',
    'Eagle\'s Nest',
    'Emerald City',
    'Silverpeak',
    'Sunspire',
  ]
}

const StartModal = ({ isOpen, onClose, isEditing = false }) => {
  const { t, i18n } = useTranslation()
  const cityName = useGameStore(state => state.cityName)
  const buildings = useGameStore(state => state.buildings || [])
  const money = useGameStore(state => state.money || 0)
  const population = useGameStore(state => state.population || 5)
  const land = useGameStore(state => state.land ?? 10)
  const upgrades = useGameStore(state => state.upgrades || [])

  const startNewGame = useGameStore(state => state.startNewGame)
  const resumeGame = useGameStore(state => state.resumeGame)
  const setCityName = useGameStore(state => state.setCityName)
  const addNotification = useGameStore(state => state.addNotification)

  const langKey = i18n.language?.startsWith('en') ? 'en' : 'tr'
  const namePool = SUGGESTED_NAMES[langKey] || SUGGESTED_NAMES.tr

  // Determine if a saved city from a previous session exists
  const hasSavedCity = Boolean(cityName)

  // View mode: 'resume' for continuing saved city, 'new' for starting fresh
  const [viewMode, setViewMode] = useState(hasSavedCity && !isEditing ? 'resume' : 'new')
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setViewMode('new')
        setInputVal(cityName || '')
      } else if (hasSavedCity) {
        setViewMode('resume')
      } else {
        setViewMode('new')
        const randomInitial = namePool[Math.floor(Math.random() * namePool.length)]
        setInputVal(randomInitial)
      }

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 100)
    }
  }, [isOpen, cityName, hasSavedCity, isEditing, langKey])

  if (!isOpen) return null

  const handleRandomize = () => {
    const available = namePool.filter(n => n.toLowerCase() !== inputVal.toLowerCase())
    const picked = available[Math.floor(Math.random() * available.length)] || namePool[0]
    setInputVal(picked)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleSelectChip = (name) => {
    setInputVal(name)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle continuing with the saved city
  const handleContinueCity = () => {
    resumeGame(cityName)
    playGameStartSound()
    addNotification({
      type: 'success',
      icon: '🏰',
      title: t('startModal.welcomeGovernor', 'Hoş Geldiniz, Vali!'),
      message: `${cityName} şehrinizi yönetmeye devam ediyorsunuz.`,
      duration: 4000
    })
    if (onClose) onClose()
  }

  // Handle starting a fresh new game (resets progress)
  const handleStartNewGame = (e) => {
    if (e) e.preventDefault()
    const fallbackDefault = langKey === 'en' ? 'New City' : 'Yeni Şehir'
    const finalName = inputVal.trim() || fallbackDefault

    if (isEditing) {
      setCityName(finalName)
      addNotification({
        type: 'success',
        icon: '🏛️',
        title: t('startModal.changeCityTitle', 'Şehir İsmi Güncellendi'),
        message: `${finalName}`,
        duration: 3000
      })
      if (onClose) onClose()
    } else {
      startNewGame(finalName)
      playGameStartSound()
      addNotification({
        type: 'success',
        icon: '🏰',
        title: t('startModal.welcomeGovernor', 'Hoş Geldiniz, Vali!'),
        message: t('startModal.toastGameStarted', {
          name: finalName,
          defaultValue: `${finalName} şehri resmen kuruldu! Şehrinizi büyütmeye başlayın.`
        }),
        duration: 4500
      })
      if (onClose) onClose()
    }
  }

  const handleSwitchToNewGame = () => {
    setViewMode('new')
    const randomInitial = namePool[Math.floor(Math.random() * namePool.length)]
    setInputVal(randomInitial)
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, 100)
  }

  return (
    <div className={styles.backdrop} onClick={isEditing ? onClose : undefined}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          {isEditing && onClose && (
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          )}

          <div className={styles.emblemWrapper}>
            <span className={styles.emblemIcon}>🏰</span>
          </div>

          <h2 className={styles.modalTitle}>
            {isEditing
              ? t('startModal.changeCityTitle', 'Şehir İsmini Değiştir')
              : viewMode === 'resume'
                ? t('startModal.resumeTitle', 'Kayıtlı Şehrinize Hoş Geldiniz!')
                : hasSavedCity
                  ? t('startModal.newGameTitle', 'Sıfırdan Yeni Şehir Kur')
                  : t('startModal.title', 'Şehrini Kur ve Yönet')}
          </h2>

          <p className={styles.modalSubtitle}>
            {isEditing
              ? t('startModal.editSubtitle', 'Şehrinizin tabelasını ve resmi kayıtlarını yeni bir isimle güncelleyin.')
              : viewMode === 'resume'
                ? t('startModal.resumeSubtitle', 'Önceki oturumunuzdan kalan şehrinize devam edebilir veya sıfırdan yepyeni bir şehir kurabilirsiniz.')
                : hasSavedCity
                  ? t('startModal.newGameSubtitle', 'Şehrinizi ve kaynaklarınızı sıfırlayarak yepyeni bir medeniyet kurun.')
                  : t('startModal.subtitle', 'Kendi medeniyetini inşa etmeye başlamadan önce şehrine görkemli bir isim ver.')}
          </p>
        </div>

        <div className={styles.modalBody}>
          {/* VIEW MODE 1: RESUME SAVED CITY */}
          {viewMode === 'resume' && (
            <>
              <div className={styles.savedCityCard}>
                <div className={styles.savedCityTitle}>
                  <div className={styles.savedCityName}>
                    <span>🏛️</span>
                    <span>{cityName}</span>
                  </div>
                  <span className={styles.savedCityBadge}>
                    {t('startModal.savedOverview', 'Kayıtlı Şehir Durumu')}
                  </span>
                </div>

                <div className={styles.savedStatsGrid}>
                  <div className={styles.savedStatItem}>
                    <span className={styles.savedStatVal}>👥 {population || 5}</span>
                    <span className={styles.savedStatLabel}>{t('resources.population', 'Nüfus')}</span>
                  </div>

                  <div className={styles.savedStatItem}>
                    <span className={styles.savedStatVal}>🏛️ {buildings.length}</span>
                    <span className={styles.savedStatLabel}>{t('startModal.structures', 'Yapı')}</span>
                  </div>

                  <div className={styles.savedStatItem}>
                    <span className={styles.savedStatVal}>💰 ${formatNumber(money || 0)}</span>
                    <span className={styles.savedStatLabel}>{t('resources.money', 'Nakit')}</span>
                  </div>

                  <div className={styles.savedStatItem}>
                    <span className={styles.savedStatVal}>🔬 {upgrades.length}</span>
                    <span className={styles.savedStatLabel}>{t('startModal.researched', 'Teknoloji')}</span>
                  </div>

                  <div className={styles.savedStatItem}>
                    <span className={styles.savedStatVal}>🏞️ {land ?? 10}</span>
                    <span className={styles.savedStatLabel}>{t('resources.land', 'Arazi')}</span>
                  </div>

                  <div className={styles.savedStatItem}>
                    <span className={styles.savedStatVal}>⏱️ 1x</span>
                    <span className={styles.savedStatLabel}>{t('resources.rate', 'Hız')}</span>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.startButton}
                  onClick={handleContinueCity}
                >
                  <span className={styles.buttonIcon}>▶️</span>
                  <span>{t('startModal.continueCityBtn', { name: cityName, defaultValue: `▶️ ${cityName} Şehrine Devam Et` })}</span>
                </button>

                <button
                  type="button"
                  className={styles.secondaryNewGameBtn}
                  onClick={handleSwitchToNewGame}
                >
                  <span>{t('startModal.newGameChoiceBtn', '🔄 Sıfırdan Yeni Oyun Başlat')}</span>
                </button>
              </div>
            </>
          )}

          {/* VIEW MODE 2: NEW GAME / FOUND CITY */}
          {viewMode === 'new' && (
            <>
              {hasSavedCity && !isEditing && (
                <div className={styles.warningBox}>
                  <span className={styles.warningIcon}>⚠️</span>
                  <span>{t('startModal.newGameWarning', 'Yeni oyun başlattığınızda önceki şehrinizin tüm binaları, hazinesi ve teknolojileri sıfırlanacaktır.')}</span>
                </div>
              )}

              <form onSubmit={handleStartNewGame} className={styles.inputSection}>
                <label htmlFor="city-name-input" className={styles.inputLabel}>
                  <span>🏛️ {t('startModal.inputLabel', 'Şehir İsmi')}</span>
                  <span className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                    {t('startModal.pressEnter', 'Enter ile başlat')}
                  </span>
                </label>

                <div className={styles.inputGroup}>
                  <span className={styles.fieldPrefix}>⚔️</span>
                  <input
                    id="city-name-input"
                    ref={inputRef}
                    type="text"
                    className={styles.cityInput}
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    placeholder={t('startModal.inputPlaceholder', 'Örn: Konstantinopolis, Atlantis, Novigrad...')}
                    maxLength={30}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className={styles.randomButton}
                    onClick={handleRandomize}
                    title={t('startModal.randomNameTooltip', 'Rastgele Şehir İsmi Üret')}
                    aria-label={t('startModal.randomNameTooltip', 'Rastgele Şehir İsmi Üret')}
                  >
                    🎲
                  </button>
                </div>

                {/* Quick Suggestions Chips */}
                <div className={styles.chipsContainer}>
                  {namePool.slice(0, 5).map(name => (
                    <button
                      key={name}
                      type="button"
                      className={styles.chipButton}
                      onClick={() => handleSelectChip(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </form>

              {/* Starting Resources / City Status Overview */}
              {!isEditing && (
                <div className={styles.overviewSection}>
                  <div className={styles.overviewTitle}>
                    <span>📦</span>
                    <span>{t('startModal.startingResourcesTitle', 'Başlangıç Şehir Kaynakları')}</span>
                  </div>
                  <div className={styles.resourcesGrid}>
                    <div className={styles.resourcePill}>
                      <span className={styles.resourcePillIcon}>🪵</span>
                      <div className={styles.resourcePillMeta}>
                        <span className={styles.resourcePillAmount}>100</span>
                        <span className={styles.resourcePillName}>{t('resources.wood', 'Odun')}</span>
                      </div>
                    </div>

                    <div className={styles.resourcePill}>
                      <span className={styles.resourcePillIcon}>🪙</span>
                      <div className={styles.resourcePillMeta}>
                        <span className={styles.resourcePillAmount}>$10</span>
                        <span className={styles.resourcePillName}>{t('resources.money', 'Nakit')}</span>
                      </div>
                    </div>

                    <div className={styles.resourcePill}>
                      <span className={styles.resourcePillIcon}>🍞</span>
                      <div className={styles.resourcePillMeta}>
                        <span className={styles.resourcePillAmount}>30</span>
                        <span className={styles.resourcePillName}>{t('resources.food', 'Yemek')}</span>
                      </div>
                    </div>

                    <div className={styles.resourcePill}>
                      <span className={styles.resourcePillIcon}>💧</span>
                      <div className={styles.resourcePillMeta}>
                        <span className={styles.resourcePillAmount}>30</span>
                        <span className={styles.resourcePillName}>{t('resources.water', 'Su')}</span>
                      </div>
                    </div>

                    <div className={styles.resourcePill}>
                      <span className={styles.resourcePillIcon}>👥</span>
                      <div className={styles.resourcePillMeta}>
                        <span className={styles.resourcePillAmount}>5</span>
                        <span className={styles.resourcePillName}>{t('resources.population', 'Nüfus')}</span>
                      </div>
                    </div>

                    <div className={styles.resourcePill}>
                      <span className={styles.resourcePillIcon}>🏞️</span>
                      <div className={styles.resourcePillMeta}>
                        <span className={styles.resourcePillAmount}>10</span>
                        <span className={styles.resourcePillName}>{t('resources.land', 'Arazi')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips Callout */}
              <div className={styles.tipCallout}>
                <span className={styles.tipIcon}>💡</span>
                <span>
                  {t('startModal.tipMessage', 'Vatandaşlarınızın çalışması ve mutlu yaşaması için Ev inşa edin, Su Kuyusu ve Avcı ile gıda ve su tedarikini aksatmayın!')}
                </span>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.startButton}
                  onClick={handleStartNewGame}
                >
                  <span className={styles.buttonIcon}>
                    {isEditing ? '💾' : '✨'}
                  </span>
                  <span>
                    {isEditing
                      ? t('startModal.saveBtn', 'İsmi Güncelle')
                      : hasSavedCity
                        ? t('startModal.startNewCityBtn', '✨ Şehri Kur ve Oyunu Başlat')
                        : t('startModal.startBtn', 'Oyunu Başlat')}
                  </span>
                </button>

                {hasSavedCity && !isEditing && (
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => setViewMode('resume')}
                  >
                    <span>{t('startModal.backToSavedBtn', '↩️ Kayıtlı Şehre Geri Dön')}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default StartModal
