import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'
import type { CookieCategory } from '../types'

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
}

export function CookieConsentProvider({
  children,
  storageKey = 'cookie-consent-preferences',
}: CookieConsentProviderProps) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)
  const [loading, setLoading] = useState(true)

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
        const parsed = JSON.parse(stored) as CookiePreferences
        setPreferences(parsed)
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
    },
    [storageKey]
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

        return next
      })
    },
    [storageKey]
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
