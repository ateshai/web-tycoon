import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import { getUpgradeMultiplier, calculateDetailedRates, getPopulationStats, calculateCityExpenses, getBuildingMaintenanceCost } from '../../logic/gameLogic'
import { formatNumber } from '../../logic/utils'
import { BUILDINGS } from '../../logic/constants'
import styles from './CityView.module.css'

const CityView = ({ onOpenBuild }) => {
  const { t } = useTranslation()
  const { buildings, upgrades, money, wood, stone, plank, grain, flour, food, water, knowledge, experience, land, lastExpenseTick } = useGameStore(state => ({
    buildings: state.buildings || [],
    upgrades: state.upgrades || [],
    money: state.money || 0,
    wood: state.wood || 0,
    stone: state.stone || 0,
    plank: state.plank || 0,
    grain: state.grain || 0,
    flour: state.flour || 0,
    food: state.food !== undefined ? state.food : 30,
    water: state.water !== undefined ? state.water : 30,
    knowledge: state.knowledge || 0,
    experience: state.experience || 0,
    land: state.land ?? 10,
    lastExpenseTick: state.lastExpenseTick || Date.now()
  }))

  const [currentTime, setCurrentTime] = useState(Date.now())

  // Keep countdown timer ticking smoothly
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 250)
    return () => clearInterval(timer)
  }, [])

  const usedLand = buildings.length
  const totalLand = land ?? 10
  const freeLand = Math.max(0, totalLand - usedLand)
  const playerResources = { money, wood, stone, plank, grain, flour, food, water, knowledge, experience, land: totalLand }
  const popStats = getPopulationStats(buildings)

  // Calculate city maintenance and active expenses
  const cityExpenses = calculateCityExpenses(buildings)
  const intervalMs = (cityExpenses.intervalSec || 10) * 1000
  const elapsedInCycle = Math.max(0, currentTime - lastExpenseTick) % intervalMs
  const remainingSec = Math.max(0, Math.ceil((intervalMs - elapsedInCycle) / 1000))
  const progressPercent = Math.min(100, Math.max(0, (elapsedInCycle / intervalMs) * 100))

  // Calculate detailed production rates per second
  const detailedRates = calculateDetailedRates(buildings, upgrades)
  const productionRates = detailedRates.net

  // Helper to determine net rate and visual status (positive / warning / negative / neutral)
  const getResourceRateInfo = (resKey) => {
    const grossProd = resKey === 'knowledge' ? (detailedRates.knowledge || 0) : (detailedRates.production[resKey] || 0)
    const expPerSec = cityExpenses.perSecond[resKey] || 0
    const consPerSec = detailedRates.consumption[resKey] || 0
    const net = (detailedRates.net[resKey] || 0) - expPerSec

    if (grossProd === 0 && expPerSec === 0 && consPerSec === 0) {
      return {
        rate: '0/s',
        rateType: 'neutral',
        net: 0,
        grossProd: 0
      }
    }

    let rateType = 'positive'
    if (net < 0) {
      rateType = 'negative'
    } else if (grossProd > 0 && net <= grossProd * 0.2) {
      // Net üretim pozitif olsa bile brüt üretimin %20'si ve altındaysa kritik seviye
      rateType = 'warning'
    }

    const formattedRate = `${net > 0 ? '+' : ''}${Number(net.toFixed(2))}/s`

    return {
      rate: formattedRate,
      rateType,
      net,
      grossProd
    }
  }

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
      ...getResourceRateInfo('wood'),
      description: t('resources.woodDesc'),
    },
    {
      id: 'plank',
      name: t('resources.plank'),
      icon: '🪚',
      amount: `${formatNumber(plank)} ${t('resources.units')}`,
      ...getResourceRateInfo('plank'),
      description: t('resources.plankDesc'),
    },
    {
      id: 'stone',
      name: t('resources.stone'),
      icon: '🪨',
      amount: `${formatNumber(stone)} ${t('resources.units')}`,
      ...getResourceRateInfo('stone'),
      description: t('resources.stoneDesc'),
    },
    {
      id: 'grain',
      name: t('resources.grain'),
      icon: '🌾',
      amount: `${formatNumber(grain)} ${t('resources.units')}`,
      ...getResourceRateInfo('grain'),
      description: t('resources.grainDesc'),
    },
    {
      id: 'flour',
      name: t('resources.flour'),
      icon: '🥡',
      amount: `${formatNumber(flour)} ${t('resources.units')}`,
      ...getResourceRateInfo('flour'),
      description: t('resources.flourDesc'),
    },
    {
      id: 'food',
      name: t('resources.food'),
      icon: '🍞',
      amount: `${formatNumber(food)} ${t('resources.units')}`,
      ...getResourceRateInfo('food'),
      description: t('resources.foodDesc'),
    },
    {
      id: 'water',
      name: t('resources.water'),
      icon: '💧',
      amount: `${formatNumber(water)} ${t('resources.units')}`,
      ...getResourceRateInfo('water'),
      description: t('resources.waterDesc'),
    },
    {
      id: 'knowledge',
      name: t('resources.knowledge'),
      icon: '💡',
      amount: `${formatNumber(knowledge)} ${t('resources.points')}`,
      ...getResourceRateInfo('knowledge'),
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
                {/* <p className={styles.inventoryDesc}>{item.description}</p> */}
                {item.rate && (
                  <div className={`${styles.inventoryRateBadge} ${
                    item.rateType === 'negative'
                      ? styles.negativeRate
                      : item.rateType === 'warning'
                        ? styles.warningRate
                        : item.rateType === 'positive'
                          ? styles.positiveRate
                          : ''
                  }`}>
                    <span>{t('resources.rate')}: </span>
                    <strong className={
                      item.rateType === 'negative'
                        ? 'text-danger'
                        : item.rateType === 'warning'
                          ? 'text-warning'
                          : item.rateType === 'positive'
                            ? 'text-success'
                            : ''
                    }>
                      {item.rate}
                    </strong>
                    {item.rateType === 'warning' && (
                      <span
                        className={styles.criticalWarningIcon}
                        title={t('city.criticalRateNotice', 'Kritik Seviye: Net üretim toplam üretimin %20\'si veya altında!')}
                      >
                        ⚠️
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active City Expenses & Maintenance Section */}
      <section className={styles.dashboardSection}>
        <div className={styles.sectionTitleRow}>
          <div className={styles.sectionTitleGroup}>
            <h2>{t('city.expensesTitle')}</h2>
            <span className={styles.sectionSubtitleText}>{t('city.expensesSubtitle')}</span>
          </div>
          <span className={`${styles.sectionBadge} ${styles.expenseBadge}`}>
            ⏱️ {t('city.expenseCycleBadge', { seconds: cityExpenses.intervalSec })}
          </span>
        </div>

        {/* Expense Cycle Progress Countdown Card */}
        <div className={styles.expenseTimerCard}>
          <div className={styles.expenseTimerHeader}>
            <div className={styles.timerLabelGroup}>
              <span className={styles.timerIcon}>⏳</span>
              <span>{t('city.nextDeduction')}:</span>
              <strong className={styles.timerCountdown}>{remainingSec}s</strong>
            </div>
            <span className={styles.timerSubText}>
              {t('city.cycleExpense', { seconds: cityExpenses.intervalSec })}
            </span>
          </div>
          <div className={styles.expenseProgressBarTrack}>
            <div
              className={styles.expenseProgressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Total Expenses Summary Grid */}
        <div className={styles.expenseSummaryGrid}>
          {Object.entries(cityExpenses.totalPerTick).length === 0 ? (
            <div className={styles.noExpensesNotice}>
              <span>🌱 {t('city.noExpenses')}</span>
            </div>
          ) : (
            Object.entries(cityExpenses.totalPerTick).map(([resKey, tickAmount]) => {
              const resIcons = {
                wood: '🪵',
                stone: '🪨',
                plank: '🪚',
                food: '🍞',
                water: '💧',
                money: '💰',
              }
              const icon = resIcons[resKey] || '📦'
              const resName = t(`resources.${resKey}`, resKey)
              const perSec = cityExpenses.perSecond[resKey] || 0
              const currentStock = playerResources[resKey] ?? 0
              const isLow = currentStock < tickAmount

              return (
                <div key={resKey} className={`${styles.expenseSummaryCard} ${isLow ? styles.expenseCardWarning : ''}`}>
                  <span className={styles.expenseIcon}>{icon}</span>
                  <div className={styles.expenseCardContent}>
                    <div className={styles.expenseCardTitleRow}>
                      <span className={styles.expenseResName}>{resName}</span>
                      {isLow && (
                        <span className={styles.expenseDangerPill}>⚠️ {t('build.materialsMissing')}</span>
                      )}
                    </div>
                    <div className={styles.expenseRatePrimary}>
                      <span className="text-danger">-{tickAmount}</span>
                      <span className={styles.expensePerCycleLabel}> / {cityExpenses.intervalSec}s</span>
                    </div>
                    <span className={styles.expenseSecEquiv}>
                      (-{perSec}/s {t('city.perSecEquivalent')})
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Detailed Breakdown by Building Type */}
        {cityExpenses.breakdown.length > 0 && (
          <div className={styles.expenseBreakdownContainer}>
            <h4 className={styles.expenseBreakdownTitle}>🏛️ {t('city.buildingMaintenance')}</h4>
            <div className={styles.expenseBreakdownList}>
              {cityExpenses.breakdown.map(item => {
                const translatedName = t(`buildings.${item.id}.name`, item.name)
                return (
                  <div key={item.id} className={styles.expenseBreakdownRow}>
                    <div className={styles.expenseRowLeft}>
                      <strong className={styles.expenseBuildingName}>{translatedName}</strong>
                      <span className={styles.buildingCountBadge}>x{item.count}</span>
                    </div>

                    <div className={styles.expenseRowDetails}>
                      {/* Fixed Maintenance (2%) */}
                      {Object.keys(item.fixedPerUnit).length > 0 && (
                        <span className={styles.expensePillFixed} title={t('city.fixedMaintenance')}>
                          🛠️ {t('city.fixedMaintenance')}:{' '}
                          {Object.entries(item.fixedGroupExpense).map(([res, amt]) => {
                            const resName = t(`resources.${res}`, res)
                            return `-${amt} ${resName}`
                          }).join(', ')}
                        </span>
                      )}

                      {/* Special Consumption */}
                      {Object.keys(item.specialPerUnit).length > 0 && (
                        <span className={styles.expensePillSpecial} title={t('city.specialConsumption')}>
                          🍽️ {t('city.specialConsumption')}:{' '}
                          {Object.entries(item.specialGroupExpense).map(([res, amt]) => {
                            const resName = t(`resources.${res}`, res)
                            return `-${amt} ${resName}`
                          }).join(', ')}
                        </span>
                      )}

                      {/* Total for this building group */}
                      <span className={styles.expensePillTotal}>
                        = {Object.entries(item.totalGroupExpense).map(([res, amt]) => {
                          const resName = t(`resources.${res}`, res)
                          return `-${amt} ${resName}`
                        }).join(', ')} / {cityExpenses.intervalSec}s
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
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
            <span className={styles.summaryIcon}>🌾</span>
            <div>
              <span className={styles.summaryLabel}>{t('city.grainYield', 'Buğday Üretimi')}</span>
              <strong className={`summary-value ${(productionRates.grain || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                {(productionRates.grain || 0) > 0 ? '+' : ''}{Number((productionRates.grain || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
          <div className={styles.productionSummaryCard}>
            <span className={styles.summaryIcon}>🥡</span>
            <div>
              <span className={styles.summaryLabel}>{t('city.flourYield', 'Un Üretimi')}</span>
              <strong className={`summary-value ${(productionRates.flour || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                {(productionRates.flour || 0) > 0 ? '+' : ''}{Number((productionRates.flour || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
          <div className={styles.productionSummaryCard}>
            <span className={styles.summaryIcon}>🍞</span>
            <div>
              <span className={styles.summaryLabel}>{t('city.foodYield')}</span>
              <strong className="summary-value text-success">
                +{Number((productionRates.food || 0).toFixed(2))}/s
              </strong>
            </div>
          </div>
          <div className={styles.productionSummaryCard}>
            <span className={styles.summaryIcon}>💧</span>
            <div>
              <span className={styles.summaryLabel}>{t('city.waterYield')}</span>
              <strong className="summary-value text-success">
                +{Number((productionRates.water || 0).toFixed(2))}/s
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
              const groupExpense = cityExpenses.breakdown.find(b => b.id === group.id)

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
                    {/* Building Maintenance & Expense Pill */}
                    {groupExpense && Object.keys(groupExpense.totalGroupExpense).length > 0 && (
                      <span className={`${styles.productionPill} ${styles.expensePill}`} title={t('city.buildingMaintenance')}>
                        💸 {Object.entries(groupExpense.totalGroupExpense).map(([res, amt]) => {
                          const icon = { wood: '🪵', food: '🍞', water: '💧', money: '💰', stone: '🪨', plank: '🪚' }[res] || res
                          return `-${amt}${icon}`
                        }).join(' ')} / {cityExpenses.intervalSec}s
                      </span>
                    )}

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