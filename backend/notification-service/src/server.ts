import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { NotificationService } from './services/notification.service';
import { WebSocketService } from './services/websocket.service';
import { EmailService } from './services/email.service';
import { MongoService } from './services/mongo.service';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

// Initialize services
const mongoService = new MongoService();
const emailService = new EmailService();
const websocketService = new WebSocketService(io);
const notificationService = new NotificationService(
  mongoService,
  websocketService,
  emailService
);

// REST API endpoints
app.post('/api/v1/notifications', async (req, res) => {
  try {
    const { userId, type, title, message, channels } = req.body;
    await notificationService.sendNotification({
      userId,
      type,
      title,
      message,
      channels: channels || ['websocket'],
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/notifications/:userId', async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.params.userId);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/v1/notifications/:id/read', async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('subscribe', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} subscribed to notifications`);
  });

  socket.on('unsubscribe', (userId: string) => {
    socket.leave(`user:${userId}`);
    console.log(`User ${userId} unsubscribed from notifications`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8003;
httpServer.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});

