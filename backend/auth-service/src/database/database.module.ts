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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('POSTGRES_URL'),
        entities: [Organization, User, Role, UserRole, RefreshToken],
        synchronize: false, // Use migrations in production
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Organization, User, Role, UserRole, RefreshToken]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}


