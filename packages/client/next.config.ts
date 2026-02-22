import type { NextConfig } from 'next'

const API_URL = process.env.INTERNAL_API_URL ?? 'http://localhost:4000'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@slop-factory/shared'],

  // Proxy API requests to the Express server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${API_URL}/uploads/:path*`,
      },
    ]
  },
}

export default nextConfig
