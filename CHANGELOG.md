# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.0.0] - 2026-08-17

### Added

- Browser-safe `readCookieConsent` and `subscribeToCookieConsent` utilities with initial and cross-tab updates.
- `CookieConsentPreferences` for site-owned settings pages and `CookieConsentGate` for optional content.
- `preferencesHref` and `preferencesLinkText` options for linking the banner to detailed settings.

### Fixed

- Accepting or saving preferences no longer grants categories configured with `enabled: false`.

## [4.7.0] - 2026-08-14

### Added

- Optional `consentExpiryDays` configuration with versioned stored preferences.
- Coverage thresholds and a CI build that installs the packed release into the sample site.

### Changed

- Replaced the two identical rejection buttons with one `rejectText` action. The old text options remain as deprecated fallbacks.
- Consent reset now immediately publishes denied optional consent to Google Consent Mode and browser integrations.
- The theme root is now the only banner mount, keeping hooks and the dialog in one React provider.

### Fixed

- Matched button modifier selectors to the kebab-case classes emitted by the dialog.

### Removed

- Removed the `onConsentChange` configuration option because Docusaurus global data can't serialize functions. Use the `cookieConsentChange` browser event instead.

## [4.6.0] - 2026-06-02

### Changed

- Widened `react` and `react-dom` peer dependency ranges to `^18.2.0 || ^19.0.0`, adding React 19 support. Validated against React 19.2.7 (typecheck, build, and full test suite pass).

## [4.1.0] - 2024-12-12

### Added

- Google Consent Mode v2 integration for GTM/GA4/Google Ads
- `googleConsentMode` configuration option with `enabled`, `waitForUpdate`, `adsDataRedaction`, `urlPassthrough`
- `onConsentChange` callback for custom integrations
- `cookieConsentChange` DOM event dispatched on consent changes (for PostHog, Plausible, etc.)
- New exported types: `ConsentState`, `GoogleConsentModeConfig`
- New exported utilities: `setDefaultConsent`, `updateGoogleConsent`, `initGoogleConsentMode`
- Documentation for custom analytics integration (PostHog, Plausible examples)
- Focus trap for keyboard navigation (Tab/Shift+Tab cycles within modal)
- Validation of stored preferences to handle corrupted localStorage data

## [4.0.2] - 2024-12-11

### Added

- CONTRIBUTING.md with development guidelines
- CHANGELOG.md for tracking version history

### Changed

- Updated ACCESSIBILITY.md with correct file references and line numbers

### Removed

- Removed outdated AGENTS.md file

## [4.0.1] - 2024-11-18

### Fixed

- CSS class name mismatches between Modal.css and Modal.tsx
- Hardcoded storageKey in Root.tsx now uses configured value
- Test data type mismatch (label/href instead of text/url)
- `hasCategoryConsent('necessary')` now returns true before consent is given

### Added

- Comprehensive test suite (34 tests)
- ESLint configuration with TypeScript and React plugins
- `npm run lint` and `npm run lint:fix` scripts

## [4.0.0] - 2024-11-07

### Changed

- Major refactor of plugin architecture
- Updated to ESM module format
- Improved TypeScript types

### Added

- Cookie categories (necessary, analytics, marketing, functional)
- `useCookieConsent` hook for checking preferences
- Toast mode option
- Markdown support in description
- Full TypeScript definitions

## [3.1.0]

### Added

- Additional configuration options

## [3.0.0]

### Changed

- Breaking: Updated for Docusaurus 3.x compatibility
- Updated peer dependencies

## [2.0.4]

### Fixed

- Minor bug fixes

## [2.0.3]

### Fixed

- Minor bug fixes

## [2.0.2]

### Added

- Initial public release
