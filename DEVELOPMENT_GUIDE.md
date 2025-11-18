# Development Guide - Monorepo & Separate Modules

This project supports **both monorepo and separate module workflows**. You can:
- ✅ Run everything together (monorepo mode)
- ✅ Run individual modules independently
- ✅ Push modules to separate Git repositories
- ✅ Develop modules in isolation

## Two Development Approaches

### Approach 1: Monorepo Development (Recommended for Local Development)

Run all services together from the root directory.

#### Setup

```bash
# Clone the entire monorepo
git clone <monorepo-url>
cd enterprise-task-management-system

# Install all dependencies
npm install

# Or use the setup script
npm run setup
```

#### Running Services

**Run All Services:**
```bash
# Start all backend and frontend services
npm run dev:all

# Or start separately
npm run dev:backend  # All backend services
npm run dev:frontend # All frontend services
```

**Run Individual Services:**
```bash
# Backend services
npm run dev:auth          # Auth service only
npm run dev:project       # Project service only
npm run dev:notification  # Notification service only
npm run dev:migration     # Migration service only

# Frontend services
npm run dev:shell         # Shell app only
npm run dev:auth-mfe      # Auth MFE only
npm run dev:workspace-mfe # Workspace MFE only
npm run dev:analytics-mfe # Analytics MFE only
npm run dev:admin-mfe     # Admin MFE only
```

**Docker Services:**
```bash
# Start databases (PostgreSQL, MongoDB, Redis)
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

#### Building

```bash
# Build all modules
npm run build:all

# Build specific module
npm run build --workspace=backend/auth-service
```

### Approach 2: Separate Module Development

Each module can be developed independently as a separate repository.

#### Setup Individual Module

```bash
# Clone specific module
git clone <module-repo-url>
cd auth-service

# Install dependencies
npm install

# Run the service
npm run start:dev
```

#### Module Structure

Each module is self-contained:
- ✅ Own `package.json` with all dependencies
- ✅ Own `tsconfig.json` (can extend base or be standalone)
- ✅ Own `.gitignore`
- ✅ Own `README.md`
- ✅ Can be pushed to separate Git repository

## Workspace Configuration

The root `package.json` defines workspaces:

```json
{
  "workspaces": [
    "backend/*",
    "frontend/*",
    "shared-libs/*"
  ]
}
```

This allows:
- Shared dependencies (hoisted to root `node_modules`)
- Running commands across all workspaces
- TypeScript path resolution for shared libraries

## Shared Libraries

### In Monorepo Mode

Shared libraries are linked automatically via workspaces:

```typescript
// In any service
import { UserDto } from '@task-management/dto';
import { Workflow } from '@task-management/interfaces';
```

### In Separate Module Mode

Install shared libraries as NPM packages:

```bash
npm install @task-management/dto @task-management/interfaces @task-management/utils
```

Or use Git URLs:

```json
{
  "dependencies": {
    "@task-management/dto": "git+https://github.com/your-org/dto.git"
  }
}
```

## TypeScript Configuration

### Monorepo Mode

Modules extend `tsconfig.base.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    // Module-specific overrides
  }
}
```

### Separate Module Mode

Modules can use standalone `tsconfig.json` or extend base if available.

## State Management Strategy

### Redux Toolkit + Redux Saga

**Use Redux Toolkit for:**
- ✅ Complex global state (auth, projects, tasks)
- ✅ State shared across multiple components
- ✅ Complex async flows requiring orchestration
- ✅ Time-travel debugging needs
- ✅ Middleware requirements (logging, persistence)

**Example:**
```typescript
// Redux for global auth state
const { user, isAuthenticated } = useAppSelector((state) => state.auth);
const dispatch = useAppDispatch();
dispatch(loginStart({ email, password }));
```

### Zustand

**Use Zustand for:**
- ✅ Simple local component state
- ✅ UI state (modals, dropdowns, form state)
- ✅ Quick prototyping
- ✅ Minimal boilerplate needed
- ✅ Component-specific state

**Example:**
```typescript
// Zustand for simple UI state
const useModalStore = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
```

### React Query

**Use React Query for:**
- ✅ Server state management
- ✅ API data caching
- ✅ Automatic refetching
- ✅ Optimistic updates

## Development Workflow

### Starting Fresh

1. **Clone Monorepo:**
   ```bash
   git clone <monorepo-url>
   cd enterprise-task-management-system
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Databases:**
   ```bash
   npm run docker:up
   ```

