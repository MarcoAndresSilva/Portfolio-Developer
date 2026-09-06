import { Injectable, Logger } from '@nestjs/common';
import type { ContactDto } from './contact.dto.js';

/**
 * Entrega los mensajes de contacto por email usando la API HTTP de Resend.
 *
 * Se usa la API HTTP y no SMTP porque el plan free de Render bloquea el tráfico
 * saliente a los puertos SMTP (25 / 465 / 587) desde 2025-09 — con `nodemailer`
 * el envío quedaba colgado hasta dar timeout. Ver ARCHITECTURE.md §6.
 *
 * Config por env:
 *   RESEND_API_KEY  API key de resend.com. Sin ella el endpoint sigue
 *                   funcionando pero solo registra el mensaje en el log
 *                   (así corre en local sin cuenta).
 *   CONTACT_TO      Destino de los mensajes. Default: el gmail de Marco.
 *   CONTACT_FROM    Remitente. Default: onboarding@resend.dev — la única
 *                   dirección válida mientras no haya un dominio verificado
 *                   en Resend (y el destino, entonces, solo puede ser la
 *                   casilla con la que se creó la cuenta: justo a donde van
 *                   todos los mensajes de este formulario).
 *
 * Si el envío falla, se loguea el mensaje completo (para no perderlo nunca) y
 * se relanza: el controller lo traduce a un 502 y el formulario muestra su
 * texto de fallback ("…escribime por email").
 */
@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly apiKey = process.env.RESEND_API_KEY;
  private readonly to = process.env.CONTACT_TO ?? 'marco.silvaponce10@gmail.com';
  private readonly from = process.env.CONTACT_FROM ?? 'Portafolio <onboarding@resend.dev>';

  async deliver(dto: ContactDto): Promise<void> {
    const preview = dto.message.slice(0, 140) + (dto.message.length > 140 ? '…' : '');
    const summary = `${dto.name} <${dto.email}>: ${preview}`;

    if (!this.apiKey) {
      this.logger.warn(`RESEND_API_KEY sin configurar — NO enviado. ${summary}`);
      return;
    }

    let res: Response;
    try {
      res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: this.to,
          reply_to: `${dto.name} <${dto.email}>`,
          subject: `Portafolio — mensaje de ${dto.name}`,
          text: `${dto.message}\n\n—\n${dto.name} · ${dto.email}`,
        }),
      });
    } catch (cause) {
      this.logger.error(`Fallo de red al enviar el contacto — ${summary}`, cause as Error);
      throw new Error('contact-delivery-failed', { cause });
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      this.logger.error(`Resend respondió ${res.status} — ${summary} ${detail}`.trim());
      throw new Error(`contact-delivery-failed-${res.status}`);
    }

    this.logger.log(`Contacto enviado a ${this.to} (de ${dto.email})`);
  }
}
