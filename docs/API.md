# API reference

## Plugin options

`CookieConsentOptions` accepts:

| Option                | Type                      | Default                      | Purpose                                      |
| --------------------- | ------------------------- | ---------------------------- | -------------------------------------------- |
| `enabled`             | `boolean`                 | `true`                       | Enable the plugin.                           |
| `title`               | `string`                  | `Cookie consent`             | Dialog heading.                              |
| `description`         | `string`                  | Built-in explanation         | Dialog copy with markdown-style links.       |
| `links`               | `CookieConsentLink[]`     | `[]`                         | Policy links shown in the dialog.            |
| `preferencesHref`     | `string`                  | None                         | Site-owned cookie settings page.             |
| `preferencesLinkText` | `string`                  | `Manage preferences`         | Settings link label.                         |
| `acceptAllText`       | `string`                  | `Accept all`                 | Accept button label.                         |
| `rejectText`          | `string`                  | `Reject optional`            | Optional-cookie rejection label.             |
| `storageKey`          | `string`                  | `cookie-consent-preferences` | `localStorage` key.                          |
| `consentExpiryDays`   | `number`                  | None                         | Positive number of days before re-prompting. |
| `toastMode`           | `boolean`                 | `false`                      | Use the bottom toast layout.                 |
| `orientation`         | `vertical \| horizontal`  | `vertical`                   | Use a card or full-width bottom banner.      |
| `showDetailsButton`   | `boolean`                 | `true`                       | Show category descriptions.                  |
| `categories`          | Category configuration    | Built-in labels              | Override or hide category descriptions.      |
| `googleConsentMode`   | `GoogleConsentModeConfig` | Disabled                     | Configure Google Consent Mode v2.            |

`rejectOptionalText` and `rejectAllText` remain accepted as deprecated fallbacks for `rejectText`.

## Hook

`useCookieConsent()` returns:

| Member               | Type                                                | Purpose                                                    |
| -------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `preferences`        | `CookiePreferences \| null`                         | Current preferences after loading.                         |
| `loading`            | `boolean`                                           | Whether stored preferences are loading.                    |
| `hasConsent`         | `() => boolean`                                     | Whether the user has made a choice.                        |
| `hasCategoryConsent` | `(category: CookieCategory) => boolean`             | Check one category. `necessary` is always true.            |
| `acceptAll`          | `() => void`                                        | Grant every category.                                      |
| `rejectOptional`     | `() => void`                                        | Deny every optional category.                              |
| `rejectAll`          | `() => void`                                        | Backward-compatible alias for `rejectOptional`.            |
| `updatePreferences`  | `(preferences: Partial<CookiePreferences>) => void` | Update selected categories.                                |
| `resetConsent`       | `() => void`                                        | Clear storage, deny optional consent, and show the banner. |

## Browser event

Every consent change dispatches `cookieConsentChange` on `window`. Its `detail` is a `ConsentState`:

```ts
window.addEventListener('cookieConsentChange', (event: CustomEvent<ConsentState>) => {
  if (event.detail.analytics) {
    startAnalytics()
  } else {
    stopAnalytics()
  }
})
```

Use this event for client modules and third-party analytics integrations. Functions in `docusaurus.config.ts` aren't supported because Docusaurus serializes plugin global data as JSON.

## Browser subscription

Client modules can subscribe without reading or patching `localStorage` themselves:

```ts
import { subscribeToCookieConsent } from 'docusaurus-plugin-cookie-consent/client'

const unsubscribe = subscribeToCookieConsent(
  (consent) => {
    if (consent?.analytics) startAnalytics()
    else stopAnalytics()
  },
  { storageKey: 'my-site-cookie-consent' }
)
```

The subscriber receives the current validated value immediately, same-page changes through the plugin event, and changes made in other tabs. It receives `null` when no valid choice exists. Set `emitCurrent: false` to skip the initial call, and call `unsubscribe()` during cleanup.

`readCookieConsent(storageKey, consentExpiryDays)` performs the same validated one-off read. Both utilities are safe during static rendering and return inert values when `window` is unavailable.

## Standalone preference page

The plugin supplies the form while the site owns its route, heading, and policy copy:

```tsx
import Layout from '@theme/Layout'
import { CookieConsentPreferences } from 'docusaurus-plugin-cookie-consent/client'

export default function CookieSettingsPage() {
  return (
    <Layout title="Cookie settings">
      <main className="container margin-vert--lg">
        <h1>Cookie settings</h1>
        <CookieConsentPreferences />
      </main>
    </Layout>
  )
}
```

Set `preferencesHref: '/cookie-settings'` in the plugin options. The banner links to that route and stays hidden there so an undecided visitor can use the form. Pass the same `categories` object to the form when the site overrides labels, descriptions, or visibility.

## Consent-gated content

```tsx
import { CookieConsentGate } from 'docusaurus-plugin-cookie-consent/client'

export function GatedComments() {
  return (
    <CookieConsentGate
      category="functional"
      fallback={<a href="/cookie-settings">Enable functional cookies to view comments.</a>}
    >
      <Comments />
    </CookieConsentGate>
  )
}
```

## Exported types and utilities

The package exports `CookieConsentOptions`, `CookieCategory`, `CookieConsentLink`, `CookiePreferences`, `ConsentState`, and `GoogleConsentModeConfig`. It also exports the browser utilities and React components above. Advanced Google integrations can import `setDefaultConsent`, `updateGoogleConsent`, and `initGoogleConsentMode`.
