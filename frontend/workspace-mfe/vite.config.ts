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
          name: 'workspaceMfe',
          filename: 'remoteEntry.js',
          exposes: {
            './KanbanBoard': './src/components/KanbanBoard',
            './TaskList': './src/components/TaskList',
            './ProjectManagement': './src/components/ProjectManagement',
            './WorkflowDesigner': './src/components/WorkflowDesigner',
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
    port: 3002,
  },
  define: {
    'process.env': '{}',
  },
});
