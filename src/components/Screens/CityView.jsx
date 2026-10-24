import React from 'react'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import { getUpgradeMultiplier, calculateResourceProduction } from '../../logic/gameLogic'
import { formatNumber } from '../../logic/utils'

const CityView = ({ onOpenBuild }) => {
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

  // Calculate net production rates per second
  const productionRates = calculateResourceProduction(buildings, upgrades)

  // Group owned buildings by type
  const groupedBuildings = Object.values(
    buildings.reduce((acc, building) => {
      const key = building.id || building.type || building.name
      if (!acc[key]) {
        acc[key] = {
          id: key,
          name: building.name,
          count: 0,
          product: building.product,
          productionQuantityPerBuilding: building.productionQuantity || 0,
          knowledgePerBuilding: building.knowledge || 0,
        }
      }
      acc[key].count += 1
      return acc
    }, {})
  )

  const inventoryItems = [
    {
      id: 'money',
      name: 'Cash / Treasury',
      icon: '💰',
      amount: `$${formatNumber(money)}`,
      rate: null,
      description: 'Used to purchase buildings, tools and trade goods.',
    },
    {
      id: 'wood',
      name: 'Wood',
      icon: '🪵',
      amount: `${formatNumber(wood)} units`,
      rate: productionRates.wood ? `+${Number(productionRates.wood.toFixed(2))}/s` : '0/s',
      description: 'Raw building material harvested by woodcutters.',
    },
    {
      id: 'plank',
      name: 'Planks',
      icon: '🪚',
      amount: `${formatNumber(plank)} units`,
      rate: productionRates.plank ? `+${Number(productionRates.plank.toFixed(2))}/s` : '0/s',
      description: 'Refined lumber processed by carpenters.',
    },
    {
      id: 'stone',
      name: 'Stone',
      icon: '🪨',
      amount: `${formatNumber(stone)} units`,
      rate: productionRates.stone ? `+${Number(productionRates.stone.toFixed(2))}/s` : '0/s',
      description: 'Heavy quarry material cut by stonemasons.',
    },
    {
      id: 'knowledge',
      name: 'Knowledge',
      icon: '💡',
      amount: `${formatNumber(knowledge)} points`,
      rate: productionRates.knowledge ? `+${Number(productionRates.knowledge.toFixed(2))}/s` : '0/s',
      description: 'Scientific insight used to unlock new technologies.',
    },
    {
      id: 'experience',
      name: 'Experience',
      icon: '📚',
      amount: `${formatNumber(experience)} XP`,
      rate: null,
      description: 'Progression gained through completing milestones.',
    },
  ]

  return (
    <div className="screen city-view">
      <div className="city-header-section">
        <div>
          <h1>City Dashboard</h1>
          <p className="city-subtitle">
            Overview of your city's total inventory, production capacity, and active buildings.
          </p>
        </div>
        {onOpenBuild && (
          <Button onClick={onOpenBuild} variant="primary" className="hero-build-button">
            🔨 Construct Building
          </Button>
        )}
      </div>

      {/* Comprehensive Inventory Section */}
      <section className="dashboard-section">
        <div className="section-title-row">
          <h2>📦 City Inventory & Storage</h2>
          <span className="section-badge">{inventoryItems.length} Commodities</span>
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
                    <span>Rate: </span>
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
          <h2>⚡ Production Summary</h2>
          <span className="section-badge">Per Second Yield</span>
        </div>
        <div className="production-summary-grid">
          <div className="production-summary-card">
            <span className="summary-icon">🪵</span>
            <div>
              <span className="summary-label">Wood Yield</span>
              <strong className="summary-value text-success">
                +{Number((productionRates.wood || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
          <div className="production-summary-card">
            <span className="summary-icon">🪚</span>
            <div>
              <span className="summary-label">Plank Yield</span>
              <strong className="summary-value text-success">
                +{Number((productionRates.plank || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
          <div className="production-summary-card">
            <span className="summary-icon">🪨</span>
            <div>
              <span className="summary-label">Stone Yield</span>
              <strong className="summary-value text-success">
                +{Number((productionRates.stone || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
          <div className="production-summary-card">
            <span className="summary-icon">💡</span>
            <div>
              <span className="summary-label">Knowledge Generation</span>
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
          <h2>🏛️ Active Buildings in City</h2>
          <span className="section-badge">{buildings.length} Total Structures</span>
        </div>

        <div className="owned-buildings-list">
          {groupedBuildings.length === 0 ? (
            <div className="empty-buildings-banner">
              <span className="empty-icon">🏗️</span>
              <h3>No Buildings Constructed Yet</h3>
              <p>Your city needs production structures to begin generating resources and knowledge.</p>
              {onOpenBuild && (
                <Button onClick={onOpenBuild} variant="primary">
                  Open Build Menu
                </Button>
              )}
            </div>
          ) : (
            groupedBuildings.map(group => {
              const multiplier = getUpgradeMultiplier(group.id, upgrades)
              const totalProduction = Number((group.productionQuantityPerBuilding * multiplier * group.count).toFixed(2))
              const totalKnowledge = Number(((group.knowledgePerBuilding || 0) * group.count).toFixed(2))
              const bonusPct = Math.round((multiplier - 1) * 100)

              return (
                <div key={group.id} className="owned-building-row">
                  <div className="building-identity">
                    <strong>{group.name}</strong>
                    <span className="building-count-badge">x{group.count}</span>
                  </div>
                  <div className="building-production-info">
                    <span className="production-pill text-success">
                      +{totalProduction} {group.product}/s
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