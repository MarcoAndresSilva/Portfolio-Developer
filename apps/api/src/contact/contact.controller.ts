import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { looksLikeSpam, toContactDto, validateContact } from './contact.dto.js';
import { ContactService } from './contact.service.js';
import { RateLimitGuard } from './rate-limit.guard.js';

@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(RateLimitGuard)
  async submit(@Body() body: Record<string, unknown>): Promise<{ ok: true }> {
    // Honeypot: respondemos 202 igual para no darle pistas al bot, pero no
    // hacemos nada con el mensaje.
    if (looksLikeSpam(body)) {
      return { ok: true };
    }

    const errors = validateContact(body);
    if (errors) {
      throw new BadRequestException({ message: 'Datos inválidos', errors });
    }

    await this.contact.deliver(toContactDto(body));
    return { ok: true };
  }
}
