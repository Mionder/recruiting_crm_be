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
    this.accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID') || '';
    this.authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN') || '';
    this.fromNumber = this.configService.get<string>('TWILIO_WHATSAPP_FROM') || '';
    this.targetNumber = this.configService.get<string>('WHATSAPP_TARGET_PHONE') || '';
  }

  // Допоміжний метод для відправки одного повідомлення (тексту або медіа)
  private async sendTwilioRequest(formData: URLSearchParams) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const authBuffer = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

    return firstValueFrom(
      this.httpService.post(url, formData.toString(), {
        headers: {
          'Authorization': `Basic ${authBuffer}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    );
  }

  async sendCandidateNotification(candidate: any) {
    if (!this.accountSid || !this.authToken || !this.targetNumber || !this.fromNumber) {
      this.logger.warn('Twilio WhatsApp інтеграція не налаштована. Перевірте .env.');
      return;
    }

    // 1. Формуємо та відправляємо основний текст анкети (вже без посилань внизу)
    const message = `*Новий кандидат у CRM!* 🚀\n\n` +
                    `В/Ч A1619\n` +
                    `👤 *ПІБ:* ${candidate.fullName}\n` +
                    `📞 *Телефон:* ${candidate.phone}\n` +
                    `📍 *Адреса:* ${candidate.address}\n` +
                    `🪪 *ІПН:* ${candidate.ipn}\n` +
                    `🚗 *Категорії:* ${candidate.categories || 'Не wказано'}\n` +
                    `🏥 *Здоров'я:* ${candidate.healthIssues || 'Без скарг'}\n` +
                    `⚖️ *Судимість:* ${candidate.hasCriminal ? 'Є (' + candidate.criminalDetails + ')' : 'Відсутня'}`;

    try {
      // Відправляємо текст
      const textParams = new URLSearchParams();
      textParams.append('From', this.fromNumber);
      textParams.append('To', this.targetNumber);
      textParams.append('Body', message);
      await this.sendTwilioRequest(textParams);

      // 2. Якщо є фото кандидата, відправляємо його як зображення
      if (candidate.photoUrl) {
        const photoParams = new URLSearchParams();
        photoParams.append('From', this.fromNumber);
        photoParams.append('To', this.targetNumber);
        photoParams.append('Body', `📸 Фото кандидата: ${candidate.fullName}`);
        photoParams.append('MediaUrl', candidate.photoUrl); // Магія Twilio: завантажує картинку за посиланням
        await this.sendTwilioRequest(photoParams);
      }

      // 3. Якщо є скан ВЛК, відправляємо його окремим зображенням/файлом
      if (candidate.vlkUrl) {
        const vlkParams = new URLSearchParams();
        vlkParams.append('From', this.fromNumber);
        vlkParams.append('To', this.targetNumber);
        vlkParams.append('Body', `📄 Довідка ВЛК: ${candidate.fullName}`);
        vlkParams.append('MediaUrl', candidate.vlkUrl);
        await this.sendTwilioRequest(vlkParams);
      }

      this.logger.log(`Повний пакет даних кандидата ${candidate.fullName} (текст + медіа) відправлено у WhatsApp.`);
    } catch (error: any) {
      this.logger.error(
        'Помилка відправки пакета повідомлень через Twilio:',
        error.response?.data || error.message,
      );
    }
  }
}