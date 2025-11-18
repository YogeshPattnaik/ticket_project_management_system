# Enterprise Task Management System - Development Prompt

## Project Overview
Build a modular, enterprise-grade task/project management system (similar to Jira) using modern microservices and microfrontend architecture with comprehensive RBAC, real-time features, and AWS deployment capabilities.

## System Architecture Requirements

### 1. Frontend Architecture - Microfrontends

#### Technology Stack
- **Framework**: Next.js 14+ with App Router for SSR/SSG capabilities
- **Language**: TypeScript 5.x with strict mode
- **Module Federation**: Webpack 5 Module Federation or Single-SPA for microfrontend orchestration
- **State Management**: Zustand for local state, React Query for server state
- **UI Components**: Shadcn/ui with Tailwind CSS for consistent design system
- **Real-time**: Socket.io-client for WebSocket connections

#### Microfrontend Services Structure
```
frontend/
├── shell-app/                 # Main container application
│   ├── src/
│   │   ├── layout/            # Main layout components
│   │   ├── routing/           # Central routing logic
│   │   └── federation/        # Module federation config
│   └── public/
├── auth-mfe/                  # Authentication & user management
│   ├── src/
│   │   ├── components/        # Login, register, profile
│   │   └── services/          # Auth API integration
├── workspace-mfe/             # Workspace & project management
│   ├── src/
│   │   ├── boards/           # Kanban boards
│   │   ├── lists/            # TODO lists
│   │   └── workflows/        # Workflow designer
├── analytics-mfe/             # Reports & dashboards
│   ├── src/
│   │   ├── reports/          # Report generation
│   │   └── dashboards/       # Analytics dashboards
├── admin-mfe/                 # Admin panel
│   ├── src/
│   │   ├── rbac/             # Role & permission management
│   │   ├── users/            # User management
│   │   └── settings/         # System settings
└── shared-ui/                 # Shared component library
    ├── components/           # Reusable components
    ├── hooks/               # Custom hooks
    └── utils/               # Shared utilities
```

### 2. Backend Architecture - Microservices

#### Technology Decision Matrix
```
Service Type         | Technology    | Reasoning
--------------------|---------------|----------------------------------
Auth Service        | NestJS        | Built-in JWT, Guards, Decorators
Core Services       | NestJS        | TypeScript, DI, Modular structure
Real-time Service   | Node/Express  | Lightweight for WebSocket handling
File Service        | SpringBoot    | Superior file handling, streaming
Analytics Service   | SpringBoot    | Better for complex data processing
```

#### Microservices Structure
```
backend/
├── api-gateway/               # Kong/NGINX - Single entry point
│   ├── config/
│   ├── routes/
│   └── middleware/
├── auth-service/              # NestJS - Authentication & authorization
│   ├── src/
│   │   ├── auth/             # JWT, OAuth2
│   │   ├── rbac/             # Role-based access control
│   │   └── users/            # User management
│   └── prisma/                # Database schemas
├── project-service/           # NestJS - Core project management
│   ├── src/
│   │   ├── projects/         # Project CRUD
│   │   ├── tasks/            # Task management
│   │   ├── workflows/        # Workflow engine
│   │   └── boards/           # Kanban board logic
├── notification-service/      # Express - Real-time notifications
│   ├── src/
│   │   ├── websocket/        # Socket.io server
│   │   ├── email/            # Email notifications
│   │   └── push/             # Push notifications
├── file-service/             # SpringBoot - File management
│   ├── src/main/java/
│   │   ├── storage/          # S3 integration
│   │   ├── processing/       # File processing
│   │   └── streaming/        # File streaming
├── analytics-service/        # SpringBoot - Reports & analytics
│   ├── src/main/java/
│   │   ├── reports/          # Report generation
│   │   ├── metrics/          # Metrics calculation
│   │   └── export/           # Data export
└── shared-libs/              # Shared libraries
    ├── dto/                  # Shared DTOs
    ├── interfaces/           # Common interfaces
    └── utils/                # Utility functions
```

### 3. Database Architecture

