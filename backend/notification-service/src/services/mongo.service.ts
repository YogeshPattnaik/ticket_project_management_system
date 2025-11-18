import { MongoClient, Db, Collection } from 'mongodb';
import { Notification } from '@task-management/interfaces';

export class MongoService {
  private client: MongoClient;
  private db: Db;
  private collection: Collection;

  constructor() {
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
    this.client = new MongoClient(mongoUrl);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(process.env.MONGODB_DB_NAME || 'task_management');
      this.collection = this.db.collection('notifications');
      
      // Create indexes
      await this.collection.createIndex({ userId: 1, createdAt: -1 });
      await this.collection.createIndex({ read: 1 });
      
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async saveNotification(notification: Notification): Promise<Notification> {
    const doc = {
      ...notification,
      _id: notification.id || undefined,
    };
    
    const result = await this.collection.insertOne(doc);
    
    return {
      ...notification,
      id: result.insertedId.toString(),
    };
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const results = await this.collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return results.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      title: doc.title,
      message: doc.message,
      channels: doc.channels,
      read: doc.read,
      createdAt: doc.createdAt,
    }));
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: notificationId },
      { $set: { read: true } }
    );
  }
}

