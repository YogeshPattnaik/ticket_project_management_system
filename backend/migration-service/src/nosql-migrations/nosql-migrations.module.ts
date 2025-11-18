import { Module } from '@nestjs/common';
import { NosqlMigrationExecutorService } from './migration-executor.service';
import { NosqlMigrationParserService } from './migration-parser.service';
import { NosqlVersionTrackerService } from './version-tracker.service';

@Module({
  providers: [
    NosqlMigrationExecutorService,
    NosqlMigrationParserService,
    NosqlVersionTrackerService,
  ],
  exports: [
    NosqlMigrationExecutorService,
    NosqlMigrationParserService,
    NosqlVersionTrackerService,
  ],
})
export class NosqlMigrationsModule {}

