import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '../i18n'

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Audio settings
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 0.7,
      musicVolume: 0.5,
      
      // Display settings
      theme: 'dark',
      notifications: true,
      language: 'tr',
      
      // Actions
      loadSettings: () => {
        const lang = get().language || 'tr'
        i18n.changeLanguage(lang)
      },

      setLanguage: (language) => {
        set({ language })
        i18n.changeLanguage(language)
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