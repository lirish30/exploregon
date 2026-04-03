/** @type {import('next').NextConfig} */
const payloadServerUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL
let payloadRemotePattern

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
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: payloadRemotePattern ? [payloadRemotePattern] : []
  }
}

export default nextConfig
