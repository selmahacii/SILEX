import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

let serverApp: INestApplication | null = null;
let expressInstance: Express | null = null;

export async function createApp(): Promise<{ app: INestApplication; express: Express }> {
  if (serverApp && expressInstance) {
    return { app: serverApp, express: expressInstance };
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

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

  await app.init();
  serverApp = app;
  expressInstance = expressApp;

  return { app, express: expressApp };
}

// Handler exporté par défaut pour Vercel Serverless
export default async function handler(req: Request, res: Response) {
  const { express: server } = await createApp();
  return server(req, res);
}

// Démarrage standalone standard si exécuté directement (local ou conteneur)
if (!process.env.VERCEL) {
  const logger = new Logger('SILEX_API_BOOTSTRAP');
  createApp()
    .then(async ({ app }) => {
      const port = process.env.PORT || 4000;
      await app.listen(port, '0.0.0.0');
      logger.log(`🚀 SILEX ERP API démarrée sur http://0.0.0.0:${port}/api`);
      logger.log(`📚 Documentation Swagger disponible sur http://localhost:${port}/api/docs`);
    })
    .catch((err) => {
      logger.error('Erreur au démarrage de l\'API:', err);
    });
}
