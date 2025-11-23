# Industry-Level Microfrontend Architecture

## Architecture Overview

This project uses **Single-SPA** as the microfrontend orchestration framework, following industry best practices for enterprise applications.

### Technology Stack

- **Orchestration**: Single-SPA 6.x
- **Framework**: React 19
- **Build Tool**: Vite 5.x
- **Routing**: React Router 6.x
- **State Management**: 
  - Redux Toolkit (Global state)
  - Redux Saga (Async flows)
  - Zustand (Local UI state)
  - React Query (Server state)
- **Styling**: Tailwind CSS
- **TypeScript**: 5.x with strict mode

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Shell App (Host/Container)                 │
│  - React 19 + Vite                                      │
│  - Single-SPA Orchestrator                             │
│  - React Router (Main Routing)                         │
│  - Redux Store (Global State)                          │
│  - Port: 3000                                           │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│  Auth MFE    │  │ Workspace MFE │  │ Analytics MFE│
│  React 19    │  │  React 19     │  │  React 19    │
│  Port: 3001  │  │  Port: 3002    │  │  Port: 3003  │
└──────────────┘  └───────────────┘  └──────────────┘
        │                 │                 │
┌───────▼──────┐  ┌───────▼───────────────────────────┐
│  Admin MFE   │  │      Shared UI Library             │
│  React 19    │  │  - Components                      │
│  Port: 3004  │  │  - Hooks                           │
└──────────────┘  │  - Utils                           │
                  └───────────────────────────────────┘
```

## Key Principles

1. **React Sharing**: All MFEs share the same React instance from the shell app
2. **Independent Development**: Each MFE can be developed and deployed independently
3. **Technology Agnostic**: Single-SPA allows different frameworks (we use React 19 for all)
4. **Lazy Loading**: MFEs are loaded on-demand based on routes
5. **State Isolation**: Each MFE manages its own state, with shared global state in shell
6. **Type Safety**: Full TypeScript support across all applications

## Project Structure

```
frontend/
├── shell-app/              # Host application
│   ├── src/
│   │   ├── main.tsx       # Entry point
│   │   ├── App.tsx        # Root component with routing
│   │   ├── single-spa-config.ts  # Single-SPA registration
│   │   ├── components/    # Shell components
│   │   ├── pages/         # Shell pages
│   │   ├── store/         # Redux store
│   │   └── utils/         # Utilities
│   ├── vite.config.ts
│   └── package.json
│
├── auth-mfe/              # Authentication microfrontend
│   ├── src/
│   │   ├── main.tsx       # Single-SPA entry
│   │   ├── single-spa-entry.tsx  # Lifecycle functions
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
    │   ├── components/   # Shared components
    │   ├── hooks/        # Shared hooks
    │   └── utils/        # Shared utilities
    └── package.json
```

## React Sharing Strategy

The shell app exposes React and ReactDOM on `window.__REACT__` and `window.__REACT_DOM__`. Each MFE checks for these before using its local React instance. This ensures:

- Single React instance across all applications
- No version conflicts
- Proper hook behavior (useInsertionEffect, etc.)
- Smaller bundle sizes (React not duplicated)

## Routing Strategy

- **Shell App**: Uses React Router for top-level routing (`/`, `/auth`, `/dashboard`)
- **MFEs**: Use React Router internally for their own routes
- **Single-SPA**: Manages which MFE is active based on URL patterns

## State Management Strategy

- **Global State** (Shell): Redux Toolkit for auth, UI preferences
- **MFE State**: Each MFE can use Redux, Zustand, or React Query as needed
- **Server State**: React Query for API data
- **Local State**: Zustand or React useState for component-level state

## Development Workflow

1. Start shell app: `cd shell-app && npm run dev` (port 3000)
2. Start MFEs: Each MFE runs on its own port (3001, 3002, 3003, 3004)
3. All applications work together as a single SPA
4. Hot Module Replacement (HMR) works independently for each MFE

## Production Build

1. Build each MFE independently
2. Deploy MFEs as static assets
3. Shell app loads MFEs from CDN or same domain
4. All served from a single port in production



