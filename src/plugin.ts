import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LoadContext, Plugin } from '@docusaurus/types'
import type { CookieConsentOptions } from './types'

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
  Omit<CookieConsentOptions, 'categories' | 'googleConsentMode' | 'showDetailsButton'>
> & {
  categories?: CookieConsentOptions['categories']
  googleConsentMode?: CookieConsentOptions['googleConsentMode']
  showDetailsButton?: CookieConsentOptions['showDetailsButton']
}

type CookieConsentPluginContent = {
  options: ResolvedCookieConsentOptions
}

export default function cookieConsentPlugin(
  context: LoadContext,
  options: CookieConsentOptions = {}
): Plugin<CookieConsentPluginContent | undefined> {
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
    showDetailsButton: options.showDetailsButton,
    categories: options.categories,
    googleConsentMode: options.googleConsentMode,
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

    injectHtmlTags() {
      if (!resolvedOptions.enabled) return {}
      const gcm = resolvedOptions.googleConsentMode
      if (!gcm?.enabled) return {}

      const waitForUpdate = Number(gcm.waitForUpdate ?? 500)
      const adsRedaction = gcm.adsDataRedaction !== false
      const urlPassthrough = !!gcm.urlPassthrough
      const storageKey = JSON.stringify(resolvedOptions.storageKey)

      const innerHTML = `
(function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  if (window.__cookieConsentDefaultsSet) return;
  window.__cookieConsentDefaultsSet = true;
  window.gtag = window.gtag || gtag;
  gtag('consent','default',{
    ad_storage:'denied',
    ad_user_data:'denied',
    ad_personalization:'denied',
    analytics_storage:'denied',
    functionality_storage:'denied',
    personalization_storage:'denied',
    security_storage:'granted',
    wait_for_update: ${waitForUpdate}
  });
  ${adsRedaction ? "gtag('set','ads_data_redaction',true);" : ''}
  ${urlPassthrough ? "gtag('set','url_passthrough',true);" : ''}
  try {
    var raw = localStorage.getItem(${storageKey});
    if (raw) {
      var c = JSON.parse(raw);
      gtag('consent','update',{
        ad_storage: c.marketing ? 'granted':'denied',
        ad_user_data: c.marketing ? 'granted':'denied',
        ad_personalization: c.marketing ? 'granted':'denied',
        analytics_storage: c.analytics ? 'granted':'denied',
        functionality_storage: c.functional ? 'granted':'denied',
        personalization_storage: c.functional ? 'granted':'denied'
      });
    }
  } catch (e) {}
})();`

      return {
        headTags: [
          {
            tagName: 'script',
            innerHTML,
          },
        ],
      }
    },
  }
}
