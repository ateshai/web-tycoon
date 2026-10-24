import React from 'react'
import { useGameStore } from '../../store/gameStore'
import { formatNumber } from '../../logic/utils'

const ResourceDisplay = () => {
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
      <div className="resource-display" title="Money">
        <span className="resource-icon">💰</span>
        <span className="resource-value">${formatNumber(money || 0)}</span>
      </div>
      <div className="resource-display" title="Wood">
        <span className="resource-icon">🪵</span>
        <span className="resource-value">{formatNumber(wood || 0)} Wood</span>
      </div>
      <div className="resource-display" title="Planks">
        <span className="resource-icon">🪚</span>
        <span className="resource-value">{formatNumber(plank || 0)} Plank</span>
      </div>
      <div className="resource-display" title="Stone">
        <span className="resource-icon">🪨</span>
        <span className="resource-value">{formatNumber(stone || 0)} Stone</span>
      </div>
      <div className="resource-display" title="Knowledge">
        <span className="resource-icon">💡</span>
        <span className="resource-value">{formatNumber(knowledge || 0)} Knowledge</span>
      </div>
      <div className="resource-display" title="Experience">
        <span className="resource-icon">📚</span>
        <span className="resource-value">{formatNumber(experience || 0)}</span>
      </div>
    </div>
  )
}

export default ResourceDisplay