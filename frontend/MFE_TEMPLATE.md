# Microfrontend Template

This is the standard template for creating a new microfrontend in this project.

## File Structure

```
mfe-name/
├── src/
│   ├── main.tsx              # Exports lifecycle functions
│   ├── single-spa-entry.tsx  # Single-SPA configuration
│   ├── App.tsx               # Root component
│   ├── components/           # MFE components
│   ├── store/                # State management (if needed)
│   └── index.css             # Styles
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Standard Files

### 1. `package.json`

```json
{
  "name": "@frontend/mfe-name",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.17.0",
    "@task-management/shared-ui": "^1.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.21.1",
    "single-spa": "^6.0.3",
    "single-spa-react": "^6.0.2"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

### 2. `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 300X, // Unique port for each MFE
    cors: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 300X,
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'system',
      },
    },
  },
  define: {
    'process.env': '{}',
  },
});
```

### 3. `src/single-spa-entry.tsx`

```typescript
import * as LocalReact from 'react';
import * as LocalReactDOM from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import App from './App';
import './index.css';

// Use host React if available, otherwise use local React
let React: any;
let ReactDOM: any;

if (typeof window !== 'undefined') {
  if ((window as any).__REACT__ && (window as any).__REACT_DOM__) {
    React = (window as any).__REACT__;
    ReactDOM = (window as any).__REACT_DOM__;
    console.log('[mfe-name] Using host React');
  } else {
    React = LocalReact;
    ReactDOM = LocalReactDOM;
    console.log('[mfe-name] Using local React');
  }
} else {
  React = LocalReact;
  ReactDOM = LocalReactDOM;
}

// Ensure App is a valid component
if (typeof App !== 'function') {
  throw new Error('App must be a function component');
}

// Create Single-SPA lifecycles
const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err, info, props) {
    return React.createElement('div', { 
      className: 'p-4 bg-red-50 border border-red-200 rounded' 
    },
      React.createElement('h2', { className: 'text-red-800 font-bold' }, 'Error in MFE'),
      React.createElement('p', { className: 'text-red-600' }, err.message)
    );
  },
  domElementGetter: () => {
    let el = document.getElementById('mfe-name-container');
    if (!el) {
      console.warn('[mfe-name] Container not found, creating fallback');
      el = document.createElement('div');
      el.id = 'mfe-name-container';
      el.className = 'w-full h-full min-h-[400px]';
      const mainContent = document.querySelector('main') || document.body;
      mainContent.appendChild(el);
    }
    return el;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
```

### 4. `src/main.tsx`

```typescript
// Export single-spa lifecycle functions
// Also expose on window for script-based loading
import { bootstrap, mount, unmount } from './single-spa-entry';

// Expose on window for script-based loading
if (typeof window !== 'undefined') {
  (window as any).mfeNameMfe = { bootstrap, mount, unmount };
  if (!(window as any).__MFE_MODULES__) {
    (window as any).__MFE_MODULES__ = {};
  }
  (window as any).__MFE_MODULES__['http://localhost:300X/src/main.tsx'] = { 
    bootstrap, 
    mount, 
    unmount 
  };
}

export { bootstrap, mount, unmount };
```

### 5. `src/App.tsx`

```typescript
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-full">
        {/* Your MFE content here */}
      </div>
    </QueryClientProvider>
  );
}

export default App;
```

## Registration in Shell App

Add to `frontend/shell-app/src/single-spa-config.ts`:

```typescript
registerApplication({
  name: 'mfe-name',
  app: async () => {
    console.log('[single-spa-config] Loading mfe-name...');
    const module = await loadMfeModule('http://localhost:300X/src/main.tsx');
    return module;
  },
  activeWhen: (location) => {
    // Define when this MFE should be active
    return location.pathname.startsWith('/your-route');
  },
});
```

## Best Practices

1. **Always use host React**: Check for `window.__REACT__` first
2. **Container IDs**: Use unique container IDs (`mfe-name-container`)
3. **Error Boundaries**: Always include error boundaries
4. **TypeScript**: Use strict TypeScript
5. **State Management**: Use Redux Toolkit for complex state, Zustand for simple state
6. **Server State**: Use React Query for API data



