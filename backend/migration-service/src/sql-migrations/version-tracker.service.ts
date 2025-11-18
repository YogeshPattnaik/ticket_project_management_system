import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { Logger } from '@task-management/utils';
import { IVersionTracker, IMigration } from '../common/migration.interface';

@Injectable()
export class SqlVersionTrackerService implements IVersionTracker, OnModuleInit {
  private pool: Pool;
  private readonly logger = new Logger('SqlVersionTracker');

  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      connectionString: this.configService.get<string>('POSTGRES_URL'),
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureMigrationTable();
    } catch (error) {
      this.logger.error('Failed to initialize migration table', error as Error);
      this.logger.warn('Service will continue but migration operations may fail');
      // Don't throw - allow service to start even if DB is unavailable
      // This is useful for development when DB might not be ready
    }
  }

  private async ensureMigrationTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        version VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(10) NOT NULL DEFAULT 'sql',
        status VARCHAR(20) NOT NULL,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        execution_time INTEGER NOT NULL,
        error TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_type ON schema_migrations(type);
    `;

    try {
      await this.pool.query(query);
      this.logger.info('Migration tracking table ensured');
    } catch (error) {
      this.logger.error('Failed to create migration table', error as Error);
      throw error;
    }
  }

  async getCurrentVersion(type: 'sql' | 'nosql'): Promise<string | null> {
    const query = `
      SELECT version 
      FROM schema_migrations 
      WHERE type = $1 AND status = 'completed'
      ORDER BY executed_at DESC 
      LIMIT 1
    `;

    try {
      const result = await this.pool.query(query, [type]);
      return result.rows[0]?.version || null;
    } catch (error) {
      this.logger.error('Failed to get current version', error as Error);
      throw error;
    }
  }

  async recordMigration(
    migration: IMigration,
    executionTime: number
  ): Promise<void> {
    const query = `
      INSERT INTO schema_migrations 
        (version, name, type, status, execution_time, error)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (version) 
      DO UPDATE SET 
        status = EXCLUDED.status,
        execution_time = EXCLUDED.execution_time,
        error = EXCLUDED.error,
        executed_at = NOW()
    `;

    try {
      await this.pool.query(query, [
        migration.version,
        migration.name,
        migration.type,
        migration.status,
        executionTime,
        migration.error || null,
      ]);
      this.logger.info(`Recorded migration ${migration.version}`);
    } catch (error) {
      this.logger.error('Failed to record migration', error as Error);
      throw error;
    }
  }

  async getMigrationHistory(type: 'sql' | 'nosql'): Promise<IMigration[]> {
    const query = `
      SELECT 
        id,
        version,
        name,
        type,
        status,
        executed_at,
        execution_time,
        error
      FROM schema_migrations
      WHERE type = $1
      ORDER BY executed_at DESC
    `;

    try {
      const result = await this.pool.query(query, [type]);
      return result.rows.map((row) => ({
        id: row.id,
        version: row.version,
        name: row.name,
        type: row.type,
        content: '', // Not stored in history
        status: row.status,
        executedAt: row.executed_at,
        executionTime: row.execution_time,
        error: row.error,
      }));
    } catch (error) {
      this.logger.error('Failed to get migration history', error as Error);
      throw error;
    }
  }

  async hasVersion(version: string, type: 'sql' | 'nosql'): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM schema_migrations
      WHERE version = $1 AND type = $2
    `;

    try {
      const result = await this.pool.query(query, [version, type]);
      return parseInt(result.rows[0].count, 10) > 0;
    } catch (error) {
      this.logger.error('Failed to check version', error as Error);
      throw error;
    }
  }
}

