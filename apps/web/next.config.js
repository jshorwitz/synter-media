/** @type {import('next').NextConfig} */
import path from 'path'

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Force Next to treat the app folder as the root for tracing and module resolution in monorepo
    outputFileTracingRoot: path.join(__dirname),
  },
}

export default nextConfig
