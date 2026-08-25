import React from 'react'
import Layout from '@theme/Layout'
import Heading from '@theme/Heading'
import { CookieConsentPreferences } from 'docusaurus-plugin-cookie-consent/client'

const categories = {
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
}

export default function CookieSettingsPage(): JSX.Element {
  return (
    <Layout title="Cookie settings" description="Choose which optional cookies this site may use.">
      <main className="container margin-vert--lg">
        <Heading as="h1">Cookie settings</Heading>
        <p>Necessary cookies are always active. You can change the optional categories below.</p>
        <CookieConsentPreferences categories={categories} />
      </main>
    </Layout>
  )
}
