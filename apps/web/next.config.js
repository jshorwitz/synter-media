/** @type {import('next').NextConfig} */
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async redirects() {
    return [
      {
        source: '/ppc',
        destination: '/optimizations',
        permanent: true,
      },
      {
        source: '/ppc/:path*',
        destination: '/optimizations/:path*',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/workflow/:path*',
        destination: '/api/workflow-proxy?path=:path*',
      },
    ]
  },
}

export default nextConfig
