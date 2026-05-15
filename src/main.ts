import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  const port = process.env.PORT || 3001; 
  
  // Важливо: слухати на '0.0.0.0', щоб сервер був доступний ззовні
  await app.listen(port, '0.0.0.0');
}
bootstrap();
