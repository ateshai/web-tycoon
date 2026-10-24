import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { INITIAL_RESOURCES, MARKET_ITEMS } from '../logic/constants'
import { meetsRequirements, getUpgradeMultiplier } from '../logic/gameLogic'
import { playTradeSound } from '../logic/audio'

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Resources
      ...INITIAL_RESOURCES,

      // Buildings/Assets
      buildings: [],
      upgrades: [],

      // Active timed research and completion modal state
      activeResearch: null, // { upgrade, startTime, duration }
      completedResearch: null, // upgrade that just finished

      // Notifications queue
      notifications: [],

      // Game state
      lastUpdate: Date.now(),
      gameSpeed: 1,

      // Actions
      initialize: () => {
        set({
          ...INITIAL_RESOURCES,
          buildings: [],
          upgrades: [],
          activeResearch: null,
          completedResearch: null,
          notifications: [],
          lastUpdate: Date.now(),
          gameSpeed: 1
        })
      },

      updateResources: () => {
        const now = Date.now()
        const state = get()
        const deltaTime = (now - state.lastUpdate) * state.gameSpeed
        const timeMultiplier = deltaTime / 1000

        // Calculate production and knowledge from all buildings
        const productionIncrements = {}
        let totalKnowledgeGain = 0
        const currentUpgrades = state.upgrades || []

        state.buildings.forEach(building => {
          const buildingId = building.id || building.type
          const multiplier = getUpgradeMultiplier(buildingId, currentUpgrades)

          if (building.product && building.productionQuantity) {
            const amount = building.productionQuantity * multiplier * timeMultiplier
            productionIncrements[building.product] =
              (productionIncrements[building.product] || 0) + amount
          }
          if (building.knowledge) {
            totalKnowledgeGain += building.knowledge * timeMultiplier
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
            knowledge: (prevState.knowledge || 0) + totalKnowledgeGain,
            lastUpdate: now
          }

          Object.entries(productionIncrements).forEach(([product, amount]) => {
            nextState[product] = (prevState[product] || 0) + amount
          })

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

        if (canAfford && hasRequirements) {
          set(prevState => {
            const updatedResources = {}
            Object.entries(cost).forEach(([resource, amount]) => {
              updatedResources[resource] = (prevState[resource] ?? 0) - amount
            })

            return {
              ...prevState,
              ...updatedResources,
              buildings: [...prevState.buildings, building]
            }
          })
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
          const itemName = customName || itemConfig?.name || resourceKey

          get().addNotification({
            type: 'success',
            icon: '💰',
            title: 'Satış Yapıldı!',
            message: `${sellAmount}x ${itemName} satıldı`,
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
          const itemName = customName || itemConfig?.name || resourceKey

          get().addNotification({
            type: 'buy',
            icon: '🛒',
            title: 'Satın Alındı!',
            message: `${amount}x ${itemName} depoya eklendi`,
            badge: `-$${totalCost}`,
            duration: 3500
          })

          return { success: true, cost: totalCost, amount }
        }
        return { success: false }
      },

      // Add more game actions here
    }),
    {
      name: 'html-tycoon-game',
    }
  )
)