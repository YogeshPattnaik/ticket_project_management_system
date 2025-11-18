// Module Federation is disabled for Next.js 15 App Router
// We'll use a workaround with dynamic imports or iframes
// For now, we'll create a simple integration

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable module federation for App Router compatibility
  // The shell app will load MFEs via iframes or API integration
  reactStrictMode: true,
  // Allow loading from different ports in development
  async rewrites() {
    return [
      {
        source: '/mfe/:path*',
        destination: '/api/mfe/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
