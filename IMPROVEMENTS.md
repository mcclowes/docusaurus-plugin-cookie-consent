# Codebase Improvement Suggestions

This document outlines identified improvements for the `docusaurus-plugin-cookie-consent` plugin, organized by priority and category.

## Critical Bugs

### 1. CSS Class Name Mismatch (High Priority)

**Location:** `src/client/Modal.css` and `src/client/Modal.tsx`

The CSS class names don't match between the JavaScript styles object and the CSS file:

| JavaScript (Modal.tsx) | Expected CSS Class | Actual CSS Class |
|------------------------|-------------------|------------------|
| `styles.toastOverlay` | `.cookie-consent-toast-overlay` | `.cookie-consent-toastOverlay` |
| `styles.details` | `.cookie-consent-details` | `.details` |
| `styles.detailsTitle` | `.cookie-consent-details-title` | `.detailsTitle` |
| `styles.categoryLabel` | `.cookie-consent-category-label` | `.cookie-consent-categoryLabel` |
| `styles.categoryRequired` | `.cookie-consent-category-required` | `.cookie-consent-categoryRequired` |
| `styles.categoryDescription` | `.cookie-consent-category-description` | `.cookie-consent-categoryDescription` |
| `styles.srOnly` | `.cookie-consent-sr-only` | `.srOnly` |

**Responsive selectors also affected:** `.modal`, `.toast`, `.title`, `.buttons`, `.buttonsToast`, `.button`

**Fix:** Rename CSS classes to use consistent kebab-case with the `cookie-consent-` prefix throughout.

### 2. Hardcoded storageKey in Root.tsx (Medium Priority)

**Location:** `src/theme/Root.tsx:18`

```tsx
<CookieConsentProvider storageKey="cookie-consent-preferences">
```

The `storageKey` is hardcoded instead of using the configured value from `pluginData.options.storageKey`.

**Fix:**
```tsx
<CookieConsentProvider storageKey={pluginData?.options?.storageKey ?? 'cookie-consent-preferences'}>
```

### 3. Test Data Type Mismatch (Low Priority)

**Location:** `tests/plugin.test.ts:42`

```ts
links: [{ text: 'Privacy Policy', url: '/privacy' }],
```

Uses `text` and `url` but `CookieConsentLink` type expects `label` and `href`.

---

## Test Coverage Gaps

### Current State
- Only **1 test file** with **3 tests** covering `plugin.ts`
- **0% coverage** for React components

### Missing Test Coverage

| Component | Priority | Suggested Tests |
|-----------|----------|-----------------|
| `Provider.tsx` | High | Context provider, localStorage read/write, SSR fallbacks, all hook methods |
| `Modal.tsx` | High | Rendering, button interactions, keyboard navigation, markdown link parsing |
| `clientModule.tsx` | Medium | DOM injection, global data access |
| `Root.tsx` | Medium | Theme integration, BrowserOnly wrapping |

### Suggested Test Structure

```
tests/
├── plugin.test.ts          (existing)
├── Provider.test.tsx       (new - context & hooks)
├── Modal.test.tsx          (new - UI component)
├── clientModule.test.tsx   (new - DOM injection)
└── integration.test.tsx    (new - full flow)
```

---

## Code Quality Improvements

### 1. Add ESLint Configuration

The project lacks ESLint configuration. Suggested setup:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ]
}
```

### 2. Refactor Duplicated localStorage Logic

**Location:** `src/client/Provider.tsx`

The `updateConsent` and `updatePreferences` functions both contain similar localStorage save logic. Consider extracting to a shared helper:

```tsx
const saveToStorage = useCallback((prefs: CookiePreferences) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, JSON.stringify(prefs))
    } catch (error) {
      console.warn('[docusaurus-plugin-cookie-consent] Failed to save preferences:', error)
    }
  }
}, [storageKey])
```

### 3. Extract Constants

**Location:** `src/client/Modal.tsx:112-129`

Move `defaultCategories` to a separate constants file:

```tsx
// src/constants.ts
export const DEFAULT_CATEGORIES: Record<CookieCategory, CategoryConfig> = {
  necessary: { label: 'Necessary', description: '...' },
  // ...
}

