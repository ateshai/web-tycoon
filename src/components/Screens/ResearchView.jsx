import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import { UPGRADES, BUILDINGS } from '../../logic/constants'
import { meetsRequirements } from '../../logic/gameLogic'
import { formatNumber } from '../../logic/utils'

import styles from './ResearchView.module.css'

const ResearchView = () => {
  const { t } = useTranslation()
  const { resources, knowledge, upgrades, buildings, activeResearch, startResearch } = useGameStore(state => ({
    knowledge: state.knowledge || 0,
    resources: {
      knowledge: state.knowledge || 0,
      money: state.money || 0,
      wood: state.wood || 0,
      stone: state.stone || 0,
      plank: state.plank || 0,
      grain: state.grain || 0,
      flour: state.flour || 0,
      food: state.food || 0,
      water: state.water || 0,
    },
    upgrades: state.upgrades || [],
    buildings: state.buildings || [],
    activeResearch: state.activeResearch,
    startResearch: state.startResearch
  }))

  const canAfford = (cost) => {
    if (!cost) return true
    return Object.entries(cost).every(([resource, amount]) => {
      return (resources[resource] ?? 0) >= amount
    })
  }

  const renderCost = (cost) => {
    if (!cost || Object.keys(cost).length === 0) return t('build.free', 'Ücretsiz')
    const iconMap = {
      knowledge: '💡',
      money: '💰',
      wood: '🪵',
      stone: '🪨',
      plank: '🪚',
      grain: '🌾',
      flour: '🥡',
      food: '🍞',
      water: '💧'
    }
    return (
      <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px' }}>
        {Object.entries(cost).map(([res, amount]) => {
          const hasEnough = (resources[res] ?? 0) >= amount
          const icon = iconMap[res] || '📦'
          const name = t(`resources.${res}`, res)
          return (
            <span
              key={res}
              style={{
                color: hasEnough ? 'inherit' : 'var(--danger-color, #e74c3c)',
                fontWeight: hasEnough ? 'normal' : '600'
              }}
            >
              {icon} {formatNumber(amount)} {name}
            </span>
          )
        })}
      </span>
    )
  }

  const formatRequirements = (requirements) => {
    if (!requirements) return null
    const parts = []

    if (requirements.research) {
      const researchList = Array.isArray(requirements.research) ? requirements.research : [requirements.research]
      researchList.forEach(id => {
        const found = Object.values(UPGRADES).find(u => u.id.toLowerCase() === id.toLowerCase())
        const name = found ? t(`upgrades.${found.id}.name`, found.name) : id
        parts.push(`🔬 ${name}`)
      })
    }

    const reqList = requirements.buildings || requirements
    Object.entries(reqList).forEach(([buildingKey, count]) => {
      if (buildingKey === 'research') return
      const found = Object.values(BUILDINGS).find(
        b => b.id.toLowerCase() === buildingKey.toLowerCase()
      )
      const name = found ? t(`buildings.${found.id}.name`, found.name) : buildingKey
      parts.push(`🏛️ ${count} ${name}`)
    })

    return parts.join(', ')
  }

  return (
    <div className={`screen ${styles.researchView}`}>
      <div className={styles.researchHeader}>
        <h1>{t('research.title')}</h1>
        <div className={styles.knowledgePill}>
          <span>💡 {t('research.availableKnowledge')}: <strong>{formatNumber(knowledge)}</strong></span>
        </div>
      </div>
      <p className={styles.researchSubtitle}>
        {t('research.subtitle')}
      </p>

      <div className={styles.upgradesGrid}>
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

          const cardStatusClass = isPurchased
            ? styles.purchased
            : isCurrentResearch
              ? styles.inProgress
              : !canResearch
                ? styles.disabled
                : ''

          return (
            <div
              key={key}
              className={`${styles.upgradeCard} ${cardStatusClass}`}
            >
              <div className={styles.upgradeCardHeader}>
                <h3>{upgradeName}</h3>
                {isPurchased && <span className={`${styles.statusBadge} ${styles.researched}`}>{t('research.statusResearched')}</span>}
                {isCurrentResearch && <span className={`${styles.statusBadge} ${styles.researching}`}>{t('research.statusResearching')}</span>}
              </div>

              <p className={styles.upgradeDescription}>{upgradeDesc}</p>

              <div className={styles.upgradeDetails}>
                <p>
                  <strong>{t('research.cost')}:</strong> {renderCost(upgrade.cost)}
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