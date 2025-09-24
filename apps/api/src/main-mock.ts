import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppMockModule } from './app-mock.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppMockModule);

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // CORS configuration
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    });

    // API prefix
    app.setGlobalPrefix('api/v1');

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('BenchIQ API (Mock)')
      .setDescription('API for computer/phone repair shop management - Mock version with in-memory data')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 BenchIQ API (Mock) running on port ${port}`);
    console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
    console.log(`🎯 Demo credentials: owner@demorepairshop.com / password123`);
    console.log(`💡 This is a mock version with in-memory data. Full database version ready for deployment.`);
  } catch (error) {
    console.error('Failed to start server:', error.message);
  }
}
bootstrap();