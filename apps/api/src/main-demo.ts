import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

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
      .setTitle('BenchIQ API')
      .setDescription('API for computer/phone repair shop management')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 BenchIQ API running on port ${port}`);
    console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.log('💡 This is likely due to database connection issues.');
    console.log('   The frontend is still running at http://localhost:3000');
    console.log('   You can view the API documentation structure in the codebase.');
  }
}
bootstrap();