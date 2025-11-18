# Enterprise Task Management System - Complete Project Details

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Module Structure](#module-structure)
4. [Getting Started](#getting-started)
5. [Running the Project](#running-the-project)
6. [Module Modification Guide](#module-modification-guide)
7. [API Documentation](#api-documentation)
8. [Database Management](#database-management)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

Enterprise-grade task/project management system (similar to Jira) built with modern microservices and microfrontend architecture. The system supports comprehensive RBAC, real-time features, workflow automation, and AWS deployment capabilities.

### Key Features

- **Microservices Architecture** - Independent, scalable services
- **Microfrontend Architecture** - Modular frontend applications
- **Real-time Notifications** - WebSocket-based notifications
- **RBAC** - Role-based access control with fine-grained permissions
- **Workflow Engine** - Automated workflow execution
- **Kanban Boards** - Drag & drop task management
- **SLA Tracking** - Service level agreement monitoring
- **Database Migrations** - Versioned SQL and NoSQL migrations
- **API Versioning** - URL-based API versioning (v1, v2, etc.)
- **Comprehensive Security** - Input validation, XSS/CSRF protection, rate limiting

### Technology Stack

**Frontend:**
- Next.js 14+ (App Router, SSR/SSG)
- React 19 (with latest features)
- Module Federation (Webpack 5)
- **Redux Toolkit** (Complex global state management)
- **Redux Saga** (Async flow orchestration)
- **Zustand** (Simple UI state management)
- React Query (Server state management)
- Tailwind CSS + Shadcn/ui

**Backend:**
- NestJS (TypeScript, DI, Modular)
- Express (Lightweight services)
- SpringBoot (File & Analytics services)
- PostgreSQL 15+ (Primary database)
- MongoDB (Secondary database)
- Redis (Cache layer)
- Elasticsearch (Search engine)

**Infrastructure:**
- Docker & Docker Compose
- Kubernetes (EKS)
- AWS (RDS, ElastiCache, S3)
- Terraform (Infrastructure as Code)
- GitHub Actions (CI/CD)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway (Kong)                    │
│              Rate Limiting, CORS, Routing                │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│ Auth Service │  │Project Service│  │Notification  │
│   (NestJS)   │  │   (NestJS)    │  │  Service     │
│              │  │               │  │  (Express)   │
└───────┬──────┘  └───────┬──────┘  └───────┬──────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│  PostgreSQL   │  │   MongoDB    │  │    Redis     │
│  (Primary DB) │  │ (Secondary)  │  │   (Cache)    │
└───────────────┘  └──────────────┘  └──────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Shell App (Next.js)                   │
│              Module Federation Container                 │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│  Auth MFE    │  │ Workspace MFE│  │ Analytics MFE│
│  (React 19)  │  │  (React 19)   │  │ (Next.js 14+)│
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Module Structure

### Backend Services

#### 1. Auth Service (`backend/auth-service`)
**Technology:** NestJS  
**Port:** 3001  
**Purpose:** Authentication, authorization, user management, RBAC

**Key Features:**
- JWT authentication with refresh tokens
- User registration and login
- Role-based access control (RBAC)
- User CRUD operations
- Role and permission management

**Main Modules:**
- `src/auth/` - Authentication logic, JWT strategy
- `src/users/` - User management
- `src/roles/` - Role and permission management
- `src/rbac/` - RBAC guards and decorators
- `src/prisma/` - Database service

**How to Modify:**
- Add new authentication methods: `src/auth/auth.service.ts`
- Add new user fields: `prisma/schema.prisma` → run migration
- Add new roles/permissions: `src/roles/roles.service.ts`
- Customize RBAC logic: `src/rbac/rbac.guard.ts`

**API Endpoints:**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `GET /api/v1/roles` - List roles
- `POST /api/v1/roles` - Create role

#### 2. Project Service (`backend/project-service`)
**Technology:** NestJS  
**Port:** 3002  
**Purpose:** Project and task management, Kanban boards, workflows, SLAs

**Key Features:**
- Project CRUD operations
- Task management with history tracking
- Kanban board logic
- Workflow engine
- SLA tracking and monitoring

**Main Modules:**
- `src/projects/` - Project management
- `src/tasks/` - Task management with history
- `src/boards/` - Kanban board logic
- `src/workflows/` - Workflow engine
- `src/slas/` - SLA tracking

**How to Modify:**
- Add new task fields: `prisma/schema.prisma` → run migration
- Customize Kanban logic: `src/boards/boards.service.ts`
- Add workflow actions: `src/workflows/workflows.service.ts`
- Customize SLA calculations: `src/slas/slas.service.ts`

**API Endpoints:**
- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/tasks` - List tasks
- `POST /api/v1/tasks` - Create task
- `POST /api/v1/tasks/:id/move` - Move task (Kanban)
- `GET /api/v1/boards/:id` - Get Kanban board
- `POST /api/v1/workflows` - Create workflow
- `POST /api/v1/workflows/:id/execute` - Execute workflow

#### 3. Notification Service (`backend/notification-service`)
**Technology:** Express  
**Port:** 3003  
**Purpose:** Real-time notifications via WebSocket, email, push

**Key Features:**
- Socket.io WebSocket server
- Email notifications (SMTP)
- Push notifications (structure)
- Notification history in MongoDB

**Main Modules:**
- `src/services/notification.service.ts` - Notification orchestration
- `src/services/websocket.service.ts` - WebSocket handling
- `src/services/email.service.ts` - Email sending
- `src/services/mongo.service.ts` - MongoDB operations

**How to Modify:**
- Add new notification channels: `src/services/notification.service.ts`
- Customize email templates: `src/services/email.service.ts`
- Add WebSocket events: `src/server.ts` and `src/services/websocket.service.ts`
- Change notification storage: `src/services/mongo.service.ts`

**API Endpoints:**
- `POST /api/v1/notifications` - Send notification
- `GET /api/v1/notifications/:userId` - Get user notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read

**WebSocket Events:**
- `subscribe` - Subscribe to user notifications
- `unsubscribe` - Unsubscribe
- `notification` - Receive notification event

#### 4. Migration Service (`backend/migration-service`)
**Technology:** NestJS  
**Port:** 3004  
**Purpose:** Database migration management for SQL and NoSQL

**Key Features:**
- SQL migration executor (PostgreSQL)
- NoSQL migration executor (MongoDB)
- Version tracking and history
- Rollback capabilities
- Migration file management

**Main Modules:**
- `src/sql-migrations/` - PostgreSQL migration handling
- `src/nosql-migrations/` - MongoDB migration handling
- `src/migrations/` - Migration API and service

**How to Modify:**
- Add migration validation rules: `src/sql-migrations/migration-parser.service.ts`
- Customize migration execution: `src/sql-migrations/migration-executor.service.ts`
- Add new migration types: Extend `IMigration` interface

**API Endpoints:**
- `POST /api/v1/migrations` - Create migration file
- `POST /api/v1/migrations/execute` - Execute migration
- `POST /api/v1/migrations/rollback/:version` - Rollback migration
- `GET /api/v1/migrations/history` - Get migration history
- `GET /api/v1/migrations/current` - Get current version
- `DELETE /api/v1/migrations/:version` - Delete migration file

#### 5. File Service (`backend/file-service`)
**Technology:** SpringBoot  
**Port:** 3005  
**Purpose:** File upload/download, S3 integration, file metadata

**Status:** Structure created, implementation needed

**How to Modify:**
- Implement S3 upload: Add AWS SDK integration
- Add file processing: Implement image/video processing
- Customize metadata storage: MongoDB integration
- Add file versioning: Implement version control

#### 6. Analytics Service (`backend/analytics-service`)
**Technology:** SpringBoot  
**Port:** 3006  
**Purpose:** Report generation, metrics calculation, Elasticsearch integration

**Status:** Structure created, implementation needed

**How to Modify:**
- Add report templates: Create report generator
- Implement metrics calculations: Add calculation logic
- Elasticsearch integration: Add search and aggregation
- Export functionality: PDF, CSV, Excel export

### Frontend Applications

#### 1. Shell App (`frontend/shell-app`)
**Technology:** Next.js 14+  
**Port:** 3000  
**Purpose:** Main container application for microfrontends

**Key Features:**
- Module Federation configuration
- App Router with layouts
- Navigation and routing
- React Query provider setup
- **Redux Toolkit** for global app state (auth, UI preferences)
- **Redux Saga** for auth flows and token refresh

**State Management:**
- **Redux Toolkit**: Global auth state, UI state (theme, sidebar, notifications)
- **Redux Saga**: Auth flows (login, register, token refresh), notification handling
- **Zustand**: Simple component-level state (if needed)

**Main Components:**
- `src/app/layout.tsx` - Root layout
- `src/app/dashboard/` - Dashboard pages
- `src/components/Navigation.tsx` - Main navigation
- `src/store/store.ts` - Redux store configuration
- `src/store/slices/` - Redux slices (auth, ui)
- `src/store/sagas/` - Redux sagas (auth, ui)

**How to Modify:**
- Add new routes: Create new folders in `src/app/`
- Customize layout: `src/app/layout.tsx`
- Add navigation items: `src/components/Navigation.tsx`
- Configure Module Federation: `next.config.js`
- Modify auth state: `src/store/slices/authSlice.ts`
- Add new auth flows: `src/store/sagas/authSaga.ts`

#### 2. Auth MFE (`frontend/auth-mfe`)
**Technology:** React 19  
**Port:** 3001 (dev)  
**Purpose:** Authentication and user profile management

**Key Features:**
- Login/Register components
- Profile management
- React 19 features (useActionState, useOptimistic)
- **Redux Toolkit** for auth state management
- **Redux Saga** for async auth flows

**State Management:**
- **Redux Toolkit**: Global auth state (user, tokens, authentication status)
- **Zustand**: Local UI state (form state, modal visibility)

**Main Components:**
- `src/components/Login.tsx` - Login form
- `src/components/Register.tsx` - Registration form
- `src/components/Profile.tsx` - Profile management
- `src/store/` - Redux store configuration
- `src/store/slices/authSlice.ts` - Auth state slice
- `src/store/sagas/authSaga.ts` - Auth async flows

**How to Modify:**
- Customize login flow: `src/components/Login.tsx` and `src/store/sagas/authSaga.ts`
- Add OAuth providers: Extend auth saga
- Customize profile fields: `src/components/Profile.tsx`
- Add form validation: Use React Hook Form or similar
- Modify auth state: `src/store/slices/authSlice.ts`

**Module Federation Exposes:**
- `./Login` - Login component
- `./Register` - Register component
- `./Profile` - Profile component

#### 3. Workspace MFE (`frontend/workspace-mfe`)
**Technology:** React 19  
**Port:** 3002 (dev)  
**Purpose:** Workspace, projects, tasks, Kanban boards, workflows

**Key Features:**
- Kanban board with drag & drop (@dnd-kit)
- Task list management
- Project management
- Workflow designer
- Real-time updates (WebSocket)
- **Redux Toolkit** for complex state (projects, tasks, boards, workflows)
- **Redux Saga** for async operations and API calls
- **Zustand** for simple UI state (modals, dropdowns)

**State Management:**
- **Redux Toolkit**: Projects, tasks, boards, workflows state
- **Redux Saga**: API calls, complex async flows, optimistic updates
- **Zustand**: UI state (modal visibility, dropdown state, form state)

**Main Components:**
- `src/components/KanbanBoard.tsx` - Kanban board with drag & drop
- `src/components/TaskList.tsx` - Task list view
- `src/components/ProjectManagement.tsx` - Project CRUD
- `src/components/WorkflowDesigner.tsx` - Workflow designer
- `src/store/slices/` - Redux slices (projects, tasks, boards, workflows)
- `src/store/sagas/` - Redux sagas for async operations

**How to Modify:**
- Customize Kanban columns: Modify `KanbanBoard.tsx` and `src/store/slices/boardsSlice.ts`
- Add task filters: Extend `TaskList.tsx` and `src/store/slices/tasksSlice.ts`
- Customize drag & drop: Modify `@dnd-kit` configuration
- Add new workflow actions: Extend workflow designer and saga
- Customize real-time updates: Modify WebSocket integration in sagas
- Modify state structure: Update Redux slices
- Add new API operations: Create new sagas

**Module Federation Exposes:**
- `./KanbanBoard` - Kanban board component
- `./TaskList` - Task list component
- `./ProjectManagement` - Project management
- `./WorkflowDesigner` - Workflow designer

#### 4. Analytics MFE (`frontend/analytics-mfe`)
**Technology:** Next.js 14+  
**Port:** 3003 (dev)  
**Purpose:** Analytics dashboards and reports

**Key Features:**
- Dashboard with charts (Recharts)
- Report generation UI
- Server-side rendering for performance

**Main Components:**
- `src/components/Dashboard.tsx` - Main dashboard
- `src/components/Reports.tsx` - Report generation

**How to Modify:**
- Add new charts: Extend `Dashboard.tsx` with Recharts
- Customize report templates: Modify `Reports.tsx`
- Add new metrics: Connect to analytics service
- Customize dashboard layout: Modify component structure

**Module Federation Exposes:**
- `./Dashboard` - Analytics dashboard
- `./Reports` - Report generation

#### 5. Admin MFE (`frontend/admin-mfe`)
**Technology:** React 19  
**Port:** 3004 (dev)  
**Purpose:** Admin panel for RBAC, users, system settings

**Key Features:**
- RBAC management UI
- User management interface
- System settings configuration

**Main Components:**
- `src/components/RBACManagement.tsx` - Role and permission management
- `src/components/UserManagement.tsx` - User CRUD interface
- `src/components/SystemSettings.tsx` - System configuration

**How to Modify:**
- Add new permission types: Extend RBAC management
- Customize user management: Modify `UserManagement.tsx`
- Add system settings: Extend `SystemSettings.tsx`
- Add audit logs view: Create new component

**Module Federation Exposes:**
- `./RBACManagement` - RBAC management
- `./UserManagement` - User management
- `./SystemSettings` - System settings

#### 6. Shared UI (`frontend/shared-ui`)
**Technology:** React 19  
**Purpose:** Shared component library for all microfrontends

**Key Features:**
- Reusable UI components
- Custom hooks
- API client utilities
- WebSocket hook

**Main Components:**
- `src/components/Button.tsx` - Button component
- `src/components/Input.tsx` - Input component
- `src/components/Modal.tsx` - Modal component
- `src/components/Card.tsx` - Card component

**Main Hooks:**
- `src/hooks/useAuth.ts` - Authentication hook
- `src/hooks/useApi.ts` - API query/mutation hooks
- `src/hooks/useWebSocket.ts` - WebSocket connection hook

**How to Modify:**
- Add new components: Create in `src/components/`
- Add new hooks: Create in `src/hooks/`
- Customize API client: `src/utils/api-client.ts`
- Add utility functions: `src/utils/`

**Publishing:**
```bash
npm run build
npm publish --access public
```

### Shared Libraries

#### 1. DTO Library (`shared-libs/dto`)
**Purpose:** Data Transfer Objects for API communication

**Exports:**
- `UserDto`, `CreateUserDto`, `UpdateUserDto`
- `ProjectDto`, `CreateProjectDto`, `UpdateProjectDto`
- `TaskDto`, `CreateTaskDto`, `UpdateTaskDto`
- `RoleDto`, `PermissionDto`
- `AuthResponseDto`, `LoginDto`, `RegisterDto`
- `MigrationDto`, `CreateMigrationDto`
- `ApiResponse<T>` - Generic API response wrapper

**How to Modify:**
- Add new DTOs: `src/index.ts`
- Modify existing DTOs: Update interface definitions
- Add validation: Use class-validator decorators

**Publishing:**
```bash
npm run build
npm publish --access public
```

#### 2. Interfaces Library (`shared-libs/interfaces`)
**Purpose:** TypeScript interfaces for domain models

**Exports:**
- `Permission`, `Role` - RBAC interfaces
- `Workflow`, `Trigger`, `Condition`, `Action` - Workflow interfaces
- `KanbanBoard`, `Column`, `Swimlane` - Kanban interfaces
- `SLA`, `Priority`, `Duration`, `EscalationRule` - SLA interfaces
- `Notification`, `NotificationChannel` - Notification interfaces
- `Migration`, `MigrationStatus` - Migration interfaces

**How to Modify:**
- Add new interfaces: `src/index.ts`
- Extend existing interfaces: Modify type definitions
- Add enum types: Define in `src/index.ts`

**Publishing:**
```bash
npm run build
npm publish --access public
```

#### 3. Utils Library (`shared-libs/utils`)
**Purpose:** Shared utility functions

**Exports:**
- `Logger` - Structured logging utility
- `VersionManager` - Version comparison and management
- `AppException`, `ValidationException`, `NotFoundException` - Error classes

**How to Modify:**
- Add new utilities: Create new files in `src/`
- Extend Logger: Add new log levels or features
- Add validation utilities: Create validation helpers

**Publishing:**
```bash
npm run build
npm publish --access public
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** & **Docker Compose** (for local development)
- **PostgreSQL** 15+ (or use Docker)
- **MongoDB** (or use Docker)
- **Redis** (or use Docker)
- **Git** (for version control)

### Development Approaches

This project supports **two development approaches**:

1. **Monorepo Mode** - Run everything together (recommended for local development)
2. **Separate Module Mode** - Run individual modules independently

See [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for detailed information.

### Initial Setup

#### Option 1: Monorepo Setup (Recommended)

```bash
# Clone the monorepo
git clone <monorepo-url>
cd enterprise-task-management-system

# Install all dependencies
npm install

# Start databases
npm run docker:up

# Run all services
npm run dev:all
```

#### Option 2: Separate Module Setup

#### 1. Clone Module Repositories

Each module can be in a separate Git repository. Clone the ones you need:

```bash
# Backend services
git clone https://github.com/your-org/auth-service.git
git clone https://github.com/your-org/project-service.git
git clone https://github.com/your-org/notification-service.git
git clone https://github.com/your-org/migration-service.git

# Frontend applications
git clone https://github.com/your-org/shell-app.git
git clone https://github.com/your-org/auth-mfe.git
git clone https://github.com/your-org/workspace-mfe.git
git clone https://github.com/your-org/analytics-mfe.git
git clone https://github.com/your-org/admin-mfe.git
git clone https://github.com/your-org/shared-ui.git

# Shared libraries
git clone https://github.com/your-org/dto.git
git clone https://github.com/your-org/interfaces.git
git clone https://github.com/your-org/utils.git

# Infrastructure
git clone https://github.com/your-org/infrastructure.git
```

#### 2. Install Shared Libraries

First, publish or install shared libraries:

**Option A: Publish to NPM (Recommended)**
```bash
cd shared-libs/dto
npm login
npm publish --access public

cd ../interfaces
npm publish --access public

cd ../utils
npm publish --access public

cd ../../frontend/shared-ui
npm publish --access public
```

**Option B: Install from Git (For Development)**
```bash
# In each service's package.json, use:
"@task-management/dto": "git+https://github.com/your-org/dto.git"
```

#### 3. Install Dependencies

For each module:

```bash
cd backend/auth-service
npm install

cd ../../backend/project-service
npm install

# ... repeat for all modules
```

#### 4. Setup Environment Variables

Create `.env` files in each service:

**backend/auth-service/.env:**
```env
PORT=3001
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/task_management
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000
```

**backend/project-service/.env:**
```env
PORT=3002
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/task_management
ALLOWED_ORIGINS=http://localhost:3000
```

**backend/notification-service/.env:**
```env
PORT=3003
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=task_management
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
ALLOWED_ORIGINS=http://localhost:3000
```

**backend/migration-service/.env:**
```env
PORT=3004
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/task_management
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=task_management
ALLOWED_ORIGINS=http://localhost:3000
```

**frontend/shell-app/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=http://localhost:3003
```

#### 5. Setup Databases

**Using Docker Compose (Recommended):**
```bash
# From infrastructure repository
docker-compose up -d postgres mongodb redis
```

**Or manually:**
```bash
# PostgreSQL
createdb task_management

# MongoDB
# MongoDB will create database automatically on first connection
```

#### 6. Run Database Migrations

```bash
cd backend/migration-service
npm install
npm run start:dev

# In another terminal, execute migrations
curl -X POST http://localhost:3004/api/v1/migrations/execute \
  -H "Content-Type: application/json" \
  -d '{"version": "V1", "type": "sql"}'

curl -X POST http://localhost:3004/api/v1/migrations/execute \
  -H "Content-Type: application/json" \
  -d '{"version": "V1", "type": "nosql"}'
```

---

## Running the Project

### Option 1: Monorepo Mode (Easiest)

From the root directory:

```bash
# Start databases
npm run docker:up

# Run all services together
npm run dev:all

# Or run separately
npm run dev:backend   # All backend services
npm run dev:frontend  # All frontend services
```

### Option 2: Run Individual Services

From root directory:

```bash
# Backend services
npm run dev:auth          # Auth service
npm run dev:project       # Project service
npm run dev:notification  # Notification service
npm run dev:migration     # Migration service

# Frontend services
npm run dev:shell         # Shell app
npm run dev:auth-mfe      # Auth MFE
npm run dev:workspace-mfe # Workspace MFE
npm run dev:analytics-mfe # Analytics MFE
npm run dev:admin-mfe     # Admin MFE
```

### Option 3: Docker Compose + Manual Services

Start databases with Docker Compose:

```bash
npm run docker:up
```

Then start services individually (from root or module directories).

### Option 4: Separate Module Mode

Navigate to each module and run individually:

#### Backend Services

**Terminal 1 - Auth Service:**
```bash
cd backend/auth-service
npm install
npm run prisma:generate
npm run start:dev
# Runs on http://localhost:3001
```

**Terminal 2 - Project Service:**
```bash
cd backend/project-service
npm install
npm run prisma:generate
npm run start:dev
# Runs on http://localhost:3002
```

**Terminal 3 - Notification Service:**
```bash
cd backend/notification-service
npm install
npm run start:dev
# Runs on http://localhost:3003
```

**Terminal 4 - Migration Service:**
```bash
cd backend/migration-service
npm install
npm run start:dev
# Runs on http://localhost:3004
```

#### Frontend Applications

**Terminal 5 - Shell App:**
```bash
cd frontend/shell-app
npm install
npm run dev
# Runs on http://localhost:3000
```

**Terminal 6 - Auth MFE:**
```bash
cd frontend/auth-mfe
npm install
npm run dev
# Runs on http://localhost:3001 (dev server)
```

**Terminal 7 - Workspace MFE:**
```bash
cd frontend/workspace-mfe
npm install
npm run dev
# Runs on http://localhost:3002 (dev server)
```

**Terminal 8 - Analytics MFE:**
```bash
cd frontend/analytics-mfe
npm install
npm run dev
# Runs on http://localhost:3003 (dev server)
```

**Terminal 9 - Admin MFE:**
```bash
cd frontend/admin-mfe
npm install
npm run dev
# Runs on http://localhost:3004 (dev server)
```

### Accessing the Application

- **Shell App:** http://localhost:3000
- **Auth Service API:** http://localhost:3001/api/v1
- **Project Service API:** http://localhost:3002/api/v1
- **Notification Service API:** http://localhost:3003/api/v1
- **Migration Service API:** http://localhost:3004/api/v1
- **Swagger Docs:**
  - Auth: http://localhost:3001/api/docs
  - Project: http://localhost:3002/api/docs
  - Migration: http://localhost:3004/api/docs

---

## Module Modification Guide

### Adding a New Backend Service

1. **Create Service Directory:**
   ```bash
   mkdir backend/new-service
   cd backend/new-service
   ```

2. **Initialize NestJS:**
   ```bash
   npm install -g @nestjs/cli
   nest new . --skip-git
   ```

3. **Install Dependencies:**
   ```bash
   npm install @task-management/dto @task-management/interfaces @task-management/utils
   ```

4. **Create Service Structure:**
   ```
   src/
   ├── main.ts
   ├── app.module.ts
   ├── your-module/
   │   ├── your-module.controller.ts
   │   ├── your-module.service.ts
   │   └── your-module.module.ts
   └── prisma/ (if using Prisma)
   ```

5. **Add to API Gateway:**
   Edit `backend/api-gateway/kong.yml`:
   ```yaml
   services:
     - name: new-service
       url: http://new-service:3005
       routes:
         - name: new-service-v1
           paths:
             - /api/v1/your-endpoint
   ```

6. **Add Dockerfile:**
   Copy from another service and modify

7. **Add Kubernetes Manifest:**
   Copy from `k8s/auth-service/` and modify

### Adding a New Frontend Microfrontend

1. **Create MFE Directory:**
   ```bash
   mkdir frontend/new-mfe
   cd frontend/new-mfe
   ```

2. **Initialize Vite/Next.js:**
   ```bash
   # For React 19
   npm create vite@latest . -- --template react-ts
   
   # For Next.js 14+
   npx create-next-app@latest . --typescript --app
   ```

3. **Install Dependencies:**
   ```bash
   npm install @task-management/shared-ui
   ```

4. **Configure Module Federation:**
   ```typescript
   // vite.config.ts or next.config.js
   federation({
     name: 'newMfe',
     filename: 'remoteEntry.js',
     exposes: {
       './YourComponent': './src/components/YourComponent',
     },
   })
   ```

5. **Update Shell App:**
   Edit `frontend/shell-app/next.config.js`:
   ```javascript
   remotes: {
     newMfe: 'newMfe@http://localhost:3005/remoteEntry.js',
   }
   ```

### Modifying Database Schema

1. **Update Prisma Schema:**
   ```bash
   cd backend/auth-service  # or relevant service
   # Edit prisma/schema.prisma
   ```

2. **Create Migration:**
   ```bash
   # Option 1: Using Prisma
   npm run prisma:migrate dev --name your_migration_name
   
   # Option 2: Using Migration Service
   # Create migration file manually
   # Then execute via API
   ```

3. **For Manual Migrations:**
   ```bash
   cd backend/migration-service/migrations/sql
   # Create V2__your_migration.sql
   
   # Execute via API
   curl -X POST http://localhost:3004/api/v1/migrations/execute \
     -H "Content-Type: application/json" \
     -d '{"version": "V2", "type": "sql"}'
   ```

### Adding New API Endpoints

1. **In NestJS Service:**
   ```typescript
   // src/your-module/your-module.controller.ts
   @Controller('your-resource')
   export class YourController {
     @Get()
     findAll() {
       return this.service.findAll();
     }
     
     @Post()
     create(@Body() dto: CreateYourDto) {
       return this.service.create(dto);
     }
   }
   ```

2. **Add DTO:**
   ```typescript
   // In shared-libs/dto/src/index.ts
   export interface YourDto {
     id: string;
     // ... fields
   }
   ```

3. **Update API Gateway:**
   Add route in `backend/api-gateway/kong.yml`

### Adding New Frontend Components

1. **In Shared UI (if reusable):**
   ```typescript
   // frontend/shared-ui/src/components/YourComponent.tsx
   export const YourComponent = () => {
     // Component implementation
   };
   ```

2. **In Specific MFE:**
   ```typescript
   // frontend/workspace-mfe/src/components/YourComponent.tsx
   export const YourComponent = () => {
     // Component implementation
   };
   ```

3. **Export from MFE:**
   Update `vite.config.ts` or `next.config.js` to expose component

### Customizing RBAC

1. **Add New Permission:**
   ```typescript
   // In shared-libs/interfaces/src/index.ts
   export interface Permission {
     resource: string;  // e.g., 'invoice'
     action: string;   // e.g., 'create'
     scope: string;     // e.g., 'organization'
   }
   ```

2. **Update RBAC Guard:**
   ```typescript
   // backend/auth-service/src/rbac/rbac.guard.ts
   // Add custom permission checking logic
   ```

3. **Use in Controller:**
   ```typescript
   @UseGuards(JwtAuthGuard, RbacGuard)
   @RequirePermissions({ resource: 'invoice', action: 'create', scope: 'organization' })
   @Post()
   create() {
     // ...
   }
   ```

### Adding Real-time Features

1. **Server Side (Notification Service):**
   ```typescript
   // backend/notification-service/src/services/websocket.service.ts
   async sendCustomEvent(userId: string, event: string, data: any) {
     this.io.to(`user:${userId}`).emit(event, data);
   }
   ```

2. **Client Side:**
   ```typescript
   // In any MFE
   import { useWebSocket } from '@task-management/shared-ui';
   
   const { on, emit } = useWebSocket(WS_URL, userId);
   
   useEffect(() => {
     on('custom-event', (data) => {
       // Handle event
     });
   }, [on]);
   ```

### Customizing Workflow Engine

1. **Add New Trigger:**
   ```typescript
   // In shared-libs/interfaces/src/index.ts
   export interface Trigger {
     type: 'status_change' | 'field_update' | 'time_based' | 'your_trigger';
     config: Record<string, unknown>;
   }
   ```

2. **Add New Action:**
   ```typescript
   export interface Action {
     type: 'update_status' | 'assign_user' | 'send_notification' | 'your_action';
     config: Record<string, unknown>;
   }
   ```

3. **Implement in Project Service:**
   ```typescript
   // backend/project-service/src/workflows/workflows.service.ts
   private async performAction(action: Action, context: Context) {
     switch (action.type) {
       case 'your_action':
         // Implement your action
         break;
     }
   }
   ```

---

## API Documentation

### API Versioning

All APIs use URL-based versioning:
- Current: `/api/v1/`
- Future: `/api/v2/`, `/api/v3/`, etc.

### Authentication

Most endpoints require JWT authentication:

```bash
# Get token
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use token
curl http://localhost:3002/api/v1/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Common Response Format

```typescript
{
  "success": true,
  "data": { /* response data */ },
  "version": "v1",
  "pagination": { /* if paginated */ }
}
```

### Error Response Format

```typescript
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Project not found",
    "details": { "projectId": "123" }
  }
}
```

### Swagger Documentation

Access Swagger UI at:
- Auth Service: http://localhost:3001/api/docs
- Project Service: http://localhost:3002/api/docs
- Migration Service: http://localhost:3004/api/docs

---

## Database Management

### Running Migrations

**Using Migration Service API:**
```bash
# Execute SQL migration
curl -X POST http://localhost:3004/api/v1/migrations/execute \
  -H "Content-Type: application/json" \
  -d '{
    "version": "V1",
    "type": "sql"
  }'

# Execute NoSQL migration
curl -X POST http://localhost:3004/api/v1/migrations/execute \
  -H "Content-Type: application/json" \
  -d '{
    "version": "V1",
    "type": "nosql"
  }'
```

**Check Migration Status:**
```bash
curl http://localhost:3004/api/v1/migrations/current?type=sql
curl http://localhost:3004/api/v1/migrations/history?type=sql
```

**Rollback Migration:**
```bash
curl -X POST http://localhost:3004/api/v1/migrations/rollback/V1?type=sql
```

### Creating New Migrations

**SQL Migration:**
```bash
cd backend/migration-service/migrations/sql
# Create file: V2__add_new_table.sql
```

```sql
-- V2__add_new_table.sql
CREATE TABLE new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROLLBACK
DROP TABLE IF EXISTS new_table;
```

**NoSQL Migration:**
```bash
cd backend/migration-service/migrations/nosql
# Create file: V2__add_new_collection.js
```

```javascript
// V2__add_new_collection.js
async function up(db) {
  await db.createCollection('new_collection', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name'],
        properties: {
          name: { bsonType: 'string' }
        }
      }
    }
  });
}

async function down(db) {
  await db.collection('new_collection').drop();
}
```

### Database Backup

**PostgreSQL:**
```bash
pg_dump -U postgres task_management > backup.sql
```

**MongoDB:**
```bash
mongodump --db task_management --out /backup/path
```

---

## Deployment

### Local Development with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment

1. **Setup Kubernetes Cluster:**
   ```bash
   # Using Terraform
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```

2. **Configure kubectl:**
   ```bash
   aws eks update-kubeconfig --name task-management-cluster --region us-east-1
   ```

3. **Deploy Services:**
   ```bash
   kubectl apply -f k8s/
   ```

4. **Check Status:**
   ```bash
   kubectl get deployments
   kubectl get services
   kubectl get pods
   ```

### AWS Deployment

See `DEPLOYMENT.md` for detailed AWS deployment instructions.

---

## Troubleshooting

### Common Issues

#### 1. Module Federation Not Loading

**Problem:** Remote modules not loading in shell app

**Solution:**
- Ensure all MFE dev servers are running
- Check `next.config.js` remote URLs
- Check browser console for CORS errors
- Verify `remoteEntry.js` is accessible

#### 2. Database Connection Errors

**Problem:** Services can't connect to database

**Solution:**
- Verify database is running: `docker ps`
- Check connection string in `.env`
- Verify network connectivity
- Check database logs: `docker-compose logs postgres`

#### 3. Shared Library Import Errors

**Problem:** `Cannot find module '@task-management/dto'`

**Solution:**
- Publish shared libraries to NPM first
- Or install from Git: `npm install git+https://github.com/your-org/dto.git`
- Check `package.json` dependencies
- Run `npm install` in service directory

#### 4. CORS Errors

**Problem:** CORS policy blocking requests

**Solution:**
- Add origin to `ALLOWED_ORIGINS` in service `.env`
- Check API Gateway CORS configuration
- Verify frontend API URL is correct

#### 5. WebSocket Connection Failed

**Problem:** WebSocket not connecting

**Solution:**
- Verify notification service is running
- Check `NEXT_PUBLIC_WS_URL` in frontend `.env.local`
- Check WebSocket server logs
- Verify firewall/network allows WebSocket connections

#### 6. Migration Execution Failed

**Problem:** Migration fails to execute

**Solution:**
- Check migration file syntax
- Verify database connection
- Check migration service logs
- Ensure previous migrations completed
- Check for version conflicts

### Debugging Tips

1. **Check Service Logs:**
   ```bash
   # Docker
   docker-compose logs -f auth-service
   
   # Kubernetes
   kubectl logs deployment/auth-service -f
   ```

2. **Verify Environment Variables:**
   ```bash
   # In service directory
   cat .env
   ```

3. **Test API Endpoints:**
   ```bash
   curl http://localhost:3001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "test"}'
   ```

4. **Check Database:**
   ```bash
   # PostgreSQL
   psql -U postgres -d task_management
   \dt  # List tables
   
   # MongoDB
   mongosh
   use task_management
   show collections
   ```

---

## Additional Resources

- [MODULE_STRUCTURE.md](./MODULE_STRUCTURE.md) - Module organization
- [SETUP_GIT_REPOS.md](./SETUP_GIT_REPOS.md) - Setting up separate Git repos
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [VERSIONING.md](./VERSIONING.md) - Versioning strategy
- [FINAL_STATUS.md](./FINAL_STATUS.md) - Implementation status

---

## Support

For issues or questions:
1. Check module-specific README.md files
2. Review API documentation (Swagger)
3. Check service logs
4. Review this documentation

---

**Last Updated:** 2024  
**Version:** 1.0.0

