export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'functional'

export type CookieConsentLink = {
  label: string
  href: string
}

export type ConsentState = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export type GoogleConsentModeConfig = {
  /**
   * Enable Google Consent Mode v2 integration.
   * When enabled, the plugin will automatically update gtag consent state.
   * @default false
   */
  enabled?: boolean
  /**
   * Wait for consent update before loading tags (in milliseconds).
   * Google recommends 500ms for EU users.
   * @default 500
   */
  waitForUpdate?: number
  /**
   * Enable ads_data_redaction when ad_storage is denied.
   * @default true
   */
  adsDataRedaction?: boolean
  /**
   * Enable URL passthrough for ad click information when cookies are denied.
   * @default false
   */
  urlPassthrough?: boolean
}

export type CookieConsentOptions = {
  /**
   * Enable or disable the cookie consent banner
   */
  enabled?: boolean
  /**
   * Main title/heading text for the cookie consent modal
   */
  title?: string
  /**
   * Main description text (markdown compatible)
   */
  description?: string
  /**
   * Links to privacy policy, cookie policy, etc.
   */
  links?: CookieConsentLink[]
  /**
   * Text for the "Accept All" button
   */
  acceptAllText?: string
  /**
   * Text for the "Reject Optional" button (only rejects non-necessary cookies)
   */
  rejectOptionalText?: string
  /**
   * Text for the "Reject All" button (rejects all except necessary)
   */
  rejectAllText?: string
  /**
   * Local storage key for storing consent preferences
   */
  storageKey?: string
  /**
   * Number of days before saved consent expires and the banner is shown again.
   * Omit to keep consent until the user resets it.
   */
  consentExpiryDays?: number
  /**
   * Show the modal as a toast (bottom of screen) instead of centered modal
   */
  toastMode?: boolean
  /**
   * Cookie categories and their descriptions
   */
  categories?: {
    [key in CookieCategory]?: {
      label: string
      description?: string
      enabled?: boolean
    }
  }
  /**
   * Show the "Show Details" button to expand cookie category details.
   * @default true
   */
  showDetailsButton?: boolean
  /**
   * Google Consent Mode v2 configuration.
   * When enabled, the plugin integrates with Google's consent framework
   * to control GTM, GA4, and Google Ads based on user consent.
   */
  googleConsentMode?: GoogleConsentModeConfig
}
