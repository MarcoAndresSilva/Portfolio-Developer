import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
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

    try {
      await this.contact.deliver(toContactDto(body));
    } catch {
      // El detalle real (y el mensaje completo) ya quedó en el log de la API.
      // Al cliente le respondemos 502: el formulario muestra su texto de
      // fallback ("…escribime por email") en vez de un 500 crudo.
      throw new HttpException(
        'No se pudo entregar el mensaje. Probá de nuevo en un momento.',
        HttpStatus.BAD_GATEWAY,
      );
    }
    return { ok: true };
  }
}