#### Database Strategy
```yaml
Primary Database:
  Type: PostgreSQL 15+
  Usage: 
    - Transactional data (projects, tasks, users)
    - RBAC (roles, permissions)
    - Workflows, comments
  Features:
    - JSONB for custom fields
    - Full-text search for comments
    - Partitioning for large tables

Secondary Database:
  Type: MongoDB
  Usage:
    - Audit logs
    - Activity feeds
    - File metadata
    - Notification history

Cache Layer:
  Type: Redis Cluster
  Usage:
    - Session management
    - Real-time presence
    - Query caching
    - Rate limiting

Search Engine:
  Type: Elasticsearch
  Usage:
    - Full-text search across all entities
    - Advanced filtering
    - Analytics aggregations
```

#### Database Schema Design (PostgreSQL)
```sql
-- Core entities
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    profile JSONB DEFAULT '{}',
    organization_id UUID REFERENCES organizations(id)
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    permissions JSONB NOT NULL,
    organization_id UUID REFERENCES organizations(id)
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    organization_id UUID REFERENCES organizations(id)
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    priority INTEGER,
    custom_fields JSONB DEFAULT '{}',
    project_id UUID REFERENCES projects(id),
    assignee_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing strategy
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_custom_fields ON tasks USING GIN(custom_fields);
```

### 4. RBAC Implementation

#### Permission Model
```typescript
interface Permission {
  resource: string;      // 'project', 'task', 'user', etc.
  action: string;        // 'create', 'read', 'update', 'delete'
  scope: string;         // 'own', 'team', 'organization'
  conditions?: object;   // Dynamic conditions
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  hierarchy: number;     // For role inheritance
}

// Predefined roles structure
const roles = {
  SUPER_ADMIN: {
    hierarchy: 100,
    permissions: ['*:*:*']  // Full access
  },
  ORGANIZATION_ADMIN: {
    hierarchy: 90,
    permissions: [
      'organization:*:organization',
      'user:*:organization',
      'project:*:organization'
    ]
  },
  PROJECT_MANAGER: {
    hierarchy: 70,
    permissions: [
      'project:*:team',
      'task:*:team',
      'workflow:*:team'
    ]
  },
  TEAM_LEADER: {
    hierarchy: 50,
    permissions: [
      'task:create:team',
      'task:update:team',
      'task:assign:team'
    ]
  },
  CONTRIBUTOR: {
    hierarchy: 30,
    permissions: [
      'task:read:team',
      'task:update:own',
      'comment:create:team'
    ]
  },
  VIEWER: {
    hierarchy: 10,
    permissions: [
      'project:read:team',
      'task:read:team'
    ]
  }
};
```

### 5. Core Features Implementation

#### A. Kanban Board
```typescript
interface KanbanBoard {
  columns: Column[];
  swimlanes?: Swimlane[];
  filters: Filter[];
  automation: WorkflowRule[];
}

interface Column {
  id: string;
  name: string;
  limit?: number;          // WIP limit
  statuses: string[];      // Mapped task statuses
  color: string;
}

// Drag & Drop with optimistic updates
const moveTask = async (taskId: string, columnId: string) => {
  // Optimistic update
  updateLocalState(taskId, columnId);
  
  // Server update with rollback on failure
  try {
    await api.updateTaskStatus(taskId, columnId);
  } catch (error) {
    rollbackLocalState(taskId);
  }
};
```

#### B. Workflow Engine
```typescript
interface Workflow {
  id: string;
  name: string;
  triggers: Trigger[];
  conditions: Condition[];
  actions: Action[];
}

interface Trigger {
  type: 'status_change' | 'field_update' | 'time_based';
  config: object;
}

// Workflow execution engine
class WorkflowEngine {
  async execute(workflow: Workflow, context: Context) {
    if (!this.evaluateConditions(workflow.conditions, context)) {
      return;
    }
    
    for (const action of workflow.actions) {
      await this.performAction(action, context);
    }
  }
}
```

