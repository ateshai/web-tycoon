import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import { UPGRADES, BUILDINGS } from '../../logic/constants'
import { meetsRequirements } from '../../logic/gameLogic'
import { formatNumber } from '../../logic/utils'

const ResearchView = () => {
  const { t } = useTranslation()
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
        const name = found ? t(`buildings.${found.id}.name`, found.name) : buildingKey
        return `${count} ${name}`
      })
      .join(', ')
  }

  return (
    <div className="screen research-view">
      <div className="research-header">
        <h1>{t('research.title')}</h1>
        <div className="knowledge-pill">
          <span>💡 {t('research.availableKnowledge')}: <strong>{formatNumber(knowledge)}</strong></span>
        </div>
      </div>
      <p className="research-subtitle">
        {t('research.subtitle')}
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

          const upgradeName = t(`upgrades.${upgrade.id}.name`, upgrade.name)
          const upgradeDesc = t(`upgrades.${upgrade.id}.description`, upgrade.description)
          const unlockedName = unlockedBuilding ? t(`buildings.${unlockedBuilding.id}.name`, unlockedBuilding.name) : ''
          const affectsName = upgrade.affects ? t(`buildings.${upgrade.affects}.name`, upgrade.affects) : ''

          return (
            <div
              key={key}
              className={`upgrade-card ${isPurchased ? 'purchased' : isCurrentResearch ? 'in-progress' : !canResearch ? 'disabled' : ''}`}
            >
              <div className="upgrade-card-header">
                <h3>{upgradeName}</h3>
                {isPurchased && <span className="status-badge researched">{t('research.statusResearched')}</span>}
                {isCurrentResearch && <span className="status-badge researching">{t('research.statusResearching')}</span>}
              </div>

              <p className="upgrade-description">{upgradeDesc}</p>

              <div className="upgrade-details">
                <p>
                  <strong>{t('research.cost')}:</strong> 💡 {upgrade.cost?.knowledge || 0} {t('resources.knowledge')}
                </p>
                <p>
                  <strong>{t('research.researchTime')}:</strong> ⏱️ {upgrade.duration || 10} {t('research.seconds')}
                </p>
                <p>
                  <strong>{t('research.effect')}:</strong>{' '}
                  {unlockedBuilding
                    ? t('research.unlocksBuilding', { name: unlockedName })
                    : t('research.productionBonus', { bonus: Math.round((upgrade.multiplier || 0) * 100), target: affectsName })}
                </p>
                {upgrade.requirements ? (
                  <p className={`requirement-info ${hasRequirements ? 'met' : 'unmet'}`}>
                    <strong>{t('research.requires')}:</strong> {hasRequirements ? '✔️ ' : '🔒 '}
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
                  ? t('research.btnResearched')
                  : isCurrentResearch
                  ? t('research.btnInProgress')
                  : isAnyResearchActive
                  ? t('research.btnQueueBusy')
                  : t('research.btnStart', { duration: upgrade.duration || 10 })}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ResearchView