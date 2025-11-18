import { MigrationStatus } from '@task-management/interfaces';

export interface IMigration {
  id: string;
  version: string;
  name: string;
  type: 'sql' | 'nosql';
  content: string;
  status: MigrationStatus;
  executedAt?: Date;
  executionTime?: number;
  error?: string;
  rollbackContent?: string;
}

export interface IMigrationExecutor {
  execute(migration: IMigration): Promise<void>;
  rollback(migration: IMigration): Promise<void>;
  validate(migration: IMigration): Promise<boolean>;
}

export interface IVersionTracker {
  getCurrentVersion(type: 'sql' | 'nosql'): Promise<string | null>;
  recordMigration(migration: IMigration, executionTime: number): Promise<void>;
  getMigrationHistory(type: 'sql' | 'nosql'): Promise<IMigration[]>;
  hasVersion(version: string, type: 'sql' | 'nosql'): Promise<boolean>;
}

