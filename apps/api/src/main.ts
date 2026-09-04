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

  // 3100 en dev para no chocar con otros NestJS locales (que toman 3000).
  // En producción el hosting inyecta PORT.
  await app.listen(process.env.PORT ?? 3100);
}
await bootstrap();
