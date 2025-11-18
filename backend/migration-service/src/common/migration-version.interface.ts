export interface MigrationVersion {
  version: string;
  type: 'sql' | 'nosql';
  executedAt: Date;
  executionTime: number;
  status: 'completed' | 'failed' | 'rolled_back';
  error?: string;
}

