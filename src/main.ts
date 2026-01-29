import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

interface ExpressRouteLayers {
  route?: {
    path?: string;
    methods?: Record<string, string>;
  };
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  const server = app.getHttpAdapter().getInstance();
  const stack = server._router.stack as ExpressRouteLayers[];

  const availableRoutes = stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      method: Object.keys(layer.route?.methods ?? {})[0].toUpperCase(),
      path: layer.route?.path,
    }));

  console.log(JSON.stringify(availableRoutes, null, 2), 'availableRoutes');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
