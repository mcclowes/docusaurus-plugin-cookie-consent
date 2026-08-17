import type { LoadContext } from '@docusaurus/types'
import { describe, expect, it, vi } from 'vitest'

import cookieConsentPlugin from '../src/plugin'

const createContext = (): LoadContext =>
  ({
    siteDir: '/tmp/test-site',
  }) as LoadContext

describe('cookieConsentPlugin', () => {
  it('skips content and client modules when disabled', async () => {
    const plugin = cookieConsentPlugin(createContext(), { enabled: false })

    const content = await plugin.loadContent?.()

    expect(content).toBeUndefined()
    expect(plugin.getClientModules?.()).toBeUndefined()
  })

  it('resolves default options when enabled', async () => {
    const plugin = cookieConsentPlugin(createContext(), { enabled: true })

    const content = await plugin.loadContent?.()

    expect(content?.options).toMatchObject({
      enabled: true,
      title: 'Cookie consent',
      storageKey: 'cookie-consent-preferences',
      orientation: 'vertical',
    })

    expect(plugin.getClientModules?.()).toBeUndefined()
  })

  it('sets global data with resolved options during contentLoaded', async () => {
    const plugin = cookieConsentPlugin(createContext(), {
      enabled: true,
      title: 'Custom Title',
      links: [{ label: 'Privacy Policy', href: '/privacy' }],
    })

    const content = await plugin.loadContent?.()
    expect(content).toBeDefined()

    const setGlobalData = vi.fn()
    await plugin.contentLoaded?.({
      content: content!,
      actions: {
        setGlobalData,
      } as unknown,
    })

    expect(setGlobalData).toHaveBeenCalledWith(content)
  })

  it('only exposes JSON-serializable options as global data', async () => {
    const plugin = cookieConsentPlugin(createContext(), {
      title: 'Serializable options',
    })

    const content = await plugin.loadContent?.()

    expect(() => JSON.stringify(content)).not.toThrow()
    expect(JSON.parse(JSON.stringify(content))).toEqual(content)
  })

  it('rejects invalid consent expiry values', () => {
    expect(() => cookieConsentPlugin(createContext(), { consentExpiryDays: 0 })).toThrow(
      'consentExpiryDays must be a positive number'
    )
  })

  it('only restores valid, unexpired consent in the injected head script', () => {
    const plugin = cookieConsentPlugin(createContext(), {
      consentExpiryDays: 30,
      googleConsentMode: { enabled: true },
    })

    const tags = plugin.injectHtmlTags?.()
    const script = tags && 'headTags' in tags ? tags.headTags?.[0]?.innerHTML : undefined

    expect(script).toContain('c.version === 1')
    expect(script).toContain('c.consentGiven === true')
    expect(script).toContain('Date.now() - c.timestamp < 2592000000')
  })
})