#### C. SLA & Time Tracking
```typescript
interface SLA {
  id: string;
  name: string;
  priority: Priority;
  responseTime: Duration;
  resolutionTime: Duration;
  escalationRules: EscalationRule[];
}

class SLATracker {
  calculateBreachTime(task: Task, sla: SLA): Date {
    const startTime = task.createdAt;
    const workingHours = this.getWorkingHours();
    return this.addBusinessTime(startTime, sla.resolutionTime, workingHours);
  }
  
  async checkBreaches() {
    const tasks = await this.getActiveTasks();
    for (const task of tasks) {
      if (this.isBreaching(task)) {
        await this.escalate(task);
      }
    }
  }
}
```

#### D. Real-time Notifications
```typescript
// WebSocket server setup
class NotificationService {
  private io: Server;
  
  async sendNotification(userId: string, notification: Notification) {
    // Store in database
    await this.saveNotification(notification);
    
    // Send real-time via WebSocket
    this.io.to(`user:${userId}`).emit('notification', notification);
    
    // Send email if configured
    if (notification.channels.includes('email')) {
      await this.emailService.send(notification);
    }
  }
}

// Client-side subscription
useEffect(() => {
  socket.on('notification', (notification) => {
    showToast(notification);
    updateNotificationBadge();
  });
}, []);
```

### 6. Infrastructure & Deployment

#### Docker Configuration
```dockerfile
# Backend service Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### Kubernetes Manifests
```yaml
# Deployment example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: project-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: project-service
  template:
    metadata:
      labels:
        app: project-service
    spec:
      containers:
      - name: project-service
        image: task-system/project-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: project-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: project-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

#### AWS Infrastructure (Terraform)
```hcl
# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "task-management-cluster"
  cluster_version = "1.28"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  node_groups = {
    main = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 2
      
      instance_types = ["t3.medium"]
    }
  }
}

# RDS for PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "task-management-db"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  
  multi_az               = true
  backup_retention_period = 30
}

# ElastiCache for Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "task-cache"
  engine              = "redis"
  node_type           = "cache.t3.micro"
  num_cache_nodes     = 1
  parameter_group_name = "default.redis7"
}
```

### 7. CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth-service, project-service, notification-service]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend/${{ matrix.service }}
        npm ci
    
    - name: Run tests
      run: |
        cd backend/${{ matrix.service }}
        npm run test:cov
    
    - name: SonarQube Scan
      uses: sonarsource/sonarqube-scan-action@master
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Login to Amazon ECR
      run: |
        aws ecr get-login-password --region us-east-1 | \
        docker login --username AWS --password-stdin $ECR_REGISTRY
    
    - name: Build and push Docker images
      run: |
        for service in auth-service project-service notification-service; do
          docker build -t $ECR_REGISTRY/$service:$GITHUB_SHA backend/$service
          docker push $ECR_REGISTRY/$service:$GITHUB_SHA
        done
    
    - name: Deploy to EKS
      run: |
        kubectl set image deployment/auth-service \
          auth-service=$ECR_REGISTRY/auth-service:$GITHUB_SHA \
          --record
```

### 8. Observability Stack

#### Monitoring & Logging
```yaml
# Prometheus configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

#### Application Metrics
```typescript
// Custom metrics in NestJS service
import { Counter, Histogram, register } from 'prom-client';

export class MetricsService {
  private taskCreatedCounter = new Counter({
    name: 'tasks_created_total',
    help: 'Total number of tasks created',
    labelNames: ['project', 'priority']
  });
  
  private apiResponseTime = new Histogram({
    name: 'api_response_time_seconds',
    help: 'API response time in seconds',
    labelNames: ['method', 'route', 'status_code']
  });
  
  trackTaskCreation(project: string, priority: string) {
    this.taskCreatedCounter.inc({ project, priority });
  }
}
```

### 9. Security Implementation

#### Security Measures
```typescript
// API Gateway security
class SecurityMiddleware {
  // Rate limiting
  rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  });
  
  // CORS configuration
  corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
    optionsSuccessStatus: 200
  };
  
  // Input validation
  validateInput(schema: Joi.Schema) {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details });
      }
      next();
    };
  }
  
  // SQL injection prevention (using Prisma ORM)
  async safeQuery(query: string, params: any[]) {
    return await this.prisma.$queryRawSafe(query, ...params);
  }
}
```

