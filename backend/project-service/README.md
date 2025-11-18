# Project Service

Project and task management service built with NestJS.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
PORT=3002
POSTGRES_URL=postgresql://user:password@localhost:5432/task_management
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

## API Documentation

Swagger UI available at: http://localhost:3002/api/docs

## License

Proprietary

