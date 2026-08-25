export const CONSENT_STORAGE_VERSION = 1
export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

export type CookiePreferences = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
  consentGiven: boolean
  timestamp?: number
}

type StoredCookiePreferences = CookiePreferences & {
  version: typeof CONSENT_STORAGE_VERSION
}

export function parseStoredPreferences(
  data: unknown,
  consentExpiryDays?: number
): CookiePreferences | null {
  if (!data || typeof data !== 'object') return null

  const prefs = data as Record<string, unknown>
  if (prefs.version !== undefined && prefs.version !== CONSENT_STORAGE_VERSION) return null
  if (prefs.necessary !== true) return null
  if (typeof prefs.analytics !== 'boolean') return null
  if (typeof prefs.marketing !== 'boolean') return null
  if (typeof prefs.functional !== 'boolean') return null
  if (typeof prefs.consentGiven !== 'boolean') return null
  if (prefs.timestamp !== undefined && typeof prefs.timestamp !== 'number') return null

  if (consentExpiryDays !== undefined) {
    if (typeof prefs.timestamp !== 'number') return null
    if (Date.now() - prefs.timestamp >= consentExpiryDays * MILLISECONDS_PER_DAY) return null
  }

  return {
    necessary: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    functional: prefs.functional,
    consentGiven: prefs.consentGiven,
    timestamp: prefs.timestamp as number | undefined,
  }
}

export function serializePreferences(preferences: CookiePreferences): StoredCookiePreferences {
  return { ...preferences, version: CONSENT_STORAGE_VERSION }
}
