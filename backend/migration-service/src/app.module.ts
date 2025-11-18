import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MigrationsModule } from './migrations/migrations.module';
import { SqlMigrationsModule } from './sql-migrations/sql-migrations.module';
import { NosqlMigrationsModule } from './nosql-migrations/nosql-migrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MigrationsModule,
    SqlMigrationsModule,
    NosqlMigrationsModule,
  ],
})
export class AppModule {}

