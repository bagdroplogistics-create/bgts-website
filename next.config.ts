import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Image optimisation
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },

  // Strict headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  // Redirects: keep old BGTS URL patterns working
  async redirects() {
    return [
      {
        source: '/services/ftl',
        destination: '/services/full-truck-load',
        permanent: true,
      },
      {
        source: '/services/ptl',
        destination: '/services/part-truck-load',
        permanent: true,
      },
      {
        source: '/ekohaul-ev',
        destination: '/ekohaul',
        permanent: true,
      },
    ]
  },

  // Experimental: partial prerendering for faster pages
  experimental: {
    ppr: false,  // enable when stable
  },

  // Compiler: remove console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
