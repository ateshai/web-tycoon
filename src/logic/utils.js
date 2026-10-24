// Format number with appropriate suffix (K, M, B) - always integer, no decimals
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num) || num <= 0) return '0'
  const intVal = Math.floor(num)
  if (intVal < 1000) return intVal.toString()
  
  const suffixes = ['', 'K', 'M', 'B', 'T']
  const order = Math.floor(Math.log10(intVal) / 3)
  const suffix = suffixes[Math.min(order, suffixes.length - 1)]
  const shortened = Math.floor(intVal / Math.pow(1000, order))
  return `${shortened}${suffix}`
}

// Format time duration
export const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

// Deep clone an object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

// Generate a unique ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Calculate percentage
export const calculatePercentage = (current, total) => {
  return Math.round((current / total) * 100)
}

// Random number between min and max
export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Shuffle array
export const shuffleArray = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}