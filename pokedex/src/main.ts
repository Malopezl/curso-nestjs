import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,

      /* Esto es utilizado para convertir la data recibida 
      * al tipo de dato que esperan los dto.
      *
      * (Consume mas memoria asi que depende del tipo de aplicacion)
      */
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    }),
  )

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
