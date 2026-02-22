import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@slop-factory/shared'],

  // Proxy API requests to the Express server in development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:4000/uploads/:path*',
      },
    ]
  },
}

export default nextConfig
