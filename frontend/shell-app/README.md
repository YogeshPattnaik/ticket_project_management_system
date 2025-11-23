# Shell App - Task Management System

The shell application (host) for the Task Management System microfrontend architecture. Built with React 19 and Vite.

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **React Query** - Data fetching and caching
- **Single-SPA** - Microfrontend orchestration
- **Tailwind CSS** - Styling

## Architecture

This is a single-page application (SPA) that orchestrates multiple microfrontends:

- **auth-mfe** (port 3001) - Authentication and user management
- **workspace-mfe** (port 3002) - Workspace and project management
- **analytics-mfe** (port 3003) - Analytics and reporting
- **admin-mfe** (port 3004) - Admin panel and system settings

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Running All MFEs Together

To run the complete system as a SPA:

1. Start the shell app:
   ```bash
   cd frontend/shell-app
   npm run dev
   ```

2. Start all microfrontends in separate terminals:
   ```bash
   # Terminal 2
   cd frontend/auth-mfe
   npm run dev

   # Terminal 3
   cd frontend/workspace-mfe
   npm run dev

   # Terminal 4
   cd frontend/analytics-mfe
   npm run dev

   # Terminal 5
   cd frontend/admin-mfe
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser

## Project Structure

```
src/
├── components/       # Shared components (Header, SingleSpaLoader, etc.)
├── pages/           # Page components (HomePage, DashboardPage, AuthPage)
├── store/           # Redux store configuration
├── utils/           # Utility functions (loadMfe, etc.)
├── single-spa-config.ts  # Single-SPA application registration
├── App.tsx          # Main app component with routing
└── main.tsx         # Application entry point
```

## React Sharing

The shell app exposes React and ReactDOM on `window.__REACT__` and `window.__REACT_DOM__` to ensure all microfrontends use the same React instance, preventing version conflicts and issues with hooks like `useInsertionEffect`.

## Routing

The app uses React Router for client-side routing:

- `/` - Landing page (redirects to dashboard if authenticated)
- `/auth` - Authentication page (loads auth-mfe)
- `/dashboard` - Main dashboard (loads workspace-mfe, admin-mfe, or analytics-mfe based on query params)

## License

Private
