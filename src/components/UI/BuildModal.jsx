import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import Button from './Button'
import { BUILDINGS, UPGRADES, BUILDING_CATEGORIES } from '../../logic/constants'
import { meetsRequirements, getUpgradeMultiplier, calculateLandCost, getCurrentLandUnitPrice, getPopulationStats, hasFreeWorkers } from '../../logic/gameLogic'
import { formatNumber } from '../../logic/utils'
import styles from './BuildModal.module.css'

const BuildModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const { buildings, upgrades, resources, land, purchaseBuilding, buyLand } = useGameStore(state => ({
    buildings: state.buildings || [],
    upgrades: state.upgrades || [],
    land: state.land ?? 10,
    resources: {
      money: state.money,
      wood: state.wood,
      stone: state.stone,
      plank: state.plank,
      food: state.food,
      water: state.water,
      knowledge: state.knowledge,
      experience: state.experience
    },
    purchaseBuilding: state.purchaseBuilding,
    buyLand: state.buyLand
  }))

  const usedLand = buildings.length
  const totalLand = land ?? 10
  const freeLand = Math.max(0, totalLand - usedLand)
  const currentUnitPrice = getCurrentLandUnitPrice(totalLand)
  const popStats = getPopulationStats(buildings)

  const [selectedCategory, setSelectedCategory] = useState('all')

  const buildingCounts = buildings.reduce((counts, b) => {
    const key = (b.id || b.type || '').toLowerCase()
    if (key) {
      counts[key] = (counts[key] || 0) + 1
    }
    return counts
  }, {})

  const allBuildings = Object.entries(BUILDINGS)
  const visibleBuildings = allBuildings.filter(([, building]) => {
    if (selectedCategory === 'all') return true
    return building.category === selectedCategory
  })

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

  const renderCost = (cost) => {
    if (!cost) return <span className={`${styles.costBadge} ${styles.costMet}`}>{t('build.free')}</span>
    if (typeof cost === 'number') {
      const hasEnough = (resources.money ?? 0) >= cost
      return (
        <span className={`${styles.costBadge} ${hasEnough ? styles.costMet : styles.costUnmet}`}>
          ${formatNumber(cost)}
        </span>
      )
    }
    const entries = Object.entries(cost)
    return entries.map(([resource, amount], idx) => {
      const current = resources[resource] ?? 0
      const hasEnough = current >= amount
      const resourceName = t(`resources.${resource}`, resource)
      const text = resource === 'money' ? `$${formatNumber(amount)}` : `${formatNumber(amount)} ${resourceName}`
      return (
        <span key={resource} className={styles.costItemWrapper}>
          <span className={`${styles.costBadge} ${hasEnough ? styles.costMet : styles.costUnmet}`}>
            {text}
          </span>
          {idx < entries.length - 1 && <span className={styles.costSeparator}>, </span>}
        </span>
      )
    })
  }

  const renderRequirements = (requirements) => {
    if (!requirements) return null
    const parts = []

    if (requirements.research) {
      const researchList = Array.isArray(requirements.research) ? requirements.research : [requirements.research]
      researchList.forEach(id => {
        const isMet = (upgrades || []).some(u => String(u.id || '').toLowerCase() === String(id).toLowerCase())
        const found = Object.values(UPGRADES).find(u => u.id.toLowerCase() === id.toLowerCase())
        const resName = found ? t(`upgrades.${found.id}.name`, found.name) : id
        parts.push({
          key: `research-${id}`,
          label: `${t('nav.research')}: ${resName}`,
          met: isMet
        })
      })
    }

    const reqList = requirements.buildings || requirements
    Object.entries(reqList).forEach(([buildingKey, count]) => {
      if (buildingKey === 'research') return
      const currentCount = buildingCounts[buildingKey.toLowerCase()] || 0
      const isMet = currentCount >= count
      const found = Object.values(BUILDINGS).find(
        b => b.id.toLowerCase() === buildingKey.toLowerCase()
      )
      const name = found ? t(`buildings.${found.id}.name`, found.name) : buildingKey
      parts.push({
        key: `building-${buildingKey}`,
        label: `${count} ${name}`,
        met: isMet
      })
    })

    return parts.map((req, idx) => (
      <span key={req.key} className={styles.reqItemWrapper}>
        <span className={`${styles.requirementBadge} ${req.met ? styles.reqMet : styles.reqUnmet}`}>
          {req.met ? '✓ ' : '🔒 '}
          {req.label}
        </span>
        {idx < parts.length - 1 ? ' ' : ''}
      </span>
    ))
  }

  const handlePurchase = (buildingType) => {
    const building = BUILDINGS[buildingType]
    purchaseBuilding({ ...building, type: buildingType })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal-container ${styles.buildModal}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{t('build.title')}</h2>
            <p className="modal-subtitle">{t('build.subtitle')}</p>
          </div>
          <button className="modal-close-button" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className={styles.modalQuickResources}>
          <span>💰 ${formatNumber(resources.money || 0)}</span>
          <span className={freeLand > 0 ? '' : 'text-danger font-bold'}>
            🏞️ {freeLand}/{totalLand} {t('resources.freeLand')}
          </span>
          <span className={popStats.freePopulation > 0 ? '' : 'text-danger font-bold'}>
            👥 {popStats.workingPopulation}/{popStats.totalPopulation} {t('resources.population')} ({popStats.freePopulation} {t('resources.free')})
          </span>
          <span>🪵 {formatNumber(resources.wood || 0)} {t('resources.wood')}</span>
          <span>🪨 {formatNumber(resources.stone || 0)} {t('resources.stone')}</span>
          <span>🪚 {formatNumber(resources.plank || 0)} {t('resources.plank')}</span>
          <span>🍞 {formatNumber(resources.food || 0)} {t('resources.food')}</span>
          <span>💧 {formatNumber(resources.water || 0)} {t('resources.water')}</span>
          <span>💡 {formatNumber(resources.knowledge || 0)} {t('resources.knowledge')}</span>
        </div>

        <div className="modal-content">
          {/* Territory / Land Expansion Purchase Section */}
          <div className={styles.landExpansionPanel}>
            <div className={styles.landPanelHeader}>
              <div className={styles.landPanelTitleGroup}>
                <span className={styles.landBadgeIcon}>🏞️</span>
                <div>
                  <h3>{t('land.title')}</h3>
                  <p className={styles.landPanelSubtitle}>
                    {t('land.priceTierNotice')} • {t('land.currentPrice')}: <strong>${formatNumber(currentUnitPrice)}</strong>
                  </p>
                </div>
              </div>
              <div className={styles.landStatsPill}>
                <span>{t('land.used')}: <strong>{usedLand}</strong></span>
                <span>{t('land.free')}: <strong className={freeLand > 0 ? 'text-success' : 'text-danger'}>{freeLand}</strong></span>
                <span>{t('land.total')}: <strong>{totalLand}</strong></span>
              </div>
            </div>

            <div className={styles.landBuyOptions}>
              {[1, 5, 10, 20].map(amount => {
                const cost = calculateLandCost(totalLand, amount)
                const affordable = (resources.money || 0) >= cost
                return (
                  <Button
                    key={amount}
                    variant={affordable ? 'primary' : 'secondary'}
                    disabled={!affordable}
                    onClick={() => buyLand(amount)}
                    className={styles.landBuyBtn}
                  >
                    +{amount} {t('resources.land')} (${formatNumber(cost)})
                  </Button>
                )
              })}
            </div>
          </div>

          <div className={styles.buildingsSectionTitle}>
            <h3>🏛️ {t('city.activeBuildingsTitle')}</h3>
          </div>

          {/* Category Navigation Tabs */}
          <div className={styles.categoryTabs} role="tablist" aria-label="Building Categories">
            {BUILDING_CATEGORIES.map(cat => {
              const count = cat.id === 'all'
                ? allBuildings.length
                : allBuildings.filter(([, b]) => b.category === cat.id).length

              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === cat.id}
                  className={`${styles.categoryTab} ${selectedCategory === cat.id ? styles.activeTab : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className={styles.tabIcon}>{cat.icon}</span>
                  <span className={styles.tabLabel}>{t(`build.categories.${cat.id}`, cat.id)}</span>
                  <span className={styles.tabBadge}>{count}</span>
                </button>
              )
            })}
          </div>

          <div className={styles.buildingsGrid}>
            {visibleBuildings.length === 0 ? (
              <div className={styles.emptyCategoryState}>
                <div className={styles.emptyCategoryIcon}>🏗️</div>
                <p>{t('build.emptyCategory', 'Bu kategoride gösterilecek bina bulunmuyor.')}</p>
              </div>
            ) : (
              visibleBuildings.map(([type, building]) => {
                const currentCount = buildingCounts[(building.id || type).toLowerCase()] || 0
                const affordable = canAfford(building.cost)
                const hasRequirements = meetsRequirements(building.requirements, buildings, upgrades)
                const hasFreeLand = freeLand >= 1
                const isHouse = (building.id || type).toLowerCase() === 'house'
                const hasWorkers = hasFreeWorkers(building, popStats.freePopulation)
                const canPurchase = affordable && hasRequirements && hasFreeLand && hasWorkers
                const multiplier = getUpgradeMultiplier(building.id || type, upgrades)
                const effectiveProduction = Number(((building.productionQuantity || 0) * multiplier).toFixed(2))
                const bonusPct = Math.round((multiplier - 1) * 100)
                const buildingName = t(`buildings.${building.id || type}.name`, building.name)
                const productName = t(`resources.${building.product}`, building.product)

                return (
                  <div key={type} className={`${styles.buildingCard} ${!canPurchase ? styles.disabled : ''}`}>
                    <div className={styles.buildingCardHeader}>
                      <div className={styles.buildingTitleGroup}>
                        <span className={styles.buildingCardIcon}>{building.icon || '🏛️'}</span>
                        <div>
                          <h3>{buildingName}</h3>
                          <span className={styles.buildingCategoryTag}>
                            {t(`build.categories.${building.category}`, building.category)}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`${styles.ownedBadge} ${currentCount > 0 ? styles.ownedActive : styles.ownedZero}`}
                        title={`${buildingName}: ${currentCount} adet mevcut`}
                      >
                        <span className={styles.ownedIcon}>🏛️</span>
                        <span className={styles.ownedText}>
                          {t('build.ownedCount', { count: currentCount, defaultValue: `Şehirde: ${currentCount}` })}
                        </span>
                      </div>
                    </div>
                    <p className={styles.buildingCostRow}>
                      <strong>{t('build.cost')}:</strong>{' '}
                      <span className={styles.costItemsList}>
                        {renderCost(building.cost)}
                      </span>
                    </p>
                    
                    {building.consumes && Object.keys(building.consumes).length > 0 && (
                      <p className={styles.buildingConsumesInfo}>
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

                    {isHouse ? (
                      <p>
                        <strong>👥 {t('resources.populationProvided')}:</strong>{' '}
                        <span className="text-success font-bold">+{building.providesPopulation || 5} {t('resources.population')}</span>
                      </p>
                    ) : (
                      <p>
                        <strong>{t('build.produces')}:</strong> +{effectiveProduction} {productName}/s
                        {bonusPct > 0 && <span className={styles.multiplierBadge}> (+{bonusPct}%)</span>}
                      </p>
                    )}

                    <p className={`${styles.landRequirementRow} ${hasFreeLand ? styles.met : styles.unmet}`}>
                      <strong>🏞️ {t('land.requiresLand')}:</strong>{' '}
                      {hasFreeLand ? (
                        <span className="text-success">1 {t('resources.units')} (✓ {freeLand} {t('resources.freeLand')})</span>
                      ) : (
                        <span className={`${styles.landUnmetBadge} font-bold`}>1 {t('resources.units')} (🔒 {t('land.noLandWarning')})</span>
                      )}
                    </p>

                    {!isHouse && (
                      <p className={`${styles.landRequirementRow} ${hasWorkers ? styles.met : styles.unmet}`}>
                        <strong>👥 {t('resources.workerRequired')}:</strong>{' '}
                        {hasWorkers ? (
                          <span className="text-success">1 {t('resources.worker')} (✓ {popStats.freePopulation} {t('resources.free')})</span>
                        ) : (
                          <span className={`${styles.landUnmetBadge} font-bold`}>1 {t('resources.worker')} (🔒 {t('resources.noWorkersWarning')})</span>
                        )}
                      </p>
                    )}

                    {building.knowledge ? (
                      <p><strong>{t('build.knowledge')}:</strong> +{building.knowledge}/s</p>
                    ) : null}

                    {building.requirements ? (
                      <div className={styles.buildingRequirementsRow}>
                        <p><strong>{t('build.requires')}:</strong></p>
                        <div className={styles.requirementsList}>
                          {renderRequirements(building.requirements)}
                        </div>
                      </div>
                    ) : null}

                    <Button
                      onClick={() => handlePurchase(type)}
                      disabled={!canPurchase}
                    >
                      {!hasFreeLand 
                        ? `🔒 ${t('resources.freeLand')}: 0` 
                        : !hasWorkers 
                        ? `🔒 ${t('resources.freePopulation')}: 0` 
                        : t('build.purchase')}
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuildModal
