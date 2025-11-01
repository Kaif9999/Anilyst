// app/providers.tsx
'use client'

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Lazy load PostHog
const PostHogProvider = dynamic(() => import('./PostHogProvider'), {
  ssr: false,
});

export function PostHogProviderWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <>{children}</>;
  }
  
  return <PostHogProvider>{children}</PostHogProvider>;
}