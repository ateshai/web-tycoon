import { BUILDINGS, RESOURCE_RATES, THRESHOLDS } from './constants'

// Calculate resource production based on owned buildings and upgrades
export const calculateResourceProduction = (buildings, upgrades = []) => {
  return buildings.reduce((acc, building) => {
    const buildingDef = BUILDINGS[building.type] || building
    const product = buildingDef.product
    const quantity = buildingDef.productionQuantity || 0
    const multiplier = getUpgradeMultiplier(building.type || building.id, upgrades)
    
    const nextAcc = { ...acc }
    if (product) {
      nextAcc[product] = (nextAcc[product] || 0) + quantity * multiplier
    }
    if (buildingDef.knowledge) {
      nextAcc.knowledge = (nextAcc.knowledge || 0) + buildingDef.knowledge
    }
    return nextAcc
  }, { knowledge: 0 })
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
    const id = b.id || b.type
    if (id) {
      counts[id] = (counts[id] || 0) + 1
      counts[id.toLowerCase()] = (counts[id.toLowerCase()] || 0) + 1
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