import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const payloadServerUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL
let payloadRemotePattern
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (payloadServerUrl) {
  try {
    const payloadUrl = new URL(payloadServerUrl)
    payloadRemotePattern = {
      protocol: payloadUrl.protocol.replace(':', ''),
      hostname: payloadUrl.hostname,
      port: payloadUrl.port || '',
      pathname: '/**'
    }
  } catch {
    payloadRemotePattern = undefined
  }
}

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(dirname, '../..'),
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: payloadRemotePattern ? [payloadRemotePattern] : []
  }
}

export default nextConfig
