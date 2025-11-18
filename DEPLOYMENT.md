# Deployment Guide

## Prerequisites
- Docker and Docker Compose
- Kubernetes cluster (EKS recommended)
- AWS account with appropriate permissions
- Terraform >= 1.0
- kubectl configured

## Local Development

### Using Docker Compose
```bash
docker-compose up -d
```

This will start:
- PostgreSQL
- MongoDB
- Redis
- All backend services

### Running Services Individually

#### Backend Services
```bash
# Auth Service
cd backend/auth-service
npm install
npm run start:dev

# Project Service
cd backend/project-service
npm install
npm run start:dev

# Notification Service
cd backend/notification-service
npm install
npm run start:dev

# Migration Service
cd backend/migration-service
npm install
npm run start:dev
```

#### Frontend Services
```bash
# Shell App
cd frontend/shell-app
npm install
npm run dev

# Auth MFE
cd frontend/auth-mfe
npm install
npm run dev

# Workspace MFE
cd frontend/workspace-mfe
npm install
npm run dev

# Analytics MFE
cd frontend/analytics-mfe
npm install
npm run dev

# Admin MFE
cd frontend/admin-mfe
npm install
npm run dev
```

## Database Migrations

### Run Migrations
```bash
# Execute SQL migrations
curl -X POST http://localhost:3004/api/v1/migrations/execute \
  -H "Content-Type: application/json" \
  -d '{"version": "V1", "type": "sql"}'

# Execute NoSQL migrations
curl -X POST http://localhost:3004/api/v1/migrations/execute \
  -H "Content-Type: application/json" \
  -d '{"version": "V1", "type": "nosql"}'
```

## AWS Deployment

### 1. Initialize Terraform
```bash
cd terraform
terraform init
```

### 2. Plan Infrastructure
```bash
terraform plan -out=tfplan
```

### 3. Apply Infrastructure
```bash
terraform apply tfplan
```

This will create:
- EKS cluster
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- S3 buckets
- VPC and networking
- IAM roles and policies

### 4. Deploy to Kubernetes
```bash
# Configure kubectl
aws eks update-kubeconfig --name task-management-cluster --region us-east-1

# Apply Kubernetes manifests
kubectl apply -f k8s/

# Verify deployments
kubectl get deployments
kubectl get services
```

## CI/CD Pipeline

The GitHub Actions workflow automatically:
1. Runs tests on pull requests
2. Builds Docker images on main branch
3. Pushes to ECR
4. Deploys to EKS
5. Runs database migrations

## Monitoring

### Prometheus Metrics
Metrics are exposed at `/metrics` endpoint on each service.

### View Metrics
```bash
# Port forward to access metrics
kubectl port-forward deployment/auth-service 9090:3001
curl http://localhost:9090/metrics
```

## Health Checks

All services expose health check endpoints:
- Auth Service: http://localhost:3001/health
- Project Service: http://localhost:3002/health
- Notification Service: http://localhost:3003/health
- Migration Service: http://localhost:3004/health

## Troubleshooting

### Service Not Starting
1. Check logs: `kubectl logs deployment/<service-name>`
2. Verify environment variables in ConfigMap/Secrets
3. Check database connectivity

### Database Connection Issues
1. Verify RDS endpoint is correct
2. Check security group rules
3. Verify credentials in Secrets

### Frontend Module Federation Issues
1. Ensure all MFE services are running
2. Check remoteEntry.js files are accessible
3. Verify CORS configuration

