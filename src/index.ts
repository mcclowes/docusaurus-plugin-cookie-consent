import cookieConsentPlugin from './plugin'
export default cookieConsentPlugin

export type {
  CookieConsentOptions,
  CookieCategory,
  CookieConsentLink,
  ConsentState,
  GoogleConsentModeConfig,
} from './types'

// Export hooks for use in user components
export { useCookieConsent } from './client/Provider'
export type { CookiePreferences } from './client/Provider'

// Export Google Consent Mode utilities for advanced use cases
export {
  setDefaultConsent,
  updateGoogleConsent,
  initGoogleConsentMode,
} from './client/googleConsentMode'
