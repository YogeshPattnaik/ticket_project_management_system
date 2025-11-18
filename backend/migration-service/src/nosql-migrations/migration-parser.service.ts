import { Injectable } from '@nestjs/common';
import { IMigration } from '../common/migration.interface';

@Injectable()
export class NosqlMigrationParserService {
  // Logger available for future use
  // private readonly logger = new Logger('NosqlMigrationParser');

  parseMigrationFile(filename: string, content: string): Partial<IMigration> {
    // Parse version from filename: V1__initial_collections.js
    const versionMatch = filename.match(/V(\d+)__/);
    if (!versionMatch) {
      throw new Error(`Invalid migration filename format: ${filename}`);
    }

    const version = `V${versionMatch[1]}`;
    const name = filename.replace(/^V\d+__/, '').replace(/\.js$/, '');

    // Extract rollback content if present (separated by // ROLLBACK marker)
    const rollbackMatch = content.match(/\/\/\s*ROLLBACK\s*\n(.*)/s);
    const rollbackContent = rollbackMatch ? rollbackMatch[1].trim() : undefined;
    const migrationContent = rollbackMatch
      ? content.substring(0, rollbackMatch.index).trim()
      : content.trim();

    return {
      version,
      name,
      type: 'nosql',
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

    // Basic JavaScript validation
    try {
      // Check if it's valid JavaScript syntax
      new Function(migration.content);
    } catch (error) {
      errors.push(`Invalid JavaScript syntax: ${(error as Error).message}`);
    }

    // Check for dangerous operations
    const dangerousPatterns = [
      /db\.dropDatabase\(/i,
      /\.remove\(\{\}\)/i, // Unsafe remove without filter
    ];

    dangerousPatterns.forEach((pattern) => {
      if (pattern.test(migration.content)) {
        errors.push('Dangerous MongoDB operation detected. Use proper safeguards.');
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

