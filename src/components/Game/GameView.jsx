import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Navigation from '../UI/Navigation'
import CityView from '../Screens/CityView'
import MarketView from '../Screens/MarketView'
import ResearchView from '../Screens/ResearchView'
import Settings from '../Screens/Settings'
import GameLoop from './GameLoop'
import BuildModal from '../UI/BuildModal'
import ResearchCompleteModal from '../UI/ResearchCompleteModal'
import ToastContainer from '../UI/ToastContainer'
import { useGameStore } from '../../store/gameStore'

import styles from './GameView.module.css'

const GameView = () => {
  const { t } = useTranslation()
  const [currentScreen, setCurrentScreen] = useState('city')
  const [isBuildOpen, setIsBuildOpen] = useState(false)
  const activeResearch = useGameStore(state => state.activeResearch)
  const [, setTick] = useState(0)

  // Re-render header progress bar smoothly while research is active
  useEffect(() => {
    if (!activeResearch) return
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 200)
    return () => clearInterval(interval)
  }, [activeResearch])

  const renderScreen = () => {
    switch (currentScreen) {
      case 'city':
        return <CityView onOpenBuild={() => setIsBuildOpen(true)} />
      case 'market':
        return <MarketView />
      case 'research':
        return <ResearchView />
      case 'settings':
        return <Settings />
      default:
        return <CityView onOpenBuild={() => setIsBuildOpen(true)} />
    }
  }

  // Calculate remaining time and percentage for active research
  let researchProgress = null
  if (activeResearch) {
    const elapsed = Math.max(0, (Date.now() - activeResearch.startTime) / 1000)
    const duration = activeResearch.duration || 10
    const remaining = Math.max(0, Math.ceil(duration - elapsed))
    const percent = Math.min(100, Math.max(0, (elapsed / duration) * 100))
    researchProgress = { remaining, percent, name: activeResearch.upgrade.name }
  }

  return (
    <GameLoop>
      <div className={styles.gameContainer}>
        <header className={styles.gameHeaderBar}>
          {researchProgress ? (
            <div className={styles.researchHeaderBanner}>
              <div className={styles.researchBannerInfo}>
                <span className={styles.bannerIcon}>🔬</span>
                <span className={styles.bannerTitle}>
                  {t('app.researching')}: <strong>{t(`upgrades.${activeResearch.upgrade.id}.name`, activeResearch.upgrade.name)}</strong>
                </span>
                <span className={styles.bannerCountdown}>{researchProgress.remaining}s {t('app.left')}</span>
              </div>
              <div className={styles.researchHeaderProgressTrack}>
                <div
                  className={styles.researchHeaderProgressFill}
                  style={{ width: `${researchProgress.percent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className={styles.gameLogo}>
              <span className={styles.logoIcon}>🏰</span>
              <span className={styles.logoText}>{t('app.title')}</span>
            </div>
          )}
        </header>

        <main className={`${styles.gameContent} ${styles.withBottomBar}`}>
          {renderScreen()}
        </main>

        <Navigation
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
          onOpenBuild={() => setIsBuildOpen(true)}
        />

        <BuildModal
          isOpen={isBuildOpen}
          onClose={() => setIsBuildOpen(false)}
        />

        <ResearchCompleteModal />
        <ToastContainer />
      </div>
    </GameLoop>
  )
}

export default GameView