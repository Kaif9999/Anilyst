// app/providers.tsx
'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import PostHogPageView from './PostHogPageView'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
      if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          capture_pageview: true  // Disable automatic pageview capture, as we capture manually
        })
      }
  }, [])

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  )
}