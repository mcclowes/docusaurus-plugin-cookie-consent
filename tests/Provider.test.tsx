/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CookieConsentProvider, useCookieConsent } from '../src/client/Provider'

// Helper component to test the hook
function TestConsumer() {
  const {
    preferences,
    loading,
    hasConsent,
    hasCategoryConsent,
    acceptAll,
    rejectOptional,
    rejectAll,
    updatePreferences,
    resetConsent,
  } = useCookieConsent()

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="has-consent">{hasConsent().toString()}</div>
      <div data-testid="preferences">{JSON.stringify(preferences)}</div>
      <div data-testid="analytics-consent">{hasCategoryConsent('analytics').toString()}</div>
      <div data-testid="necessary-consent">{hasCategoryConsent('necessary').toString()}</div>
      <button data-testid="accept-all" onClick={acceptAll}>
        Accept All
      </button>
      <button data-testid="reject-optional" onClick={rejectOptional}>
        Reject Optional
      </button>
      <button data-testid="reject-all" onClick={rejectAll}>
        Reject All
      </button>
      <button data-testid="reset" onClick={resetConsent}>
        Reset
      </button>
      <button
        data-testid="update-analytics"
        onClick={() => updatePreferences({ analytics: true, consentGiven: true })}
      >
        Enable Analytics
      </button>
    </div>
  )
}

describe('CookieConsentProvider', () => {
  const storageKey = 'test-cookie-consent'

  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders children', () => {
    render(
      <CookieConsentProvider storageKey={storageKey}>
        <div data-testid="child">Child content</div>
      </CookieConsentProvider>
    )

    expect(screen.getByTestId('child')).toHaveTextContent('Child content')
  })

  it('starts with loading state and no preferences', async () => {
    render(
      <CookieConsentProvider storageKey={storageKey}>
        <TestConsumer />
      </CookieConsentProvider>
    )

    // After effect runs, loading should be false
    await vi.waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })
    expect(screen.getByTestId('preferences')).toHaveTextContent('null')
    expect(screen.getByTestId('has-consent')).toHaveTextContent('false')
  })

  it('loads preferences from localStorage', async () => {
    const savedPreferences = {
      necessary: true,
      analytics: true,
      marketing: false,
      functional: false,
      consentGiven: true,
      timestamp: Date.now(),
    }
    localStorage.setItem(storageKey, JSON.stringify(savedPreferences))

    render(
      <CookieConsentProvider storageKey={storageKey}>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await vi.waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })
    expect(screen.getByTestId('has-consent')).toHaveTextContent('true')
    expect(screen.getByTestId('analytics-consent')).toHaveTextContent('true')
  })

  it('acceptAll sets all categories to true', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <CookieConsentProvider storageKey={storageKey}>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await vi.waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    await user.click(screen.getByTestId('accept-all'))

    await vi.waitFor(() => {
      expect(screen.getByTestId('has-consent')).toHaveTextContent('true')
    })

    const preferences = JSON.parse(screen.getByTestId('preferences').textContent || '{}')
    expect(preferences.necessary).toBe(true)
    expect(preferences.analytics).toBe(true)
    expect(preferences.marketing).toBe(true)
    expect(preferences.functional).toBe(true)
    expect(preferences.consentGiven).toBe(true)
    expect(preferences.timestamp).toBeDefined()

    // Verify localStorage was updated
    const stored = JSON.parse(localStorage.getItem(storageKey) || '{}')
    expect(stored.consentGiven).toBe(true)
  })

  it('rejectOptional sets only necessary to true', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <CookieConsentProvider storageKey={storageKey}>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await vi.waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    await user.click(screen.getByTestId('reject-optional'))

    await vi.waitFor(() => {
      expect(screen.getByTestId('has-consent')).toHaveTextContent('true')
    })

    const preferences = JSON.parse(screen.getByTestId('preferences').textContent || '{}')
    expect(preferences.necessary).toBe(true)
    expect(preferences.analytics).toBe(false)
    expect(preferences.marketing).toBe(false)
    expect(preferences.functional).toBe(false)
    expect(preferences.consentGiven).toBe(true)
  })

  it('rejectAll behaves same as rejectOptional', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <CookieConsentProvider storageKey={storageKey}>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await vi.waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    await user.click(screen.getByTestId('reject-all'))

    await vi.waitFor(() => {
      expect(screen.getByTestId('has-consent')).toHaveTextContent('true')
    })

    const preferences = JSON.parse(screen.getByTestId('preferences').textContent || '{}')
    expect(preferences.necessary).toBe(true)
    expect(preferences.analytics).toBe(false)
  })

  it('resetConsent clears preferences and localStorage', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    // Start with saved preferences
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: true,
        functional: true,
        consentGiven: true,
      })
    )

    render(
      <CookieConsentProvider storageKey={storageKey}>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await vi.waitFor(() => {
      expect(screen.getByTestId('has-consent')).toHaveTextContent('true')
    })

    await user.click(screen.getByTestId('reset'))

    await vi.waitFor(() => {
      expect(screen.getByTestId('preferences')).toHaveTextContent('null')
    })
    expect(screen.getByTestId('has-consent')).toHaveTextContent('false')
    expect(localStorage.getItem(storageKey)).toBeNull()
  })

  it('updatePreferences updates specific categories', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <CookieConsentProvider storageKey={storageKey}>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await vi.waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    await user.click(screen.getByTestId('update-analytics'))

    await vi.waitFor(() => {
      expect(screen.getByTestId('analytics-consent')).toHaveTextContent('true')
    })

    const preferences = JSON.parse(screen.getByTestId('preferences').textContent || '{}')
    expect(preferences.analytics).toBe(true)
    expect(preferences.marketing).toBe(false)
  })

  it('hasCategoryConsent always returns true for necessary', async () => {
    render(
      <CookieConsentProvider storageKey={storageKey}>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await vi.waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    // Even without consent, necessary should return true
    expect(screen.getByTestId('necessary-consent')).toHaveTextContent('true')
  })

  it('handles corrupted localStorage gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    localStorage.setItem(storageKey, 'invalid-json')

    render(
      <CookieConsentProvider storageKey={storageKey}>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await vi.waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('preferences')).toHaveTextContent('null')
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})

describe('useCookieConsent outside provider', () => {
  it('throws error when used outside provider in browser', () => {
    // The hook throws when context is null and window is defined
    expect(() => {
      render(<TestConsumer />)
    }).toThrow('useCookieConsent must be used within CookieConsentProvider')
  })
})
