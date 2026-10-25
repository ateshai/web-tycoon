import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { INITIAL_RESOURCES, INITIAL_BUILDINGS, MARKET_ITEMS, BUILDINGS } from '../logic/constants'
import { meetsRequirements, getUpgradeMultiplier, calculateLandCost, getPopulationStats, calculateCityExpenses } from '../logic/gameLogic'
import { playTradeSound } from '../logic/audio'
import i18n from '../i18n'

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Resources
      ...INITIAL_RESOURCES,

      // Buildings/Assets
      buildings: INITIAL_BUILDINGS,
      upgrades: [],

      // Active timed research and completion modal state
      activeResearch: null, // { upgrade, startTime, duration }
      completedResearch: null, // upgrade that just finished

      // Notifications queue
      notifications: [],

      // Game state
      cityName: '',
      isGameStarted: false,
      lastUpdate: Date.now(),
      lastExpenseTick: Date.now(),
      lastExpenseSummary: null,
      gameSpeed: 1,

      // Actions
      initialize: () => {
        set({
          ...INITIAL_RESOURCES,
          buildings: INITIAL_BUILDINGS,
          upgrades: [],
          activeResearch: null,
          completedResearch: null,
          notifications: [],
          cityName: '',
          isGameStarted: false,
          lastUpdate: Date.now(),
          lastExpenseTick: Date.now(),
          lastExpenseSummary: null,
          gameSpeed: 1
        })
      },

      startGame: (name) => {
        const state = get()
        if (state.cityName) {
          state.resumeGame(name)
        } else {
          state.startNewGame(name)
        }
      },

      startNewGame: (name) => {
        const currentLang = i18n.language || 'tr'
        const fallbackDefault = currentLang === 'en' ? 'New City' : 'Yeni Şehir'
        const trimmed = (name || '').trim() || fallbackDefault
        const now = Date.now()
        set({
          ...INITIAL_RESOURCES,
          buildings: INITIAL_BUILDINGS,
          upgrades: [],
          activeResearch: null,
          completedResearch: null,
          notifications: [],
          cityName: trimmed,
          isGameStarted: true,
          lastUpdate: now,
          lastExpenseTick: now,
          lastExpenseSummary: null,
          gameSpeed: 1
        })
      },

      resumeGame: (optionalName) => {
        const currentLang = i18n.language || 'tr'
        const fallbackDefault = currentLang === 'en' ? 'New City' : 'Yeni Şehir'
        const trimmed = (optionalName || '').trim() || get().cityName || fallbackDefault
        const now = Date.now()
        set({
          cityName: trimmed,
          isGameStarted: true,
          lastUpdate: now,
          lastExpenseTick: now,
        })
      },

      setCityName: (name) => {
        const trimmed = (name || '').trim()
        if (trimmed) {
          set({ cityName: trimmed })
        }
      },

      updateResources: () => {
        const now = Date.now()
        const state = get()
        const deltaTime = (now - state.lastUpdate) * state.gameSpeed
        const timeMultiplier = deltaTime / 1000

        // Track resource mutations during this tick
        const updatedResources = {
          wood: state.wood || 0,
          stone: state.stone || 0,
          plank: state.plank || 0,
          food: state.food !== undefined ? state.food : (INITIAL_RESOURCES.food || 0),
          water: state.water !== undefined ? state.water : (INITIAL_RESOURCES.water || 0),
          knowledge: state.knowledge || 0,
          money: state.money || 0,
          experience: state.experience || 0,
        }

        let totalKnowledgeGain = 0
        const currentUpgrades = state.upgrades || []

        // Phase 1: Primary production (buildings without input consumption)
        state.buildings.forEach(building => {
          const buildingDef = (building.type && BUILDINGS[building.type]) ||
            (building.id && BUILDINGS[building.id.toUpperCase()]) ||
            BUILDINGS[building.type?.toUpperCase()] ||
            building

          const consumes = buildingDef.consumes || building.consumes
          const buildingId = building.id || building.type
          const multiplier = getUpgradeMultiplier(buildingId, currentUpgrades)

          if (!consumes || Object.keys(consumes).length === 0) {
            if (buildingDef.product && buildingDef.productionQuantity) {
              const amount = buildingDef.productionQuantity * multiplier * timeMultiplier
              updatedResources[buildingDef.product] = (updatedResources[buildingDef.product] || 0) + amount
            }
            if (buildingDef.knowledge) {
              totalKnowledgeGain += buildingDef.knowledge * timeMultiplier
            }
          }
        })

        // Phase 2: Processing production (buildings with input consumption)
        state.buildings.forEach(building => {
          const buildingDef = (building.type && BUILDINGS[building.type]) ||
            (building.id && BUILDINGS[building.id.toUpperCase()]) ||
            BUILDINGS[building.type?.toUpperCase()] ||
            building

          const consumes = buildingDef.consumes || building.consumes
          if (consumes && Object.keys(consumes).length > 0) {
            const buildingId = building.id || building.type
            const multiplier = getUpgradeMultiplier(buildingId, currentUpgrades)
            const targetCycles = (buildingDef.productionQuantity || 1) * multiplier * timeMultiplier

            // Determine max operational ratio based on available inputs
            let maxRatio = 1
            Object.entries(consumes).forEach(([resKey, reqPerUnit]) => {
              const totalNeeded = reqPerUnit * targetCycles
              const available = Math.max(0, updatedResources[resKey] || 0)
              if (totalNeeded > 0) {
                const ratio = available / totalNeeded
                if (ratio < maxRatio) {
                  maxRatio = Math.max(0, ratio)
                }
              }
            })

            // Actual production cycles limited by input supply
            const actualCycles = targetCycles * maxRatio

            if (actualCycles > 0) {
              // Consume inputs
              Object.entries(consumes).forEach(([resKey, reqPerUnit]) => {
                const amountToConsume = reqPerUnit * actualCycles
                updatedResources[resKey] = Math.max(0, (updatedResources[resKey] || 0) - amountToConsume)
              })

              // Produce output
              if (buildingDef.product) {
                updatedResources[buildingDef.product] = (updatedResources[buildingDef.product] || 0) + actualCycles
              }

              // Knowledge generated proportional to actual work done
              if (buildingDef.knowledge) {
                totalKnowledgeGain += buildingDef.knowledge * maxRatio * timeMultiplier
              }
            }
          }
        })

        // Check active research completion
        let newlyCompletedResearch = null
        let newlyAddedUpgrades = null

        if (state.activeResearch) {
          const elapsed = (now - state.activeResearch.startTime) / 1000
          if (elapsed >= state.activeResearch.duration) {
            newlyCompletedResearch = state.activeResearch.upgrade
            newlyAddedUpgrades = [...(state.upgrades || []), newlyCompletedResearch]
          }
        }

        set(prevState => {
          const nextState = {
            ...prevState,
            ...updatedResources,
            knowledge: (updatedResources.knowledge || 0) + totalKnowledgeGain,
            lastUpdate: now
          }

          if (newlyCompletedResearch) {
            nextState.upgrades = newlyAddedUpgrades
            nextState.completedResearch = newlyCompletedResearch
            nextState.activeResearch = null
          }

          return nextState
        })
      },

      purchaseBuilding: (building) => {
        const state = get()
        const cost = building.cost || {}

        // Check if player can afford all required resources
        const canAfford = Object.entries(cost).every(([resource, amount]) => {
          return (state[resource] ?? 0) >= amount
        })

        // Check if player meets building requirements (buildings and research)
        const hasRequirements = meetsRequirements(building.requirements, state.buildings, state.upgrades)

        // Check if player has available free land (1 land per building)
        const totalLand = state.land ?? 10
        const usedLand = (state.buildings || []).length
        const hasLand = (totalLand - usedLand) >= 1

        // Check if player has available workforce (all buildings except house require 1 worker)
        const popStats = getPopulationStats(state.buildings || [])
        const isHouse = (building.type || building.id || '').toLowerCase() === 'house'
        const requiredWorkers = isHouse ? 0 : (building.workers !== undefined ? building.workers : 1)
        const hasWorkers = popStats.freePopulation >= requiredWorkers

        if (canAfford && hasRequirements && hasLand && hasWorkers) {
          set(prevState => {
            const updatedResources = {}
            Object.entries(cost).forEach(([resource, amount]) => {
              updatedResources[resource] = (prevState[resource] ?? 0) - amount
            })

            const newBuildings = [...prevState.buildings, building]
            const newPopStats = getPopulationStats(newBuildings)

            return {
              ...prevState,
              ...updatedResources,
              buildings: newBuildings,
              population: newPopStats.totalPopulation,
            }
          })
          return { success: true }
        }
        return {
          success: false,
          reason: !hasLand ? 'no_land' : !hasWorkers ? 'no_workers' : !canAfford ? 'cant_afford' : 'requirements_unmet'
        }
      },

      startResearch: (upgrade) => {
        const state = get()
        const currentUpgrades = state.upgrades || []

        // Prevent if research is already in progress or already completed
        if (state.activeResearch || currentUpgrades.some(u => u.id === upgrade.id)) {
          return
        }

        const cost = upgrade.cost || {}
        const canAfford = Object.entries(cost).every(([resource, amount]) => {
          return (state[resource] ?? 0) >= amount
        })

        const hasRequirements = meetsRequirements(upgrade.requirements, state.buildings, currentUpgrades)

        if (canAfford && hasRequirements) {
          set(prevState => {
            const updatedResources = {}
            Object.entries(cost).forEach(([resource, amount]) => {
              updatedResources[resource] = (prevState[resource] ?? 0) - amount
            })

            return {
              ...prevState,
              ...updatedResources,
              activeResearch: {
                upgrade,
                startTime: Date.now(),
                duration: upgrade.duration || 10
              }
            }
          })
        }
      },

      purchaseUpgrade: (upgrade) => {
        // Alias to startResearch for backwards compatibility
        get().startResearch(upgrade)
      },

      dismissCompletedResearch: () => {
        set({ completedResearch: null })
      },

      addNotification: ({ type = 'success', title, message, badge, icon, duration = 3500 }) => {
        const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        const newNotification = {
          id,
          type,
          title,
          message,
          badge,
          icon: icon || (type === 'success' ? '💰' : '🛒'),
          duration,
          timestamp: Date.now()
        }

        set(state => ({
          ...state,
          // Limit to max 4 concurrent notifications for clean UI
          notifications: [newNotification, ...(state.notifications || []).slice(0, 3)]
        }))

        // Auto remove
        setTimeout(() => {
          get().removeNotification(id)
        }, duration)

        return id
      },

      removeNotification: (id) => {
        set(state => ({
          ...state,
          notifications: (state.notifications || []).filter(n => n.id !== id)
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },

      sellResource: (resourceKey, amount, unitPrice, customName = null) => {
        const state = get()
        const currentAmount = Math.floor(state[resourceKey] || 0)
        const sellAmount = Math.min(amount, currentAmount)

        if (sellAmount > 0) {
          const earnings = sellAmount * unitPrice
          set(prevState => ({
            ...prevState,
            money: (prevState.money || 0) + earnings,
            [resourceKey]: Math.max(0, (prevState[resourceKey] || 0) - sellAmount)
          }))

          playTradeSound('sell')

          const itemConfig = MARKET_ITEMS[resourceKey.toUpperCase()]
          const itemName = customName || i18n.t(`items.${resourceKey}.name`, itemConfig?.name || resourceKey)

          get().addNotification({
            type: 'success',
            icon: '💰',
            title: i18n.t('market.toast.saleSuccessTitle'),
            message: i18n.t('market.toast.saleSuccessMsg', { count: sellAmount, name: itemName }),
            badge: `+$${earnings}`,
            duration: 3500
          })

          return { success: true, earnings, amount: sellAmount }
        }
        return { success: false }
      },

      buyResource: (resourceKey, amount, unitPrice, customName = null) => {
        const state = get()
        const currentMoney = state.money || 0
        const totalCost = amount * unitPrice

        if (currentMoney >= totalCost && amount > 0) {
          set(prevState => ({
            ...prevState,
            money: prevState.money - totalCost,
            [resourceKey]: (prevState[resourceKey] || 0) + amount
          }))

          playTradeSound('buy')

          const itemConfig = MARKET_ITEMS[resourceKey.toUpperCase()]
          const itemName = customName || i18n.t(`items.${resourceKey}.name`, itemConfig?.name || resourceKey)

          get().addNotification({
            type: 'buy',
            icon: '🛒',
            title: i18n.t('market.toast.buySuccessTitle'),
            message: i18n.t('market.toast.buySuccessMsg', { count: amount, name: itemName }),
            badge: `-$${totalCost}`,
            duration: 3500
          })

          return { success: true, cost: totalCost, amount }
        }
        return { success: false }
      },

      buyLand: (amount) => {
        const state = get()
        const currentLand = state.land ?? 10
        const totalCost = calculateLandCost(currentLand, amount)
        const currentMoney = state.money || 0

        if (currentMoney >= totalCost && amount > 0) {
          set(prevState => ({
            ...prevState,
            money: prevState.money - totalCost,
            land: (prevState.land ?? 10) + amount
          }))

          playTradeSound('buy')

          get().addNotification({
            type: 'buy',
            icon: '🏞️',
            title: i18n.t('land.toastSuccessTitle'),
            message: i18n.t('land.toastSuccessMsg', { count: amount }),
            badge: `-$${totalCost}`,
            duration: 3500
          })

          return { success: true, cost: totalCost, amount }
        }
        return { success: false }
      },

      processExpenses: () => {
        const state = get()
        const buildings = state.buildings || []
        const expenseData = calculateCityExpenses(buildings)
        const { totalPerTick } = expenseData

        const currentResources = {
          wood: state.wood || 0,
          stone: state.stone || 0,
          plank: state.plank || 0,
          food: state.food !== undefined ? state.food : (INITIAL_RESOURCES.food || 0),
          water: state.water !== undefined ? state.water : (INITIAL_RESOURCES.water || 0),
          knowledge: state.knowledge || 0,
          money: state.money || 0,
          experience: state.experience || 0,
        }

        const shortages = {}
        const deducted = {}

        Object.entries(totalPerTick).forEach(([res, needed]) => {
          const avail = currentResources[res] ?? 0
          if (avail < needed) {
            shortages[res] = Number((needed - avail).toFixed(2))
            deducted[res] = avail
            currentResources[res] = 0
          } else {
            deducted[res] = needed
            currentResources[res] = Number((avail - needed).toFixed(2))
          }
        })

        const hasShortage = Object.keys(shortages).length > 0

        set(prevState => ({
          ...prevState,
          ...currentResources,
          lastExpenseTick: Date.now(),
          lastExpenseSummary: {
            totalPerTick,
            deducted,
            shortages,
            timestamp: Date.now(),
          }
        }))

        // If a shortage occurred, alert the player
        if (hasShortage) {
          const missingNames = Object.keys(shortages)
            .map(k => i18n.t(`resources.${k}`, k))
            .join(', ')

          get().addNotification({
            type: 'warning',
            icon: '⚠️',
            title: i18n.t('expenses.shortageTitle', 'Kaynak Eksikliği!'),
            message: i18n.t('expenses.shortageMsg', { resources: missingNames, defaultValue: `Şehir giderleri tam karşılanamadı: ${missingNames} tükendi!` }),
            badge: i18n.t('expenses.shortageBadge', 'Masraf Ödenemedi'),
            duration: 4000
          })
        }

        return { totalPerTick, deducted, shortages }
      },

      // Add more game actions here
    }),
    {
      name: 'html-tycoon-game',
      partialize: (state) => {
        // Exclude isGameStarted so the simulation never starts automatically on page load
        const { isGameStarted, ...persistedState } = state
        return persistedState
      },
    }
  )
)