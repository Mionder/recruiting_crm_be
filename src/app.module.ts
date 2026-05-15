import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CandidatesModule } from './candidates/candidates.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Глобальний конфіг для .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Підключення до MongoDB Atlas
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        serverSelectionTimeoutMS: 5000, // не чекати вічність
        family: 4,
      }),
      inject: [ConfigService],
    }),
    // Наші модулі
    AuthModule,
    CandidatesModule,
    CloudinaryModule,
  ],
})
export class AppModule {}