import React, { useEffect, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { BUILDINGS } from '../../logic/constants'
import Button from './Button'

const ResearchCompleteModal = () => {
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

  return (
    <div className="modal-backdrop completion-backdrop" onClick={dismissCompletedResearch}>
      <div className="modal-container completion-modal" onClick={e => e.stopPropagation()}>
        <div className="completion-confetti-header">
          <span className="celebration-badge">🔬 Research Breakthrough!</span>
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

          <h2>{completedResearch.name}</h2>
          <p className="completion-description">{completedResearch.description}</p>

          <div className="completion-benefit-box">
            <span className="benefit-label">ACTIVE BENEFIT</span>
            <strong className="benefit-value text-success">
              {unlockedBuilding
                ? `🏗️ Unlocked New Building: ${unlockedBuilding.name} (Ready in Build Menu!)`
                : `⚡ +${Math.round((completedResearch.multiplier || 0) * 100)}% Production Bonus for ${completedResearch.affects}`}
            </strong>
          </div>

          <div className="countdown-auto-bar">
            <div
              className="countdown-progress-fill"
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>
          <span className="countdown-text">Auto-closing in {countdown}s...</span>

          <Button
            variant="primary"
            className="claim-research-btn"
            onClick={dismissCompletedResearch}
          >
            Awesome! Continue Playing
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResearchCompleteModal
