# Migration Service

Database migration management service for SQL and NoSQL databases.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
PORT=3004
POSTGRES_URL=postgresql://user:password@localhost:5432/task_management
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=task_management
ALLOWED_ORIGINS=http://localhost:3000
```

## Development

```bash
npm run start:dev
```

## Usage

### Create Migration

```bash
curl -X POST http://localhost:3004/api/v1/migrations \
  -H "Content-Type: application/json" \
  -d '{
    "version": "V1",
    "name": "initial_schema",
    "type": "sql",
    "content": "CREATE TABLE ..."
  }'
```

### Execute Migration

```bash
curl -X POST http://localhost:3004/api/v1/migrations/execute \
  -H "Content-Type: application/json" \
  -d '{
    "version": "V1",
    "type": "sql"
  }'
```

## Dependencies

- `@task-management/dto` - Shared DTOs
- `@task-management/interfaces` - Shared interfaces
- `@task-management/utils` - Shared utilities

## License

Proprietary

