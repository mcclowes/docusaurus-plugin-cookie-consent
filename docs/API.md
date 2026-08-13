# API reference

## Plugin options

`CookieConsentOptions` accepts:

| Option              | Type                      | Default                      | Purpose                                      |
| ------------------- | ------------------------- | ---------------------------- | -------------------------------------------- |
| `enabled`           | `boolean`                 | `true`                       | Enable the plugin.                           |
| `title`             | `string`                  | `Cookie consent`             | Dialog heading.                              |
| `description`       | `string`                  | Built-in explanation         | Dialog copy with markdown-style links.       |
| `links`             | `CookieConsentLink[]`     | `[]`                         | Policy links shown in the dialog.            |
| `acceptAllText`     | `string`                  | `Accept all`                 | Accept button label.                         |
| `rejectText`        | `string`                  | `Reject optional`            | Optional-cookie rejection label.             |
| `storageKey`        | `string`                  | `cookie-consent-preferences` | `localStorage` key.                          |
| `consentExpiryDays` | `number`                  | None                         | Positive number of days before re-prompting. |
| `toastMode`         | `boolean`                 | `false`                      | Use the bottom toast layout.                 |
| `showDetailsButton` | `boolean`                 | `true`                       | Show category descriptions.                  |
| `categories`        | Category configuration    | Built-in labels              | Override or hide category descriptions.      |
| `googleConsentMode` | `GoogleConsentModeConfig` | Disabled                     | Configure Google Consent Mode v2.            |

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

## Exported types and utilities

The package exports `CookieConsentOptions`, `CookieCategory`, `CookieConsentLink`, `CookiePreferences`, `ConsentState`, and `GoogleConsentModeConfig`. Advanced Google integrations can also import `setDefaultConsent`, `updateGoogleConsent`, and `initGoogleConsentMode`.
