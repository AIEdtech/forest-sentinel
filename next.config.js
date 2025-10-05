/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'unpkg.com',
      'earthengine.googleapis.com',
      'firms.modaps.eosdis.nasa.gov',
      'server.arcgisonline.com'
    ],
  },
  env: {
    NEXT_PUBLIC_EE_PROJECT_ID: process.env.NEXT_PUBLIC_EE_PROJECT_ID,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig