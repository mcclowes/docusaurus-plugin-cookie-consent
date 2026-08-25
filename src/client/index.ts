// Client modules should not export a default component
// as that can cause SSR issues with Docusaurus

// Re-export public hooks/types for convenience
export * from './hooks'
export { CookieConsentProvider, useCookieConsent } from './Provider'
export type { CookiePreferences } from './Provider'
export { CookieConsentModal } from './Modal'
export { CookieConsentGate } from './CookieConsentGate'
export type { CookieConsentGateProps } from './CookieConsentGate'
export { CookieConsentPreferences } from './CookieConsentPreferences'
export type { CookieConsentPreferencesProps } from './CookieConsentPreferences'
export { COOKIE_CONSENT_CHANGE_EVENT, readCookieConsent, subscribeToCookieConsent } from './consent'
export type { CookieConsentSubscriber, CookieConsentSubscriptionOptions } from './consent'
export { setDefaultConsent, updateGoogleConsent, initGoogleConsentMode } from './googleConsentMode'
