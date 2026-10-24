import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import { getUpgradeMultiplier, calculateResourceProduction } from '../../logic/gameLogic'
import { formatNumber } from '../../logic/utils'
import { BUILDINGS } from '../../logic/constants'

const CityView = ({ onOpenBuild }) => {
  const { t } = useTranslation()
  const { buildings, upgrades, money, wood, stone, plank, knowledge, experience } = useGameStore(state => ({
    buildings: state.buildings || [],
    upgrades: state.upgrades || [],
    money: state.money || 0,
    wood: state.wood || 0,
    stone: state.stone || 0,
    plank: state.plank || 0,
    knowledge: state.knowledge || 0,
    experience: state.experience || 0
  }))

  const playerResources = { money, wood, stone, plank, knowledge, experience }

  // Calculate net production rates per second
  const productionRates = calculateResourceProduction(buildings, upgrades)

  // Group owned buildings by type
  const groupedBuildings = Object.values(
    buildings.reduce((acc, building) => {
      const key = building.id || building.type || building.name
      const buildingDef = (building.type && BUILDINGS[building.type]) ||
        (building.id && BUILDINGS[building.id.toUpperCase()]) ||
        BUILDINGS[building.type?.toUpperCase()] ||
        building

      if (!acc[key]) {
        acc[key] = {
          id: key,
          name: building.name,
          count: 0,
          product: buildingDef.product,
          productionQuantityPerBuilding: buildingDef.productionQuantity || 0,
          knowledgePerBuilding: buildingDef.knowledge || 0,
          consumes: buildingDef.consumes || building.consumes || null,
        }
      }
      acc[key].count += 1
      return acc
    }, {})
  )

  const inventoryItems = [
    {
      id: 'money',
      name: t('resources.money'),
      icon: '💰',
      amount: `$${formatNumber(money)}`,
      rate: null,
      description: t('resources.moneyDesc'),
    },
    {
      id: 'wood',
      name: t('resources.wood'),
      icon: '🪵',
      amount: `${formatNumber(wood)} ${t('resources.units')}`,
      rate: productionRates.wood ? `+${Number(productionRates.wood.toFixed(2))}/s` : '0/s',
      description: t('resources.woodDesc'),
    },
    {
      id: 'plank',
      name: t('resources.plank'),
      icon: '🪚',
      amount: `${formatNumber(plank)} ${t('resources.units')}`,
      rate: productionRates.plank ? `+${Number(productionRates.plank.toFixed(2))}/s` : '0/s',
      description: t('resources.plankDesc'),
    },
    {
      id: 'stone',
      name: t('resources.stone'),
      icon: '🪨',
      amount: `${formatNumber(stone)} ${t('resources.units')}`,
      rate: productionRates.stone ? `+${Number(productionRates.stone.toFixed(2))}/s` : '0/s',
      description: t('resources.stoneDesc'),
    },
    {
      id: 'knowledge',
      name: t('resources.knowledge'),
      icon: '💡',
      amount: `${formatNumber(knowledge)} ${t('resources.points')}`,
      rate: productionRates.knowledge ? `+${Number(productionRates.knowledge.toFixed(2))}/s` : '0/s',
      description: t('resources.knowledgeDesc'),
    },
    {
      id: 'experience',
      name: t('resources.experience'),
      icon: '📚',
      amount: `${formatNumber(experience)} ${t('resources.xp')}`,
      rate: null,
      description: t('resources.experienceDesc'),
    },
  ]

  return (
    <div className="screen city-view">
      <div className="city-header-section">
        <div>
          <h1>{t('city.title')}</h1>
          <p className="city-subtitle">
            {t('city.subtitle')}
          </p>
        </div>
        {onOpenBuild && (
          <Button onClick={onOpenBuild} variant="primary" className="hero-build-button">
            {t('city.constructBtn')}
          </Button>
        )}
      </div>

      {/* Comprehensive Inventory Section */}
      <section className="dashboard-section">
        <div className="section-title-row">
          <h2>{t('city.inventoryTitle')}</h2>
          <span className="section-badge">
            {t('city.commoditiesCount', { count: inventoryItems.length })}
          </span>
        </div>
        <div className="inventory-grid">
          {inventoryItems.map(item => (
            <div key={item.id} className="inventory-card">
              <div className="inventory-card-top">
                <span className="inventory-icon">{item.icon}</span>
                <div className="inventory-title-group">
                  <h3>{item.name}</h3>
                  <span className="inventory-amount">{item.amount}</span>
                </div>
              </div>
              <div className="inventory-card-bottom">
                <p className="inventory-desc">{item.description}</p>
                {item.rate && (
                  <div className="inventory-rate-badge">
                    <span>{t('resources.rate')}: </span>
                    <strong className="text-success">{item.rate}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Net Production Rates Summary */}
      <section className="dashboard-section">
        <div className="section-title-row">
          <h2>{t('city.productionTitle')}</h2>
          <span className="section-badge">{t('city.yieldBadge')}</span>
        </div>
        <div className="production-summary-grid">
          <div className="production-summary-card">
            <span className="summary-icon">🪵</span>
            <div>
              <span className="summary-label">{t('city.woodYield')}</span>
              <strong className="summary-value text-success">
                +{Number((productionRates.wood || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
          <div className="production-summary-card">
            <span className="summary-icon">🪚</span>
            <div>
              <span className="summary-label">{t('city.plankYield')}</span>
              <strong className="summary-value text-success">
                +{Number((productionRates.plank || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
          <div className="production-summary-card">
            <span className="summary-icon">🪨</span>
            <div>
              <span className="summary-label">{t('city.stoneYield')}</span>
              <strong className="summary-value text-success">
                +{Number((productionRates.stone || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
          <div className="production-summary-card">
            <span className="summary-icon">💡</span>
            <div>
              <span className="summary-label">{t('city.knowledgeYield')}</span>
              <strong className="summary-value text-warning">
                +{Number((productionRates.knowledge || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* City Constructed Buildings Section */}
      <section className="dashboard-section">
        <div className="section-title-row">
          <h2>{t('city.activeBuildingsTitle')}</h2>
          <span className="section-badge">
            {t('city.structuresCount', { count: buildings.length })}
          </span>
        </div>

        <div className="owned-buildings-list">
          {groupedBuildings.length === 0 ? (
            <div className="empty-buildings-banner">
              <span className="empty-icon">🏗️</span>
              <h3>{t('city.emptyBuildingsTitle')}</h3>
              <p>{t('city.emptyBuildingsDesc')}</p>
              {onOpenBuild && (
                <Button onClick={onOpenBuild} variant="primary">
                  {t('city.openBuildMenu')}
                </Button>
              )}
            </div>
          ) : (
            groupedBuildings.map(group => {
              const multiplier = getUpgradeMultiplier(group.id, upgrades)
              const totalProduction = Number((group.productionQuantityPerBuilding * multiplier * group.count).toFixed(2))
              const totalKnowledge = Number(((group.knowledgePerBuilding || 0) * group.count).toFixed(2))
              const bonusPct = Math.round((multiplier - 1) * 100)
              const translatedBuildingName = t(`buildings.${group.id}.name`, group.name)
              const translatedProduct = t(`resources.${group.product}`, group.product)

              // Check if building is missing any required consumable resources
              const isStarved = group.consumes && Object.entries(group.consumes).some(
                ([resKey]) => (playerResources[resKey] || 0) < 1
              )

              return (
                <div key={group.id} className={`owned-building-row ${isStarved ? 'starved' : ''}`}>
                  <div className="building-identity">
                    <strong>{translatedBuildingName}</strong>
                    <span className="building-count-badge">x{group.count}</span>
                    {isStarved && (
                      <span className="status-badge warning" style={{ marginLeft: '8px', fontSize: '0.72rem' }}>
                        ⚠️ {t('build.materialsMissing')}
                      </span>
                    )}
                  </div>
                  <div className="building-production-info">
                    {group.consumes && Object.entries(group.consumes).map(([resKey, req]) => {
                      const totalCons = Number((req * (group.productionQuantityPerBuilding || 1) * multiplier * group.count).toFixed(2))
                      const resName = t(`resources.${resKey}`, resKey)
                      return (
                        <span key={resKey} className="production-pill text-warning" title={t('build.consumes')}>
                          -{totalCons} {resName}/s
                        </span>
                      )
                    })}
                    <span className="production-pill text-success">
                      +{totalProduction} {translatedProduct}/s
                      {bonusPct > 0 && ` (+${bonusPct}%)`}
                    </span>
                    {totalKnowledge > 0 && (
                      <span className="production-pill text-warning">
                        +{totalKnowledge} 💡/s
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}

export default CityView