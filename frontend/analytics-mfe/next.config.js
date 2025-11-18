// Temporarily disable module federation for Next.js 15 App Router
// Module federation doesn't support App Router yet
// We'll use a workaround or switch to Pages Router if needed
const NextFederationPlugin = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable module federation for now due to App Router incompatibility
  // To use module federation, switch to Pages Router (pages/ directory)
  webpack: (config, { isServer }) => {
    // Only enable module federation if using Pages Router
    // For now, we'll skip it to allow the app to run
    if (!isServer && false) { // Disabled for App Router
      config.plugins.push(
        new NextFederationPlugin({
          name: 'analyticsMfe',
          filename: 'static/chunks/remoteEntry.js',
          exposes: {
            './Dashboard': './src/components/Dashboard',
            './Reports': './src/components/Reports',
          },
          shared: {
            react: {
              singleton: true,
              requiredVersion: false,
            },
            'react-dom': {
              singleton: true,
              requiredVersion: false,
            },
          },
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;

