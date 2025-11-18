# Notification Service

Real-time notification service with WebSocket support.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

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

## Development

```bash
npm run start:dev
```

## Build

```bash
npm run build
npm run start
```

## API Endpoints

- `POST /api/v1/notifications` - Send notification
- `GET /api/v1/notifications/:userId` - Get user notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read

## WebSocket Events

- `subscribe` - Subscribe to user notifications
- `unsubscribe` - Unsubscribe from notifications
- `notification` - Receive notification event

## License

Proprietary

