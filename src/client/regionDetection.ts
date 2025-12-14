import type { RegionDetectionConfig, RegionDetectionResult } from '../types'
import { GDPR_COUNTRIES } from '../types'

const CACHE_KEY = 'cookie-consent-region-cache'
const DEFAULT_API_URL = 'https://ipapi.co/json/'
const DEFAULT_CACHE_DURATION = 86400000 // 24 hours

/**
 * Mapping of common IANA timezones to likely country codes.
 * This is a best-effort approximation and not 100% accurate.
 */
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // Europe (GDPR regions)
  'Europe/Vienna': 'AT',
  'Europe/Brussels': 'BE',
  'Europe/Sofia': 'BG',
  'Europe/Zagreb': 'HR',
  'Asia/Nicosia': 'CY',
  'Europe/Prague': 'CZ',
  'Europe/Copenhagen': 'DK',
  'Europe/Tallinn': 'EE',
  'Europe/Helsinki': 'FI',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Athens': 'GR',
  'Europe/Budapest': 'HU',
  'Europe/Dublin': 'IE',
  'Europe/Rome': 'IT',
  'Europe/Riga': 'LV',
  'Europe/Vilnius': 'LT',
  'Europe/Luxembourg': 'LU',
  'Europe/Malta': 'MT',
  'Europe/Amsterdam': 'NL',
  'Europe/Warsaw': 'PL',
  'Europe/Lisbon': 'PT',
  'Europe/Bucharest': 'RO',
  'Europe/Bratislava': 'SK',
  'Europe/Ljubljana': 'SI',
  'Europe/Madrid': 'ES',
  'Europe/Stockholm': 'SE',
  'Atlantic/Reykjavik': 'IS',
  'Europe/Vaduz': 'LI',
  'Europe/Oslo': 'NO',
  'Europe/London': 'GB',
  // US timezones
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  // Canada
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Edmonton': 'CA',
  // Other common
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Asia/Tokyo': 'JP',
  'Asia/Singapore': 'SG',
  'Asia/Hong_Kong': 'HK',
}

type CachedRegion = {
  countryCode: string
  timestamp: number
}

function getCachedRegion(cacheDuration: number): string | null {
  if (cacheDuration === 0 || typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const parsed: CachedRegion = JSON.parse(cached)
    if (Date.now() - parsed.timestamp < cacheDuration) {
      return parsed.countryCode
    }
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // Ignore cache errors
  }
  return null
}

function setCachedRegion(countryCode: string): void {
  if (typeof window === 'undefined') return

  try {
    const cacheData: CachedRegion = {
      countryCode,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch {
    // Ignore cache errors
  }
}

function detectRegionFromTimezone(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return TIMEZONE_TO_COUNTRY[timezone] || null
  } catch {
    return null
  }
}

async function detectRegionFromAPI(apiUrl: string): Promise<string | null> {
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    // Support common API response formats
    const countryCode = data.country_code || data.countryCode || data.country || data.country_code2

    if (typeof countryCode === 'string' && countryCode.length === 2) {
      return countryCode.toUpperCase()
    }

    return null
  } catch {
    return null
  }
}

function isConsentRequired(countryCode: string | null, config: RegionDetectionConfig): boolean {
  if (!countryCode) {
    // Detection failed, use fallback behavior
    return config.fallbackBehavior !== 'hide'
  }

  const requireRegions = getRequireRegions(config)
  if (requireRegions.length === 0) {
    // No regions specified, always require consent
    return true
  }

  return requireRegions.includes(countryCode.toUpperCase())
}

function getRequireRegions(config: RegionDetectionConfig): string[] {
  // If explicit requireRegions is provided, use it
  if (config.requireRegions && config.requireRegions.length > 0) {
    return config.requireRegions.map((r) => r.toUpperCase())
  }

  // If requireConsentInGDPRRegions is true (or undefined, defaulting to true), use GDPR countries
  if (config.requireConsentInGDPRRegions !== false) {
    return [...GDPR_COUNTRIES]
  }

  // No regions specified
  return []
}

/**
 * Detect the user's region and determine if consent is required.
 */
export async function detectRegion(config: RegionDetectionConfig): Promise<RegionDetectionResult> {
  const cacheDuration = config.cacheDuration ?? DEFAULT_CACHE_DURATION
  const mode = config.mode ?? 'api'
  const apiUrl = config.apiUrl ?? DEFAULT_API_URL

  // Check cache first
  const cachedCountry = getCachedRegion(cacheDuration)
  if (cachedCountry) {
    return {
      countryCode: cachedCountry,
      requiresConsent: isConsentRequired(cachedCountry, config),
      success: true,
      method: 'cache',
    }
  }

  let countryCode: string | null = null
  let method: RegionDetectionResult['method'] = 'fallback'
  let error: string | undefined

  if (mode === 'timezone') {
    countryCode = detectRegionFromTimezone()
    method = countryCode ? 'timezone' : 'fallback'
    if (!countryCode) {
      error = 'Could not determine region from timezone'
    }
  } else {
    // API mode
    countryCode = await detectRegionFromAPI(apiUrl)
    if (countryCode) {
      method = 'api'
    } else {
      // Fall back to timezone if API fails
      countryCode = detectRegionFromTimezone()
      method = countryCode ? 'timezone' : 'fallback'
      error = countryCode
        ? 'API detection failed, fell back to timezone'
        : 'Region detection failed'
    }
  }

  // Cache successful detection
  if (countryCode && cacheDuration > 0) {
    setCachedRegion(countryCode)
  }

  const result: RegionDetectionResult = {
    countryCode,
    requiresConsent: isConsentRequired(countryCode, config),
    success: !!countryCode,
    method,
    error,
  }

  return result
}

/**
 * Check if a country code is in the GDPR region.
 */
export function isGDPRCountry(countryCode: string): boolean {
  return GDPR_COUNTRIES.includes(countryCode.toUpperCase() as (typeof GDPR_COUNTRIES)[number])
}

/**
 * Clear the cached region data.
 */
export function clearRegionCache(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // Ignore errors
  }
}
