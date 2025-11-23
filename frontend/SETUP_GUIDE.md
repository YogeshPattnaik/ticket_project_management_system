# Industry-Level Microfrontend Setup Guide

## Overview

This is a complete, industry-standard microfrontend architecture using:
- **Single-SPA** for orchestration
- **React 19** for all applications
- **Vite** for build tooling
- **TypeScript** for type safety

## Architecture Principles

1. **Single React Instance**: All MFEs share React from the shell app
2. **Independent Development**: Each MFE can be developed separately
3. **Lazy Loading**: MFEs load on-demand based on routes
4. **Type Safety**: Full TypeScript support
5. **State Isolation**: Each MFE manages its own state

## Project Structure

```
frontend/
├── shell-app/              # Host/Container application
│   ├── src/
│   │   ├── main.tsx       # Entry point - exposes React
│   │   ├── App.tsx        # Root component with routing
│   │   ├── single-spa-config.ts  # Single-SPA registration
│   │   ├── components/    # Shell components (Header, Navigation)
│   │   ├── pages/         # Shell pages (Home, Dashboard wrapper)
│   │   ├── store/         # Redux store (global state)
│   │   └── utils/         # Utilities
│   ├── vite.config.ts
│   └── package.json
│
├── auth-mfe/              # Authentication microfrontend
│   ├── src/
│   │   ├── main.tsx       # Exports lifecycle functions
│   │   ├── single-spa-entry.tsx  # Single-SPA configuration
│   │   ├── App.tsx        # Root component
│   │   └── components/    # MFE components
│   ├── vite.config.ts
│   └── package.json
│
├── workspace-mfe/         # Workspace microfrontend
├── analytics-mfe/         # Analytics microfrontend
├── admin-mfe/            # Admin microfrontend
│
└── shared-ui/            # Shared component library
    ├── src/
    │   ├── components/    # Shared components
    │   ├── hooks/         # Shared hooks
    │   └── utils/         # Shared utilities
    └── package.json
```

## Installation & Setup

### 1. Install Dependencies

```bash
# Shell App
cd frontend/shell-app
npm install

# Auth MFE
cd ../auth-mfe
npm install

# Workspace MFE
cd ../workspace-mfe
npm install

# Analytics MFE
cd ../analytics-mfe
npm install

# Admin MFE
cd ../admin-mfe
npm install

# Shared UI
cd ../shared-ui
npm install
```

### 2. Start Development Servers

**Terminal 1 - Shell App:**
```bash
cd frontend/shell-app
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Auth MFE:**
```bash
cd frontend/auth-mfe
npm run dev
# Runs on http://localhost:3001
```

**Terminal 3 - Workspace MFE:**
```bash
cd frontend/workspace-mfe
npm run dev
# Runs on http://localhost:3002
```

**Terminal 4 - Analytics MFE:**
```bash
cd frontend/analytics-mfe
npm run dev
# Runs on http://localhost:3003
```

**Terminal 5 - Admin MFE:**
```bash
cd frontend/admin-mfe
npm run dev
# Runs on http://localhost:3004
```

### 3. Access the Application

Open `http://localhost:3000` in your browser. The shell app will:
- Load the appropriate MFE based on the route
- Share React instance with all MFEs
- Handle routing between MFEs

## Routing

- `/` - Home page (shell app)
- `/auth` - Auth MFE (login/register)
- `/dashboard` - Dashboard (workspace MFE by default)
- `/dashboard?mfe=workspace` - Workspace MFE
- `/dashboard?mfe=analytics` - Analytics MFE
- `/dashboard?mfe=admin` - Admin MFE

## React Sharing

The shell app exposes React on `window.__REACT__` and `window.__REACT_DOM__`. Each MFE:
1. Checks for host React first
2. Falls back to local React if not available
3. Uses the shared instance to avoid conflicts

## State Management

- **Global State** (Shell): Redux Toolkit for auth, UI preferences
- **MFE State**: Each MFE can use Redux, Zustand, or React Query
- **Server State**: React Query for API data
- **Local State**: React useState or Zustand

## Building for Production

```bash
# Build each MFE
cd frontend/auth-mfe && npm run build
cd ../workspace-mfe && npm run build
cd ../analytics-mfe && npm run build
cd ../admin-mfe && npm run build

# Build shell app
cd ../shell-app && npm run build
```

Deploy all built files to your hosting service. The shell app will load MFEs from their deployed locations.

## Troubleshooting

### MFE Not Loading

1. Check that the MFE dev server is running
2. Check browser console for errors
3. Verify the URL in `single-spa-config.ts` matches the MFE port
4. Check CORS settings in MFE's `vite.config.ts`

### React Version Conflicts

1. Ensure all apps use React 19
2. Verify React is exposed on `window.__REACT__` in shell app
3. Check MFE is using host React (check console logs)

### Routing Issues

1. Verify routes in `single-spa-config.ts` match your routes
2. Check `activeWhen` functions return correct boolean
3. Ensure React Router is set up correctly in shell app



