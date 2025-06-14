import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      //permite remover la data extra no esperada
      whitelist: true,
      //envia un error al recibir data extra no esperada
      forbidNonWhitelisted: true,
    }),
  )

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
