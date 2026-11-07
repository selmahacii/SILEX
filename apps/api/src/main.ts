import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

let appPromise: Promise<INestApplication> | null = null;

async function bootstrap(): Promise<INestApplication> {
  const logger = new Logger('SILEX_API_BOOTSTRAP');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.use(
    helmet({
      contentSecurityPolicy: false, // Permet l'affichage de Swagger UI en dev
    }),
  );
  app.use(compression());

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuration Swagger OpenAPI
  const config = new DocumentBuilder()
    .setTitle('SILEX Industrial ERP API')
    .setDescription(
      'Plateforme de Gestion des Opérations et Projets Industriels pour SILEX SERVICES (Algérie).',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'SILEX ERP API Docs',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 SILEX ERP API démarrée sur http://0.0.0.0:${port}/api`);
  logger.log(`📚 Documentation Swagger disponible sur http://localhost:${port}/api/docs`);

  return app;
}

appPromise = bootstrap().catch((err) => {
  console.error('Erreur au bootstrap de l\'application API:', err);
  throw err;
});

// Handler exporté pour Vercel Serverless si invoqué en mode fonction
export default async function handler(req: any, res: any) {
  const app = await appPromise;
  if (!app) {
    throw new Error('Application NestJS non initialisée.');
  }
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
}
