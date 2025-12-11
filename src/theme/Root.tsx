import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import useGlobalData from '@docusaurus/useGlobalData'
import { CookieConsentProvider } from '../client/Provider'
import { CookieConsentModal } from '../client/Modal'
import type { CookieConsentOptions } from '../types'
import '../client/Modal.css'

export default function Root({ children }: { children: React.ReactNode }) {
  const globalData = useGlobalData()
  const pluginData = globalData?.['docusaurus-plugin-cookie-consent']?.default as
    | {
        options: CookieConsentOptions
      }
    | undefined

  const options = pluginData?.options
  const storageKey = options?.storageKey ?? 'cookie-consent-preferences'

  return (
    <CookieConsentProvider
      storageKey={storageKey}
      googleConsentMode={options?.googleConsentMode}
      onConsentChange={options?.onConsentChange}
    >
      {children}
      {options && <BrowserOnly>{() => <CookieConsentModal options={options} />}</BrowserOnly>}
    </CookieConsentProvider>
  )
}
