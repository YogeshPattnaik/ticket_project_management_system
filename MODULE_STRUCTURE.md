# Module Structure - Independent Git Repositories

Each module is designed to be a **separate, independent Git repository**. They can be developed, versioned, and deployed independently.

## Module List

### Backend Services
1. **backend/auth-service** - Authentication & Authorization Service
2. **backend/project-service** - Project & Task Management Service
3. **backend/notification-service** - Real-time Notification Service
4. **backend/migration-service** - Database Migration Service
5. **backend/file-service** - File Management Service (SpringBoot)
6. **backend/analytics-service** - Analytics & Reporting Service (SpringBoot)
7. **backend/api-gateway** - API Gateway Configuration

### Frontend Applications
1. **frontend/shell-app** - Main Container Application (Next.js 14+)
2. **frontend/auth-mfe** - Authentication Microfrontend (React 19)
3. **frontend/workspace-mfe** - Workspace Microfrontend (React 19)
4. **frontend/analytics-mfe** - Analytics Microfrontend (Next.js 14+)
5. **frontend/admin-mfe** - Admin Panel Microfrontend (React 19)
6. **frontend/shared-ui** - Shared UI Component Library (React 19)

### Shared Libraries
1. **shared-libs/dto** - Data Transfer Objects
2. **shared-libs/interfaces** - TypeScript Interfaces
3. **shared-libs/utils** - Utility Functions

### Infrastructure
1. **k8s/** - Kubernetes Manifests
2. **terraform/** - AWS Infrastructure as Code
3. **.github/workflows/** - CI/CD Pipelines

## Setting Up Separate Git Repositories

### For Each Module:

1. **Initialize Git Repository**
   ```bash
   cd backend/auth-service  # or any module
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create Remote Repository**
   - Create a new repository on GitHub/GitLab/etc.
   - Example: `git@github.com:your-org/auth-service.git`

3. **Push to Remote**
   ```bash
   git remote add origin git@github.com:your-org/auth-service.git
   git branch -M main
   git push -u origin main
   ```

## Module Dependencies

### Shared Libraries as NPM Packages

The shared libraries should be published as NPM packages:

1. **Publish shared-libs/dto**
   ```bash
   cd shared-libs/dto
   npm publish --access public
   ```

2. **Install in services**
   ```bash
   cd backend/auth-service
   npm install @task-management/dto
   ```

### Alternative: Git Submodules or Private NPM Registry

If using private repositories:
- Use Git submodules
- Set up a private NPM registry
- Use GitHub Packages

## Module-Specific README

Each module should have its own README.md with:
- Installation instructions
- Configuration
- API documentation
- Development setup
- Deployment instructions

## CI/CD Per Module

Each module can have its own CI/CD pipeline:
- `.github/workflows/ci-cd.yml` in each module
- Independent versioning
- Independent deployments

## Versioning Strategy

Each module maintains its own version:
- `package.json` version field
- Semantic versioning (1.0.0)
- Independent release cycles

## Integration

Modules integrate via:
- Published NPM packages (shared libraries)
- API calls (microservices)
- Module Federation (microfrontends)
- Docker images (deployment)

