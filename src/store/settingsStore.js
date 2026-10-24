import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      // Audio settings
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 0.7,
      musicVolume: 0.5,
      
      // Display settings
      theme: 'dark',
      notifications: true,
      
      // Actions
      loadSettings: () => {
        // Load settings from localStorage or use defaults
      },
      
      updateSoundSettings: (settings) => {
        set((state) => ({
          ...state,
          ...settings,
        }))
      },
      
      toggleSound: () => {
        set((state) => ({
          soundEnabled: !state.soundEnabled,
        }))
      },
      
      toggleMusic: () => {
        set((state) => ({
          musicEnabled: !state.musicEnabled,
        }))
      },
      
      setTheme: (theme) => {
        set({ theme })
      },
      
      toggleNotifications: () => {
        set((state) => ({
          notifications: !state.notifications,
        }))
      },
    }),
    {
      name: 'html-tycoon-settings',
    }
  )
)