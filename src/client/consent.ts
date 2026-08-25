import { parseStoredPreferences } from '../consentStorage'
import type { ConsentState } from '../types'

export const COOKIE_CONSENT_CHANGE_EVENT = 'cookieConsentChange'

export type CookieConsentSubscriber = (consent: ConsentState | null) => void

export type CookieConsentSubscriptionOptions = {
  storageKey?: string
  consentExpiryDays?: number
  emitCurrent?: boolean
}

function toConsentState(data: unknown, consentExpiryDays?: number): ConsentState | null {
  const preferences = parseStoredPreferences(data, consentExpiryDays)
  if (!preferences?.consentGiven) return null

  return {
    necessary: true,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    functional: preferences.functional,
  }
}

export function readCookieConsent(
  storageKey = 'cookie-consent-preferences',
  consentExpiryDays?: number
): ConsentState | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? toConsentState(JSON.parse(stored), consentExpiryDays) : null
  } catch {
    return null
  }
}

export function subscribeToCookieConsent(
  subscriber: CookieConsentSubscriber,
  {
    storageKey = 'cookie-consent-preferences',
    consentExpiryDays,
    emitCurrent = true,
  }: CookieConsentSubscriptionOptions = {}
): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleConsentChange = (event: Event) => {
    subscriber((event as CustomEvent<ConsentState>).detail)
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key !== storageKey) return

    try {
      subscriber(
        event.newValue ? toConsentState(JSON.parse(event.newValue), consentExpiryDays) : null
      )
    } catch {
      subscriber(null)
    }
  }

  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, handleConsentChange)
  window.addEventListener('storage', handleStorageChange)

  if (emitCurrent) subscriber(readCookieConsent(storageKey, consentExpiryDays))

  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, handleConsentChange)
    window.removeEventListener('storage', handleStorageChange)
  }
}
