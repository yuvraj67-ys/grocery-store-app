/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  reactStrictMode: true,
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
    localeDetection: false  // ✅ Must be boolean: true or false (not undefined)
  },
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
