// Building categories for organized menu navigation
export const BUILDING_CATEGORIES = [
  { id: 'all', icon: '🏛️' },
  { id: 'residential', icon: '🏠' },
  { id: 'gathering', icon: '⛏️' },
  { id: 'crafting', icon: '⚙️' },
  { id: 'sustenance', icon: '🌾' },
]

// Building costs and requirements
export const BUILDINGS = {
  HOUSE: {
    id: 'house',
    name: 'House',
    category: 'residential',
    icon: '🏠',
    cost: {
      wood: 50,
    },
    workers: 0,
    providesPopulation: 5,
    product: null,
    productionQuantity: 0,
    knowledge: 0,
    specialConsumption: {
      food: 5,
      water: 5,
    },
  },
  WOODCUTTER: {
    id: 'woodcutter',
    name: 'Woodcutter',
    category: 'gathering',
    icon: '🪓',
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
    category: 'gathering',
    icon: '⛏️',
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
    category: 'crafting',
    icon: '🪚',
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
  FARM: {
    id: 'farm',
    name: 'Farm',
    category: 'sustenance',
    icon: '🌾',
    cost: {
      money: 40,
      wood: 40,
    },
    workers: 1,
    requirements: {
      research: 'farming',
    },
    product: 'grain',
    productionQuantity: 2,
    knowledge: 0.1,
  },
  MILL: {
    id: 'mill',
    name: 'Mill',
    category: 'crafting',
    icon: '⚙️',
    cost: {
      money: 100,
      wood: 60,
      stone: 30,
    },
    workers: 1,
    requirements: {
      research: 'machinery_1',
      farm: 1,
    },
    consumes: {
      grain: 1,
    },
    product: 'flour',
    productionQuantity: 1,
    knowledge: 0.2,
  },
  BAKERY: {
    id: 'bakery',
    name: 'Bakery',
    category: 'sustenance',
    icon: '🥖',
    cost: {
      money: 120,
      wood: 50,
      stone: 50,
    },
    workers: 1,
    requirements: {
      research: 'bakery',
    },
    consumes: {
      flour: 1,
      water: 1,
    },
    product: 'food',
    productionQuantity: 3,
    knowledge: 0.2,
  },
  WELL: {
    id: 'well',
    name: 'Water Well',
    category: 'sustenance',
    icon: '💧',
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
    category: 'sustenance',
    icon: '🏹',
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
  FARMING: {
    id: 'farming',
    name: 'Farming',
    description: 'Unlocks the Farm building to harvest grain.',
    cost: {
      money: 40,
      knowledge: 20,
    },
    duration: 15, // 15 seconds
    unlocks: 'farm',
    level: 1,
    requirements: {
      hunter: 1,
    },
  },
  SIMPLE_MACHINERY: {
    id: 'machinery_1',
    name: 'Simple Machinery',
    description: 'Unlocks the Mill building to grind grain into flour.',
    cost: {
      money: 100,
      knowledge: 50,
    },
    duration: 25, // 25 seconds
    unlocks: 'mill',
    level: 1,
    requirements: {
      woodcutter: 1,
      stonemason: 1,
    },
  },
  BAKING: {
    id: 'bakery',
    name: 'Baking',
    description: 'Unlocks the Bakery building to bake hearty food from flour and water.',
    cost: {
      money: 120,
      knowledge: 60,
    },
    duration: 30, // 30 seconds
    unlocks: 'bakery',
    level: 1,
    requirements: {
      research: 'machinery_1',
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
  GRAIN: {
    id: 'grain',
    name: 'Grain',
    icon: '🌾',
    sellPrice: 3,
    buyPrice: 6,
    description: 'Raw agricultural grain harvested from farms.',
  },
  FLOUR: {
    id: 'flour',
    name: 'Flour',
    icon: '🥡',
    sellPrice: 8,
    buyPrice: 16,
    description: 'Finely milled grain suitable for baking.',
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
  grain: 0,
  flour: 0,
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