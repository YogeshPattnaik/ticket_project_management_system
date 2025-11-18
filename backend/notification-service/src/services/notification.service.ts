import { Notification, NotificationChannel } from '@task-management/interfaces';
import { MongoService } from './mongo.service';
import { WebSocketService } from './websocket.service';
import { EmailService } from './email.service';

export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  message: string;
  channels: NotificationChannel[];
}

export class NotificationService {
  constructor(
    private mongoService: MongoService,
    private websocketService: WebSocketService,
    private emailService: EmailService
  ) {}

  async sendNotification(dto: CreateNotificationDto): Promise<Notification> {
    const notification: Notification = {
      id: '',
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      channels: dto.channels,
      read: false,
      createdAt: new Date(),
    };

    // Store in database
    const saved = await this.mongoService.saveNotification(notification);

    // Send via configured channels
    for (const channel of dto.channels) {
      switch (channel) {
        case 'websocket':
          await this.websocketService.sendNotification(dto.userId, saved);
          break;
        case 'email':
          await this.emailService.sendEmail(dto.userId, saved);
          break;
        case 'push':
          // Push notification implementation would go here
          console.log(`Push notification sent to user ${dto.userId}`);
          break;
      }
    }

    return saved;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.mongoService.getNotifications(userId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.mongoService.markNotificationAsRead(notificationId);
  }
}

