/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  reactStrictMode: true,
  // Removed 'output: standalone' - causes issues with server components on Vercel free tier
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '**' }
    ],
    deviceSizes: [320, 428, 768, 1024],
    imageSizes: [16, 32, 48, 64, 128],
    formats: ['image/webp'],
  },
  i18n: {
    locales: ['en', 'hi'],
    defaultLocale: 'hi',
    localeDetection: true
  },
  // Ensure compatibility with Vercel serverless
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = withPWA(nextConfig);
