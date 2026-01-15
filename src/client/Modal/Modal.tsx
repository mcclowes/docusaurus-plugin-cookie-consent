import React, { useState, useEffect, useRef } from 'react'
import { useCookieConsent } from '../Provider'
import type { CookieConsentOptions, CookieCategory } from '../../types'

// Define class names as constants
const styles = {
  overlay: 'cookie-consent-overlay',
  toastOverlay: 'cookie-consent-toast-overlay',
  modal: 'cookie-consent-modal',
  toast: 'cookie-consent-toast',
  title: 'cookie-consent-title',
  description: 'cookie-consent-description',
  links: 'cookie-consent-links',
  buttons: 'cookie-consent-buttons',
  buttonsToast: 'cookie-consent-buttons-toast',
  button: 'cookie-consent-button',
  buttonPrimary: 'cookie-consent-button-primary',
  buttonSecondary: 'cookie-consent-button-secondary',
  buttonText: 'cookie-consent-button-text',
  details: 'cookie-consent-details',
  detailsTitle: 'cookie-consent-details-title',
  category: 'cookie-consent-category',
  categoryLabel: 'cookie-consent-category-label',
  categoryRequired: 'cookie-consent-category-required',
  categoryDescription: 'cookie-consent-category-description',
  srOnly: 'cookie-consent-sr-only',
  externalLinkIcon: 'cookie-consent-external-link-icon',
}

function ExternalLinkIcon() {
  return (
    <svg
      className={styles.externalLinkIcon}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

type CookieConsentModalProps = {
  options: CookieConsentOptions
}

export function CookieConsentModal({ options }: CookieConsentModalProps) {
  const { preferences, loading, acceptAll, rejectOptional, rejectAll } = useCookieConsent()
  const [showDetails, setShowDetails] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Determine if modal should be shown
  const shouldShow = !loading && !preferences?.consentGiven

  // Keyboard and focus management with focus trap
  useEffect(() => {
    // Don't set up event listeners if modal shouldn't be shown
    if (!shouldShow) return
    if (typeof window === 'undefined') return

    const getFocusableElements = (): HTMLElement[] => {
      if (!modalRef.current) return []
      return Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // ESC key - treat as reject all
        rejectAll()
        return
      }

      // Focus trap: Tab and Shift+Tab cycling
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements()
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          // Shift+Tab: if on first element, go to last
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab: if on last element, go to first
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Prevent body scrolling when modal is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus the first button
    setTimeout(() => {
      const focusableElements = getFocusableElements()
      focusableElements[0]?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [shouldShow, rejectAll])

  // Don't render modal if it shouldn't be shown
  if (!shouldShow) {
    return null
  }

  // Render markdown-like links in description
  const renderDescription = (text: string) => {
    if (!text) return null

    // Simple markdown link parsing: [text](url)
    const parts = text.split(/(\[([^\]]+)\]\(([^)]+)\))/g)
    const elements: React.ReactNode[] = []

    for (let i = 0; i < parts.length; i++) {
      if (i % 4 === 0 && parts[i]) {
        // Regular text
        elements.push(parts[i])
      } else if (i % 4 === 1 && parts[i + 1] && parts[i + 2]) {
        // Link match
        const linkText = parts[i + 1]
        const linkUrl = parts[i + 2]
        elements.push(
          <a
            key={i}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${linkText} (opens in new tab)`}
          >
            {linkText}
            <ExternalLinkIcon />
            <span className={styles.srOnly}> (opens in new tab)</span>
          </a>
        )
        i += 2
      }
    }

    return elements.length > 0 ? <>{elements}</> : text
  }

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

  const categories = options.categories || {}
  const categoryList: CookieCategory[] = ['necessary', 'analytics', 'marketing', 'functional']

  const overlayClass = options.toastMode
    ? `${styles.overlay} ${styles.toastOverlay}`
    : styles.overlay

  const modalClass = options.toastMode ? `${styles.modal} ${styles.toast}` : styles.modal

  const buttonsClass = options.toastMode
    ? `${styles.buttons} ${styles.buttonsToast}`
    : styles.buttons

  return (
    <>
      {/* Backdrop overlay */}
      {!options.toastMode && (
        <div
          className={overlayClass}
          aria-hidden="true"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        />
      )}

      {/* Modal */}
      <div
        ref={modalRef}
        className={modalClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        tabIndex={-1}
      >
        <h2 id="cookie-consent-title" className={styles.title}>
          {options.title || 'Cookie consent'}
        </h2>

        <div id="cookie-consent-description" className={styles.description}>
          {renderDescription(
            options.description ||
              'We use cookies to enhance your browsing experience and analyze our traffic.'
          )}
        </div>

        {options.links && options.links.length > 0 && (
          <div className={styles.links}>
            {options.links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${link.label} (opens in new tab)`}
              >
                {link.label}
                <ExternalLinkIcon />
                <span className={styles.srOnly}> (opens in new tab)</span>
              </a>
            ))}
          </div>
        )}

        {showDetails && (
          <div className={styles.details}>
            <h3 className={styles.detailsTitle}>Cookie Categories</h3>
            {categoryList.map((category) => {
              const categoryConfig = categories[category] || defaultCategories[category]
              if ('enabled' in categoryConfig && categoryConfig.enabled === false) return null

              return (
                <div key={category} className={styles.category}>
                  <div className={styles.categoryLabel}>
                    {categoryConfig.label}
                    {category === 'necessary' && (
                      <span className={styles.categoryRequired}>(Required)</span>
                    )}
                  </div>
                  {categoryConfig.description && (
                    <div className={styles.categoryDescription}>{categoryConfig.description}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className={buttonsClass}>
          <button
            onClick={acceptAll}
            className={`${styles.button} ${styles.buttonPrimary}`}
            type="button"
          >
            {options.acceptAllText || 'Accept all'}
          </button>

          {options.rejectOptionalText && (
            <button
              onClick={rejectOptional}
              className={`${styles.button} ${styles.buttonSecondary}`}
              type="button"
            >
              {options.rejectOptionalText}
            </button>
          )}

          <button
            onClick={rejectAll}
            className={`${styles.button} ${styles.buttonSecondary}`}
            type="button"
          >
            {options.rejectAllText || 'Reject all'}
          </button>

          {options.showDetailsButton !== false && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`${styles.button} ${styles.buttonText}`}
              type="button"
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default CookieConsentModal
