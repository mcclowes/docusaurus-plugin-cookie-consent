import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { GDPR_COUNTRIES } from '../src/types'
import type { RegionDetectionConfig, RegionDetectionResult } from '../src/types'

describe('regionDetection', () => {
  // Store original globals
  const originalFetch = global.fetch
  const originalLocalStorage = global.localStorage

  // Mock implementations
  let mockFetch: ReturnType<typeof vi.fn>
  let mockTimezone: string
  let localStore: Record<string, string>

  beforeEach(async () => {
    vi.resetModules()
    mockTimezone = 'America/New_York'
    localStore = {}

    // Setup localStorage mock
    const localStorageMock = {
      getItem: vi.fn((key: string) => localStore[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStore[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete localStore[key]
      }),
      clear: vi.fn(() => {
        localStore = {}
      }),
      length: 0,
      key: vi.fn(),
    }

    // Setup fetch mock
    mockFetch = vi.fn()

    // Apply mocks
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    })

    Object.defineProperty(global, 'fetch', {
      value: mockFetch,
      writable: true,
      configurable: true,
    })

    // Mock Intl.DateTimeFormat
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(
      () =>
        ({
          resolvedOptions: () => ({ timeZone: mockTimezone }),
          format: () => '',
          formatToParts: () => [],
          formatRange: () => '',
          formatRangeToParts: () => [],
        }) as Intl.DateTimeFormat
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()

    // Restore original globals
    Object.defineProperty(global, 'fetch', {
      value: originalFetch,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    })
  })

  describe('isGDPRCountry', () => {
    it('returns true for EU countries', async () => {
      const { isGDPRCountry } = await import('../src/client/regionDetection')
      expect(isGDPRCountry('DE')).toBe(true)
      expect(isGDPRCountry('FR')).toBe(true)
      expect(isGDPRCountry('IT')).toBe(true)
    })

    it('returns true for EEA countries', async () => {
      const { isGDPRCountry } = await import('../src/client/regionDetection')
      expect(isGDPRCountry('NO')).toBe(true)
      expect(isGDPRCountry('IS')).toBe(true)
      expect(isGDPRCountry('LI')).toBe(true)
    })

    it('returns true for UK', async () => {
      const { isGDPRCountry } = await import('../src/client/regionDetection')
      expect(isGDPRCountry('GB')).toBe(true)
    })

    it('returns false for non-GDPR countries', async () => {
      const { isGDPRCountry } = await import('../src/client/regionDetection')
      expect(isGDPRCountry('US')).toBe(false)
      expect(isGDPRCountry('CA')).toBe(false)
      expect(isGDPRCountry('AU')).toBe(false)
    })

    it('is case insensitive', async () => {
      const { isGDPRCountry } = await import('../src/client/regionDetection')
      expect(isGDPRCountry('de')).toBe(true)
      expect(isGDPRCountry('De')).toBe(true)
    })
  })

  describe('GDPR_COUNTRIES', () => {
    it('contains all EU member states', () => {
      const euCountries = [
        'AT',
        'BE',
        'BG',
        'HR',
        'CY',
        'CZ',
        'DK',
        'EE',
        'FI',
        'FR',
        'DE',
        'GR',
        'HU',
        'IE',
        'IT',
        'LV',
        'LT',
        'LU',
        'MT',
        'NL',
        'PL',
        'PT',
        'RO',
        'SK',
        'SI',
        'ES',
        'SE',
      ]
      euCountries.forEach((country) => {
        expect(GDPR_COUNTRIES).toContain(country)
      })
    })

    it('contains EEA countries', () => {
      expect(GDPR_COUNTRIES).toContain('IS')
      expect(GDPR_COUNTRIES).toContain('LI')
      expect(GDPR_COUNTRIES).toContain('NO')
    })

    it('contains UK', () => {
      expect(GDPR_COUNTRIES).toContain('GB')
    })
  })

  describe('detectRegion', () => {
    describe('with API mode', () => {
      it('detects region from API response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ country_code: 'DE' }),
        })

        const { detectRegion } = await import('../src/client/regionDetection')
        const config: RegionDetectionConfig = {
          enabled: true,
          mode: 'api',
        }

        const result = await detectRegion(config)

        expect(result.countryCode).toBe('DE')
        expect(result.success).toBe(true)
        expect(result.method).toBe('api')
        expect(result.requiresConsent).toBe(true)
      })

      it('detects non-GDPR region and returns requiresConsent false', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ country_code: 'US' }),
        })

        const { detectRegion } = await import('../src/client/regionDetection')
        const config: RegionDetectionConfig = {
          enabled: true,
          mode: 'api',
          requireConsentInGDPRRegions: true,
        }

        const result = await detectRegion(config)

        expect(result.countryCode).toBe('US')
        expect(result.success).toBe(true)
        expect(result.requiresConsent).toBe(false)
      })

      it('supports custom API URL', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ country: 'FR' }),
        })

        const { detectRegion } = await import('../src/client/regionDetection')
        const config: RegionDetectionConfig = {
          enabled: true,
          mode: 'api',
          apiUrl: 'https://custom-api.example.com/geo',
        }

        await detectRegion(config)

        expect(mockFetch).toHaveBeenCalledWith(
          'https://custom-api.example.com/geo',
          expect.any(Object)
        )
      })

      it('falls back when API fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        const { detectRegion } = await import('../src/client/regionDetection')
        const config: RegionDetectionConfig = {
          enabled: true,
          mode: 'api',
        }

        const result = await detectRegion(config)

        // Should fall back to either timezone or fallback mode
        expect(['timezone', 'fallback']).toContain(result.method)
      })
    })

    describe('with timezone mode', () => {
      it('returns fallback when timezone is unknown', async () => {
        mockTimezone = 'Unknown/Timezone'
        vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(
          () =>
            ({
              resolvedOptions: () => ({ timeZone: mockTimezone }),
              format: () => '',
              formatToParts: () => [],
              formatRange: () => '',
              formatRangeToParts: () => [],
            }) as Intl.DateTimeFormat
        )

        const { detectRegion } = await import('../src/client/regionDetection')
        const config: RegionDetectionConfig = {
          enabled: true,
          mode: 'timezone',
          fallbackBehavior: 'show',
        }

        const result = await detectRegion(config)

        expect(result.countryCode).toBeNull()
        expect(result.success).toBe(false)
        expect(result.method).toBe('fallback')
        expect(result.requiresConsent).toBe(true) // fallback shows consent
      })
    })

    describe('with caching', () => {
      it('ignores expired cache', async () => {
        const cachedData = {
          countryCode: 'FR',
          timestamp: Date.now() - 90000000, // Expired
        }
        localStore['cookie-consent-region-cache'] = JSON.stringify(cachedData)

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ country_code: 'DE' }),
        })

        const { detectRegion } = await import('../src/client/regionDetection')
        const config: RegionDetectionConfig = {
          enabled: true,
          mode: 'api',
          cacheDuration: 86400000,
        }

        const result = await detectRegion(config)

        expect(result.countryCode).toBe('DE')
        expect(result.method).toBe('api')
      })

      it('skips caching when cacheDuration is 0', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ country_code: 'DE' }),
        })

        const { detectRegion } = await import('../src/client/regionDetection')
        const config: RegionDetectionConfig = {
          enabled: true,
          mode: 'api',
          cacheDuration: 0,
        }

        await detectRegion(config)

        expect(localStorage.setItem).not.toHaveBeenCalled()
      })
    })

    describe('with custom requireRegions', () => {
      it('requires consent only for specified regions', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ country_code: 'DE' }),
        })

        const { detectRegion } = await import('../src/client/regionDetection')
        const config: RegionDetectionConfig = {
          enabled: true,
          mode: 'api',
          requireRegions: ['DE', 'FR'],
        }

        const result = await detectRegion(config)

        expect(result.requiresConsent).toBe(true)
      })

      it('does not require consent for regions not in list', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ country_code: 'GB' }),
        })

        const { detectRegion } = await import('../src/client/regionDetection')
        const config: RegionDetectionConfig = {
          enabled: true,
          mode: 'api',
          requireRegions: ['DE', 'FR'],
        }

        const result = await detectRegion(config)

        expect(result.requiresConsent).toBe(false)
      })
    })

    describe('fallback behavior', () => {
      it('shows consent by default when detection fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))
        mockTimezone = 'Unknown/Timezone'
        vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(
          () =>
            ({
              resolvedOptions: () => ({ timeZone: mockTimezone }),
              format: () => '',
              formatToParts: () => [],
              formatRange: () => '',
              formatRangeToParts: () => [],
            }) as Intl.DateTimeFormat
        )

        const { detectRegion } = await import('../src/client/regionDetection')
        const config: RegionDetectionConfig = {
          enabled: true,
          mode: 'api',
        }

        const result = await detectRegion(config)

        expect(result.requiresConsent).toBe(true)
      })

      it('hides consent when fallbackBehavior is hide', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))
        mockTimezone = 'Unknown/Timezone'
        vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(
          () =>
            ({
              resolvedOptions: () => ({ timeZone: mockTimezone }),
              format: () => '',
              formatToParts: () => [],
              formatRange: () => '',
              formatRangeToParts: () => [],
            }) as Intl.DateTimeFormat
        )

        const { detectRegion } = await import('../src/client/regionDetection')
        const config: RegionDetectionConfig = {
          enabled: true,
          mode: 'api',
          fallbackBehavior: 'hide',
        }

        const result = await detectRegion(config)

        expect(result.requiresConsent).toBe(false)
      })
    })
  })

  describe('clearRegionCache', () => {
    it('clears cache without error', async () => {
      const { clearRegionCache } = await import('../src/client/regionDetection')
      // Should not throw
      expect(() => clearRegionCache()).not.toThrow()
    })
  })
})
