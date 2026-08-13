import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@docusaurus/ExecutionEnvironment': path.resolve(
        __dirname,
        './tests/mocks/ExecutionEnvironment.ts'
      ),
      '@docusaurus/BrowserOnly': path.resolve(__dirname, './tests/mocks/BrowserOnly.tsx'),
      '@docusaurus/useGlobalData': path.resolve(__dirname, './tests/mocks/useGlobalData.ts'),
    },
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environmentMatchGlobs: [
      // Use jsdom for component tests
      ['tests/**/*.test.tsx', 'jsdom'],
      // Use node for plugin tests
      ['tests/**/*.test.ts', 'node'],
    ],
    setupFiles: ['./tests/setup.ts'],
  },
})
