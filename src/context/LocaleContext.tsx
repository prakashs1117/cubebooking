import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { messages, type Locale } from '../i18n'

const STORAGE_KEY = 'curiosity-locale'

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>')
  return ctx
}

/** Detect browser/OS language and map to a supported locale. */
function detectLocale(): Locale {
  // navigator.languages is an ordered priority list; fall back to navigator.language
  const langs = (navigator.languages?.length ? navigator.languages : [navigator.language]) ?? []
  for (const lang of langs) {
    const primary = lang.split('-')[0].toLowerCase()
    if (primary === 'de') return 'de'
    if (primary === 'en') return 'en'
  }
  // Default: German (app is based in Darmstadt, Germany)
  return 'de'
}

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // 1. Respect an explicit user choice stored in localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'en' || stored === 'de') return stored
    } catch { /* noop */ }

    // 2. Auto-detect from browser / system language
    return detectLocale()
  })

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* noop */ }
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <IntlProvider
        locale={locale}
        messages={messages[locale]}
        defaultLocale="de"
        onError={import.meta.env.PROD ? () => {} : undefined}
      >
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  )
}
