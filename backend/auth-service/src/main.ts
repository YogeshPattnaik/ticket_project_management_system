import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@task-management/utils';

async function bootstrap(): Promise<void> {
  try {
    const port = process.env.PORT || 8001;
    const logger = new Logger('AuthService');

    // Suppress TypeORM connection errors during initialization
    const originalErrorHandler = process.listeners('unhandledRejection');
    process.removeAllListeners('unhandledRejection');

    process.on('unhandledRejection', (reason: any) => {
      // Ignore database connection errors during startup
      if (
        reason?.code === 'ENOTFOUND' &&
        reason?.hostname?.includes('supabase')
      ) {
        return;
      }
      // Log other unhandled rejections
      console.error('Unhandled rejection:', reason);
    });

    let app;
    try {
      app = (await Promise.race([
        NestFactory.create(AppModule, {
          logger: ['error', 'warn', 'log'],
          abortOnError: false, // Don't abort on errors - allows service to start even if DB fails
        }),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('App creation timeout after 10 seconds')),
            10000
          )
        ),
      ])) as any;
    } catch (error: any) {
      // If it's a database error, log and continue anyway
      if (
        error?.code === 'ENOTFOUND' ||
        error?.message?.includes('database') ||
        error?.message?.includes('ENOTFOUND')
      ) {
        // Create app anyway - TypeORM will retry on first query
        app = await NestFactory.create(AppModule, {
          logger: ['error', 'warn', 'log'],
          abortOnError: false,
        });
      } else {
        throw error;
      }
    } finally {
      // Restore original error handlers
      process.removeAllListeners('unhandledRejection');
      originalErrorHandler.forEach((handler) =>
        process.on('unhandledRejection', handler as any)
      );
    }

    // Global prefix for API versioning
    app.setGlobalPrefix('api/v1');

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    // CORS configuration
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
    });

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Auth Service API')
      .setDescription('Authentication and authorization service')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('auth')
      .addTag('users')
      .addTag('roles')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(port);
    logger.info(`Auth service is running on port ${port}`);
  } catch (error) {
    console.error('Failed to start auth service:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start auth service:', error);
  process.exit(1);
});
