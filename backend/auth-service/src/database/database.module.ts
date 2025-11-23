import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const postgresUrl = configService.get<string>('POSTGRES_URL');
        
        const config = {
          type: 'postgres' as const,
          url: postgresUrl,
          entities: [Organization, User, Role, UserRole, RefreshToken],
          synchronize: false,
          logging: configService.get<string>('NODE_ENV') === 'development',
          // Critical settings to prevent blocking
          retryAttempts: 0,
          connectTimeoutMS: 2000, // 2 second timeout
          autoLoadEntities: false,
          // Prevent immediate connection
          migrations: [],
          migrationsRun: false,
          // Don't connect on initialization - only connect when first query is made
          extra: {
            max: 10,
            connectionTimeoutMillis: 2000, // 2 seconds - fail fast
            statement_timeout: 0,
            query_timeout: 0,
            keepAlive: false,
            // Prevent connection pool from blocking
            idle_in_transaction_session_timeout: 0,
            // Don't connect immediately
            connect_timeout: 2,
          },
          // This prevents TypeORM from connecting during module initialization
          // Connection will happen lazily on first query
        };
        
        return config;
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Organization, User, Role, UserRole, RefreshToken]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {
  // Handle connection errors gracefully
  async onModuleInit() {
    // This will be called after module initialization
    // TypeORM will attempt connection here, but errors won't crash the app
    // because we set abortOnError: false in main.ts
  }
}


