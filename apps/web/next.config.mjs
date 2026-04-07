import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const payloadServerUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL
const payloadRemotePatterns = []
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const addRemotePattern = (urlValue) => {
  try {
    const parsed = new URL(urlValue)
    payloadRemotePatterns.push({
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port || '',
      pathname: '/**'
    })
  } catch {
    // Ignore malformed URLs and continue with remaining patterns.
  }
}

if (payloadServerUrl) {
  addRemotePattern(payloadServerUrl)
}

if (payloadRemotePatterns.length === 0) {
  addRemotePattern('http://localhost:3001')
  addRemotePattern('http://localhost:3002')
  addRemotePattern('http://127.0.0.1:3001')
  addRemotePattern('http://127.0.0.1:3002')
}

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(dirname, '../..'),
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react']
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: payloadRemotePatterns
  }
}

export default nextConfig
