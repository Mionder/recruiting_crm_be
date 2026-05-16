import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string;
  private readonly targetNumber: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_WHATSAPP_FROM');
    this.targetNumber = this.configService.get<string>('WHATSAPP_TARGET_PHONE');
  }

  async sendCandidateNotification(candidate: any) {
    if (!this.accountSid || !this.authToken || !this.targetNumber || !this.fromNumber) {
      this.logger.warn('Twilio WhatsApp інтеграція не налаштована. Перевірте .env файли.');
      return;
    }

    // Формуємо красивий текст анкети
    const message = `*Новий кандидат у CRM!* 🚀\n\n` +
                    `👤 *ПІБ:* ${candidate.fullName}\n` +
                    `📞 *Телефон:* ${candidate.phone}\n` +
                    `📍 *Адреса:* ${candidate.address}\n` +
                    `🪪 *ІПН:* ${candidate.ipn}\n` +
                    `🚗 *Категорії:* ${candidate.categories || 'Не вказано'}\n` +
                    `🏥 *Здоров'я:* ${candidate.healthIssues || 'Без скарг'}\n` +
                    `⚖️ *Судимість:* ${candidate.hasCriminal ? 'Є (' + candidate.criminalDetails + ')' : 'Відсутня'}\n\n` +
                    `📸 *Фото:* ${candidate.photoUrl || 'Не завантажено'}\n` +
                    `📄 *ВЛК:* ${candidate.vlkUrl || 'Не завантажено'}`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

    // Twilio очікує дані форми (URL Encoded)
    const params = new URLSearchParams();
    params.append('From', this.fromNumber);
    params.append('To', this.targetNumber);
    params.append('Body', message);

    // Створюємо рядок для Basic-авторизації (Base64 від "SID:TOKEN")
    const authBuffer = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

    try {
      await firstValueFrom(
        this.httpService.post(url, params.toString(), {
          headers: {
            'Authorization': `Basic ${authBuffer}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );
      this.logger.log(`Сповіщення про кандидата ${candidate.fullName} успішно відправлено у WhatsApp через Twilio.`);
    } catch (error) {
      this.logger.error(
        'Помилка відправки повідомлення через Twilio:',
        error.response?.data || error.message,
      );
    }
  }
}