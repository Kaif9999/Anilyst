/** @type {import('next').NextConfig} */
const config = {
    output: 'standalone',
    experimental: {
      serverActions: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: { 
      unoptimized: true,
      domains: ['images.unsplash.com']
    },
    
    // Add trailing slashes to URLs
    trailingSlash: true,
    // Disable server components for static export
    typescript: {
      ignoreBuildErrors: true,
    }
  };
  
  export default config;