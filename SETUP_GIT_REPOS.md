# Setting Up Separate Git Repositories

## Overview

Each module is designed to be a **completely independent Git repository**. This allows:
- Independent versioning
- Separate CI/CD pipelines
- Independent deployment
- Team ownership per module

## Step-by-Step Setup

### 1. Create Remote Repositories

Create separate repositories on GitHub/GitLab/Bitbucket for each module:

**Backend Services:**
- `auth-service`
- `project-service`
- `notification-service`
- `migration-service`
- `file-service`
- `analytics-service`
- `api-gateway`

**Frontend Applications:**
- `shell-app`
- `auth-mfe`
- `workspace-mfe`
- `analytics-mfe`
- `admin-mfe`
- `shared-ui`

**Shared Libraries:**
- `dto` (publish as `@task-management/dto`)
- `interfaces` (publish as `@task-management/interfaces`)
- `utils` (publish as `@task-management/utils`)

**Infrastructure:**
- `infrastructure` (this repo - k8s, terraform, etc.)

### 2. Initialize Git in Each Module

For each module directory:

```bash
# Example for auth-service
cd backend/auth-service

# Initialize Git
git init
git add .
git commit -m "Initial commit: Auth service"

# Add remote (replace with your actual repository URL)
git remote add origin git@github.com:your-org/auth-service.git
git branch -M main
git push -u origin main
```

### 3. Publish Shared Libraries as NPM Packages

**First, update package.json names:**
- `shared-libs/dto` → `@task-management/dto`
- `shared-libs/interfaces` → `@task-management/interfaces`
- `shared-libs/utils` → `@task-management/utils`
- `frontend/shared-ui` → `@task-management/shared-ui`

**Then publish:**

```bash
# Publish DTO library
cd shared-libs/dto
npm login
npm publish --access public

# Publish Interfaces library
cd ../interfaces
npm publish --access public

# Publish Utils library
cd ../utils
npm publish --access public

# Publish Shared UI library
cd ../../frontend/shared-ui
npm publish --access public
```

### 4. Install Shared Packages in Services

In each service's `package.json`, the dependencies are already configured:

```json
{
  "dependencies": {
    "@task-management/dto": "^1.0.0",
    "@task-management/interfaces": "^1.0.0",
    "@task-management/utils": "^1.0.0",
    "@task-management/shared-ui": "^1.0.0"
  }
}
```

Just run `npm install` in each service after publishing.

### 5. Update TypeScript Paths

Each module's `tsconfig.json` is already configured to use:
```json
{
  "compilerOptions": {
    "paths": {
      "@shared-libs/*": ["node_modules/@task-management/*/src"]
    }
  }
}
```

### 6. Add README to Each Module

Each module already has its own README.md with:
- Installation instructions
- Configuration
- Development setup
- API documentation (where applicable)

### 7. Setup CI/CD Per Module

Each module can have its own `.github/workflows/ci-cd.yml`:

```bash
# Copy CI/CD template to each module
cp .github/workflows/ci-cd.yml backend/auth-service/.github/workflows/
# Update service name in workflow file
```

## Automation Script

Create `setup-git-repos.sh`:

```bash
#!/bin/bash

# Backend services
for service in auth-service project-service notification-service migration-service; do
  echo "Setting up $service..."
  cd "backend/$service"
  git init
  git add .
  git commit -m "Initial commit"
  echo "✅ $service ready for Git push"
  cd ../..
done

# Frontend apps
for app in shell-app auth-mfe workspace-mfe analytics-mfe admin-mfe shared-ui; do
  echo "Setting up $app..."
  cd "frontend/$app"
  git init
  git add .
  git commit -m "Initial commit"
  echo "✅ $app ready for Git push"
  cd ../..
done

# Shared libraries
for lib in dto interfaces utils; do
  echo "Setting up $lib..."
  cd "shared-libs/$lib"
  git init
  git add .
  git commit -m "Initial commit"
  echo "✅ $lib ready for Git push and NPM publish"
  cd ../..
done

echo "✅ All modules initialized!"
echo "Next steps:"
echo "1. Create remote repositories"
echo "2. Add remotes: git remote add origin <repo-url>"
echo "3. Push: git push -u origin main"
echo "4. Publish shared libs: npm publish"
```

## Module Independence

Each module:
- ✅ Has its own `.gitignore`
- ✅ Has its own `package.json`
- ✅ Has its own `tsconfig.json` (no extends)
- ✅ Has its own README.md
- ✅ Can be versioned independently
- ✅ Can have its own CI/CD pipeline
- ✅ Can be deployed independently

## Integration

Modules integrate via:
- **NPM packages** - Shared libraries published to NPM
- **APIs** - Microservices communicate via REST APIs
- **Module Federation** - Microfrontends load at runtime
- **Docker images** - Services deployed as containers

## Notes

- No monorepo workspace configuration
- No root package.json
- Each module is completely self-contained
- Shared libraries must be published before services can use them
- Services communicate via HTTP APIs, not direct imports
