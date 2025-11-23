# Enterprise Microfrontend Architecture

A production-ready, industry-standard microfrontend architecture using **Single-SPA**, **React 19**, and **Vite**.

## 🏗️ Architecture

This project uses a **microfrontend architecture** where:

- **Shell App** (Host/Container) orchestrates all microfrontends
- **Microfrontends** are independent React applications
- **Single-SPA** manages lifecycle and routing
- **Shared React Instance** prevents version conflicts
- **Independent Development** - each MFE can be developed separately

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
- **TypeScript**: 5.x (strict mode)

## 📁 Project Structure

```
frontend/
├── shell-app/              # Host application (Port 3000)
│   ├── src/
│   │   ├── main.tsx       # Entry point - exposes React
│   │   ├── App.tsx        # Root component with routing
│   │   ├── single-spa-config.ts  # Single-SPA registration
│   │   ├── components/    # Shell components
│   │   ├── pages/         # Shell pages
│   │   └── store/         # Redux store
│   └── vite.config.ts
│
├── auth-mfe/              # Authentication (Port 3001)
├── workspace-mfe/         # Workspace & Projects (Port 3002)
├── analytics-mfe/         # Analytics & Reports (Port 3003)
├── admin-mfe/             # Admin Panel (Port 3004)
│
└── shared-ui/             # Shared component library
    ├── components/        # Shared components
    ├── hooks/            # Shared hooks
    └── utils/            # Shared utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies for all applications
cd shell-app && npm install && cd ..
cd auth-mfe && npm install && cd ..
cd workspace-mfe && npm install && cd ..
cd analytics-mfe && npm install && cd ..
cd admin-mfe && npm install && cd ..
cd shared-ui && npm install && cd ..
```

### Development

Start all applications in separate terminals:

**Terminal 1 - Shell App:**
```bash
cd shell-app
npm run dev
# http://localhost:3000
```

**Terminal 2 - Auth MFE:**
```bash
cd auth-mfe
npm run dev
# http://localhost:3001
```

**Terminal 3 - Workspace MFE:**
```bash
cd workspace-mfe
npm run dev
# http://localhost:3002
```

**Terminal 4 - Analytics MFE:**
```bash
cd analytics-mfe
npm run dev
# http://localhost:3003
```

**Terminal 5 - Admin MFE:**
```bash
cd admin-mfe
npm run dev
# http://localhost:3004
```

### Access the Application

Open `http://localhost:3000` in your browser. The shell app will automatically load the appropriate microfrontend based on the route.

## 🛣️ Routing

- `/` - Home page (shell app)
- `/auth` - Authentication (auth-mfe)
- `/dashboard` - Dashboard (workspace-mfe by default)
- `/dashboard?mfe=workspace` - Workspace MFE
- `/dashboard?mfe=analytics` - Analytics MFE
- `/dashboard?mfe=admin` - Admin MFE

## 🔄 React Sharing

The shell app exposes React on `window.__REACT__` and `window.__REACT_DOM__`. Each microfrontend:

1. Checks for host React first
2. Falls back to local React if not available
3. Uses the shared instance to avoid conflicts

This ensures:
- ✅ Single React instance across all applications
- ✅ No version conflicts
- ✅ Proper hook behavior
- ✅ Smaller bundle sizes

## 📦 State Management

### Global State (Shell App)
- **Redux Toolkit**: Auth state, UI preferences
- **Redux Saga**: Async flows, token refresh

### MFE State
- **Redux Toolkit**: Complex state (projects, tasks, boards)
- **Zustand**: Simple UI state (modals, dropdowns)
- **React Query**: Server state (API data)

## 🏭 Production Build

```bash
# Build each microfrontend
cd auth-mfe && npm run build
cd ../workspace-mfe && npm run build
cd ../analytics-mfe && npm run build
cd ../admin-mfe && npm run build

# Build shell app
cd ../shell-app && npm run build
```

Deploy all built files to your hosting service. The shell app will load microfrontends from their deployed locations.

## 📚 Documentation

- [Architecture Details](./MICROFRONTEND_ARCHITECTURE.md) - Detailed architecture
- [Setup Guide](./SETUP_GUIDE.md) - Complete setup instructions
- [MFE Template](./MFE_TEMPLATE.md) - Template for creating new MFEs

## 🐛 Troubleshooting

### MFE Not Loading

1. ✅ Check that the MFE dev server is running
2. ✅ Check browser console for errors
3. ✅ Verify the URL in `single-spa-config.ts` matches the MFE port
4. ✅ Check CORS settings in MFE's `vite.config.ts`

### React Version Conflicts

1. ✅ Ensure all apps use React 19
2. ✅ Verify React is exposed on `window.__REACT__` in shell app
3. ✅ Check MFE is using host React (check console logs)

### Routing Issues

1. ✅ Verify routes in `single-spa-config.ts` match your routes
2. ✅ Check `activeWhen` functions return correct boolean
3. ✅ Ensure React Router is set up correctly in shell app

## 🎯 Best Practices

1. **Always use host React**: Check for `window.__REACT__` first
2. **Container IDs**: Use unique container IDs (`mfe-name-container`)
3. **Error Boundaries**: Always include error boundaries
4. **TypeScript**: Use strict TypeScript
5. **State Management**: Use Redux Toolkit for complex state, Zustand for simple state
6. **Server State**: Use React Query for API data
7. **Independent Development**: Each MFE can be developed separately
8. **Type Safety**: Full TypeScript support across all applications

## 📝 License

This project is part of the Enterprise Task Management System.
