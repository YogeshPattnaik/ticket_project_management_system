import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@task-management/utils';

console.log('=== MAIN: Starting Auth Service ===');
console.log('⏰ Timestamp:', new Date().toISOString());
console.log('📝 Process PID:', process.pid);

async function bootstrap(): Promise<void> {
  try {
    console.log('🚀 Starting Auth Service...');
    const port = process.env.PORT || 8001;
    console.log(`📌 Auth Service will run on port: ${port}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    console.log('📦 Creating NestJS application...');
    console.log('⏱️  Starting app creation at:', new Date().toISOString());
    
    // Create app with minimal logging to see what's happening
    const app = await NestFactory.create(AppModule, {
      logger: false, // Disable NestJS logger temporarily to see our logs
    });
    
    console.log('✅ NestJS application created successfully at:', new Date().toISOString());
    
    const logger = new Logger('AuthService');

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

    console.log('🌐 Starting HTTP server...');
    await app.listen(port);
    
    logger.info(`✅ Auth service is running on port ${port}`);
    console.log('========================================');
    console.log(`✅ Auth service is running on port ${port}`);
    console.log(`🌐 API available at: http://localhost:${port}/api/v1`);
    console.log(`🔗 Register endpoint: http://localhost:${port}/api/v1/auth/register`);
    console.log(`📋 Swagger docs: http://localhost:${port}/api/docs`);
    console.log('========================================');
  } catch (error) {
    console.error('❌ Failed to start auth service:', error);
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

