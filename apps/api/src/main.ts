import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: el sitio (Angular) y la API van en dominios distintos. Los orígenes
  // permitidos se listan en `CORS_ORIGIN` (separados por coma); por defecto, el
  // dev server de Angular.
  const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:4200')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins, methods: ['POST', 'GET'] });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
