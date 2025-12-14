import cookieConsentPlugin from './plugin'
export default cookieConsentPlugin

export type {
  CookieConsentOptions,
  CookieCategory,
  CookieConsentLink,
  ConsentState,
  GoogleConsentModeConfig,
  RegionDetectionConfig,
  RegionDetectionResult,
  GDPRCountry,
} from './types'

export { GDPR_COUNTRIES } from './types'

// Export hooks for use in user components
export { useCookieConsent } from './client/Provider'
export type { CookiePreferences } from './client/Provider'

// Export Google Consent Mode utilities for advanced use cases
export {
  setDefaultConsent,
  updateGoogleConsent,
  initGoogleConsentMode,
} from './client/googleConsentMode'

// Export region detection utilities
export { detectRegion, isGDPRCountry, clearRegionCache } from './client/regionDetection'
