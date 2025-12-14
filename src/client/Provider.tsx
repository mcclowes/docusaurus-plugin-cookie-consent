import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react'
import type {
  CookieCategory,
  ConsentState,
  GoogleConsentModeConfig,
  RegionDetectionConfig,
  RegionDetectionResult,
} from '../types'
import { initGoogleConsentMode, updateGoogleConsent } from './googleConsentMode'
import { detectRegion } from './regionDetection'

export type CookiePreferences = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
  consentGiven: boolean
  timestamp?: number
}

type CookieContextType = {
  preferences: CookiePreferences | null
  loading: boolean
  regionDetectionResult: RegionDetectionResult | null
  regionRequiresConsent: boolean
  hasConsent: () => boolean
  hasCategoryConsent: (category: CookieCategory) => boolean
  acceptAll: () => void
  rejectOptional: () => void
  rejectAll: () => void
  updatePreferences: (prefs: Partial<CookiePreferences>) => void
  resetConsent: () => void
}

const CookieConsentContext = createContext<CookieContextType | null>(null)

/**
 * Validates that stored preferences have the expected shape.
 * Returns null if validation fails, allowing the modal to show again.
 */
function validatePreferences(data: unknown): CookiePreferences | null {
  if (!data || typeof data !== 'object') return null

  const prefs = data as Record<string, unknown>

  // Check required boolean fields
  if (typeof prefs.necessary !== 'boolean') return null
  if (typeof prefs.analytics !== 'boolean') return null
  if (typeof prefs.marketing !== 'boolean') return null
  if (typeof prefs.functional !== 'boolean') return null
  if (typeof prefs.consentGiven !== 'boolean') return null

  // timestamp is optional but must be a number if present
  if (prefs.timestamp !== undefined && typeof prefs.timestamp !== 'number') return null

  return {
    necessary: prefs.necessary,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    functional: prefs.functional,
    consentGiven: prefs.consentGiven,
    timestamp: prefs.timestamp as number | undefined,
  }
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    // During SSR, provide safe defaults instead of throwing
    if (typeof window === 'undefined') {
      return {
        preferences: null,
        loading: true,
        regionDetectionResult: null,
        regionRequiresConsent: true, // Default to requiring consent
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
  googleConsentMode?: GoogleConsentModeConfig
  onConsentChange?: (consent: ConsentState) => void
  regionDetection?: RegionDetectionConfig
}

export function CookieConsentProvider({
  children,
  storageKey = 'cookie-consent-preferences',
  googleConsentMode,
  onConsentChange,
  regionDetection,
}: CookieConsentProviderProps) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [regionDetectionResult, setRegionDetectionResult] = useState<RegionDetectionResult | null>(
    null
  )
  const [regionRequiresConsent, setRegionRequiresConsent] = useState(true)
  const initializedRef = useRef(false)
  const regionDetectionRef = useRef(false)

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
        const parsed = validatePreferences(JSON.parse(stored))
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
  }, [googleConsentMode, storageKey])

  // Region detection
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (regionDetectionRef.current) return
    if (!regionDetection?.enabled) {
      // Region detection disabled, always require consent
      setRegionRequiresConsent(true)
      return
    }

    regionDetectionRef.current = true

    const runDetection = async () => {
      try {
        const result = await detectRegion(regionDetection)
        setRegionDetectionResult(result)
        setRegionRequiresConsent(result.requiresConsent)

        // Call the callback if provided
        regionDetection.onRegionDetected?.(result)
      } catch (error) {
        console.warn('[docusaurus-plugin-cookie-consent] Region detection failed:', error)
        // On error, default to requiring consent (safer for compliance)
        setRegionRequiresConsent(regionDetection.fallbackBehavior !== 'hide')
      }
    }

    runDetection()
  }, [regionDetection])

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
        const parsed = validatePreferences(JSON.parse(stored))
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
  }, [storageKey])

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
          new CustomEvent('cookieConsentChange', {
            detail: consentState,
          })
        )
      }

      // Call custom callback if provided
      onConsentChange?.(consentState)
    },
    [googleConsentMode?.enabled, onConsentChange]
  )

  // Update consent helper
  const updateConsent = useCallback(
    (value: CookiePreferences) => {
      setPreferences(value)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(value))
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
            localStorage.setItem(storageKey, JSON.stringify(next))
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
  }, [storageKey])

  const value: CookieContextType = {
    preferences,
    loading,
    regionDetectionResult,
    regionRequiresConsent,
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
