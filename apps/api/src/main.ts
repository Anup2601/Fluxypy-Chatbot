import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // ✅ Widget files serve karo as static assets
  app.useStaticAssets(
    join(__dirname, '..', '..', '..', 'widget'),
    { prefix: '/widget' },
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`\n🤖 Fluxypy Bot API is running!`);
  console.log(`📡 http://localhost:${port}/api/v1`);
  console.log(`🧩 http://localhost:${port}/widget/test.html\n`);
}
bootstrap();