import React, { useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import Button from './Button'
import { BUILDINGS, UPGRADES } from '../../logic/constants'
import { meetsRequirements, getUpgradeMultiplier } from '../../logic/gameLogic'
import { formatNumber } from '../../logic/utils'

const BuildModal = ({ isOpen, onClose }) => {
  const { buildings, upgrades, resources, purchaseBuilding } = useGameStore(state => ({
    buildings: state.buildings,
    upgrades: state.upgrades || [],
    resources: {
      money: state.money,
      wood: state.wood,
      stone: state.stone,
      plank: state.plank,
      knowledge: state.knowledge,
      experience: state.experience
    },
    purchaseBuilding: state.purchaseBuilding
  }))

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const canAfford = (cost) => {
    if (!cost) return true
    if (typeof cost === 'number') {
      return (resources.money ?? 0) >= cost
    }
    return Object.entries(cost).every(([resource, amount]) => {
      return (resources[resource] ?? 0) >= amount
    })
  }

  const formatCost = (cost) => {
    if (!cost) return 'Free'
    if (typeof cost === 'number') return `$${cost}`
    return Object.entries(cost)
      .map(([resource, amount]) => {
        if (resource === 'money') return `$${amount}`
        const capitalized = resource.charAt(0).toUpperCase() + resource.slice(1)
        return `${amount} ${capitalized}`
      })
      .join(', ')
  }

  const formatRequirements = (requirements) => {
    if (!requirements) return null
    const parts = []

    if (requirements.research) {
      const researchList = Array.isArray(requirements.research) ? requirements.research : [requirements.research]
      researchList.forEach(id => {
        const found = Object.values(UPGRADES).find(u => u.id.toLowerCase() === id.toLowerCase())
        parts.push(`Research: ${found ? found.name : id}`)
      })
    }

    const reqList = requirements.buildings || requirements
    Object.entries(reqList).forEach(([buildingKey, count]) => {
      if (buildingKey === 'research') return
      const found = Object.values(BUILDINGS).find(
        b => b.id.toLowerCase() === buildingKey.toLowerCase()
      )
      const name = found ? found.name : buildingKey
      parts.push(`${count} ${name}`)
    })

    return parts.join(', ')
  }

  const handlePurchase = (buildingType) => {
    const building = BUILDINGS[buildingType]
    purchaseBuilding({ ...building, type: buildingType })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container build-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>🏗️ Construct Building</h2>
            <p className="modal-subtitle">Choose a building to construct in your city</p>
          </div>
          <button className="modal-close-button" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-quick-resources">
          <span>💰 ${formatNumber(resources.money || 0)}</span>
          <span>🪵 {formatNumber(resources.wood || 0)} Wood</span>
          <span>🪚 {formatNumber(resources.plank || 0)} Plank</span>
          <span>🪨 {formatNumber(resources.stone || 0)} Stone</span>
          <span>💡 {formatNumber(resources.knowledge || 0)} Knowledge</span>
        </div>

        <div className="modal-content">
          <div className="buildings-grid">
            {Object.entries(BUILDINGS).map(([type, building]) => {
              const affordable = canAfford(building.cost)
              const hasRequirements = meetsRequirements(building.requirements, buildings, upgrades)
              const canPurchase = affordable && hasRequirements
              const multiplier = getUpgradeMultiplier(building.id || type, upgrades)
              const effectiveProduction = Number(((building.productionQuantity || 0) * multiplier).toFixed(2))
              const bonusPct = Math.round((multiplier - 1) * 100)

              return (
                <div key={type} className={`building-card ${!canPurchase ? 'disabled' : ''}`}>
                  <div className="building-card-header">
                    <h3>{building.name}</h3>
                  </div>
                  <p><strong>Cost:</strong> {formatCost(building.cost)}</p>
                  <p>
                    <strong>Produces:</strong> +{effectiveProduction} {building.product}/s
                    {bonusPct > 0 && <span className="multiplier-badge"> (+{bonusPct}%)</span>}
                  </p>
                  {building.knowledge ? (
                    <p><strong>Knowledge:</strong> +{building.knowledge}/s</p>
                  ) : null}
                  {building.requirements ? (
                    <p className={`requirement-info ${hasRequirements ? 'met' : 'unmet'}`}>
                      <strong>Requires:</strong> {hasRequirements ? '✔️ ' : '🔒 '}
                      {formatRequirements(building.requirements)}
                    </p>
                  ) : null}
                  <Button
                    onClick={() => handlePurchase(type)}
                    disabled={!canPurchase}
                  >
                    Purchase
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuildModal
