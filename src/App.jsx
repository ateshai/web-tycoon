import React, { useEffect } from 'react'
import GameView from './components/Game/GameView'
import { useSettingsStore } from './store/settingsStore'

function App() {
  const loadSettings = useSettingsStore(state => state.loadSettings)

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return (
    <div className="app">
      <GameView />
    </div>
  )
}

export default App