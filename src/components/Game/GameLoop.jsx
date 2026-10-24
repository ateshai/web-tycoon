import React, { useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import useGameLoop from '../../hooks/useGameLoop'

const GameLoop = ({ children }) => {
  const updateResources = useGameStore(state => state.updateResources)
  const { startGameLoop, stopGameLoop } = useGameLoop(updateResources)

  useEffect(() => {
    startGameLoop()
    return () => stopGameLoop()
  }, [])

  return children
}

export default GameLoop