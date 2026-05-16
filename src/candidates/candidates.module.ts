import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';

@Module({
  imports: [
    // Реєструємо схему в Mongoose
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema }
    ]),
    // Імпортуємо модуль для роботи з фото
    CloudinaryModule,
    WhatsappModule,
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService],
})
export class CandidatesModule {}