import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';
import { Logger } from '@task-management/utils';
import { IMigration, IMigrationExecutor } from '../common/migration.interface';
import { NosqlVersionTrackerService } from './version-tracker.service';

@Injectable()
export class NosqlMigrationExecutorService implements IMigrationExecutor {
  private client!: MongoClient;
  private db!: Db;
  private readonly logger = new Logger('NosqlMigrationExecutor');

  constructor(
    private configService: ConfigService,
    private versionTracker: NosqlVersionTrackerService
  ) {
    const mongoUrl = this.configService.get<string>('MONGODB_URL');
    this.client = new MongoClient(mongoUrl || 'mongodb://localhost:27017');
  }

  private async getDb(): Promise<Db> {
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db(
        this.configService.get<string>('MONGODB_DB_NAME') || 'task_management'
      );
    }
    return this.db;
  }

  async execute(migration: IMigration): Promise<void> {
    const startTime = Date.now();
    const db = await this.getDb();

    try {
      // Create a migration function from the content
      const migrationFn = new Function('db', migration.content);

      // Execute the migration
      await migrationFn(db);

      const executionTime = Date.now() - startTime;
      migration.status = 'completed';
      migration.executedAt = new Date();
      migration.executionTime = executionTime;

      await this.versionTracker.recordMigration(migration, executionTime);
      this.logger.info(`Successfully executed migration ${migration.version}`);
    } catch (error) {
      const executionTime = Date.now() - startTime;

      migration.status = 'failed';
      migration.error = (error as Error).message;
      migration.executionTime = executionTime;

      await this.versionTracker.recordMigration(migration, executionTime);
      this.logger.error(
        `Failed to execute migration ${migration.version}`,
        error as Error
      );
      throw error;
    }
  }

  async rollback(migration: IMigration): Promise<void> {
    if (!migration.rollbackContent) {
      throw new Error(
        `No rollback content available for migration ${migration.version}`
      );
    }

    const startTime = Date.now();
    const db = await this.getDb();

    try {
      // Create a rollback function from the content
      const rollbackFn = new Function('db', migration.rollbackContent);

      // Execute the rollback
      await rollbackFn(db);

      const executionTime = Date.now() - startTime;
      migration.status = 'rolled_back';
      migration.executionTime = executionTime;

      await this.versionTracker.recordMigration(migration, executionTime);
      this.logger.info(`Successfully rolled back migration ${migration.version}`);
    } catch (error) {
      this.logger.error(
        `Failed to rollback migration ${migration.version}`,
        error as Error
      );
      throw error;
    }
  }

  async validate(migration: IMigration): Promise<boolean> {
    // Check if version already exists
    const exists = await this.versionTracker.hasVersion(
      migration.version,
      'nosql'
    );
    if (exists) {
      throw new Error(`Migration version ${migration.version} already exists`);
    }

    // Basic content validation
    if (!migration.content || migration.content.trim().length === 0) {
      throw new Error('Migration content cannot be empty');
    }

    // Validate JavaScript syntax
    try {
      new Function(migration.content);
    } catch (error) {
      throw new Error(
        `Invalid JavaScript syntax: ${(error as Error).message}`
      );
    }

    return true;
  }
}

