import { Injectable } from '@nestjs/common';
import { IMigration } from '../common/migration.interface';

@Injectable()
export class SqlMigrationParserService {
  // Logger available for future use
  // private readonly logger = new Logger('SqlMigrationParser');

  parseMigrationFile(filename: string, content: string): Partial<IMigration> {
    // Parse version from filename: V1__initial_schema.sql
    const versionMatch = filename.match(/V(\d+)__/);
    if (!versionMatch) {
      throw new Error(`Invalid migration filename format: ${filename}`);
    }

    const version = `V${versionMatch[1]}`;
    const name = filename.replace(/^V\d+__/, '').replace(/\.sql$/, '');

    // Extract rollback content if present (separated by -- ROLLBACK marker)
    const rollbackMatch = content.match(/--\s*ROLLBACK\s*\n(.*)/s);
    const rollbackContent = rollbackMatch ? rollbackMatch[1].trim() : undefined;
    const migrationContent = rollbackMatch
      ? content.substring(0, rollbackMatch.index).trim()
      : content.trim();

    return {
      version,
      name,
      type: 'sql',
      content: migrationContent,
      rollbackContent,
    };
  }

  validateMigration(migration: IMigration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!migration.version || !migration.version.match(/^V\d+$/)) {
      errors.push('Invalid version format. Must be V1, V2, etc.');
    }

    if (!migration.name || migration.name.trim().length === 0) {
      errors.push('Migration name is required');
    }

    if (!migration.content || migration.content.trim().length === 0) {
      errors.push('Migration content is required');
    }

    // Basic SQL validation
    const sqlKeywords = ['CREATE', 'ALTER', 'DROP', 'INSERT', 'UPDATE', 'DELETE'];
    const hasValidKeyword = sqlKeywords.some((keyword) =>
      migration.content.toUpperCase().includes(keyword)
    );

    if (!hasValidKeyword) {
      errors.push('Migration must contain at least one valid SQL statement');
    }

    // Check for dangerous operations without proper safeguards
    const dangerousPatterns = [
      /DROP\s+TABLE\s+(?!IF\s+EXISTS)/i,
      /DROP\s+DATABASE/i,
      /TRUNCATE/i,
    ];

    dangerousPatterns.forEach((pattern) => {
      if (pattern.test(migration.content)) {
        errors.push('Dangerous SQL operation detected. Use IF EXISTS or proper safeguards.');
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

