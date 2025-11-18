# Auth Service

Authentication and authorization service built with NestJS.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
PORT=3001
POSTGRES_URL=postgresql://user:password@localhost:5432/task_management
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000
```

## Development

```bash
npm run start:dev
```

## Build

```bash
npm run build
npm run start:prod
```

## Dependencies

- `@task-management/dto` - Shared DTOs
- `@task-management/interfaces` - Shared interfaces
- `@task-management/utils` - Shared utilities

Install shared packages:
```bash
npm install @task-management/dto @task-management/interfaces @task-management/utils
```

## API Documentation

Swagger UI available at: http://localhost:3001/api/docs

## License

Proprietary

