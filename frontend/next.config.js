/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Optimized for Vercel serverless
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '**' }
    ],
    // Optimize for mobile/2G networks
    deviceSizes: [320, 428, 768, 1024],
    imageSizes: [16, 32, 48, 64, 128],
    formats: ['image/webp'],
  },
  // i18n for Hindi/English
  i18n: {
    locales: ['en', 'hi'],
    defaultLocale: 'hi',
    localeDetection: true
  }
};

module.exports = withPWA(nextConfig);
