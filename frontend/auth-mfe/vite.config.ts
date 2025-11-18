import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Module Federation - dynamic import to handle different export styles
let federationPlugin: any;
try {
  const mfModule = require('@module-federation/vite');
  federationPlugin = mfModule.default || mfModule.federation || mfModule;
} catch (e) {
  console.warn('Module federation not available, running without it');
  federationPlugin = () => ({ name: 'noop-federation' });
}

export default defineConfig({
  plugins: [
    react(),
    typeof federationPlugin === 'function' 
      ? federationPlugin({
          name: 'authMfe',
          filename: 'remoteEntry.js',
          exposes: {
            './Login': './src/components/Login',
            './Register': './src/components/Register',
            './Profile': './src/components/Profile',
          },
          shared: {
            react: {
              singleton: true,
              requiredVersion: '^19.0.0',
            },
            'react-dom': {
              singleton: true,
              requiredVersion: '^19.0.0',
            },
          },
        })
      : federationPlugin,
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 3001,
  },
  define: {
    'process.env': '{}',
  },
});
