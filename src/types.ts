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

/**
 * ISO 3166-1 alpha-2 country codes for GDPR countries (EU/EEA + UK).
 * These countries require explicit cookie consent under GDPR.
 */
export const GDPR_COUNTRIES = [
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
  // EEA countries (non-EU)
  'IS', // Iceland
  'LI', // Liechtenstein
  'NO', // Norway
  // UK (post-Brexit still has GDPR equivalent)
  'GB', // United Kingdom
] as const

export type GDPRCountry = (typeof GDPR_COUNTRIES)[number]

/**
 * Region detection configuration for conditionally showing the consent banner.
 * Use this to skip showing the banner in regions where GDPR doesn't apply.
 */
export type RegionDetectionConfig = {
  /**
   * Enable region-based consent detection.
   * When enabled, the plugin will detect the user's region and optionally
   * skip showing the consent banner based on the configuration.
   * @default false
   */
  enabled?: boolean
  /**
   * Detection mode for determining user's region.
   * - 'api': Use an IP geolocation API (default, most accurate)
   * - 'timezone': Infer from browser timezone (less accurate, no network request)
   * @default 'api'
   */
  mode?: 'api' | 'timezone'
  /**
   * Custom API URL for region detection.
   * Must return JSON with a 'country' or 'country_code' field containing ISO 3166-1 alpha-2 code.
   * @default 'https://ipapi.co/json/'
   */
  apiUrl?: string
  /**
   * Only show consent banner for users in these regions (ISO 3166-1 alpha-2 codes).
   * Use this to limit the banner to GDPR regions.
   * If not specified, defaults to GDPR_COUNTRIES when requireConsentInGDPRRegions is true.
   * @example ['DE', 'FR', 'GB'] - Only show in Germany, France, and UK
   */
  requireRegions?: string[]
  /**
   * Convenience option: require consent in all GDPR countries (EU/EEA + UK).
   * Equivalent to setting requireRegions to GDPR_COUNTRIES.
   * @default true
   */
  requireConsentInGDPRRegions?: boolean
  /**
   * Behavior when region detection fails (network error, API unavailable, etc.).
   * - 'show': Show the consent banner (safer for compliance)
   * - 'hide': Hide the consent banner
   * @default 'show'
   */
  fallbackBehavior?: 'show' | 'hide'
  /**
   * Cache detected region in localStorage to avoid repeated API calls.
   * Value in milliseconds. Set to 0 to disable caching.
   * @default 86400000 (24 hours)
   */
  cacheDuration?: number
  /**
   * Callback fired after region detection completes.
   * Useful for logging or analytics.
   */
  onRegionDetected?: (region: RegionDetectionResult) => void
}

/**
 * Result of region detection.
 */
export type RegionDetectionResult = {
  /** ISO 3166-1 alpha-2 country code, or null if detection failed */
  countryCode: string | null
  /** Whether the detected region requires consent */
  requiresConsent: boolean
  /** Whether detection was successful */
  success: boolean
  /** Detection method used */
  method: 'api' | 'timezone' | 'cache' | 'fallback'
  /** Error message if detection failed */
  error?: string
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
   * Google Consent Mode v2 configuration.
   * When enabled, the plugin integrates with Google's consent framework
   * to control GTM, GA4, and Google Ads based on user consent.
   */
  googleConsentMode?: GoogleConsentModeConfig
  /**
   * Callback fired when consent preferences change.
   * Use this for custom integrations with other analytics/tracking tools.
   */
  onConsentChange?: (consent: ConsentState) => void
  /**
   * Region detection configuration for conditionally showing consent.
   * When enabled, the banner can be hidden for users in regions where
   * GDPR doesn't apply (e.g., US users).
   */
  regionDetection?: RegionDetectionConfig
}
