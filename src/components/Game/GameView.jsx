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
      <div className="game-container">
        <header className="game-header-bar">
          {researchProgress ? (
            <div className="research-header-banner">
              <div className="research-banner-info">
                <span className="banner-icon">🔬</span>
                <span className="banner-title">
                  {t('app.researching')}: <strong>{t(`upgrades.${activeResearch.upgrade.id}.name`, activeResearch.upgrade.name)}</strong>
                </span>
                <span className="banner-countdown">{researchProgress.remaining}s {t('app.left')}</span>
              </div>
              <div className="research-header-progress-track">
                <div
                  className="research-header-progress-fill"
                  style={{ width: `${researchProgress.percent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="game-logo">
              <span className="logo-icon">🏰</span>
              <span className="logo-text">{t('app.title')}</span>
            </div>
          )}
        </header>

        <main className="game-content with-bottom-bar">
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