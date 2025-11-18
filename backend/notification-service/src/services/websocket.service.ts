import { Server, Socket } from 'socket.io';
import { Notification } from '@task-management/interfaces';

export class WebSocketService {
  constructor(private io: Server) {}

  async sendNotification(userId: string, notification: Notification): Promise<void> {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  async broadcastNotification(notification: Notification): Promise<void> {
    this.io.emit('notification', notification);
  }

  getConnectedUsers(): string[] {
    const rooms = this.io.sockets.adapter.rooms;
    const users: string[] = [];
    
    rooms.forEach((_, roomName) => {
      if (roomName.startsWith('user:')) {
        users.push(roomName.replace('user:', ''));
      }
    });

    return users;
  }
}

