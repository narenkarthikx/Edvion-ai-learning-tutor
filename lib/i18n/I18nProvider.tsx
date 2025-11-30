'use client'

import { useEffect, useState } from 'react'

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    async function initializeI18n() {
      const { default: i18n } = await import('i18next')
      const { initReactI18next } = await import('react-i18next')
      const { default: LanguageDetector } = await import('i18next-browser-languagedetector')

      // Import translation files
      const [en, hi, te, ta] = await Promise.all([
        import('./locales/en.json'),
        import('./locales/hi.json'),
        import('./locales/te.json'),
        import('./locales/ta.json')
      ])

      const resources = {
        en: { translation: en.default },
        hi: { translation: hi.default },
        te: { translation: te.default },
        ta: { translation: ta.default }
      }

      // Only initialize if not already initialized
      if (!i18n.isInitialized) {
        await i18n
          .use(LanguageDetector)
          .use(initReactI18next)
          .init({
            resources,
            fallbackLng: 'en',
            debug: false,
            
            detection: {
              order: ['localStorage', 'navigator', 'htmlTag'],
              caches: ['localStorage'],
              lookupLocalStorage: 'learn-buddy-language',
            },

            interpolation: {
              escapeValue: false
            },

            react: {
              useSuspense: false
            }
          })
      }

      setIsInitialized(true)
    }

    initializeI18n()
  }, [])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}