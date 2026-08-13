/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CookieConsentProvider } from '../src/client/Provider'
import { CookieConsentModal } from '../src/client/Modal'
import type { CookieConsentOptions } from '../src/types'

const defaultOptions: CookieConsentOptions = {
  enabled: true,
  title: 'Cookie Consent',
  description: 'We use cookies to enhance your experience.',
  acceptAllText: 'Accept All',
  rejectAllText: 'Reject All',
  rejectOptionalText: 'Reject Optional',
  storageKey: 'test-cookie-consent',
  toastMode: false,
}

function renderModal(options: CookieConsentOptions = defaultOptions) {
  return render(
    <CookieConsentProvider storageKey={options.storageKey || 'test-cookie-consent'}>
      <CookieConsentModal options={options} />
    </CookieConsentProvider>
  )
}

describe('CookieConsentModal', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ''
  })

  it('renders modal when no consent given', async () => {
    renderModal()

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByText('Cookie Consent')).toBeInTheDocument()
    expect(screen.getByText('We use cookies to enhance your experience.')).toBeInTheDocument()
  })

  it('does not render when consent already given', async () => {
    localStorage.setItem(
      'test-cookie-consent',
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: true,
        functional: true,
        consentGiven: true,
      })
    )

    renderModal()

    await vi.waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('renders all buttons', async () => {
    renderModal()

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Accept All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject Optional' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show details' })).toBeInTheDocument()
  })

  it('falls back to legacy reject-all text', async () => {
    const options = { ...defaultOptions, rejectOptionalText: undefined }
    renderModal(options)

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Reject All' })).toBeInTheDocument()
  })

  it('closes modal on Accept All click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderModal()

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Accept All' }))

    await vi.waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Verify preferences were saved
    const stored = JSON.parse(localStorage.getItem('test-cookie-consent') || '{}')
    expect(stored.consentGiven).toBe(true)
    expect(stored.analytics).toBe(true)
  })

  it('closes modal when optional cookies are rejected', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderModal()

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Reject Optional' }))

    await vi.waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    const stored = JSON.parse(localStorage.getItem('test-cookie-consent') || '{}')
    expect(stored.consentGiven).toBe(true)
    expect(stored.analytics).toBe(false)
  })

  it('toggles details section', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderModal()

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Details should not be visible initially
    expect(screen.queryByText('Cookie Categories')).not.toBeInTheDocument()

    // Click show details
    await user.click(screen.getByRole('button', { name: 'Show details' }))

    await vi.waitFor(() => {
      expect(screen.getByText('Cookie Categories')).toBeInTheDocument()
    })
    expect(screen.getByText('Necessary')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
    expect(screen.getByText('Functional')).toBeInTheDocument()

    // Button text should change
    expect(screen.getByRole('button', { name: 'Hide details' })).toBeInTheDocument()

    // Click hide details
    await user.click(screen.getByRole('button', { name: 'Hide details' }))

    await vi.waitFor(() => {
      expect(screen.queryByText('Cookie Categories')).not.toBeInTheDocument()
    })
  })

  it('renders custom category labels and descriptions', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const options: CookieConsentOptions = {
      ...defaultOptions,
      categories: {
        analytics: {
          label: 'Custom Analytics',
          description: 'Custom analytics description',
        },
      },
    }
    renderModal(options)

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Show details' }))

    await vi.waitFor(() => {
      expect(screen.getByText('Custom Analytics')).toBeInTheDocument()
    })
    expect(screen.getByText('Custom analytics description')).toBeInTheDocument()
  })

  it('hides disabled categories', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const options: CookieConsentOptions = {
      ...defaultOptions,
      categories: {
        marketing: {
          label: 'Marketing',
          enabled: false,
        },
      },
    }
    renderModal(options)

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Show details' }))

    await vi.waitFor(() => {
      expect(screen.getByText('Cookie Categories')).toBeInTheDocument()
    })

    expect(screen.queryByText('Marketing')).not.toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('renders links when provided', async () => {
    const options: CookieConsentOptions = {
      ...defaultOptions,
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Cookie Policy', href: '/cookies' },
      ],
    }
    renderModal(options)

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i })
    expect(privacyLink).toHaveAttribute('href', '/privacy')
    expect(privacyLink).toHaveAttribute('target', '_blank')
    expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer')

    const cookieLink = screen.getByRole('link', { name: /Cookie Policy/i })
    expect(cookieLink).toHaveAttribute('href', '/cookies')
  })

  it('renders markdown links in description', async () => {
    const options: CookieConsentOptions = {
      ...defaultOptions,
      description: 'Read our [privacy policy](https://example.com/privacy) for more info.',
    }
    renderModal(options)

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const link = screen.getByRole('link', { name: /privacy policy/i })
    expect(link).toHaveAttribute('href', 'https://example.com/privacy')
  })

  it('closes modal on ESC key', async () => {
    renderModal()

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    fireEvent.keyDown(document, { key: 'Escape' })

    await vi.waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('prevents body scroll when modal is open', async () => {
    renderModal()

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll after modal closes', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    document.body.style.overflow = 'auto'

    renderModal()

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(document.body.style.overflow).toBe('hidden')

    await user.click(screen.getByRole('button', { name: 'Accept All' }))

    await vi.waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    expect(document.body.style.overflow).toBe('auto')
  })

  it('has correct ARIA attributes', async () => {
    renderModal()

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'cookie-consent-title')
    expect(dialog).toHaveAttribute('aria-describedby', 'cookie-consent-description')
  })

  it('renders in toast mode with different styling', async () => {
    const options: CookieConsentOptions = {
      ...defaultOptions,
      toastMode: true,
    }
    renderModal(options)

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('cookie-consent-toast')
  })

  it('renders overlay in non-toast mode', async () => {
    renderModal()

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Check for overlay element
    const overlay = document.querySelector('.cookie-consent-overlay')
    expect(overlay).toBeInTheDocument()
  })

  it('does not render overlay in toast mode', async () => {
    const options: CookieConsentOptions = {
      ...defaultOptions,
      toastMode: true,
    }
    renderModal(options)

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Overlay should not be present (only toast-overlay class would be used if any)
    const overlay = document.querySelector(
      '.cookie-consent-overlay:not(.cookie-consent-toast-overlay)'
    )
    expect(overlay).not.toBeInTheDocument()
  })

  it('shows Required label for necessary category', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderModal()

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Show details' }))

    await vi.waitFor(() => {
      expect(screen.getByText('(Required)')).toBeInTheDocument()
    })
  })

  it('uses custom button text', async () => {
    const options: CookieConsentOptions = {
      ...defaultOptions,
      acceptAllText: 'I Accept',
      rejectText: 'Only Essential',
    }
    renderModal(options)

    await vi.waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'I Accept' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Only Essential' })).toBeInTheDocument()
  })
})
