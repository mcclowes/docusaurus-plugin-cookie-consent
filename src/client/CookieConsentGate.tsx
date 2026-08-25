import React from 'react'
import type { CookieCategory } from '../types'
import { useCookieConsent } from './Provider'

export type CookieConsentGateProps = {
  category: CookieCategory
  children: React.ReactNode
  fallback?: React.ReactNode
  loadingFallback?: React.ReactNode
}

export function CookieConsentGate({
  category,
  children,
  fallback = null,
  loadingFallback = null,
}: CookieConsentGateProps) {
  const { loading, hasCategoryConsent } = useCookieConsent()

  if (loading) return <>{loadingFallback}</>
  if (!hasCategoryConsent(category)) return <>{fallback}</>

  return <>{children}</>
}
