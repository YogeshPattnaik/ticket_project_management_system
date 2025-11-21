// Module Federation is disabled for Next.js 15 App Router
// We'll use a workaround with dynamic imports or iframes
// For now, we'll create a simple integration

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable module federation for App Router compatibility
  // The shell app will load MFEs via iframes or API integration
  reactStrictMode: true,
  // Transpile workspace packages
  transpilePackages: ['@task-management/shared-ui', '@task-management/dto', '@task-management/interfaces', '@task-management/utils'],
  // Proxy all MFE requests through the shell app
  async rewrites() {
    return [
      // Proxy auth-mfe (port 3001) through /mfe/auth/*
      // This includes all assets and routes
      {
        source: '/mfe/auth/:path*',
        destination: 'http://localhost:3001/:path*',
      },
      // Proxy workspace-mfe (port 3002) through /mfe/workspace/*
      {
        source: '/mfe/workspace/:path*',
        destination: 'http://localhost:3002/:path*',
      },
      // Proxy analytics-mfe (port 3003) through /mfe/analytics/*
      {
        source: '/mfe/analytics/:path*',
        destination: 'http://localhost:3003/:path*',
      },
      // Proxy admin-mfe (port 3004) through /mfe/admin/*
      {
        source: '/mfe/admin/:path*',
        destination: 'http://localhost:3004/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
