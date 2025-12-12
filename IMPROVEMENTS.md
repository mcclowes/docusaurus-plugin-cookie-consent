# Codebase Improvement Suggestions

This document outlines identified improvements for the `docusaurus-plugin-cookie-consent` plugin, organized by priority and category.

## Completed Fixes

### 1. CSS Class Name Mismatch - FIXED

All CSS class names in `Modal.css` now match the JavaScript styles object in `Modal.tsx`:
- `cookie-consent-toast-overlay`
- `cookie-consent-details`, `cookie-consent-details-title`
- `cookie-consent-category-label`, `cookie-consent-category-required`, `cookie-consent-category-description`
- `cookie-consent-sr-only`
- Responsive media query selectors

### 2. Hardcoded storageKey in Root.tsx - FIXED

`Root.tsx` now uses the configured `storageKey` from plugin options:
```tsx
const storageKey = pluginData?.options?.storageKey ?? 'cookie-consent-preferences'
```

### 3. Test Data Type Mismatch - FIXED

Test file now uses correct `CookieConsentLink` type properties (`label`/`href` instead of `text`/`url`).

### 4. hasCategoryConsent for Necessary Cookies - FIXED

`hasCategoryConsent('necessary')` now returns `true` even before consent is given, compliant with GDPR (necessary cookies don't require consent).

### 5. Test Coverage - SIGNIFICANTLY IMPROVED

Added comprehensive test suite:
- **Provider.test.tsx** (11 tests): Context provider, localStorage, all hook methods, error handling
- **Modal.test.tsx** (20 tests): Rendering, button interactions, keyboard navigation, ARIA attributes, toast mode

Total: **34 tests** (up from 3)

### 6. ESLint Configuration - ADDED

Added `eslint.config.js` with TypeScript and React plugins. New npm scripts:
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues

---

## Remaining Improvements

### Code Quality (Medium Priority)

#### 1. Refactor Duplicated localStorage Logic

**Location:** `src/client/Provider.tsx`

The `updateConsent` and `updatePreferences` functions both contain similar localStorage save logic. Consider extracting to a shared helper.

#### 2. Extract Constants

Move `defaultCategories` from `Modal.tsx` to a separate constants file.

#### 3. Validate Stored Preferences Schema - DONE

Added `validatePreferences()` function that validates stored data shape and removes corrupted preferences.

---

### Feature Suggestions (Medium Priority)

#### 1. Event Callbacks for Analytics Integration - DONE

Added `onConsentChange` callback to `CookieConsentOptions`:
```ts
onConsentChange?: (consent: ConsentState) => void
```

Also added full Google Consent Mode v2 integration via `googleConsentMode` option.

#### 2. Consent Expiry/Refresh

Add optional consent expiry that re-prompts users after a configurable period:
```ts
consentExpiryDays?: number  // e.g., 365 days
```

#### 3. Granular Category Selection UI

Add checkboxes for each non-necessary category when "Show Details" is expanded.

#### 4. Custom Event Dispatch - DONE

Now dispatches `cookieConsentChange` event on consent changes.

#### 5. Complete Focus Trap Implementation - DONE

Added full Tab/Shift+Tab focus cycling within the modal.

---

### TypeScript Improvements (Low Priority)

#### 1. Use `as const` for Category Array

```tsx
export const COOKIE_CATEGORIES = ['necessary', 'analytics', 'marketing', 'functional'] as const
export type CookieCategory = typeof COOKIE_CATEGORIES[number]
```

#### 2. Export Additional Types

Export `CookiePreferences` and `CookieContextType` for better developer experience.

---

### Build & DevOps (Low Priority)

#### 1. Add Pre-commit Hooks

Configure husky and lint-staged for automated formatting on commit.

#### 2. Add Test Coverage Reporting

Configure Vitest coverage with v8 provider and integrate with CI.

#### 3. Add Additional Tests

- `clientModule.test.tsx` - DOM injection testing
- `Root.test.tsx` - Theme integration testing
- Integration tests for full consent flow

---

### Documentation (Low Priority)

#### 1. Add CHANGELOG.md

Track version history with a proper changelog.

#### 2. Add API Reference

Expand README or create separate API documentation for all exported functions and types.

#### 3. Add Migration Guide

Document breaking changes between major versions.

---

## Summary

| Status | Issue | Priority |
|--------|-------|----------|
| **DONE** | Fix CSS class name mismatch | Critical |
| **DONE** | Fix hardcoded storageKey in Root.tsx | Critical |
| **DONE** | Fix test type mismatch | High |
| **DONE** | Fix hasCategoryConsent for necessary | High |
| **DONE** | Add React component tests | High |
| **DONE** | Add ESLint | Medium |
| **DONE** | Add event callbacks (onConsentChange, Google Consent Mode) | Medium |
| **DONE** | Implement focus trap | Medium |
| **DONE** | Validate stored preferences | Medium |
| **DONE** | Custom DOM event dispatch | Medium |
| Pending | Add consent expiry | Medium |
| Pending | Refactor duplicated code | Low |
| Pending | Add coverage reporting | Low |
| Pending | Add pre-commit hooks | Low |
