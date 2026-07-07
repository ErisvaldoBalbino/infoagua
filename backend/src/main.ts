import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Serialização
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Filtro de exceções
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors();

  // Logging de requisições HTTP
  app.use((req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl } = req;
    res.on('finish', () => {
      console.log(`[HTTP] ${method} ${originalUrl} - ${res.statusCode}`);
    });
    next();
  });

  // Versionamento URI global, todas as rotas ficam em /v1/
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('InfoÁgua API')
    .setDescription(
      'API para aplicação de monitoramento colaborativo do abastecimento de água no semiárido nordestino.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Start
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);

  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`📚 Swagger disponível em http://localhost:${port}/api/docs`);
}

void bootstrap();
