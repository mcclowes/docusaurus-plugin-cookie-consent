import type { Config } from '@docusaurus/types'
import type { ThemeConfig } from '@docusaurus/preset-classic'
import { themes as prismThemes } from 'prism-react-renderer'

const config: Config = {
  title: 'Cookie Consent Demo',
  tagline: 'Showcase of the docusaurus-plugin-cookie-consent',
  url: 'https://example.com',
  baseUrl: '/',
  favicon: 'img/logo.svg',
  organizationName: 'cookie-consent',
  projectName: 'demo',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/mcclowes/docusaurus-plugin-cookie-consent/tree/main/examples/sample-site',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-cookie-consent',
      {
        title: 'We respect your privacy',
        description:
          'We use analytics to understand how our documentation is used so we can keep improving it. You can change your preferences at any time.',
        acceptAllText: 'Accept all cookies',
        rejectText: 'Only necessary',
        consentExpiryDays: 180,
        links: [
          { label: 'Privacy policy', href: '/docs/privacy-policy' },
          { label: 'Cookie usage', href: '/docs/cookie-usage' },
        ],
        categories: {
          analytics: {
            label: 'Analytics cookies',
            description: 'Help us understand how visitors use the site.',
            enabled: true,
          },
          marketing: {
            label: 'Marketing cookies',
            description: 'Used to personalize content based on your interests.',
            enabled: false,
          },
          functional: {
            label: 'Functional cookies',
            description: 'Enable additional site functionality and preferences.',
            enabled: true,
          },
        },
        toastMode: true,
        storageKey: 'cookie-consent-demo-preferences',
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Cookie Consent Demo',
      logo: {
        alt: 'Cookie icon',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/mcclowes/docusaurus-plugin-cookie-consent',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
            {
              label: 'Cookie Usage',
              to: '/docs/cookie-usage',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub issues',
              href: 'https://github.com/mcclowes/docusaurus-plugin-cookie-consent/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Plugin README',
              href: 'https://github.com/mcclowes/docusaurus-plugin-cookie-consent',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Cookie Consent`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies ThemeConfig,
}

export default config
