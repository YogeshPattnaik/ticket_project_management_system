import { Module } from '@nestjs/common';
import { SqlMigrationExecutorService } from './migration-executor.service';
import { SqlMigrationParserService } from './migration-parser.service';
import { SqlVersionTrackerService } from './version-tracker.service';

@Module({
  providers: [
    SqlMigrationExecutorService,
    SqlMigrationParserService,
    SqlVersionTrackerService,
  ],
  exports: [
    SqlMigrationExecutorService,
    SqlMigrationParserService,
    SqlVersionTrackerService,
  ],
})
export class SqlMigrationsModule {}

