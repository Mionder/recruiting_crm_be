import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream'; // Вбудований модуль Node.js

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { 
          folder: `army_crm/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new BadRequestException('Cloudinary upload failed'));
          resolve(result);
        },
      );

      // Створюємо потік з буфера без сторонніх бібліотек
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null); // Сигнал кінця потоку
      stream.pipe(upload);
    });
  }
}