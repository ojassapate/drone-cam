/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle WebSocket on the server
    if (isServer) {
      config.externals.push('ws');
    }
    return config;
  },
  // Enable experimental features for WebSocket support
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
