import { Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from '@task-management/utils';
import { IMigration } from '../common/migration.interface';
import { SqlMigrationExecutorService } from '../sql-migrations/migration-executor.service';
import { SqlMigrationParserService } from '../sql-migrations/migration-parser.service';
import { SqlVersionTrackerService } from '../sql-migrations/version-tracker.service';
import { NosqlMigrationExecutorService } from '../nosql-migrations/migration-executor.service';
import { NosqlMigrationParserService } from '../nosql-migrations/migration-parser.service';
import { NosqlVersionTrackerService } from '../nosql-migrations/version-tracker.service';
import { CreateMigrationDto, ExecuteMigrationDto } from '@task-management/dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MigrationsService {
  private readonly logger = new Logger('MigrationsService');

  constructor(
    private sqlExecutor: SqlMigrationExecutorService,
    private sqlParser: SqlMigrationParserService,
    private sqlVersionTracker: SqlVersionTrackerService,
    private nosqlExecutor: NosqlMigrationExecutorService,
    private nosqlParser: NosqlMigrationParserService,
    private nosqlVersionTracker: NosqlVersionTrackerService
  ) {}

  async createMigration(dto: CreateMigrationDto): Promise<IMigration> {
    const migrationsDir =
      dto.type === 'sql'
        ? path.join(process.cwd(), 'migrations', 'sql')
        : path.join(process.cwd(), 'migrations', 'nosql');

    // Ensure directory exists
    await fs.mkdir(migrationsDir, { recursive: true });

    const filename =
      dto.type === 'sql'
        ? `${dto.version}__${dto.name}.sql`
        : `${dto.version}__${dto.name}.js`;

    const filePath = path.join(migrationsDir, filename);

    // Check if file already exists
    try {
      await fs.access(filePath);
      throw new Error(`Migration file ${filename} already exists`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    // Create migration file
    await fs.writeFile(filePath, dto.content, 'utf-8');

    const migration: IMigration = {
      id: '',
      version: dto.version,
      name: dto.name,
      type: dto.type,
      content: dto.content,
      status: 'pending',
    };

    this.logger.info(`Created migration file: ${filename}`);
    return migration;
  }

  async executeMigration(dto: ExecuteMigrationDto): Promise<IMigration> {
    const migrationsDir =
      dto.type === 'sql'
        ? path.join(process.cwd(), 'migrations', 'sql')
        : path.join(process.cwd(), 'migrations', 'nosql');

    // Find migration file
    const files = await fs.readdir(migrationsDir);
    const migrationFile = files.find((f) => f.startsWith(`${dto.version}__`));

    if (!migrationFile) {
      throw new NotFoundException(
        `Migration ${dto.version} not found for type ${dto.type}`
      );
    }

    const filePath = path.join(migrationsDir, migrationFile);
    const content = await fs.readFile(filePath, 'utf-8');

    // Parse migration
    const parser =
      dto.type === 'sql' ? this.sqlParser : this.nosqlParser;
    const parsed = parser.parseMigrationFile(migrationFile, content);

    const migration: IMigration = {
      id: '',
      ...parsed,
      content,
      status: 'pending',
    } as IMigration;

    // Validate migration
    const validation = parser.validateMigration(migration);
    if (!validation.valid) {
      throw new Error(`Migration validation failed: ${validation.errors.join(', ')}`);
    }

    // Execute migration
    const executor =
      dto.type === 'sql' ? this.sqlExecutor : this.nosqlExecutor;
    await executor.validate(migration);
    await executor.execute(migration);

    return migration;
  }

  async rollbackMigration(
    version: string,
    type: 'sql' | 'nosql'
  ): Promise<IMigration> {
    const migrationsDir =
      type === 'sql'
        ? path.join(process.cwd(), 'migrations', 'sql')
        : path.join(process.cwd(), 'migrations', 'nosql');

    // Find migration file
    const files = await fs.readdir(migrationsDir);
    const migrationFile = files.find((f) => f.startsWith(`${version}__`));

    if (!migrationFile) {
      throw new NotFoundException(
        `Migration ${version} not found for type ${type}`
      );
    }

    const filePath = path.join(migrationsDir, migrationFile);
    const content = await fs.readFile(filePath, 'utf-8');

    // Parse migration
    const parser = type === 'sql' ? this.sqlParser : this.nosqlParser;
    const parsed = parser.parseMigrationFile(migrationFile, content);

    const migration: IMigration = {
      id: '',
      ...parsed,
      content,
      status: 'completed',
    } as IMigration;

    // Rollback migration
    const executor = type === 'sql' ? this.sqlExecutor : this.nosqlExecutor;
    await executor.rollback(migration);

    return migration;
  }

  async getMigrationHistory(type: 'sql' | 'nosql'): Promise<IMigration[]> {
    const tracker =
      type === 'sql' ? this.sqlVersionTracker : this.nosqlVersionTracker;
    return tracker.getMigrationHistory(type);
  }

  async getCurrentVersion(type: 'sql' | 'nosql'): Promise<string | null> {
    const tracker =
      type === 'sql' ? this.sqlVersionTracker : this.nosqlVersionTracker;
    return tracker.getCurrentVersion(type);
  }

  async deleteMigration(version: string, type: 'sql' | 'nosql'): Promise<void> {
    const migrationsDir =
      type === 'sql'
        ? path.join(process.cwd(), 'migrations', 'sql')
        : path.join(process.cwd(), 'migrations', 'nosql');

    // Find migration file
    const files = await fs.readdir(migrationsDir);
    const migrationFile = files.find((f) => f.startsWith(`${version}__`));

    if (!migrationFile) {
      throw new NotFoundException(
        `Migration ${version} not found for type ${type}`
      );
    }

    // Check if migration has been executed
    const tracker =
      type === 'sql' ? this.sqlVersionTracker : this.nosqlVersionTracker;
    const hasVersion = await tracker.hasVersion(version, type);

    if (hasVersion) {
      throw new Error(
        `Cannot delete migration ${version} as it has already been executed`
      );
    }

    // Delete migration file
    const filePath = path.join(migrationsDir, migrationFile);
    await fs.unlink(filePath);

    this.logger.info(`Deleted migration file: ${migrationFile}`);
  }
}

