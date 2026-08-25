/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  initGoogleConsentMode,
  setDefaultConsent,
  updateGoogleConsent,
} from '../src/client/googleConsentMode'

describe('Google Consent Mode', () => {
  beforeEach(() => {
    window.dataLayer = []
    delete (window as Partial<Window>).gtag
  })

  it('queues denied defaults and configured privacy settings', () => {
    setDefaultConsent({ waitForUpdate: 750, adsDataRedaction: true, urlPassthrough: true })

    expect(window.dataLayer).toEqual([
      [
        'consent',
        'default',
        expect.objectContaining({
          analytics_storage: 'denied',
          ad_storage: 'denied',
          security_storage: 'granted',
          wait_for_update: 750,
        }),
      ],
      ['set', 'ads_data_redaction', true],
      ['set', 'url_passthrough', true],
    ])
  })

  it('maps category preferences to Google consent fields', () => {
    updateGoogleConsent({
      necessary: true,
      analytics: true,
      marketing: false,
      functional: true,
    })

    expect(window.dataLayer).toEqual([
      [
        'consent',
        'update',
        {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'granted',
          functionality_storage: 'granted',
          personalization_storage: 'granted',
          security_storage: 'granted',
        },
      ],
    ])
  })

  it('sets defaults before restoring stored consent', () => {
    const gtag = vi.fn()
    window.gtag = gtag

    initGoogleConsentMode(
      { adsDataRedaction: false },
      { necessary: true, analytics: true, marketing: true, functional: false }
    )

    expect(gtag.mock.calls[0]?.slice(0, 2)).toEqual(['consent', 'default'])
    expect(gtag.mock.calls[1]?.slice(0, 2)).toEqual(['consent', 'update'])
  })
})
