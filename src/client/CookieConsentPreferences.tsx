import React, { useEffect, useState } from 'react'
import type { CookieCategory, CookieConsentOptions } from '../types'
import { useCookieConsent } from './Provider'

const defaultCategories: Record<CookieCategory, { label: string; description: string }> = {
  necessary: {
    label: 'Necessary',
    description: 'Essential cookies required for the website to function properly.',
  },
  analytics: {
    label: 'Analytics',
    description: 'Cookies that help us understand how visitors interact with our website.',
  },
  marketing: {
    label: 'Marketing',
    description: 'Cookies used to deliver personalized advertisements.',
  },
  functional: {
    label: 'Functional',
    description: 'Cookies that enable enhanced functionality and personalization.',
  },
}

const optionalCategories: CookieCategory[] = ['analytics', 'marketing', 'functional']

export type CookieConsentPreferencesProps = {
  categories?: CookieConsentOptions['categories']
  saveText?: string
  savedText?: string
  className?: string
}

export function CookieConsentPreferences({
  categories = {},
  saveText = 'Save preferences',
  savedText = 'Preferences saved',
  className,
}: CookieConsentPreferencesProps) {
  const { preferences, loading, updatePreferences } = useCookieConsent()
  const [selection, setSelection] = useState<Record<CookieCategory, boolean>>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!preferences) return
    setSelection({
      necessary: true,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
      functional: preferences.functional,
    })
  }, [preferences])

  if (loading) return null

  const visibleOptionalCategories = optionalCategories.filter(
    (category) => categories[category]?.enabled !== false
  )

  const renderCategory = (category: CookieCategory, required = false) => {
    const categoryConfig = { ...defaultCategories[category], ...categories[category] }
    if (categoryConfig.enabled === false) return null

    return (
      <div className="cookie-consent-preferences-category" key={category}>
        <label className="cookie-consent-preferences-label">
          <span>
            {categoryConfig.label}
            {required && <span className="cookie-consent-category-required">(Required)</span>}
          </span>
          <input
            type="checkbox"
            checked={selection[category]}
            disabled={required}
            onChange={(event) => {
              setSaved(false)
              setSelection((current) => ({ ...current, [category]: event.target.checked }))
            }}
          />
        </label>
        {categoryConfig.description && (
          <p className="cookie-consent-category-description">{categoryConfig.description}</p>
        )}
      </div>
    )
  }

  return (
    <form
      className={['cookie-consent-preferences', className].filter(Boolean).join(' ')}
      onSubmit={(event) => {
        event.preventDefault()
        updatePreferences({
          analytics: categories.analytics?.enabled === false ? false : selection.analytics,
          marketing: categories.marketing?.enabled === false ? false : selection.marketing,
          functional: categories.functional?.enabled === false ? false : selection.functional,
          consentGiven: true,
        })
        setSaved(true)
      }}
    >
      {renderCategory('necessary', true)}
      {visibleOptionalCategories.map((category) => renderCategory(category))}
      <div className="cookie-consent-preferences-actions">
        <button className="cookie-consent-button cookie-consent-button-primary" type="submit">
          {saveText}
        </button>
        <span className="cookie-consent-preferences-status" role="status" aria-live="polite">
          {saved ? savedText : ''}
        </span>
      </div>
    </form>
  )
}
