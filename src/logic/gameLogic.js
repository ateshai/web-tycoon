import { BUILDINGS, RESOURCE_RATES, THRESHOLDS, EXPENSE_CONFIG } from './constants'

// Calculate resource production based on owned buildings and upgrades (Net rates)
export const calculateResourceProduction = (buildings, upgrades = []) => {
  const rates = calculateDetailedRates(buildings, upgrades)
  return rates.net
}

// Calculate detailed production, consumption, and net rates
export const calculateDetailedRates = (buildings = [], upgrades = []) => {
  const production = {}
  const consumption = {}
  const net = {}
  let totalKnowledge = 0

  buildings.forEach(building => {
    const buildingDef = (building.type && BUILDINGS[building.type]) ||
      (building.id && BUILDINGS[building.id.toUpperCase()]) ||
      BUILDINGS[building.type?.toUpperCase()] ||
      building

    const product = buildingDef.product
    const quantity = buildingDef.productionQuantity || 0
    const consumes = buildingDef.consumes || building.consumes
    const multiplier = getUpgradeMultiplier(building.type || building.id, upgrades)

    if (product) {
      const prodAmount = quantity * multiplier
      production[product] = (production[product] || 0) + prodAmount
      net[product] = (net[product] || 0) + prodAmount
    }

    if (consumes) {
      Object.entries(consumes).forEach(([res, amount]) => {
        const consAmount = amount * (buildingDef.productionQuantity || 1) * multiplier
        consumption[res] = (consumption[res] || 0) + consAmount
        net[res] = (net[res] || 0) - consAmount
      })
    }

    if (buildingDef.knowledge) {
      totalKnowledge += buildingDef.knowledge
    }
  })

  net.knowledge = totalKnowledge
  return { production, consumption, net, knowledge: totalKnowledge }
}

// Get the multiplier for a building type based on upgrades
// Formula: 1 + totalBonus (e.g., base + base * 0.2 = base * 1.2)
export const getUpgradeMultiplier = (buildingTypeOrId, upgrades = []) => {
  if (!buildingTypeOrId) return 1
  const target = String(buildingTypeOrId).toLowerCase()
  const totalBonus = upgrades
    .filter(upgrade => {
      const affects = String(upgrade.affects || '').toLowerCase()
      return affects === target
    })
    .reduce((sum, upgrade) => sum + (Number(upgrade.multiplier) || 0), 0)

  return 1 + totalBonus
}

// Check if player can afford a purchase (supports both cost object and number)
export const canAffordPurchase = (cost, resources) => {
  if (!cost) return true
  if (typeof cost === 'number') {
    const currentMoney = typeof resources === 'number' ? resources : (resources?.money ?? 0)
    return currentMoney >= cost
  }
  return Object.entries(cost).every(([resource, amount]) => {
    const available = typeof resources === 'object' ? (resources?.[resource] ?? 0) : 0
    return available >= amount
  })
}

// Check if player meets requirements (buildings and/or research)
export const meetsRequirements = (requirements, ownedBuildings = [], researchedUpgrades = []) => {
  if (!requirements) return true

  // Check research requirements if present
  if (requirements.research) {
    const requiredResearch = Array.isArray(requirements.research)
      ? requirements.research
      : [requirements.research]

    const hasAllResearch = requiredResearch.every(researchId => {
      return researchedUpgrades.some(u =>
        String(u.id || '').toLowerCase() === String(researchId).toLowerCase()
      )
    })

    if (!hasAllResearch) return false
  }

  // Count owned buildings by id/type
  const buildingCounts = ownedBuildings.reduce((counts, b) => {
    const key = (b.id || b.type || '').toLowerCase()
    if (key) {
      counts[key] = (counts[key] || 0) + 1
    }
    return counts
  }, {})

  const buildingRequirements = requirements.buildings || requirements

  return Object.entries(buildingRequirements).every(([reqId, count]) => {
    if (reqId === 'research') return true
    return (buildingCounts[reqId.toLowerCase()] || 0) >= count
  })
}

// Calculate player level based on experience
export const calculateLevel = (experience) => {
  return THRESHOLDS.EXPERIENCE_LEVELS.findIndex(threshold => 
    experience < threshold
  ) - 1
}

// Generate random events based on game state
export const generateEvents = (gameState) => {
  // TODO: Implement event generation logic
  return []
}

// Apply effects of an upgrade
export const applyUpgrade = (gameState, upgrade) => {
  // TODO: Implement upgrade application logic
  return gameState
}

// Save game state
export const saveGameState = (gameState) => {
  localStorage.setItem('gameState', JSON.stringify(gameState))
}

// Load game state
export const loadGameState = () => {
  const savedState = localStorage.getItem('gameState')
  return savedState ? JSON.parse(savedState) : null
}

// Calculate land cost based on tiered pricing
// Every 25 units owned, price increases by 50% from the previous tier (1000 -> 1500 -> 2250 -> ...)
export const calculateLandCost = (currentTotalLand, amountToBuy) => {
  let totalCost = 0
  for (let i = 0; i < amountToBuy; i++) {
    const unitIndex = (currentTotalLand || 0) + i
    const tier = Math.floor(unitIndex / 25)
    const unitPrice = Math.round(1000 * Math.pow(1.5, tier))
    totalCost += unitPrice
  }
  return totalCost
}

