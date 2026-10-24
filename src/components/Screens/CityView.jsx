import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import { getUpgradeMultiplier, calculateResourceProduction, getPopulationStats } from '../../logic/gameLogic'
import { formatNumber } from '../../logic/utils'
import { BUILDINGS } from '../../logic/constants'
import styles from './CityView.module.css'

const CityView = ({ onOpenBuild }) => {
  const { t } = useTranslation()
  const { buildings, upgrades, money, wood, stone, plank, knowledge, experience, land } = useGameStore(state => ({
    buildings: state.buildings || [],
    upgrades: state.upgrades || [],
    money: state.money || 0,
    wood: state.wood || 0,
    stone: state.stone || 0,
    plank: state.plank || 0,
    knowledge: state.knowledge || 0,
    experience: state.experience || 0,
    land: state.land ?? 10
  }))

  const usedLand = buildings.length
  const totalLand = land ?? 10
  const freeLand = Math.max(0, totalLand - usedLand)
  const playerResources = { money, wood, stone, plank, knowledge, experience, land: totalLand }
  const popStats = getPopulationStats(buildings)

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
      id: 'land',
      name: t('resources.land'),
      icon: '🏞️',
      amount: `${freeLand}/${totalLand} ${t('resources.freeLand')}`,
      rate: `${usedLand}/${totalLand} ${t('land.used')}`,
      description: t('resources.landDesc'),
    },
    {
      id: 'population',
      name: t('resources.population'),
      icon: '👥',
      amount: `${popStats.workingPopulation}/${popStats.totalPopulation}`,
      rate: `${popStats.freePopulation} ${t('resources.free')}`,
      description: `${t('resources.workingPopulation')}: ${popStats.workingPopulation} • ${t('resources.freePopulation')}: ${popStats.freePopulation}`,
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
    <div className={`screen ${styles.cityView}`}>
      <div className={styles.cityHeaderSection}>
        <div>
          <h1>{t('city.title')}</h1>
          <p className={styles.citySubtitle}>
            {t('city.subtitle')}
          </p>
        </div>
        {onOpenBuild && (
          <Button onClick={onOpenBuild} variant="primary" className={styles.heroBuildButton}>
            {t('city.constructBtn')}
          </Button>
        )}
      </div>

      {/* Comprehensive Inventory Section */}
      <section className={styles.dashboardSection}>
        <div className={styles.sectionTitleRow}>
          <h2>{t('city.inventoryTitle')}</h2>
          <span className={styles.sectionBadge}>
            {t('city.commoditiesCount', { count: inventoryItems.length })}
          </span>
        </div>
        <div className={styles.inventoryGrid}>
          {inventoryItems.map(item => (
            <div key={item.id} className={styles.inventoryCard}>
              <div className={styles.inventoryCardTop}>
                <span className={styles.inventoryIcon}>{item.icon}</span>
                <div className={styles.inventoryTitleGroup}>
                  <h3>{item.name}</h3>
                  <span className={styles.inventoryAmount}>{item.amount}</span>
                </div>
              </div>
              <div className={styles.inventoryCardBottom}>
                <p className={styles.inventoryDesc}>{item.description}</p>
                {item.rate && (
                  <div className={styles.inventoryRateBadge}>
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
      <section className={styles.dashboardSection}>
        <div className={styles.sectionTitleRow}>
          <h2>{t('city.productionTitle')}</h2>
          <span className={styles.sectionBadge}>{t('city.yieldBadge')}</span>
        </div>
        <div className={styles.productionSummaryGrid}>
          <div className={styles.productionSummaryCard}>
            <span className={styles.summaryIcon}>🪵</span>
            <div>
              <span className={styles.summaryLabel}>{t('city.woodYield')}</span>
              <strong className="summary-value text-success">
                +{Number((productionRates.wood || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
          <div className={styles.productionSummaryCard}>
            <span className={styles.summaryIcon}>🪚</span>
            <div>
              <span className={styles.summaryLabel}>{t('city.plankYield')}</span>
              <strong className="summary-value text-success">
                +{Number((productionRates.plank || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
          <div className={styles.productionSummaryCard}>
            <span className={styles.summaryIcon}>🪨</span>
            <div>
              <span className={styles.summaryLabel}>{t('city.stoneYield')}</span>
              <strong className="summary-value text-success">
                +{Number((productionRates.stone || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
          <div className={styles.productionSummaryCard}>
            <span className={styles.summaryIcon}>💡</span>
            <div>
              <span className={styles.summaryLabel}>{t('city.knowledgeYield')}</span>
              <strong className="summary-value text-warning">
                +{Number((productionRates.knowledge || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* City Constructed Buildings Section */}
      <section className={styles.dashboardSection}>
        <div className={styles.sectionTitleRow}>
          <h2>{t('city.activeBuildingsTitle')}</h2>
          <span className={styles.sectionBadge}>
            {t('city.structuresCount', { count: buildings.length })}
          </span>
        </div>

        <div className={styles.ownedBuildingsList}>
          {groupedBuildings.length === 0 ? (
            <div className={styles.emptyBuildingsBanner}>
              <span className={styles.emptyIcon}>🏗️</span>
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

              const isHouse = (group.id || '').toLowerCase() === 'house'

              return (
                <div key={group.id} className={`${styles.ownedBuildingRow} ${isStarved ? styles.starved : ''}`}>
                  <div className={styles.buildingIdentity}>
                    <strong>{translatedBuildingName}</strong>
                    <span className={styles.buildingCountBadge}>x{group.count}</span>
                    {isStarved && (
                      <span className={`${styles.statusBadge} ${styles.warning}`} style={{ marginLeft: '8px', fontSize: '0.72rem' }}>
                        ⚠️ {t('build.materialsMissing')}
                      </span>
                    )}
                  </div>
                  <div className={styles.buildingProductionInfo}>
                    {isHouse ? (
                      <span className={`${styles.productionPill} text-success`}>
                        +{5 * group.count} 👥 {t('resources.population')}
                      </span>
                    ) : (
                      <>
                        {group.consumes && Object.entries(group.consumes).map(([resKey, req]) => {
                          const totalCons = Number((req * (group.productionQuantityPerBuilding || 1) * multiplier * group.count).toFixed(2))
                          const resName = t(`resources.${resKey}`, resKey)
                          return (
                            <span key={resKey} className={`${styles.productionPill} text-warning`} title={t('build.consumes')}>
                              -{totalCons} {resName}/s
                            </span>
                          )
                        })}
                        <span className={`${styles.productionPill} text-success`}>
                          +{totalProduction} {translatedProduct}/s
                          {bonusPct > 0 && ` (+${bonusPct}%)`}
                        </span>
                        {totalKnowledge > 0 && (
                          <span className={`${styles.productionPill} text-warning`}>
                            +{totalKnowledge} 💡/s
                          </span>
                        )}
                      </>
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