# Docusaurus Plugin Cookie Consent

[![npm version](https://img.shields.io/npm/v/docusaurus-plugin-cookie-consent)](https://www.npmjs.com/package/docusaurus-plugin-cookie-consent)
[![CI](https://github.com/mcclowes/docusaurus-plugin-cookie-consent/actions/workflows/ci.yml/badge.svg)](https://github.com/mcclowes/docusaurus-plugin-cookie-consent/actions/workflows/ci.yml)

![](banner.png)

A cookie consent modal/toast component for Docusaurus sites with configurable text, links, and preference management. Automatically inserts a GDPR-compliant cookie consent banner into your Docusaurus site.

## Features

- ✅ **Configurable text** (markdown compatible)
- ✅ **Configurable links** to privacy policy, cookie policy, etc.
- ✅ **Multiple consent options**: Accept All, Reject Optional, Reject All
- ✅ **Helper context/hooks** to ensure compliance with user preferences
- ✅ **Local storage tracking** of user preferences
- ✅ **Modal or toast mode** (centered modal or bottom toast)
- ✅ **Cookie categories** (Necessary, Analytics, Marketing, Functional)
- ✅ **Google Consent Mode v2** integration for GTM/GA4
- ✅ **TypeScript support** with full type definitions

## Compatibility

- Docusaurus `^3.0.0`
- React `^18.2.0`

## Installation

```bash
npm install docusaurus-plugin-cookie-consent
```

## Quick Start

Add the plugin to your `docusaurus.config.ts` (or `.js`) configuration:

```ts
// docusaurus.config.ts
import type { Config } from '@docusaurus/types'

const config: Config = {
  // ... existing config ...
  plugins: [
    [
      'docusaurus-plugin-cookie-consent',
      {
        title: 'Cookie Consent',
        description: 'We use cookies to enhance your browsing experience and analyze our traffic.',
        links: [
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Cookie Policy', href: '/cookies' },
        ],
      },
    ],
  ],
}

export default config
```

That's it! The cookie consent banner will automatically appear on your site.

## Configuration Options

### Basic Configuration

```typescript
{
  // Enable or disable the plugin (default: true)
  enabled?: boolean

  // Main title/heading text (default: 'Cookie Consent')
  title?: string

  // Main description text - supports markdown links [text](url) (default: 'We use cookies...')
  description?: string

  // Links to privacy policy, cookie policy, etc.
  links?: Array<{
    label: string
    href: string
  }>

  // Button text customization
  acceptAllText?: string        // default: 'Accept All'
  rejectOptionalText?: string  // default: 'Reject Optional'
  rejectAllText?: string       // default: 'Reject All'

  // Local storage key for preferences (default: 'cookie-consent-preferences')
  storageKey?: string

  // Show as toast (bottom of screen) instead of centered modal (default: false)
  toastMode?: boolean
}
```

### Advanced Configuration with Categories

```typescript
{
  // ... basic options ...

  categories?: {
    necessary?: {
      label: string
      description?: string
      enabled?: boolean  // Hide this category
    }
    analytics?: {
      label: string
      description?: string
      enabled?: boolean
    }
    marketing?: {
      label: string
      description?: string
      enabled?: boolean
    }
    functional?: {
      label: string
      description?: string
      enabled?: boolean
    }
  }
}
```

### Google Consent Mode v2 Integration

Integrate with Google Tag Manager, Google Analytics 4, and Google Ads using [Google Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent):

```typescript
{
  // ... other options ...

  googleConsentMode: {
    // Enable Google Consent Mode integration
    enabled: true,

    // Time to wait for consent before loading tags (default: 500ms)
    waitForUpdate: 500,

    // Redact ad click identifiers when ad_storage is denied (default: true)
    adsDataRedaction: true,

    // Pass ad click info through URL parameters when cookies denied (default: false)
    urlPassthrough: false,
  },

  // Optional: callback when consent changes (for custom integrations)
  onConsentChange: (consent) => {
    console.log('Consent updated:', consent)
    // { necessary: true, analytics: true, marketing: false, functional: true }
  },
}
```

**How it works:**

1. **Before GTM loads**: Default consent is set to `denied` for all categories
2. **On page load**: If stored consent exists, it's applied immediately
3. **When user consents**: Google Consent Mode is updated with `gtag('consent', 'update', ...)`

This ensures tracking tags configured for Consent Mode wait for user approval before firing.

### Complete Example

```ts
// docusaurus.config.ts
import type { Config } from '@docusaurus/types'

const config: Config = {
  plugins: [
    [
      'docusaurus-plugin-cookie-consent',
      {
        title: 'We Value Your Privacy',
        description:
          'We use cookies to improve your experience, analyze site traffic, and personalize content. By clicking "Accept All", you consent to our use of cookies. You can also [manage your preferences](/cookie-preferences) or read our [Privacy Policy](/privacy).',
        links: [
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Cookie Policy', href: '/cookies' },
          { label: 'Terms of Service', href: '/terms' },
        ],
        acceptAllText: 'Accept All Cookies',
        rejectOptionalText: 'Essential Only',
        rejectAllText: 'Reject All',
        toastMode: true, // Show as bottom toast instead of modal
        storageKey: 'my-site-cookie-consent',
        categories: {
          necessary: {
            label: 'Essential Cookies',
            description: 'Required for the website to function properly. These cannot be disabled.',
          },
          analytics: {
            label: 'Analytics Cookies',
            description: 'Help us understand how visitors interact with our website.',
          },
          marketing: {
            label: 'Marketing Cookies',
            description:
              'Used to deliver personalized advertisements and track campaign performance.',
          },
          functional: {
            label: 'Functional Cookies',
            description: 'Enable enhanced functionality and personalization.',
          },
        },
      },
    ],
  ],
}

export default config
```

## Using the Cookie Consent Hook

The plugin provides a React hook that you can use in your components to check cookie preferences and ensure compliance.

### Basic Usage

```tsx
import React from 'react'
import { useCookieConsent } from 'docusaurus-plugin-cookie-consent'

export default function AnalyticsComponent() {
  const { hasCategoryConsent, hasConsent } = useCookieConsent()

  // Only load analytics if user has consented
  if (!hasCategoryConsent('analytics')) {
    return null
  }

  // Load your analytics script here
  React.useEffect(() => {
    // Initialize Google Analytics, etc.
    console.log('Analytics enabled')
  }, [])

  return <div>Analytics content</div>
}
```

### Available Hook Methods

```typescript
const {
  // Check if user has given any consent
  hasConsent: () => boolean

  // Check if user has consented to a specific category
  hasCategoryConsent: (category: 'necessary' | 'analytics' | 'marketing' | 'functional') => boolean

  // Get current preferences
  preferences: CookiePreferences | null

  // Programmatically accept all cookies
  acceptAll: () => void

  // Reject optional cookies (keep only necessary)
  rejectOptional: () => void

  // Reject all cookies (except necessary)
  rejectAll: () => void

  // Update specific preferences
  updatePreferences: (prefs: Partial<CookiePreferences>) => void

  // Reset consent (show banner again)
  resetConsent: () => void
} = useCookieConsent()
```

### Cookie Preferences Type

```typescript
type CookiePreferences = {
  necessary: boolean // Always true (cannot be disabled)
  analytics: boolean
  marketing: boolean
  functional: boolean
  consentGiven: boolean
  timestamp?: number // When consent was given
}
```

### Example: Conditional Script Loading

```tsx
import React, { useEffect } from 'react'
import { useCookieConsent } from 'docusaurus-plugin-cookie-consent'

export default function ConditionalAnalytics() {
  const { hasCategoryConsent } = useCookieConsent()

  useEffect(() => {
    if (hasCategoryConsent('analytics')) {
      // Load Google Analytics
      const script = document.createElement('script')
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'
      script.async = true
      document.head.appendChild(script)

      // Initialize gtag
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      gtag('js', new Date())
      gtag('config', 'GA_MEASUREMENT_ID')
    }
  }, [hasCategoryConsent])

  return null
}
```

### Example: Show Different Content Based on Consent

```tsx
import React from 'react'
import { useCookieConsent } from 'docusaurus-plugin-cookie-consent'

export default function PersonalizedContent() {
  const { hasCategoryConsent } = useCookieConsent()

  if (hasCategoryConsent('marketing')) {
    return <div>Personalized recommendations based on your interests</div>
  }

  return <div>Default content</div>
}
```

## Markdown Support in Description

The description field supports markdown-style links:

```js
{
  description: 'Read our [Privacy Policy](/privacy) and [Cookie Policy](/cookies) for more information.'
}
```

Links will be automatically converted to clickable `<a>` tags.

## Local Storage

User preferences are automatically saved to `localStorage` using the key specified in `storageKey` (default: `'cookie-consent-preferences'`). The preferences persist across page reloads and browser sessions.

To reset consent and show the banner again:

```tsx
import { useCookieConsent } from 'docusaurus-plugin-cookie-consent'

function ResetButton() {
  const { resetConsent } = useCookieConsent()

  return <button onClick={resetConsent}>Reset Cookie Preferences</button>
}
```

## Styling

The modal/toast uses inline styles for maximum compatibility. The default styling includes:

- White background with rounded corners
- Shadow for depth
- Responsive design (adapts to screen size)
- Accessible color contrast
- Hover effects on buttons

To customize the appearance, you can:

1. **Override with CSS**: Add custom CSS to your Docusaurus site that targets the cookie consent elements
2. **Use browser dev tools**: Inspect the elements and add custom styles via your site's CSS

Because the plugin renders without static IDs or classes, target elements using attribute selectors (for example, `[role="dialog"]`) or wrap the banner in your own container for easier styling.

## TypeScript Support

Full TypeScript definitions are included. Import types as needed:

```typescript
import type {
  CookieConsentOptions,
  CookieCategory,
  CookieConsentLink,
  CookiePreferences,
  ConsentState,
  GoogleConsentModeConfig,
} from 'docusaurus-plugin-cookie-consent'
```

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode for development
npm run dev

# Type checking
npm run typecheck
```

## Testing Locally

To test the plugin in a local Docusaurus site:

```bash
# From your Docusaurus site directory
npm install ../path/to/docusaurus-plugin-cookie-consent

# Or create a tarball
cd ../path/to/docusaurus-plugin-cookie-consent
npm pack
cd ../../your-docusaurus-site
npm install ../path/to/docusaurus-plugin-cookie-consent/docusaurus-plugin-cookie-consent-*.tgz
```

Then add the plugin to your `docusaurus.config.js` as shown above.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses `localStorage` (available in all modern browsers)

## Using with Google Tag Manager

When using this plugin with `@docusaurus/plugin-google-gtag` or `@docusaurus/plugin-google-tag-manager`, enable Google Consent Mode to ensure tracking respects user consent:

```ts
// docusaurus.config.ts
const config: Config = {
  plugins: [
    // This plugin MUST be listed BEFORE google-gtag/google-tag-manager
    [
      'docusaurus-plugin-cookie-consent',
      {
        googleConsentMode: {
          enabled: true,
        },
        // ... other options
      },
    ],
    // Google plugins load after consent defaults are set
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-XXXXXXXXXX',
      },
    ],
  ],
}
```

### GTM Tag Configuration

For tags in Google Tag Manager to respect consent:

1. Go to your GTM container
2. Navigate to **Admin > Container Settings**
3. Enable **"Enable consent overview"**
4. For each tag, set the appropriate consent requirement:
   - Analytics tags: Require `analytics_storage`
   - Ads/Marketing tags: Require `ad_storage`

Tags configured this way will only fire after the user grants consent.

### Consent Mode Mapping

| Plugin Category | Google Consent Signal                              |
| --------------- | -------------------------------------------------- |
| `analytics`     | `analytics_storage`                                |
| `marketing`     | `ad_storage`, `ad_user_data`, `ad_personalization` |
| `functional`    | `functionality_storage`, `personalization_storage` |
| `necessary`     | `security_storage` (always granted)                |

## Custom Analytics Integration (PostHog, Plausible, etc.)

For analytics tools that don't support Google Consent Mode, the plugin dispatches a custom DOM event whenever consent changes. You can listen to this event to conditionally initialize or shutdown your analytics.

### The `cookieConsentChange` Event

The plugin automatically dispatches a `cookieConsentChange` event on the `window` object whenever consent preferences change:

```typescript
window.addEventListener('cookieConsentChange', (event: CustomEvent) => {
  const consent = event.detail
  // consent = { necessary: true, analytics: boolean, marketing: boolean, functional: boolean }

  if (consent.analytics) {
    // Initialize your analytics
    initAnalytics()
  } else {
    // Shutdown/disable analytics
    shutdownAnalytics()
  }
})
```

### Example: PostHog Integration

Create a client module that listens for consent changes:

```javascript
// src/clientModules/posthog.js
import posthog from 'posthog-js'

const STORAGE_KEY = 'cookie-consent-preferences' // Match your plugin's storageKey

let initialized = false

function initPosthog() {
  if (initialized) return
  posthog.init('YOUR_PROJECT_KEY', { api_host: 'https://app.posthog.com' })
  initialized = true
}

function shutdownPosthog() {
  if (!initialized) return
  posthog.opt_out_capturing()
  initialized = false
}

// Listen for consent changes
window.addEventListener('cookieConsentChange', (event) => {
  if (event.detail.analytics) {
    initPosthog()
  } else {
    shutdownPosthog()
  }
})

// Check initial consent on page load
const stored = localStorage.getItem(STORAGE_KEY)
if (stored) {
  const prefs = JSON.parse(stored)
  if (prefs.analytics) {
    initPosthog()
  }
}
```

Register the client module in a custom plugin:

```javascript
// src/plugins/posthog-plugin.js
module.exports = function posthogPlugin() {
  return {
    name: 'posthog-plugin',
    getClientModules() {
      return [require.resolve('../clientModules/posthog')]
    },
  }
}
```

### Example: Plausible Analytics

Plausible is privacy-friendly and doesn't use cookies, so you may not need consent. But if you want to respect user preferences anyway:

```javascript
window.addEventListener('cookieConsentChange', (event) => {
  if (event.detail.analytics) {
    // Enable Plausible tracking
    delete window.plausible?.q // Clear any queued events
    window.plausible =
      window.plausible ||
      function () {
        ;(window.plausible.q = window.plausible.q || []).push(arguments)
      }
  } else {
    // Disable tracking
    window.plausible = () => {} // No-op function
  }
})
```

### Using the `onConsentChange` Callback

Alternatively, use the `onConsentChange` config option for simpler integrations:

```typescript
// docusaurus.config.ts
{
  plugins: [
    [
      'docusaurus-plugin-cookie-consent',
      {
        onConsentChange: (consent) => {
          if (consent.analytics) {
            // Enable analytics
          } else {
            // Disable analytics
          }
        },
      },
    ],
  ],
}
```

**Note:** The `onConsentChange` callback runs in the React context, while the DOM event works anywhere including vanilla JS client modules.

## GDPR Compliance

This plugin helps you comply with GDPR requirements by:

- ✅ Obtaining explicit consent before setting non-essential cookies
- ✅ Providing clear information about cookie usage
- ✅ Allowing users to reject non-essential cookies
- ✅ Storing consent preferences
- ✅ Providing hooks to conditionally load scripts based on consent

**Note**: This plugin provides the UI and preference management. You are responsible for:

- Actually respecting the preferences in your code (using the hooks)
- Not loading analytics/marketing scripts until consent is given
- Providing accurate privacy and cookie policy pages
- Ensuring your implementation meets your jurisdiction's specific requirements

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
