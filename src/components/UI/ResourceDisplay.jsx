import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import { formatNumber } from '../../logic/utils'

const ResourceDisplay = () => {
  const { t } = useTranslation()
  const { money, knowledge, experience, wood, stone, plank } = useGameStore(state => ({
    money: state.money,
    knowledge: state.knowledge,
    experience: state.experience,
    wood: state.wood,
    stone: state.stone,
    plank: state.plank,
  }))

  return (
    <div className="resource-bar">
      <div className="resource-display" title={t('resources.money')}>
        <span className="resource-icon">💰</span>
        <span className="resource-value">${formatNumber(money || 0)}</span>
      </div>
      <div className="resource-display" title={t('resources.wood')}>
        <span className="resource-icon">🪵</span>
        <span className="resource-value">{formatNumber(wood || 0)} {t('resources.wood')}</span>
      </div>
      <div className="resource-display" title={t('resources.plank')}>
        <span className="resource-icon">🪚</span>
        <span className="resource-value">{formatNumber(plank || 0)} {t('resources.plank')}</span>
      </div>
      <div className="resource-display" title={t('resources.stone')}>
        <span className="resource-icon">🪨</span>
        <span className="resource-value">{formatNumber(stone || 0)} {t('resources.stone')}</span>
      </div>
      <div className="resource-display" title={t('resources.knowledge')}>
        <span className="resource-icon">💡</span>
        <span className="resource-value">{formatNumber(knowledge || 0)} {t('resources.knowledge')}</span>
      </div>
      <div className="resource-display" title={t('resources.experience')}>
        <span className="resource-icon">📚</span>
        <span className="resource-value">{formatNumber(experience || 0)} {t('resources.xp')}</span>
      </div>
    </div>
  )
}

export default ResourceDisplay