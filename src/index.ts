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
export { CookieConsentGate } from './client/CookieConsentGate'
export type { CookieConsentGateProps } from './client/CookieConsentGate'
export { CookieConsentPreferences } from './client/CookieConsentPreferences'
export type { CookieConsentPreferencesProps } from './client/CookieConsentPreferences'
export {
  COOKIE_CONSENT_CHANGE_EVENT,
  readCookieConsent,
  subscribeToCookieConsent,
} from './client/consent'
export type { CookieConsentSubscriber, CookieConsentSubscriptionOptions } from './client/consent'

// Export Google Consent Mode utilities for advanced use cases
export {
  setDefaultConsent,
  updateGoogleConsent,
  initGoogleConsentMode,
} from './client/googleConsentMode'
