import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db, Collection } from 'mongodb';
import { Logger } from '@task-management/utils';
import { IVersionTracker, IMigration } from '../common/migration.interface';

@Injectable()
export class NosqlVersionTrackerService implements IVersionTracker, OnModuleInit {
  private client!: MongoClient;
  private db!: Db;
  private collection!: Collection;
  private readonly logger = new Logger('NosqlVersionTracker');

  constructor(private configService: ConfigService) {
    const mongoUrl = this.configService.get<string>('MONGODB_URL');
    this.client = new MongoClient(mongoUrl || 'mongodb://localhost:27017');
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
    await this.ensureCollection();
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(this.configService.get<string>('MONGODB_DB_NAME') || 'task_management');
      this.collection = this.db.collection('schema_migrations');
      this.logger.info('Connected to MongoDB');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error as Error);
      throw error;
    }
  }

  private async ensureCollection(): Promise<void> {
    try {
      // Create indexes
      await this.collection.createIndex({ version: 1, type: 1 }, { unique: true });
      await this.collection.createIndex({ type: 1, executedAt: -1 });
      this.logger.info('Migration tracking collection ensured');
    } catch (error) {
      this.logger.error('Failed to ensure collection', error as Error);
      throw error;
    }
  }

  async getCurrentVersion(type: 'sql' | 'nosql'): Promise<string | null> {
    try {
      const result = await this.collection
        .findOne(
          { type, status: 'completed' },
          { sort: { executedAt: -1 } }
        );
      return result?.version || null;
    } catch (error) {
      this.logger.error('Failed to get current version', error as Error);
      throw error;
    }
  }

  async recordMigration(
    migration: IMigration,
    executionTime: number
  ): Promise<void> {
    try {
      await this.collection.updateOne(
        { version: migration.version, type: migration.type },
        {
          $set: {
            version: migration.version,
            name: migration.name,
            type: migration.type,
            status: migration.status,
            executionTime,
            error: migration.error || null,
            executedAt: migration.executedAt || new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      this.logger.info(`Recorded migration ${migration.version}`);
    } catch (error) {
      this.logger.error('Failed to record migration', error as Error);
      throw error;
    }
  }

  async getMigrationHistory(type: 'sql' | 'nosql'): Promise<IMigration[]> {
    try {
      const results = await this.collection
        .find({ type })
        .sort({ executedAt: -1 })
        .toArray();

      return results.map((doc) => ({
        id: doc._id.toString(),
        version: doc.version,
        name: doc.name,
        type: doc.type,
        content: '', // Not stored in history
        status: doc.status,
        executedAt: doc.executedAt,
        executionTime: doc.executionTime,
        error: doc.error,
      }));
    } catch (error) {
      this.logger.error('Failed to get migration history', error as Error);
      throw error;
    }
  }

  async hasVersion(version: string, type: 'sql' | 'nosql'): Promise<boolean> {
    try {
      const count = await this.collection.countDocuments({ version, type });
      return count > 0;
    } catch (error) {
      this.logger.error('Failed to check version', error as Error);
      throw error;
    }
  }
}

