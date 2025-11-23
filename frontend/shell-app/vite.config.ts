import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell_app',
      remotes: {
        auth_mfe: {
          type: 'module',
          name: 'auth_mfe',
          entry: 'http://localhost:3001/remoteEntry.js',
        },
        workspace_mfe: {
          type: 'module',
          name: 'workspace_mfe',
          entry: 'http://localhost:3002/remoteEntry.js',
        },
        analytics_mfe: {
          type: 'module',
          name: 'analytics_mfe',
          entry: 'http://localhost:3003/remoteEntry.js',
        },
        admin_mfe: {
          type: 'module',
          name: 'admin_mfe',
          entry: 'http://localhost:3004/remoteEntry.js',
        },
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.0.0',
          eager: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.0.0',
          eager: false,
        },
        'react-router-dom': {
          singleton: true,
          eager: false,
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    cors: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: true,
  },
  define: {
    'process.env': '{}',
  },
});

