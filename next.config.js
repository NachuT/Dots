/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    appDir: true,
  },
  // Set port to 3001
  server: {
    port: 3001,
  },
  images: {
    domains: ['avatars.slack-edge.com'],
  },
};

module.exports = nextConfig; 