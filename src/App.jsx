import React, { useEffect } from 'react'
import GameView from './components/Game/GameView'
import { useGameStore } from './store/gameStore'
import { useSettingsStore } from './store/settingsStore'

function App() {
  const initializeGame = useGameStore(state => state.initialize)
  const loadSettings = useSettingsStore(state => state.loadSettings)

  useEffect(() => {
    initializeGame()
    loadSettings()
  }, [])

  return (
    <div className="app">
      <GameView />
    </div>
  )
}

export default App