/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CookieConsentProvider } from '../src/client/Provider'
import { CookieConsentGate } from '../src/client/CookieConsentGate'
import { CookieConsentPreferences } from '../src/client/CookieConsentPreferences'

const storageKey = 'test-cookie-consent'

function renderWithProvider(children: React.ReactNode) {
  return render(<CookieConsentProvider storageKey={storageKey}>{children}</CookieConsentProvider>)
}

describe('cookie consent client components', () => {
  beforeEach(() => localStorage.clear())

  it('shows gated content only after category consent', async () => {
    const user = userEvent.setup()
    renderWithProvider(
      <>
        <CookieConsentGate category="functional" fallback={<p>Comments disabled</p>}>
          <p>Comments enabled</p>
        </CookieConsentGate>
        <CookieConsentPreferences />
      </>
    )

    expect(await screen.findByText('Comments disabled')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: /Functional/ }))
    await user.click(screen.getByRole('button', { name: 'Save preferences' }))

    expect(await screen.findByText('Comments enabled')).toBeInTheDocument()
  })

  it('saves selected categories and confirms the update', async () => {
    const user = userEvent.setup()
    renderWithProvider(<CookieConsentPreferences />)

    const necessary = await screen.findByRole('checkbox', { name: /Necessary/ })
    expect(necessary).toBeChecked()
    expect(necessary).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: /Analytics/ }))
    await user.click(screen.getByRole('button', { name: 'Save preferences' }))

    expect(screen.getByRole('status')).toHaveTextContent('Preferences saved')
    expect(JSON.parse(localStorage.getItem(storageKey) || '{}')).toMatchObject({
      necessary: true,
      analytics: true,
      marketing: false,
      functional: false,
      consentGiven: true,
    })
  })

  it('uses custom categories and denies disabled categories when saving', async () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: true,
        functional: false,
        consentGiven: true,
      })
    )
    const user = userEvent.setup()
    renderWithProvider(
      <CookieConsentPreferences
        categories={{
          analytics: { label: 'Site analytics', description: 'Measure useful pages.' },
          marketing: { label: 'Marketing', enabled: false },
        }}
      />
    )

    expect(await screen.findByRole('checkbox', { name: 'Site analytics' })).toBeInTheDocument()
    expect(screen.getByText('Measure useful pages.')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Marketing' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save preferences' }))
    expect(JSON.parse(localStorage.getItem(storageKey) || '{}').marketing).toBe(false)
  })
})
