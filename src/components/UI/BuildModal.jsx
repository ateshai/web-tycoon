import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import Button from './Button'
import { BUILDINGS, UPGRADES } from '../../logic/constants'
import { meetsRequirements, getUpgradeMultiplier } from '../../logic/gameLogic'
import { formatNumber } from '../../logic/utils'

const BuildModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
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
    if (!cost) return t('build.free')
    if (typeof cost === 'number') return `$${cost}`
    return Object.entries(cost)
      .map(([resource, amount]) => {
        if (resource === 'money') return `$${amount}`
        const resourceName = t(`resources.${resource}`, resource)
        return `${amount} ${resourceName}`
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
        const resName = found ? t(`upgrades.${found.id}.name`, found.name) : id
        parts.push(`${t('nav.research')}: ${resName}`)
      })
    }

    const reqList = requirements.buildings || requirements
    Object.entries(reqList).forEach(([buildingKey, count]) => {
      if (buildingKey === 'research') return
      const found = Object.values(BUILDINGS).find(
        b => b.id.toLowerCase() === buildingKey.toLowerCase()
      )
      const name = found ? t(`buildings.${found.id}.name`, found.name) : buildingKey
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
            <h2>{t('build.title')}</h2>
            <p className="modal-subtitle">{t('build.subtitle')}</p>
          </div>
          <button className="modal-close-button" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-quick-resources">
          <span>💰 ${formatNumber(resources.money || 0)}</span>
          <span>🪵 {formatNumber(resources.wood || 0)} {t('resources.wood')}</span>
          <span>🪚 {formatNumber(resources.plank || 0)} {t('resources.plank')}</span>
          <span>🪨 {formatNumber(resources.stone || 0)} {t('resources.stone')}</span>
          <span>💡 {formatNumber(resources.knowledge || 0)} {t('resources.knowledge')}</span>
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
              const buildingName = t(`buildings.${building.id || type}.name`, building.name)
              const productName = t(`resources.${building.product}`, building.product)

              return (
                <div key={type} className={`building-card ${!canPurchase ? 'disabled' : ''}`}>
                  <div className="building-card-header">
                    <h3>{buildingName}</h3>
                  </div>
                  <p><strong>{t('build.cost')}:</strong> {formatCost(building.cost)}</p>
                  {building.consumes && Object.keys(building.consumes).length > 0 && (
                    <p className="building-consumes-info">
                      <strong>{t('build.consumes')}:</strong>{' '}
                      <span className="text-warning">
                        {Object.entries(building.consumes).map(([res, amt]) => {
                          const totalReq = Number((amt * (building.productionQuantity || 1) * multiplier).toFixed(2))
                          const resName = t(`resources.${res}`, res)
                          return `-${totalReq} ${resName}/s`
                        }).join(', ')}
                      </span>
                    </p>
                  )}
                  <p>
                    <strong>{t('build.produces')}:</strong> +{effectiveProduction} {productName}/s
                    {bonusPct > 0 && <span className="multiplier-badge"> (+{bonusPct}%)</span>}
                  </p>
                  {building.knowledge ? (
                    <p><strong>{t('build.knowledge')}:</strong> +{building.knowledge}/s</p>
                  ) : null}
                  {building.requirements ? (
                    <p className={`requirement-info ${hasRequirements ? 'met' : 'unmet'}`}>
                      <strong>{t('build.requires')}:</strong> {hasRequirements ? '✔️ ' : '🔒 '}
                      {formatRequirements(building.requirements)}
                    </p>
                  ) : null}
                  <Button
                    onClick={() => handlePurchase(type)}
                    disabled={!canPurchase}
                  >
                    {t('build.purchase')}
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
