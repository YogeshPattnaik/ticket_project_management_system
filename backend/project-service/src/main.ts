import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@task-management/utils';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('ProjectService');

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
    .setTitle('Project Service API')
    .setDescription('Project and task management service')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('projects')
    .addTag('tasks')
    .addTag('boards')
    .addTag('workflows')
    .addTag('slas')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);
  logger.info(`Project service is running on port ${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start project service:', error);
  process.exit(1);
});

