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
```

## Architecture

- `src/plugin.ts` - Docusaurus plugin entry (Node.js)
- `src/client/` - Browser-side code (React)
  - `Provider.tsx` - Context provider with consent state
  - `Modal.tsx` - Cookie consent UI component
  - `googleConsentMode.ts` - GTM/GA4 consent integration
- `src/theme/Root.tsx` - Theme wrapper component
- `src/types.ts` - TypeScript definitions

## Code Style

- TypeScript for all source files
- Prefer concise, well-named functions over comments
- Test alongside implementation
- Run `npm run format` before committing

## Testing

Tests in `tests/` directory using Vitest. Run with `npm test`.
