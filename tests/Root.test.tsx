/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import Root from '../src/theme/Root'
import { useCookieConsent } from '../src/client/Provider'

function Consumer() {
  const { hasConsent } = useCookieConsent()
  return <span data-testid="consent-state">{String(hasConsent())}</span>
}

describe('theme Root', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides consent state and mounts exactly one dialog', async () => {
    render(
      <Root>
        <Consumer />
      </Root>
    )

    expect(screen.getByTestId('consent-state')).toHaveTextContent('false')
    await waitFor(() => {
      expect(screen.getAllByRole('dialog')).toHaveLength(1)
    })
  })
})
