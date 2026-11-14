import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const prefix = configService.get<string>('API_PREFIX') || 'api/v1';

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Prefix
  app.setGlobalPrefix(prefix);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Todo CRUD API (NestJS + MongoDB Atlas)')
    .setDescription(
      'Clean architecture NestJS REST API with MongoDB Atlas Mongoose integration, nestjs-paginate style global pagination, and full CRUD operations for Todos.',
    )
    .setVersion('1.0.0')
    .addTag('Health', 'Health status endpoints')
    .addTag('Todos', 'CRUD operations for todo management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);

  logger.log(`====================================================`);
  logger.log(` Application is running on: http://localhost:${port}/${prefix}`);
  logger.log(` Swagger Docs available at: http://localhost:${port}/${prefix}/docs`);
  logger.log(`====================================================`);
}

bootstrap();
