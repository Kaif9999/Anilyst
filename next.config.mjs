/** @type {import('next').NextConfig} */
const config = {
    experimental: {
      serverActions: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: { 
      // Remove unoptimized: true - enable Next.js image optimization
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
        },
      ],
      formats: ['image/avif', 'image/webp'],
    },
    
    typescript: {
      ignoreBuildErrors: true,
    },
    
    // Enable compression
    compress: true,
    
    // Optimize production builds
    swcMinify: true,
    
    // Enable React strict mode for better performance
    reactStrictMode: true,
  };
  
  export default config;