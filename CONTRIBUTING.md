# Contributing

Thanks for your interest in contributing to `docusaurus-plugin-cookie-consent`!

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/mcclowes/docusaurus-plugin-cookie-consent.git
   cd docusaurus-plugin-cookie-consent
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

## Available Scripts

| Command                 | Description                     |
| ----------------------- | ------------------------------- |
| `npm run build`         | Build the plugin for production |
| `npm run dev`           | Watch mode for development      |
| `npm run typecheck`     | Run TypeScript type checking    |
| `npm run lint`          | Run ESLint                      |
| `npm run lint:fix`      | Run ESLint with auto-fix        |
| `npm run format`        | Format code with Prettier       |
| `npm run format:check`  | Check code formatting           |
| `npm test`              | Run tests                       |
| `npm run test:coverage` | Run tests and enforce coverage  |
| `npm run test:watch`    | Run tests in watch mode         |

## Testing Locally

To test the plugin in a local Docusaurus site:

```bash
# From your Docusaurus site directory
npm install ../path/to/docusaurus-plugin-cookie-consent

# Or use npm link
cd docusaurus-plugin-cookie-consent
npm link
cd ../your-docusaurus-site
npm link docusaurus-plugin-cookie-consent
```

There's also a sample site in `examples/sample-site` you can use:

```bash
cd examples/sample-site
npm install
npm start
```

## Making Changes

1. Create a new branch for your feature/fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run tests and linting:

   ```bash
   npm run test:coverage
   npm run lint
   npm run typecheck
   ```

4. Update documentation if needed (README.md, ACCESSIBILITY.md)

5. Update CHANGELOG.md with your changes under "Unreleased"

6. Commit your changes with a descriptive message

7. Push and open a pull request

## Code Style

- TypeScript for all source files
- Prefer concise, well-named functions over comments
- Run `npm run format` before committing
- Follow existing patterns in the codebase

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include tests for new functionality
- Update documentation as needed
- Update CHANGELOG.md
- Ensure CI passes

## Reporting Issues

When reporting bugs, please include:

- Plugin version
- Docusaurus version
- Browser and OS
- Steps to reproduce
- Expected vs actual behavior

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
