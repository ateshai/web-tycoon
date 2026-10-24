import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import { formatNumber } from '../../logic/utils'
import { getPopulationStats } from '../../logic/gameLogic'

import styles from './ResourceDisplay.module.css'

const ResourceDisplay = () => {
  const { t } = useTranslation()
  const { money, knowledge, experience, wood, stone, plank, land, buildings } = useGameStore(state => ({
    money: state.money,
    knowledge: state.knowledge,
    experience: state.experience,
    wood: state.wood,
    stone: state.stone,
    plank: state.plank,
    land: state.land ?? 10,
    buildings: state.buildings || [],
  }))

  const usedLand = buildings.length
  const totalLand = land ?? 10
  const freeLand = Math.max(0, totalLand - usedLand)
  const { totalPopulation, workingPopulation, freePopulation } = getPopulationStats(buildings)

  return (
    <div className={styles.resourceBar}>
      <div className={styles.resourceDisplay} title={t('resources.money')}>
        <span className={styles.resourceIcon}>💰</span>
        <span className={styles.resourceValue}>${formatNumber(money || 0)}</span>
      </div>
      <div className={styles.resourceDisplay} title={`${t('resources.usedLand')}: ${usedLand} / ${t('resources.freeLand')}: ${freeLand}`}>
        <span className={styles.resourceIcon}>🏞️</span>
        <span className={styles.resourceValue}>
          {freeLand}/{totalLand} {t('resources.land')}
        </span>
      </div>
      <div
        className={styles.resourceDisplay}
        title={`${t('resources.workingPopulation')}: ${workingPopulation} / ${t('resources.freePopulation')}: ${freePopulation}`}
      >
        <span className={styles.resourceIcon}>👥</span>
        <span className={styles.resourceValue}>
          {workingPopulation}/{totalPopulation} {t('resources.population')} ({freePopulation} {t('resources.free')})
        </span>
      </div>
      <div className={styles.resourceDisplay} title={t('resources.wood')}>
        <span className={styles.resourceIcon}>🪵</span>
        <span className={styles.resourceValue}>{formatNumber(wood || 0)} {t('resources.wood')}</span>
      </div>
      <div className={styles.resourceDisplay} title={t('resources.plank')}>
        <span className={styles.resourceIcon}>🪚</span>
        <span className={styles.resourceValue}>{formatNumber(plank || 0)} {t('resources.plank')}</span>
      </div>
      <div className={styles.resourceDisplay} title={t('resources.stone')}>
        <span className={styles.resourceIcon}>🪨</span>
        <span className={styles.resourceValue}>{formatNumber(stone || 0)} {t('resources.stone')}</span>
      </div>
      <div className={styles.resourceDisplay} title={t('resources.knowledge')}>
        <span className={styles.resourceIcon}>💡</span>
        <span className={styles.resourceValue}>{formatNumber(knowledge || 0)} {t('resources.knowledge')}</span>
      </div>
      <div className={styles.resourceDisplay} title={t('resources.experience')}>
        <span className={styles.resourceIcon}>📚</span>
        <span className={styles.resourceValue}>{formatNumber(experience || 0)} {t('resources.xp')}</span>
      </div>
    </div>
  )
}

export default ResourceDisplay