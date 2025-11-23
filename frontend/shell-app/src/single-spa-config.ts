import { registerApplication, start } from 'single-spa';
import { loadMfeModule } from './utils/loadMfe';

console.log('[single-spa-config] Initializing single-spa...');

// Register all microfrontends
// Using script-based loading for dynamic microfrontend loading
registerApplication({
  name: 'workspace-mfe',
  app: async () => {
    console.log('[single-spa-config] Loading workspace-mfe...');
    const module = await loadMfeModule('http://localhost:3002/src/main.tsx');
    console.log('[single-spa-config] workspace-mfe loaded:', module);
    return module;
  },
  activeWhen: (location) => {
    const path = location.pathname;
    const params = new URLSearchParams(location.search);
    const isActive = path.startsWith('/dashboard') && (!params.get('mfe') || params.get('mfe') === 'workspace');
    if (isActive) {
      console.log('[single-spa-config] workspace-mfe is active');
    }
    return isActive;
  },
});

registerApplication({
  name: 'admin-mfe',
  app: async () => {
    console.log('[single-spa-config] Loading admin-mfe...');
    const module = await loadMfeModule('http://localhost:3004/src/main.tsx');
    console.log('[single-spa-config] admin-mfe loaded:', module);
    return module;
  },
  activeWhen: (location) => {
    const isActive = location.pathname.startsWith('/dashboard') && new URLSearchParams(location.search).get('mfe') === 'admin';
    if (isActive) {
      console.log('[single-spa-config] admin-mfe is active');
    }
    return isActive;
  },
});

registerApplication({
  name: 'auth-mfe',
  app: async () => {
    console.log('[single-spa-config] Loading auth-mfe...');
    const module = await loadMfeModule('http://localhost:3001/src/main.tsx');
    console.log('[single-spa-config] auth-mfe loaded:', module);
    return module;
  },
  activeWhen: (location) => {
    // Active on /auth routes OR /dashboard?mfe=auth
    const isActive = location.pathname.startsWith('/auth') || 
      (location.pathname.startsWith('/dashboard') && new URLSearchParams(location.search).get('mfe') === 'auth');
    if (isActive) {
      console.log('[single-spa-config] auth-mfe is active');
    }
    return isActive;
  },
});

registerApplication({
  name: 'analytics-mfe',
  app: async () => {
    console.log('[single-spa-config] Loading analytics-mfe...');
    const module = await loadMfeModule('http://localhost:3003/src/main.tsx');
    console.log('[single-spa-config] analytics-mfe loaded:', module);
    return module;
  },
  activeWhen: (location) => {
    const isActive = location.pathname.startsWith('/dashboard') && new URLSearchParams(location.search).get('mfe') === 'analytics';
    if (isActive) {
      console.log('[single-spa-config] analytics-mfe is active');
    }
    return isActive;
  },
});

// Start single-spa
console.log('[single-spa-config] Starting single-spa...');
start({
  urlRerouteOnly: true,
});
console.log('[single-spa-config] single-spa started');
