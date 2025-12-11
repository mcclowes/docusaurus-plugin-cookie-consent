import type { ConsentState, GoogleConsentModeConfig } from '../types'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

type GoogleConsentParams = {
  ad_storage: 'granted' | 'denied'
  ad_user_data: 'granted' | 'denied'
  ad_personalization: 'granted' | 'denied'
  analytics_storage: 'granted' | 'denied'
  functionality_storage: 'granted' | 'denied'
  personalization_storage: 'granted' | 'denied'
  security_storage: 'granted'
}

function ensureGtag() {
  if (typeof window === 'undefined') return false

  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
  }
  return true
}

function mapConsentToGoogle(consent: ConsentState): GoogleConsentParams {
  return {
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    functionality_storage: consent.functional ? 'granted' : 'denied',
    personalization_storage: consent.functional ? 'granted' : 'denied',
    security_storage: 'granted', // Always granted for necessary cookies
  }
}

/**
 * Set default consent state to denied.
 * This MUST be called before GTM/gtag loads to ensure no tracking fires
 * before user consent.
 */
export function setDefaultConsent(config: GoogleConsentModeConfig = {}) {
  if (!ensureGtag()) return

  const waitForUpdate = config.waitForUpdate ?? 500

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: waitForUpdate,
  })

  // Set additional options
  if (config.adsDataRedaction !== false) {
    window.gtag('set', 'ads_data_redaction', true)
  }

  if (config.urlPassthrough) {
    window.gtag('set', 'url_passthrough', true)
  }
}

/**
 * Update consent state based on user preferences.
 * Call this whenever the user changes their consent.
 */
export function updateGoogleConsent(consent: ConsentState) {
  if (!ensureGtag()) return

  const googleConsent = mapConsentToGoogle(consent)
  window.gtag('consent', 'update', googleConsent)
}

/**
 * Initialize Google Consent Mode with stored preferences or defaults.
 * If no stored consent exists, sets defaults to denied.
 */
export function initGoogleConsentMode(
  config: GoogleConsentModeConfig = {},
  storedConsent: ConsentState | null = null
) {
  if (!ensureGtag()) return

  // Always set defaults first (before GTM loads)
  setDefaultConsent(config)

  // If we have stored consent, update immediately
  if (storedConsent) {
    updateGoogleConsent(storedConsent)
  }
}
