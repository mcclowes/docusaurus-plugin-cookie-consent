# Claude Code Instructions

## Project Overview

Docusaurus plugin providing cookie consent UI, preference management, and Google Consent Mode v2 integration.

## Key Commands

```bash
npm run build      # Build plugin
npm run dev        # Watch mode
npm test           # Run tests
npm run test:coverage # Run tests with coverage thresholds
npm run typecheck  # Type check
npm run lint       # Lint code
npm run format     # Format code with Prettier
```

## Architecture

- `src/plugin.ts` - Docusaurus plugin entry (Node.js)
- `src/client/` - Browser-side code (React)
  - `Provider.tsx` - Context provider with consent state + validation
  - `Modal/Modal.tsx` - Cookie consent UI component with focus trap
  - `googleConsentMode.ts` - GTM/GA4 consent integration
- `src/consentStorage.ts` - Versioned storage parsing and serialization
- `src/theme/Root.tsx` - Theme wrapper component
- `src/types.ts` - TypeScript definitions

## Key Features

- Google Consent Mode v2 integration
- `cookieConsentChange` DOM event for custom analytics
- Focus trap for keyboard accessibility
- Stored preferences validation

## Code Style

- TypeScript for all source files
- Prefer concise, well-named functions over comments
- Test alongside implementation
- Run `npm run format` before committing
- Run `npm run lint` to check for issues

## Testing

Tests are in `tests/` and use Vitest. Run `npm run test:coverage` before submitting changes.

## Documentation

- `README.md` - User guide
- `docs/API.md` - Public API reference
- `docs/MIGRATION.md` - Upgrade guidance
- `CHANGELOG.md` - Version history
- `ACCESSIBILITY.md` - Accessibility features
- `CONTRIBUTING.md` - Development setup
- `IMPROVEMENTS.md` - Remaining improvement ideas

## Shared docs site

User-facing changes in this repo should also be reflected in the shared documentation site at `~/Development/docusaurus/docusaurus-plugins-docs/` (separate repo; documents and dogfoods every plugin in this family).

After a change that a consumer can observe — new option, changed default, renamed export, new/removed hook, changed behavior — update both:

- `README.md` here (canonical API reference)
- `docs/cookie-consent/` in `docusaurus-plugins-docs`, at minimum `configuration.md`; also `overview.md` / `getting-started.md` / `hook.md` / the relevant `advanced/*.md` (categories, Google Consent Mode, custom analytics) when the change reaches those topics

Internal refactors, test-only changes, and build tweaks don't need docs-site updates.
