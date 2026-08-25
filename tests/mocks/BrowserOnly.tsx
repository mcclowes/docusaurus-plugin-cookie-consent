import React from 'react'

export default function BrowserOnly({ children }: { children: () => React.ReactNode }) {
  return <>{children()}</>
}
