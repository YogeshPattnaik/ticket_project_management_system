import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('PrismaService');

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      this.logger.warn('Service will continue but database operations may fail');
      // Don't throw - allow service to start even if DB is unavailable
      // This is useful for development when DB might not be ready
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

