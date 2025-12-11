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
    expect(plugin.getClientModules?.()).toEqual([])
  })

  it('resolves default options when enabled', async () => {
    const plugin = cookieConsentPlugin(createContext(), { enabled: true })

    const content = await plugin.loadContent?.()

    expect(content?.options).toMatchObject({
      enabled: true,
      title: 'Cookie consent',
      storageKey: 'cookie-consent-preferences',
    })

    const clientModules = plugin.getClientModules?.() ?? []
    expect(clientModules).toHaveLength(1)
    const normalizedPath = clientModules[0]!.replace(/\\/g, '/')
    expect(normalizedPath).toMatch(/client\/clientModule\.js$/)
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
})
