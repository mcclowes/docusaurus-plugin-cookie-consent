/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readCookieConsent, subscribeToCookieConsent } from '../src/client/consent'

const storageKey = 'test-cookie-consent'
const grantedConsent = {
  version: 1,
  necessary: true,
  analytics: true,
  marketing: false,
  functional: true,
  consentGiven: true,
  timestamp: Date.now(),
}

describe('browser consent utilities', () => {
  beforeEach(() => localStorage.clear())

  it('reads and validates stored consent', () => {
    localStorage.setItem(storageKey, JSON.stringify(grantedConsent))

    expect(readCookieConsent(storageKey)).toEqual({
      necessary: true,
      analytics: true,
      marketing: false,
      functional: true,
    })
  })

  it('returns null for missing, invalid, or incomplete consent', () => {
    expect(readCookieConsent(storageKey)).toBeNull()

    localStorage.setItem(storageKey, 'invalid')
    expect(readCookieConsent(storageKey)).toBeNull()

    localStorage.setItem(storageKey, JSON.stringify({ ...grantedConsent, consentGiven: false }))
    expect(readCookieConsent(storageKey)).toBeNull()
  })

  it('emits current consent and listens for in-page changes', () => {
    localStorage.setItem(storageKey, JSON.stringify(grantedConsent))
    const subscriber = vi.fn()
    const unsubscribe = subscribeToCookieConsent(subscriber, { storageKey })

    expect(subscriber).toHaveBeenCalledWith({
      necessary: true,
      analytics: true,
      marketing: false,
      functional: true,
    })

    const changed = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    }
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: changed }))
    expect(subscriber).toHaveBeenLastCalledWith(changed)

    unsubscribe()
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: grantedConsent }))
    expect(subscriber).toHaveBeenCalledTimes(2)
  })

  it('listens for consent updates from other tabs', () => {
    const subscriber = vi.fn()
    const unsubscribe = subscribeToCookieConsent(subscriber, {
      storageKey,
      emitCurrent: false,
    })

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: storageKey,
        newValue: JSON.stringify(grantedConsent),
      })
    )
    expect(subscriber).toHaveBeenCalledWith({
      necessary: true,
      analytics: true,
      marketing: false,
      functional: true,
    })

    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: null }))
    expect(subscriber).toHaveBeenLastCalledWith(null)
    unsubscribe()
  })
})
