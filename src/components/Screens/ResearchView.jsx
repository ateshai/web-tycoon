import React from 'react'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import { UPGRADES, BUILDINGS } from '../../logic/constants'
import { meetsRequirements } from '../../logic/gameLogic'
import { formatNumber } from '../../logic/utils'

const ResearchView = () => {
  const { knowledge, upgrades, buildings, activeResearch, startResearch } = useGameStore(state => ({
    knowledge: state.knowledge || 0,
    upgrades: state.upgrades || [],
    buildings: state.buildings || [],
    activeResearch: state.activeResearch,
    startResearch: state.startResearch
  }))

  const canAfford = (cost) => {
    if (!cost) return true
    if (cost.knowledge && knowledge < cost.knowledge) return false
    return true
  }

  const formatRequirements = (requirements) => {
    if (!requirements) return null
    const reqList = requirements.buildings || requirements
    return Object.entries(reqList)
      .map(([buildingKey, count]) => {
        const found = Object.values(BUILDINGS).find(
          b => b.id.toLowerCase() === buildingKey.toLowerCase()
        )
        const name = found ? found.name : buildingKey
        return `${count} ${name}`
      })
      .join(', ')
  }

  return (
    <div className="screen research-view">
      <div className="research-header">
        <h1>Research & Development</h1>
        <div className="knowledge-pill">
          <span>💡 Available Knowledge: <strong>{formatNumber(knowledge)}</strong></span>
        </div>
      </div>
      <p className="research-subtitle">
        Invest your Knowledge into timed technological breakthroughs to expand your city's capabilities.
      </p>

      <div className="upgrades-grid">
        {Object.entries(UPGRADES).map(([key, upgrade]) => {
          const isPurchased = upgrades.some(u => u.id === upgrade.id)
          const isCurrentResearch = activeResearch?.upgrade?.id === upgrade.id
          const isAnyResearchActive = !!activeResearch
          const hasRequirements = meetsRequirements(upgrade.requirements, buildings, upgrades)
          const affordable = canAfford(upgrade.cost)
          const canResearch = !isPurchased && !isAnyResearchActive && hasRequirements && affordable

          const unlockedBuilding = upgrade.unlocks
            ? Object.values(BUILDINGS).find(b => b.id.toLowerCase() === upgrade.unlocks.toLowerCase())
            : null

          return (
            <div
              key={key}
              className={`upgrade-card ${isPurchased ? 'purchased' : isCurrentResearch ? 'in-progress' : !canResearch ? 'disabled' : ''}`}
            >
              <div className="upgrade-card-header">
                <h3>{upgrade.name}</h3>
                {isPurchased && <span className="status-badge researched">Researched</span>}
                {isCurrentResearch && <span className="status-badge researching">Researching...</span>}
              </div>

              <p className="upgrade-description">{upgrade.description}</p>

              <div className="upgrade-details">
                <p>
                  <strong>Cost:</strong> 💡 {upgrade.cost?.knowledge || 0} Knowledge
                </p>
                <p>
                  <strong>Research Time:</strong> ⏱️ {upgrade.duration || 10} seconds
                </p>
                <p>
                  <strong>Effect:</strong>{' '}
                  {unlockedBuilding
                    ? `Unlocks ${unlockedBuilding.name} building`
                    : `+${Math.round((upgrade.multiplier || 0) * 100)}% production for ${upgrade.affects}`}
                </p>
                {upgrade.requirements ? (
                  <p className={`requirement-info ${hasRequirements ? 'met' : 'unmet'}`}>
                    <strong>Requires:</strong> {hasRequirements ? '✔️ ' : '🔒 '}
                    {formatRequirements(upgrade.requirements)}
                  </p>
                ) : null}
              </div>

              <Button
                variant={isPurchased ? 'secondary' : isCurrentResearch ? 'secondary' : 'primary'}
                onClick={() => startResearch(upgrade)}
                disabled={!canResearch}
              >
                {isPurchased
                  ? 'Researched ✔️'
                  : isCurrentResearch
                  ? 'In Progress ⏳'
                  : isAnyResearchActive
                  ? 'Queue Busy (Wait)'
                  : `Start Research (${upgrade.duration || 10}s)`}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ResearchView