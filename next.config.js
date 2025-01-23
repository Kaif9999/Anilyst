/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
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
  
  module.exports = nextConfig;