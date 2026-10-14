import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'node:url'

const configDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@docusaurus/ExecutionEnvironment': path.resolve(
        configDir,
        './tests/mocks/ExecutionEnvironment.ts'
      ),
      '@docusaurus/BrowserOnly': path.resolve(configDir, './tests/mocks/BrowserOnly.tsx'),
      '@docusaurus/useGlobalData': path.resolve(configDir, './tests/mocks/useGlobalData.ts'),
    },
  },
  test: {
    setupFiles: ['./tests/setup.ts'],
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          include: ['tests/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'client',
          include: ['tests/**/*.test.tsx'],
          environment: 'jsdom',
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/types/**', 'src/**/index.ts'],
      thresholds: {
        statements: 75,
        branches: 65,
        functions: 75,
        lines: 80,
      },
    },
  },
})
