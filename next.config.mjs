/** @type {import('next').NextConfig} */
const config = {
    images: { 
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
    
    // Compression is enabled by default in Next.js
    // swcMinify is always enabled in Next.js 16, no need to specify
    
    // Enable React strict mode for better performance
    reactStrictMode: true,
  };
  
  export default config;