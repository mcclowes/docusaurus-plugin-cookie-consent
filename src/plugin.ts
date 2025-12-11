import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LoadContext, Plugin } from '@docusaurus/types'
import type { CookieConsentOptions } from './types'

const resolveClientModulePath = (context: LoadContext) => {
  // Prefer resolving through the installed package path so bundlers like Vite
  // can treat it as a dependency under node_modules (required for CommonJS interop).
  const nodeModulesPath = join(
    context.siteDir,
    'node_modules',
    'docusaurus-plugin-cookie-consent',
    'dist',
    'client',
    'clientModule.js'
  )

  if (existsSync(nodeModulesPath)) {
    return nodeModulesPath
  }

  try {
    if (typeof __dirname === 'string') {
      return join(__dirname, 'client/clientModule.js')
    }
  } catch {
    // noop - fall back to ESM resolution below
  }

  return fileURLToPath(new URL('./client/clientModule.js', import.meta.url))
}

const resolveThemePath = () => {
  try {
    if (typeof __dirname === 'string') {
      return join(__dirname, 'theme')
    }
  } catch {
    // noop - fall back to ESM resolution below
  }

  return fileURLToPath(new URL('./theme', import.meta.url))
}

const resolveTypeScriptThemePath = () => {
  const candidates: string[] = []

  try {
    if (typeof __dirname === 'string') {
      candidates.push(join(__dirname, '../src/theme'))
    }
  } catch {
    // noop - fall back to ESM resolution below
  }

  if (typeof import.meta !== 'undefined' && typeof import.meta.url === 'string') {
    candidates.push(fileURLToPath(new URL('../src/theme', import.meta.url)))
  }

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return undefined
}

type ResolvedCookieConsentOptions = Required<
  Omit<CookieConsentOptions, 'categories' | 'googleConsentMode' | 'onConsentChange'>
> & {
  categories?: CookieConsentOptions['categories']
  googleConsentMode?: CookieConsentOptions['googleConsentMode']
  onConsentChange?: CookieConsentOptions['onConsentChange']
}

type CookieConsentPluginContent = {
  options: ResolvedCookieConsentOptions
}

export default function cookieConsentPlugin(
  context: LoadContext,
  options: CookieConsentOptions = {}
): Plugin<CookieConsentPluginContent | undefined> {
  const clientModulePath = resolveClientModulePath(context)
  const themePath = resolveThemePath()
  const typeScriptThemePath = resolveTypeScriptThemePath()

  // Enable by default in all environments, but allow override
  const resolvedOptions: ResolvedCookieConsentOptions = {
    enabled: options.enabled ?? true,
    title: options.title ?? 'Cookie consent',
    description: options.description ?? 'We use cookies to enhance your browsing experience.',
    links: options.links ?? [],
    acceptAllText: options.acceptAllText ?? 'Accept all',
    rejectOptionalText: options.rejectOptionalText ?? 'Reject optional',
    rejectAllText: options.rejectAllText ?? 'Reject all',
    storageKey: options.storageKey ?? 'cookie-consent-preferences',
    toastMode: options.toastMode ?? false,
    categories: options.categories,
    googleConsentMode: options.googleConsentMode,
    onConsentChange: options.onConsentChange,
  }

  return {
    name: 'docusaurus-plugin-cookie-consent',

    getThemePath() {
      return themePath
    },
    getTypeScriptThemePath() {
      return typeScriptThemePath ?? themePath
    },

    // Called during site build/serve. Use to produce data to be consumed later.
    async loadContent() {
      if (!resolvedOptions.enabled) return undefined
      const content = {
        options: resolvedOptions,
      }
      return content
    },

    // Called after loadContent. Use to create routes or inject data into the client.
    async contentLoaded({ content, actions }) {
      if (!content) {
        return
      }
      const { setGlobalData } = actions
      setGlobalData(content)
    },

    getClientModules() {
      if (!resolvedOptions.enabled) return []
      return [clientModulePath]
    },
  }
}
