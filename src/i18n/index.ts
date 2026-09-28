import en from './en'
import de from './de'

export type Locale = 'en' | 'de'

export const messages: Record<Locale, Record<string, string>> = { en, de }
