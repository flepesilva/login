import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http.exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    }
  }));

  // Configuración de filtros de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuración de cookie parser
  app.use(cookieParser());

  // Configuración de CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Importante para permitir cookies en solicitudes cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('API para la tienda en línea')
    .setVersion('1.0')
    .addBearerAuth() // Para documentar rutas protegidas con token
    .addCookieAuth('access_token') // Para documentar rutas protegidas con cookie
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Puerto
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
