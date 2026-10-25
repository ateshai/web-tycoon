import React, { useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import useGameLoop from '../../hooks/useGameLoop'
import { EXPENSE_CONFIG, TIME } from '../../logic/constants'

const GameLoop = ({ children }) => {
  const updateResources = useGameStore(state => state.updateResources)
  const processExpenses = useGameStore(state => state.processExpenses)
  const isGameStarted = useGameStore(state => state.isGameStarted)
  const { startGameLoop, stopGameLoop } = useGameLoop(updateResources)

  useEffect(() => {
    if (isGameStarted) {
      startGameLoop()
    } else {
      stopGameLoop()
    }
    return () => stopGameLoop()
  }, [isGameStarted, startGameLoop, stopGameLoop])

  // Periodic interval for city expenses and maintenance (every 10 seconds)
  useEffect(() => {
    if (!isGameStarted) return

    const intervalMs = EXPENSE_CONFIG?.INTERVAL_MS || TIME?.EXPENSE_TICK_RATE || 10000
    const expenseInterval = setInterval(() => {
      processExpenses()
    }, intervalMs)

    return () => clearInterval(expenseInterval)
  }, [isGameStarted, processExpenses])

  return children
}

export default GameLoop