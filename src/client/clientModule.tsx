// Client module that runs only on the client side
// This injects the cookie consent modal after the page loads

import React from 'react'
import { createRoot } from 'react-dom/client'
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
import { CookieConsentProvider } from './Provider'
import { CookieConsentModal } from './Modal'
import { setDefaultConsent } from './googleConsentMode'
import type { CookieConsentOptions } from '../types'
import './Modal.css'

// Type for Docusaurus window global
interface DocusaurusWindow extends Window {
  docusaurus?: {
    globalData?: Record<string, Record<string, { options?: CookieConsentOptions }>>
  }
}

// Initialize Google Consent Mode defaults IMMEDIATELY (before GTM loads)
// This runs synchronously at module load time - critical for blocking tracking
if (ExecutionEnvironment.canUseDOM) {
  const globalData = (window as DocusaurusWindow)?.docusaurus?.globalData
  const options = globalData?.['docusaurus-plugin-cookie-consent']?.default?.options

  if (options?.googleConsentMode?.enabled) {
    setDefaultConsent(options.googleConsentMode)
  }
}

if (ExecutionEnvironment.canUseDOM) {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent)
  } else {
    initCookieConsent()
  }
}

function initCookieConsent() {
  // Access plugin data from Docusaurus global
  const globalData = (window as DocusaurusWindow)?.docusaurus?.globalData
  const options = globalData?.['docusaurus-plugin-cookie-consent']?.default?.options

  if (!options) return

  // Create a container for the cookie consent modal
  const container = document.createElement('div')
  container.id = 'docusaurus-cookie-consent-root'
  document.body.appendChild(container)

  const storageKey = options.storageKey ?? 'cookie-consent-preferences'

  // Render the cookie consent system
  const root = createRoot(container)
  root.render(
    <CookieConsentProvider
      storageKey={storageKey}
      googleConsentMode={options.googleConsentMode}
      onConsentChange={options.onConsentChange}
      regionDetection={options.regionDetection}
    >
      <CookieConsentModal options={options} />
    </CookieConsentProvider>
  )
}
