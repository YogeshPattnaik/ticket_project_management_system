# Running All MFEs on Single Port (3000)

This setup allows all microfrontends to be accessed through port 3000 using Vite's proxy feature.

## How It Works

- **Shell app** runs on port 3000
- **MFEs** still run on their individual ports (3001, 3002, 3003, 3004) in the background
- **Vite proxy** routes requests from port 3000 to the appropriate MFE port:
  - `/mfe/auth` → `http://localhost:3001`
  - `/mfe/workspace` → `http://localhost:3002`
  - `/mfe/analytics` → `http://localhost:3003`
  - `/mfe/admin` → `http://localhost:3004`

## Setup

1. **Start all MFE dev servers** (in separate terminals):
   ```bash
   # Terminal 1
   cd frontend/auth-mfe
   npm run dev

   # Terminal 2
   cd frontend/workspace-mfe
   npm run dev

   # Terminal 3
   cd frontend/analytics-mfe
   npm run dev

   # Terminal 4
   cd frontend/admin-mfe
   npm run dev
   ```

2. **Start the shell app** (in another terminal):
   ```bash
   cd frontend/shell-app
   npm run dev
   ```

3. **Access everything through port 3000:**
   - Shell app: `http://localhost:3000`
   - All MFEs are loaded through the proxy at `/mfe/*` paths

## Benefits

- ✅ Single entry point (port 3000)
- ✅ No CORS issues
- ✅ Simpler development experience
- ✅ All MFEs still run independently for hot reload

## Production

For production, you would:
1. Build all MFEs
2. Serve them as static assets from a single server
3. Or use a reverse proxy (nginx, etc.) to route requests