### 10. Performance Optimization

#### Backend Optimizations
```typescript
// Query optimization
class TaskService {
  // Use database views for complex queries
  async getTasksWithDetails(projectId: string) {
    return this.prisma.$queryRaw`
      SELECT * FROM task_details_view 
      WHERE project_id = ${projectId}
    `;
  }
  
  // Implement cursor-based pagination
  async getTasks(cursor?: string, limit = 20) {
    return this.prisma.task.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' }
    });
  }
  
  // Batch operations
  async batchUpdate(updates: TaskUpdate[]) {
    return this.prisma.$transaction(
      updates.map(update => 
        this.prisma.task.update({
          where: { id: update.id },
          data: update.data
        })
      )
    );
  }
}
```

#### Frontend Optimizations
```typescript
// React Query configuration for optimal caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3
    }
  }
});

// Virtual scrolling for large lists
import { FixedSizeList } from 'react-window';

const TaskList = ({ tasks }) => (
  <FixedSizeList
    height={600}
    itemCount={tasks.length}
    itemSize={80}
    width="100%"
  >
    {({ index, style }) => (
      <TaskItem style={style} task={tasks[index]} />
    )}
  </FixedSizeList>
);
```

### 11. Testing Strategy

#### Test Structure
```typescript
// Unit test example
describe('TaskService', () => {
  let service: TaskService;
  let prisma: PrismaService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TaskService, PrismaService]
    }).compile();
    
    service = module.get<TaskService>(TaskService);
    prisma = module.get<PrismaService>(PrismaService);
  });
  
  describe('createTask', () => {
    it('should create a task with valid data', async () => {
      const taskData = { title: 'Test Task', projectId: '123' };
      const expectedTask = { id: '456', ...taskData };
      
      jest.spyOn(prisma.task, 'create').mockResolvedValue(expectedTask);
      
      const result = await service.createTask(taskData);
      
      expect(result).toEqual(expectedTask);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: taskData
      });
    });
  });
});

// E2E test example
describe('Task API (e2e)', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
  });
  
  it('/tasks (POST)', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Test Task', projectId: '123' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('Test Task');
      });
  });
});
```

## Development Guidelines

### Code Quality Standards

1. **TypeScript Configuration**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

2. **ESLint Configuration**
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': 'warn',
    'no-debugger': 'error'
  }
};
```

3. **Git Commit Convention**
```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style changes
refactor: Code refactoring
test: Test changes
chore: Build process or auxiliary tool changes
```

### API Design Standards

1. **RESTful Endpoints**
```
GET    /api/v1/projects              # List projects
POST   /api/v1/projects              # Create project
GET    /api/v1/projects/:id          # Get project
PUT    /api/v1/projects/:id          # Update project
DELETE /api/v1/projects/:id          # Delete project
GET    /api/v1/projects/:id/tasks    # List project tasks
```

2. **Response Format**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}
```

3. **Error Handling**
```typescript
class AppException extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Usage
throw new AppException(
  404,
  'RESOURCE_NOT_FOUND',
  'Project not found',
  { projectId }
);
```

## Scaling Strategies

### Horizontal Scaling
- Kubernetes HPA based on CPU/Memory metrics
- Database read replicas for query distribution
- Redis cluster for cache scaling
- CDN for static assets

### Vertical Scaling
- Node pool with different instance types
- Database instance upgrades without downtime
- ElastiCache node type upgrades

### Performance Targets
- API response time: p95 < 200ms
- Page load time: < 2 seconds
- WebSocket latency: < 100ms
- Database query time: p95 < 50ms
- Availability: 99.9% uptime

## Summary

This system architecture provides:
1. **Modularity**: Clean separation of concerns with microfrontends and microservices
2. **Scalability**: Both horizontal and vertical scaling capabilities
3. **Performance**: Optimized database queries, caching, and CDN usage
4. **Security**: Comprehensive RBAC, input validation, and security headers
5. **Observability**: Full monitoring, logging, and tracing
6. **Maintainability**: Clean code standards, testing, and documentation

The technology choices balance performance, developer experience, and operational complexity while maintaining enterprise-grade reliability and security.