// Get the current single unit price for the next land purchase
export const getCurrentLandUnitPrice = (currentTotalLand) => {
  const tier = Math.floor((currentTotalLand || 0) / 25)
  return Math.round(1000 * Math.pow(1.5, tier))
}

// Check if player has available free land for construction
export const hasFreeLand = (buildings = [], totalLand = 10) => {
  const usedLand = buildings.length
  return (totalLand - usedLand) >= 1
}

// Calculate total, working, and free population stats
export const getPopulationStats = (buildings = []) => {
  const houseCount = buildings.filter(b => (b.id || b.type || '').toLowerCase() === 'house').length
  // Each house provides 5 population. Ensure at least 1 house initially
  const totalHouses = (buildings.length === 0) ? 1 : Math.max(1, houseCount)
  const totalPopulation = totalHouses * 5

  const workingPopulation = buildings.filter(b => {
    const id = (b.id || b.type || '').toLowerCase()
    return id !== 'house'
  }).reduce((sum, b) => {
    const def = (b.type && BUILDINGS[b.type]) ||
      (b.id && BUILDINGS[b.id.toUpperCase()]) ||
      BUILDINGS[b.type?.toUpperCase()] ||
      b
    const required = def.workers !== undefined ? def.workers : 1
    return sum + required
  }, 0)

  const freePopulation = Math.max(0, totalPopulation - workingPopulation)

  return {
    totalHouses,
    totalPopulation,
    workingPopulation,
    freePopulation,
  }
}

// Check if player has available workforce for constructing a building
export const hasFreeWorkers = (buildingDef, freePopulation) => {
  const isHouse = (buildingDef.id || buildingDef.type || '').toLowerCase() === 'house'
  if (isHouse) return true
  const required = buildingDef.workers !== undefined ? buildingDef.workers : 1
  return freePopulation >= required
}

// Calculate maintenance and special consumption for a single building definition
export const getBuildingMaintenanceCost = (buildingDef) => {
  const maintenanceRate = EXPENSE_CONFIG?.BASE_MAINTENANCE_RATE ?? 0.02
  const fixed = {}
  const special = {}

  // 1. Fixed maintenance: 2% of construction/production cost
  const cost = buildingDef?.cost || {}
  Object.entries(cost).forEach(([res, amount]) => {
    if (amount > 0) {
      fixed[res] = Number((amount * maintenanceRate).toFixed(2))
    }
  })

  // 2. Special consumptions (e.g. house consumes 1 food, 1 water)
  const specialCons = buildingDef?.specialConsumption || buildingDef?.upkeep || {}
  Object.entries(specialCons).forEach(([res, amount]) => {
    if (amount > 0) {
      special[res] = Number(amount)
    }
  })

  // Total per single building
  const total = { ...fixed }
  Object.entries(special).forEach(([res, amount]) => {
    total[res] = Number(((total[res] || 0) + amount).toFixed(2))
  })

  return { fixed, special, total }
}

// Calculate total city expenses across all owned buildings
export const calculateCityExpenses = (buildings = []) => {
  const totalPerTick = {}
  const fixedTotal = {}
  const specialTotal = {}

  // Group by building type/id
  const grouped = {}

  buildings.forEach(building => {
    const key = building.id || building.type || 'unknown'
    const buildingDef = (building.type && BUILDINGS[building.type]) ||
      (building.id && BUILDINGS[building.id.toUpperCase()]) ||
      BUILDINGS[building.type?.toUpperCase()] ||
      building

    if (!grouped[key]) {
      const costs = getBuildingMaintenanceCost(buildingDef)
      grouped[key] = {
        id: key,
        name: buildingDef?.name || building?.name || key,
        count: 0,
        fixedPerUnit: costs.fixed,
        specialPerUnit: costs.special,
        totalPerUnit: costs.total,
        buildingDef,
      }
    }
    grouped[key].count += 1
  })

  const breakdown = Object.values(grouped).map(group => {
    const totalGroupExpense = {}
    const fixedGroupExpense = {}
    const specialGroupExpense = {}

    Object.entries(group.fixedPerUnit).forEach(([res, amount]) => {
      const total = Number((amount * group.count).toFixed(2))
      fixedGroupExpense[res] = total
      fixedTotal[res] = Number(((fixedTotal[res] || 0) + total).toFixed(2))
      totalPerTick[res] = Number(((totalPerTick[res] || 0) + total).toFixed(2))
    })

    Object.entries(group.specialPerUnit).forEach(([res, amount]) => {
      const total = Number((amount * group.count).toFixed(2))
      specialGroupExpense[res] = total
      specialTotal[res] = Number(((specialTotal[res] || 0) + total).toFixed(2))
      totalPerTick[res] = Number(((totalPerTick[res] || 0) + total).toFixed(2))
    })

    Object.entries(group.totalPerUnit).forEach(([res, amount]) => {
      totalGroupExpense[res] = Number((amount * group.count).toFixed(2))
    })

    return {
      ...group,
      fixedGroupExpense,
      specialGroupExpense,
      totalGroupExpense,
    }
  })

  const intervalSec = (EXPENSE_CONFIG?.INTERVAL_MS || 10000) / 1000
  const perSecond = {}
  Object.entries(totalPerTick).forEach(([res, amount]) => {
    perSecond[res] = Number((amount / intervalSec).toFixed(3))
  })

  return {
    totalPerTick,
    fixedTotal,
    specialTotal,
    breakdown,
    perSecond,
    intervalSec,
  }
}