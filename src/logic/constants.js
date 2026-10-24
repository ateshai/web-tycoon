// Building costs and requirements
export const BUILDINGS = {
  HOUSE: {
    id: 'house',
    name: 'House',
    cost: {
      wood: 50,
    },
    workers: 0,
    providesPopulation: 5,
    product: null,
    productionQuantity: 0,
    knowledge: 0,
    specialConsumption: {
      food: 1,
      water: 1,
    },
  },
  WOODCUTTER: {
    id: 'woodcutter',
    name: 'Woodcutter',
    cost: {
      wood: 50,
    },
    workers: 1,
    product: 'wood',
    productionQuantity: 1,
    knowledge: 0.1,
  },
  STONEMASON: {
    id: 'stonemason',
    name: 'Stonemason',
    cost: {
      wood: 75,
    },
    workers: 1,
    requirements: {
      woodcutter: 1,
    },
    product: 'stone',
    productionQuantity: 1,
    knowledge: 0.2,
  },
  CARPENTER: {
    id: 'carpenter',
    name: 'Carpenter',
    cost: {
      money: 50,
      wood: 100,
    },
    workers: 1,
    requirements: {
      research: 'carpentry',
    },
    consumes: {
      wood: 1, // Consumes 1 wood to produce 1 plank
    },
    product: 'plank',
    productionQuantity: 1,
    knowledge: 0.2,
  },
  WELL: {
    id: 'well',
    name: 'Water Well',
    cost: {
      stone: 10,
      wood: 5,
    },
    workers: 1,
    product: 'water',
    productionQuantity: 1,
    knowledge: 0.1,
  },
  HUNTER: {
    id: 'hunter',
    name: 'Hunter',
    cost: {
      wood: 15,
      stone: 5,
    },
    workers: 1,
    product: 'food',
    productionQuantity: 1,
    knowledge: 0.1,
  },
  // Add more buildings here
}

// Research and Upgrades
export const UPGRADES = {
  CARPENTRY: {
    id: 'carpentry',
    name: 'Carpentry',
    description: 'Unlocks the Carpenter building to craft refined wood planks.',
    cost: {
      knowledge: 15,
    },
    duration: 15, // 15 seconds
    unlocks: 'carpenter',
    level: 1,
    requirements: {
      woodcutter: 1,
    },
  },
  WOODCUTTER_EFFICIENCY_1: {
    id: 'woodcutter_efficiency_1',
    name: 'Sharper Axes (Woodcutter Lvl 1)',
    description: 'Improves wood chopping techniques, increasing Woodcutter production by 20% (+0.2 bonus).',
    cost: {
      knowledge: 10,
    },
    duration: 10, // 10 seconds
    affects: 'woodcutter',
    multiplier: 0.2,
    level: 1,
    requirements: {
      woodcutter: 1,
    },
  },
  STONEMASON_EFFICIENCY_1: {
    id: 'stonemason_efficiency_1',
    name: 'Hardened Chisels (Stonemason Lvl 1)',
    description: 'Improves stone crafting tools, increasing Stonemason production by 20% (+0.2 bonus).',
    cost: {
      knowledge: 25,
    },
    duration: 20, // 20 seconds
    affects: 'stonemason',
    multiplier: 0.2,
    level: 1,
    requirements: {
      stonemason: 1,
    },
  },
}

// Market trade items
export const MARKET_ITEMS = {
  WOOD: {
    id: 'wood',
    name: 'Wood',
    icon: '🪵',
    sellPrice: 2,
    buyPrice: 4,
    description: 'Raw wood chopped from forests.',
  },
  STONE: {
    id: 'stone',
    name: 'Stone',
    icon: '🪨',
    sellPrice: 4,
    buyPrice: 8,
    description: 'Quarried stones suitable for masonry.',
  },
  PLANK: {
    id: 'plank',
    name: 'Plank',
    icon: '🪚',
    sellPrice: 10,
    buyPrice: 18,
    description: 'Refined wood processed by carpenters.',
  },
  FOOD: {
    id: 'food',
    name: 'Food',
    icon: '🍞',
    sellPrice: 2,
    buyPrice: 4,
    description: 'Essential rations for city residents.',
  },
  WATER: {
    id: 'water',
    name: 'Water',
    icon: '💧',
    sellPrice: 1,
    buyPrice: 2,
    description: 'Fresh clean water for city consumption.',
  },
}

// Initial player buildings (starting with 1 House)
export const INITIAL_BUILDINGS = [
  { id: 'house', type: 'house', name: 'House' }
]

// Initial player resources (starting with 5 population and 10 land)
export const INITIAL_RESOURCES = {
  money: 10,
  wood: 100,
  stone: 0,
  plank: 0,
  food: 30,
  water: 30,
  knowledge: 0,
  experience: 0,
  land: 10,
  population: 5,
}

// Land expansion configuration
export const LAND_CONFIG = {
  INITIAL_LAND: 10,
  BASE_PRICE: 1000,
  TIER_SIZE: 25,
  PRICE_MULTIPLIER: 1.5,
  PURCHASE_OPTIONS: [1, 5, 10, 20],
}

// Expense and maintenance configuration
export const EXPENSE_CONFIG = {
  INTERVAL_MS: 10000, // 10 seconds
  INTERVAL_SEC: 10,
  BASE_MAINTENANCE_RATE: 0.02, // 2% of construction cost per tick
}

// Resource generation rates
export const RESOURCE_RATES = {
  EXPERIENCE_PER_PROJECT: 10,
}

// Game progression thresholds
export const THRESHOLDS = {
  EXPERIENCE_LEVELS: [0, 1000, 5000, 10000, 50000],
}

// Time constants
export const TIME = {
  BASE_TICK_RATE: 1000, // 1 second
  EXPENSE_TICK_RATE: 10000, // 10 seconds
  FAST_FORWARD_MULTIPLIER: 2,
}

// Game events
export const EVENTS = {
  CLIENT_REQUEST: 'CLIENT_REQUEST',
  MARKET_CHANGE: 'MARKET_CHANGE',
  TECHNOLOGY_BREAKTHROUGH: 'TECHNOLOGY_BREAKTHROUGH',
}