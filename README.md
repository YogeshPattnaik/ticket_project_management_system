# Enterprise Task Management System - Infrastructure

This repository contains **infrastructure and deployment configurations** for the Enterprise Task Management System.

## ⚠️ Important: Hybrid Monorepo & Separate Modules

**This project supports both development approaches:**

1. **Monorepo Mode** - Run everything together from root (recommended for local development)
2. **Separate Module Mode** - Each module can be a separate Git repository and run independently

**This repository contains:**
- All modules in a monorepo structure
- Kubernetes manifests
- Terraform configurations
- CI/CD pipeline templates
- Docker Compose for local development
- Documentation

## Module Repositories

Each service and application is in its own repository:

### Backend Services
- `auth-service` - Authentication & Authorization (NestJS)
- `project-service` - Project & Task Management (NestJS)
- `notification-service` - Real-time Notifications (Express)
- `migration-service` - Database Migrations (NestJS)
- `file-service` - File Management (SpringBoot)
- `analytics-service` - Analytics & Reporting (SpringBoot)

### Frontend Applications
- `shell-app` - Main Container Application (Next.js 14+)
- `auth-mfe` - Authentication Microfrontend (React 19)
- `workspace-mfe` - Workspace Microfrontend (React 19)
- `analytics-mfe` - Analytics Microfrontend (Next.js 14+)
- `admin-mfe` - Admin Panel Microfrontend (React 19)
- `shared-ui` - Shared UI Component Library (React 19)

### Shared Libraries (Published as NPM Packages)
- `@task-management/dto` - Data Transfer Objects
- `@task-management/interfaces` - TypeScript Interfaces
- `@task-management/utils` - Utility Functions
- `@task-management/shared-ui` - Shared UI Components

## Repository Structure

```
.
├── k8s/                    # Kubernetes manifests
│   ├── auth-service/
│   ├── project-service/
│   ├── notification-service/
│   └── migration-service/
├── terraform/              # AWS infrastructure
│   ├── main.tf
│   ├── eks.tf
│   ├── rds.tf
│   └── ...
├── .github/
│   └── workflows/         # CI/CD templates
├── docker-compose.yml      # Local development
└── docs/                   # Documentation
```

## Quick Start

**👋 New to this project?** Start with [GETTING_STARTED.md](./GETTING_STARTED.md) for a complete step-by-step guide.

### Option 1: Monorepo Mode (Recommended) - 🆓 100% Free

**With Free Cloud Databases (No Docker, No Credit Card Required):**
```bash
# Clone the monorepo
git clone <repository-url>
cd ticketing_system

# Install all dependencies
npm install

# Create .env files
npm run setup:env

# Set up FREE cloud databases (15 minutes):
# 1. Supabase (PostgreSQL) - FREE forever: https://supabase.com
# 2. MongoDB Atlas (MongoDB) - FREE forever: https://www.mongodb.com/cloud/atlas
# 3. Upstash (Redis - optional) - FREE forever: https://upstash.com
# 
# See: GETTING_STARTED.md or FREE_TIER_SETUP_GUIDE.md for step-by-step instructions

# Update .env files with your database connection strings

# Generate Prisma clients
npm run prisma:generate

# Run all services
npm run dev:all
```

**💰 Total Cost: $0.00 - No credit card required!**

**With Local Docker:**
```bash
# Install Docker Desktop first
# Then:
npm install
npm run docker:up  # Start databases
npm run dev:all    # Run all services
```

### Option 2: Separate Module Mode

```bash
# Clone individual modules
git clone <module-repo-url>
cd <module-name>

# Install dependencies
npm install

# Run the module
npm run start:dev  # or npm run dev
```

See [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for detailed instructions.

### Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Documentation

### 🚀 Getting Started (New Developers)
- [GETTING_STARTED.md](./GETTING_STARTED.md) - **⭐ START HERE** - Complete setup guide for new developers
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [START_HERE.md](./START_HERE.md) - Quick reference guide
- [HOW_TO_START_APP.md](./HOW_TO_START_APP.md) - Detailed app startup guide

### 🆓 Free Setup
- [FREE_TIER_SETUP_GUIDE.md](./FREE_TIER_SETUP_GUIDE.md) - 100% Free setup guide
- [QUICK_CLOUD_SETUP.md](./QUICK_CLOUD_SETUP.md) - Quick 5-minute setup
- [CLOUD_DATABASE_SETUP_GUIDE.md](./CLOUD_DATABASE_SETUP_GUIDE.md) - Detailed cloud setup

### 📚 Development & Architecture
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Development workflows
- [PROJECT_DETAILS.md](./PROJECT_DETAILS.md) - Complete project documentation
- [STATE_MANAGEMENT_GUIDE.md](./STATE_MANAGEMENT_GUIDE.md) - Redux Toolkit, Saga & Zustand guide
- [MODULE_STRUCTURE.md](./MODULE_STRUCTURE.md) - Module organization
- [SETUP_GIT_REPOS.md](./SETUP_GIT_REPOS.md) - Setting up separate Git repos
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [VERSIONING.md](./VERSIONING.md) - Versioning strategy

## License

Proprietary