4. **Run Migrations:**
   ```bash
   # Start migration service
   npm run dev:migration
   
   # In another terminal, execute migrations
   curl -X POST http://localhost:3004/api/v1/migrations/execute \
     -H "Content-Type: application/json" \
     -d '{"version": "V1", "type": "sql"}'
   ```

5. **Start All Services:**
   ```bash
   npm run dev:all
   ```

### Working on a Single Module

1. **Navigate to Module:**
   ```bash
   cd backend/auth-service
   ```

2. **Install Dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Run Module:**
   ```bash
   npm run start:dev
   ```

4. **Other services can run from root or separately**

### Adding a New Module

1. **Create Module Directory:**
   ```bash
   mkdir backend/new-service
   cd backend/new-service
   ```

2. **Initialize:**
   ```bash
   npm init -y
   # Add dependencies to package.json
   ```

3. **Module is automatically included in workspace**

4. **Add Script to Root:**
   ```json
   {
     "scripts": {
       "dev:new-service": "npm run start:dev --workspace=backend/new-service"
     }
   }
   ```

## Git Workflow

### Monorepo Git

```bash
# Single repository for all modules
git add .
git commit -m "Update auth service"
git push
```

### Separate Module Git

Each module can have its own repository:

```bash
# In module directory
cd backend/auth-service
git init
git remote add origin <module-repo-url>
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Hybrid Approach

- Keep monorepo for local development
- Push modules to separate repos for deployment
- Use Git submodules or separate clones

## Environment Variables

### Monorepo Mode

Create `.env` files in each module:
- `backend/auth-service/.env`
- `backend/project-service/.env`
- etc.

### Separate Module Mode

Same structure - each module has its own `.env` file.

## Docker Compose

Docker Compose is at the root level and works for both approaches:

```bash
# Start all infrastructure
docker-compose up -d

# Services can connect to databases
# regardless of monorepo or separate mode
```

## Troubleshooting

### Workspace Issues

**Problem:** Module not found in workspace

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### TypeScript Path Resolution

**Problem:** Cannot find module '@task-management/dto'

**Solution:**
- In monorepo: Ensure workspace is configured correctly
- In separate mode: Install package via npm or Git URL

### Port Conflicts

**Problem:** Port already in use

**Solution:**
- Check running services: `lsof -i :3001`
- Kill process or change port in `.env`

## Best Practices

1. **Use Monorepo for:**
   - Local development
   - Testing integration
   - Shared library development

2. **Use Separate Modules for:**
   - Production deployment
   - Team ownership
   - Independent versioning

3. **State Management:**
   - Redux Toolkit for complex global state
   - Zustand for simple UI state
   - React Query for server state

4. **Development:**
   - Start with monorepo for easy development
   - Split to separate repos when needed
   - Use Docker Compose for infrastructure

## Quick Reference

```bash
# Monorepo Commands
npm install              # Install all dependencies
npm run dev:all         # Run all services
npm run dev:auth        # Run auth service only
npm run build:all       # Build all modules
npm run docker:up       # Start databases

# Individual Module Commands
cd backend/auth-service
npm install             # Install module dependencies
npm run start:dev       # Run module
npm run build           # Build module
```

---

**Note:** This hybrid approach gives you the flexibility to develop in a monorepo while maintaining the ability to deploy modules independently.

