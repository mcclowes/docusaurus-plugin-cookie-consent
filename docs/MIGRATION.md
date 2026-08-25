# Migration guide

## Upcoming release from 4.6

### Replace callback configuration

Remove `onConsentChange` from `docusaurus.config.ts`. Configuration functions couldn't survive Docusaurus global-data serialization and didn't run in the browser.

Listen for the browser event instead:

```ts
window.addEventListener('cookieConsentChange', (event) => {
  const consent = event.detail
  // Start or stop optional services here.
})
```

### Use one rejection label

Replace `rejectOptionalText` and `rejectAllText` with `rejectText`:

```ts
{
  rejectText: 'Essential only'
}
```

The old options remain as fallbacks for compatibility. If both are present, `rejectOptionalText` wins.

### Consider consent expiry

Existing stored preferences remain valid. To ask users again after a fixed period, set a positive number of days:

```ts
{
  consentExpiryDays: 180
}
```

Newly stored records include an internal schema version. Legacy records are still read unless expiry is enabled and the record has no timestamp.

### Reset behavior

`resetConsent()` now immediately denies all optional Google consent signals and dispatches `cookieConsentChange` before showing the banner again. Integrations should treat that event as a request to stop optional services.

## From 3.x to 4.x

Version 4 uses Docusaurus 3, ESM-compatible builds, React context hooks, and category-based preferences. Update configuration links to `{label, href}`, and use `useCookieConsent()` for conditional client behavior.
