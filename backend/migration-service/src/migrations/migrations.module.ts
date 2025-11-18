import { Module } from '@nestjs/common';
import { MigrationsController } from './migrations.controller';
import { MigrationsService } from './migrations.service';
import { SqlMigrationsModule } from '../sql-migrations/sql-migrations.module';
import { NosqlMigrationsModule } from '../nosql-migrations/nosql-migrations.module';

@Module({
  imports: [SqlMigrationsModule, NosqlMigrationsModule],
  controllers: [MigrationsController],
  providers: [MigrationsService],
})
export class MigrationsModule {}

