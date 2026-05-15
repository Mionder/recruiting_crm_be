import { 
  Controller, 
  Post, 
  Body, 
  UseInterceptors, 
  UploadedFiles,
  Get
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './candidates.service';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post('register')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 1 },
      { name: 'vlk', maxCount: 1 },
    ]),
  )
  async registerCandidate(
    @Body() candidateData: any,
    @UploadedFiles() files: { photo?: Express.Multer.File[]; vlk?: Express.Multer.File[] },
  ) {
    // Викликаємо сервіс для збереження в БД та завантаження в Cloudinary
    const result = await this.candidatesService.create(candidateData, files);
    
    return {
      success: true,
      data: result,
    };
  }

  @Get()
  async getAll() {
    return this.candidatesService.findAll();
  }
}