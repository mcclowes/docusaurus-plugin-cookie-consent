# Claude Code Instructions

## Project Overview

Docusaurus plugin providing GDPR-compliant cookie consent modal/toast with Google Consent Mode v2 integration.

## Key Commands

```bash
npm run build      # Build plugin
npm run dev        # Watch mode
npm test           # Run tests
npm run typecheck  # Type check
npm run lint       # Lint code
npm run format     # Format code with Prettier
```

## Architecture

- `src/plugin.ts` - Docusaurus plugin entry (Node.js)
- `src/client/` - Browser-side code (React)
  - `Provider.tsx` - Context provider with consent state + validation
  - `Modal.tsx` - Cookie consent UI component with focus trap
  - `googleConsentMode.ts` - GTM/GA4 consent integration
  - `clientModule.tsx` - Auto-injection module
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

Tests in `tests/` directory using Vitest. Run with `npm test`.

## Documentation

- `README.md` - User documentation
- `CHANGELOG.md` - Version history
- `ACCESSIBILITY.md` - A11y features and line references
- `CONTRIBUTING.md` - Development setup
- `IMPROVEMENTS.md` - Remaining improvement ideas
