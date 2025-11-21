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
      useFactory: (configService: ConfigService) => {
        const postgresUrl = configService.get<string>('POSTGRES_URL');
        console.log('🔍 Auth Service - Configuring database connection...');
        console.log('📝 POSTGRES_URL:', postgresUrl ? `${postgresUrl.substring(0, 30)}...` : 'NOT SET');
        
        return {
          type: 'postgres' as const,
          url: postgresUrl,
          entities: [Organization, User, Role, UserRole, RefreshToken],
          synchronize: false,
          logging: configService.get<string>('NODE_ENV') === 'development',
          // Critical settings to prevent blocking
          retryAttempts: 0, // No retries
          connectTimeoutMS: 2000, // 2 second timeout
          extra: {
            max: 10,
            connectionTimeoutMillis: 2000,
            statement_timeout: 0,
            query_timeout: 0,
            keepAlive: false,
          },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Organization, User, Role, UserRole, RefreshToken]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {
  constructor() {
    console.log('📦 DatabaseModule initialized');
  }
}


