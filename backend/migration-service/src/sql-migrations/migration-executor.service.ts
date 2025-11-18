import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { Logger } from '@task-management/utils';
import { IMigration, IMigrationExecutor } from '../common/migration.interface';
import { SqlVersionTrackerService } from './version-tracker.service';

@Injectable()
export class SqlMigrationExecutorService implements IMigrationExecutor {
  private readonly logger = new Logger('SqlMigrationExecutor');

  constructor(
    private configService: ConfigService,
    private versionTracker: SqlVersionTrackerService
  ) {}

  async execute(migration: IMigration): Promise<void> {
    const startTime = Date.now();
    const client = new Client({
      connectionString: this.configService.get<string>('POSTGRES_URL'),
    });

    try {
      await client.connect();
      await client.query('BEGIN');

      // Split SQL by semicolons and execute each statement
      const statements = this.splitStatements(migration.content);

      for (const statement of statements) {
        if (statement.trim()) {
          await client.query(statement);
        }
      }

      await client.query('COMMIT');

      const executionTime = Date.now() - startTime;
      migration.status = 'completed';
      migration.executedAt = new Date();
      migration.executionTime = executionTime;

      await this.versionTracker.recordMigration(migration, executionTime);
      this.logger.info(`Successfully executed migration ${migration.version}`);
    } catch (error) {
      await client.query('ROLLBACK');
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
    } finally {
      await client.end();
    }
  }

  async rollback(migration: IMigration): Promise<void> {
    if (!migration.rollbackContent) {
      throw new Error(`No rollback content available for migration ${migration.version}`);
    }

    const startTime = Date.now();
    const client = new Client({
      connectionString: this.configService.get<string>('POSTGRES_URL'),
    });

    try {
      await client.connect();
      await client.query('BEGIN');

      const statements = this.splitStatements(migration.rollbackContent);

      for (const statement of statements) {
        if (statement.trim()) {
          await client.query(statement);
        }
      }

      await client.query('COMMIT');

      const executionTime = Date.now() - startTime;
      migration.status = 'rolled_back';
      migration.executionTime = executionTime;

      await this.versionTracker.recordMigration(migration, executionTime);
      this.logger.info(`Successfully rolled back migration ${migration.version}`);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(
        `Failed to rollback migration ${migration.version}`,
        error as Error
      );
      throw error;
    } finally {
      await client.end();
    }
  }

  async validate(migration: IMigration): Promise<boolean> {
    // Check if version already exists
    const exists = await this.versionTracker.hasVersion(
      migration.version,
      'sql'
    );
    if (exists) {
      throw new Error(`Migration version ${migration.version} already exists`);
    }

    // Basic SQL syntax validation
    if (!migration.content || migration.content.trim().length === 0) {
      throw new Error('Migration content cannot be empty');
    }

    return true;
  }

  private splitStatements(sql: string): string[] {
    // Split by semicolon, but preserve semicolons inside strings and functions
    const statements: string[] = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let inFunction = false;
    let depth = 0;

    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      const nextChar = sql[i + 1];

      if (!inString && char === "'" && nextChar === "'") {
        current += char + nextChar;
        i++;
        continue;
      }

      if (!inString && (char === "'" || char === '"')) {
        inString = true;
        stringChar = char;
        current += char;
        continue;
      }

      if (inString && char === stringChar) {
        inString = false;
        stringChar = '';
        current += char;
        continue;
      }

      if (!inString && char === '$' && nextChar === '$') {
        inFunction = true;
        current += char;
        continue;
      }

      if (inFunction && char === '$' && nextChar === '$') {
        inFunction = false;
        current += char;
        i++;
        continue;
      }

      if (!inString && !inFunction && char === '(') {
        depth++;
        current += char;
        continue;
      }

      if (!inString && !inFunction && char === ')') {
        depth--;
        current += char;
        continue;
      }

      if (!inString && !inFunction && depth === 0 && char === ';') {
        statements.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      statements.push(current.trim());
    }

    return statements.filter((s) => s.length > 0);
  }
}

