import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Candidate } from './schemas/candidate.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
    private cloudinary: CloudinaryService,
    private readonly whatsappService: WhatsappService,
  ) {}

  async create(candidateData: any, files: { photo?: Express.Multer.File[], vlk?: Express.Multer.File[] }) {
    let photoUrl = '';
    let vlkDocUrl = '';

    // Завантажуємо фото, якщо вони є
    if (files.photo?.[0]) {
      const res = await this.cloudinary.uploadImage(files.photo[0], 'avatars');
      photoUrl = res.secure_url;
    }

    if (files.vlk?.[0]) {
      const res = await this.cloudinary.uploadImage(files.vlk[0], 'documents');
      vlkDocUrl = res.secure_url;
    }

    // Створюємо запис у БД
    const newCandidate = new this.candidateModel({
      ...candidateData,
      photoUrl,
      vlkDocUrl,
      // конвертуємо категорії з рядка (якщо прийшли через FormData) у масив
      categories: typeof candidateData.categories === 'string' 
        ? candidateData.categories.split(',') 
        : candidateData.categories,
    });

    this.whatsappService.sendCandidateNotification(newCandidate).catch(err => {
      console.error('WhatsApp background error:', err);
    });

    return newCandidate.save();
  }

  async findAll() {
    return this.candidateModel.find().sort({ createdAt: -1 }).exec();
  }
}