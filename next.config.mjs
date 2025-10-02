/** @type {import('next').NextConfig} */
const config = {
    experimental: {
      serverActions: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: { 
      unoptimized: true,
      domains: ['images.unsplash.com', 'lh3.googleusercontent.com']
    },
    
    typescript: {
      ignoreBuildErrors: true,
    }
  };
  
  export default config;