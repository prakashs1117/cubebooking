import { createContext, useContext, useState, type ReactNode } from 'react'
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

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'en' || stored === 'de') return stored
    } catch { /* noop */ }
    return 'de'
  })

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* noop */ }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <IntlProvider
        locale={locale}
        messages={messages[locale]}
        defaultLocale="de"
        onError={() => { /* suppress missing-translation warnings in prod */ }}
      >
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  )
}
