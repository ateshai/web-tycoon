import { useCallback, useRef } from 'react'
import { TIME } from '../logic/constants'

const useGameLoop = (updateCallback) => {
  const frameRef = useRef()
  const lastUpdateRef = useRef(Date.now())

  const gameLoop = useCallback(() => {
    const now = Date.now()
    const deltaTime = now - lastUpdateRef.current

    if (deltaTime >= TIME.BASE_TICK_RATE) {
      updateCallback()
      lastUpdateRef.current = now
    }

    frameRef.current = requestAnimationFrame(gameLoop)
  }, [updateCallback])

  const startGameLoop = useCallback(() => {
    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(gameLoop)
    }
  }, [gameLoop])

  const stopGameLoop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = undefined
    }
  }, [])

  return { startGameLoop, stopGameLoop }
}

export default useGameLoop