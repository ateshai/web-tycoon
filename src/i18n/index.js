import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import tr from './locales/tr.json'

// Check if language was previously saved in localStorage
let savedLanguage = 'tr'
try {
  const settingsData = localStorage.getItem('html-tycoon-settings')
  if (settingsData) {
    const parsed = JSON.parse(settingsData)
    if (parsed?.state?.language) {
      savedLanguage = parsed.state.language
    }
  }
} catch (e) {
  // Fallback to default
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr },
    },
    lng: savedLanguage || 'tr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })

export default i18n
