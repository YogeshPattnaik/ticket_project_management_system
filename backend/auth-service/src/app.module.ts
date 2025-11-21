import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    console.log('📦 AppModule initialized');
    const postgresUrl = this.configService.get<string>('POSTGRES_URL');
    console.log('📝 POSTGRES_URL configured:', postgresUrl ? 'YES' : 'NO');
    if (postgresUrl) {
      console.log('📝 POSTGRES_URL preview:', postgresUrl.substring(0, 30) + '...');
    }
  }
}