export const COOKIE_CATEGORIES: CookieCategory[] = ['necessary', 'analytics', 'marketing', 'functional'] as const
```

### 4. Validate Stored Preferences Schema

**Location:** `src/client/Provider.tsx:72-74`

Add runtime validation when loading from localStorage:

```tsx
const isValidPreferences = (data: unknown): data is CookiePreferences => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'consentGiven' in data &&
    typeof (data as CookiePreferences).consentGiven === 'boolean'
  )
}
```

---

## Feature Suggestions

### 1. Event Callbacks for Analytics Integration

Add optional callbacks to `CookieConsentOptions`:

```ts
type CookieConsentOptions = {
  // ... existing options
  onConsentChange?: (preferences: CookiePreferences) => void
  onAcceptAll?: () => void
  onRejectAll?: () => void
}
```

This allows sites to integrate with analytics platforms when consent changes.

### 2. Consent Expiry/Refresh

Add optional consent expiry:

```ts
type CookieConsentOptions = {
  // ... existing options
  consentExpiryDays?: number  // e.g., 365 days
}
```

Check timestamp on load and re-prompt if expired:

```tsx
const isExpired = preferences.timestamp &&
  Date.now() - preferences.timestamp > expiryDays * 24 * 60 * 60 * 1000
```

### 3. Granular Category Selection UI

The current modal shows category details but doesn't allow granular selection. Consider adding checkboxes for each non-necessary category when "Show Details" is expanded.

### 4. Custom Event Dispatch

Dispatch custom events for external integration:

```tsx
window.dispatchEvent(new CustomEvent('cookieConsentChange', {
  detail: preferences
}))
```

### 5. Complete Focus Trap Implementation

**Location:** `src/client/Modal.tsx`

The ACCESSIBILITY.md mentions focus trapping, but it's not fully implemented. Add Tab/Shift+Tab focus cycling:

```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    // ... implement focus cycling
  }
}
```

---

## TypeScript Improvements

### 1. Use `as const` for Category Array

```tsx
export const COOKIE_CATEGORIES = ['necessary', 'analytics', 'marketing', 'functional'] as const
export type CookieCategory = typeof COOKIE_CATEGORIES[number]
```

### 2. Export Additional Types

Consider exporting these types for better developer experience:

```ts
export type { CookiePreferences, CookieContextType } from './client/Provider'
```

### 3. Stricter Plugin Return Type

```ts
type CookieConsentPlugin = Plugin<CookieConsentPluginContent | undefined> & {
  getThemePath: () => string
  getTypeScriptThemePath: () => string | undefined
}
```

---

## Build & DevOps

### 1. Add Pre-commit Hooks

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": "prettier --write"
  }
}
```

### 2. Add Test Coverage Reporting

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['tests/**', '*.config.*']
    }
  }
})
```

### 3. Add GitHub Actions for Coverage

```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v3
```

---

## Documentation

### 1. Add CHANGELOG.md

Track version history with a proper changelog.

### 2. Add API Reference

Expand README or create separate API documentation for all exported functions and types.

### 3. Add Migration Guide

Document breaking changes between major versions.

---

## Summary by Priority

| Priority | Issue | Effort |
|----------|-------|--------|
| **Critical** | Fix CSS class name mismatch | Low |
| **Critical** | Fix hardcoded storageKey in Root.tsx | Low |
| **High** | Add React component tests | Medium |
| **High** | Fix test type mismatch | Low |
| **Medium** | Add ESLint | Low |
| **Medium** | Add event callbacks | Medium |
| **Medium** | Implement focus trap | Medium |
| **Low** | Refactor duplicated code | Low |
| **Low** | Add consent expiry | Medium |
| **Low** | Add coverage reporting | Low |
