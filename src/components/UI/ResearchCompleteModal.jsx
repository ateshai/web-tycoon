import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import { BUILDINGS } from '../../logic/constants'
import Button from './Button'

const ResearchCompleteModal = () => {
  const { t } = useTranslation()
  const completedResearch = useGameStore(state => state.completedResearch)
  const dismissCompletedResearch = useGameStore(state => state.dismissCompletedResearch)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!completedResearch) return

    setCountdown(5)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          dismissCompletedResearch()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [completedResearch, dismissCompletedResearch])

  if (!completedResearch) return null

  const unlockedBuilding = completedResearch.unlocks
    ? Object.values(BUILDINGS).find(b => b.id.toLowerCase() === completedResearch.unlocks.toLowerCase())
    : null

  const upgradeName = t(`upgrades.${completedResearch.id}.name`, completedResearch.name)
  const upgradeDesc = t(`upgrades.${completedResearch.id}.description`, completedResearch.description)
  const buildingName = unlockedBuilding ? t(`buildings.${unlockedBuilding.id}.name`, unlockedBuilding.name) : ''
  const affectsTarget = completedResearch.affects ? t(`buildings.${completedResearch.affects}.name`, completedResearch.affects) : ''

  return (
    <div className="modal-backdrop completion-backdrop" onClick={dismissCompletedResearch}>
      <div className="modal-container completion-modal" onClick={e => e.stopPropagation()}>
        <div className="completion-confetti-header">
          <span className="celebration-badge">{t('research.modal.title')}</span>
          <button
            className="modal-close-button"
            onClick={dismissCompletedResearch}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="completion-modal-body">
          <div className="completion-icon-ring">
            <span className="breakthrough-icon">💡</span>
          </div>

          <h2>{upgradeName}</h2>
          <p className="completion-description">{upgradeDesc}</p>

          <div className="completion-benefit-box">
            <span className="benefit-label">{t('research.modal.activeBenefit')}</span>
            <strong className="benefit-value text-success">
              {unlockedBuilding
                ? t('research.modal.unlockedDesc', { name: buildingName })
                : t('research.modal.bonusDesc', { bonus: Math.round((completedResearch.multiplier || 0) * 100), target: affectsTarget })}
            </strong>
          </div>

          <div className="countdown-auto-bar">
            <div
              className="countdown-progress-fill"
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>
          <span className="countdown-text">{t('research.modal.autoClosing', { count: countdown })}</span>

          <Button
            variant="primary"
            className="claim-research-btn"
            onClick={dismissCompletedResearch}
          >
            {t('research.modal.continueBtn')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResearchCompleteModal
