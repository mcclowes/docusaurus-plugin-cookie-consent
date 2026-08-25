import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react'
import type { CookieCategory, ConsentState, GoogleConsentModeConfig } from '../types'
import {
  parseStoredPreferences,
  serializePreferences,
  type CookiePreferences,
} from '../consentStorage'
import { initGoogleConsentMode, updateGoogleConsent } from './googleConsentMode'
import { COOKIE_CONSENT_CHANGE_EVENT } from './consent'

export type { CookiePreferences } from '../consentStorage'

type CookieContextType = {
  preferences: CookiePreferences | null
  loading: boolean
  hasConsent: () => boolean
  hasCategoryConsent: (category: CookieCategory) => boolean
  acceptAll: () => void
  rejectOptional: () => void
  rejectAll: () => void
  updatePreferences: (prefs: Partial<CookiePreferences>) => void
  resetConsent: () => void
}

const CookieConsentContext = createContext<CookieContextType | null>(null)

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    // During SSR, provide safe defaults instead of throwing
    if (typeof window === 'undefined') {
      return {
        preferences: null,
        loading: true,
        hasConsent: () => false,
        hasCategoryConsent: () => false,
        acceptAll: () => {},
        rejectOptional: () => {},
        rejectAll: () => {},
        updatePreferences: () => {},
        resetConsent: () => {},
      }
    }
    throw new Error('useCookieConsent must be used within CookieConsentProvider')
  }
  return context
}

type CookieConsentProviderProps = {
  children: React.ReactNode
  storageKey?: string
  consentExpiryDays?: number
  googleConsentMode?: GoogleConsentModeConfig
}

export function CookieConsentProvider({
  children,
  storageKey = 'cookie-consent-preferences',
  consentExpiryDays,
  googleConsentMode,
}: CookieConsentProviderProps) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  // Initialize Google Consent Mode as early as possible (before GTM loads)
  useEffect(() => {
    if (typeof window === 'undefined' || initializedRef.current) return
    if (!googleConsentMode?.enabled) return

    initializedRef.current = true

    // Try to get stored consent synchronously for immediate initialization
    let storedConsent: ConsentState | null = null
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = parseStoredPreferences(JSON.parse(stored), consentExpiryDays)
        if (parsed?.consentGiven) {
          storedConsent = {
            necessary: true,
            analytics: parsed.analytics,
            marketing: parsed.marketing,
            functional: parsed.functional,
          }
        }
      }
    } catch {
      // Ignore errors, will default to denied
    }

    initGoogleConsentMode(googleConsentMode, storedConsent)
  }, [consentExpiryDays, googleConsentMode, storageKey])

  // Load preferences from localStorage on mount
  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    try {
      const stored = localStorage.getItem(storageKey)

      if (stored) {
        const parsed = parseStoredPreferences(JSON.parse(stored), consentExpiryDays)
        if (parsed) {
          setPreferences(parsed)
        } else {
          // Invalid data - remove corrupted preferences
          console.warn(
            '[docusaurus-plugin-cookie-consent] Invalid preferences in localStorage, resetting'
          )
          localStorage.removeItem(storageKey)
        }
      }
    } catch (error) {
      console.warn(
        '[docusaurus-plugin-cookie-consent] Failed to load preferences from localStorage:',
        error
      )
    } finally {
      setLoading(false)
    }
  }, [consentExpiryDays, storageKey])

  // Helper to notify consent changes
  const notifyConsentChange = useCallback(
    (prefs: CookiePreferences) => {
      const consentState: ConsentState = {
        necessary: true,
        analytics: prefs.analytics,
        marketing: prefs.marketing,
        functional: prefs.functional,
      }

      // Update Google Consent Mode if enabled
      if (googleConsentMode?.enabled) {
        updateGoogleConsent(consentState)
      }

      // Dispatch custom DOM event for third-party integrations
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, {
            detail: consentState,
          })
        )
      }
    },
    [googleConsentMode?.enabled]
  )

  // Update consent helper
  const updateConsent = useCallback(
    (value: CookiePreferences) => {
      setPreferences(value)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(serializePreferences(value)))
        } catch (error) {
          console.warn(
            '[docusaurus-plugin-cookie-consent] Failed to save preferences to localStorage:',
            error
          )
        }
      }
      notifyConsentChange(value)
    },
    [storageKey, notifyConsentChange]
  )

  const hasConsent = useCallback(() => {
    return preferences?.consentGiven ?? false
  }, [preferences])

  const hasCategoryConsent = useCallback(
    (category: CookieCategory) => {
      // Necessary cookies are always allowed, even before consent is given
      if (category === 'necessary') return true
      if (!preferences) return false
      return preferences[category] ?? false
    },
    [preferences]
  )

  const acceptAll = useCallback(() => {
    updateConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      consentGiven: true,
      timestamp: Date.now(),
    })
  }, [updateConsent])

  const rejectOptional = useCallback(() => {
    updateConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      consentGiven: true,
      timestamp: Date.now(),
    })
  }, [updateConsent])

  const rejectAll = useCallback(() => {
    // Same as rejectOptional - necessary cookies cannot be rejected
    updateConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      consentGiven: true,
      timestamp: Date.now(),
    })
  }, [updateConsent])

  const updatePreferences = useCallback(
    (prefs: Partial<CookiePreferences>) => {
      setPreferences((prev) => {
        const next: CookiePreferences = {
          necessary: true, // Always true
          analytics: prefs.analytics ?? prev?.analytics ?? false,
          marketing: prefs.marketing ?? prev?.marketing ?? false,
          functional: prefs.functional ?? prev?.functional ?? false,
          consentGiven: prefs.consentGiven ?? prev?.consentGiven ?? true,
          timestamp: Date.now(),
        }

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, JSON.stringify(serializePreferences(next)))
          } catch (error) {
            console.warn('[docusaurus-plugin-cookie-consent] Failed to save preferences:', error)
          }
        }

        // Notify consent change
        notifyConsentChange(next)

        return next
      })
    },
    [storageKey, notifyConsentChange]
  )

  const resetConsent = useCallback(() => {
    setPreferences(null)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn('[docusaurus-plugin-cookie-consent] Failed to reset consent:', error)
      }
    }
    notifyConsentChange({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      consentGiven: false,
      timestamp: Date.now(),
    })
  }, [notifyConsentChange, storageKey])

  const value: CookieContextType = {
    preferences,
    loading,
    hasConsent,
    hasCategoryConsent,
    acceptAll,
    rejectOptional,
    rejectAll,
    updatePreferences,
    resetConsent,
  }

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
}

export default CookieConsentProvider
