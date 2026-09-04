import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import type { ContactDto } from './contact.dto.js';

/**
 * Entrega los mensajes de contacto por email.
 *
 * Si hay SMTP configurado por env (`SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`) manda
 * el mail; si no, solo lo registra en el log (así funciona en local sin config).
 *
 * Para Gmail: activar 2FA y crear una "contraseña de aplicación"
 * (https://myaccount.google.com/apppasswords), y usar:
 *   SMTP_HOST=smtp.gmail.com  SMTP_PORT=587
 *   SMTP_USER=marco.silvaponce10@gmail.com  SMTP_PASS=<app password>
 */
@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly transporter = this.buildTransporter();
  private readonly to = process.env.CONTACT_TO ?? 'marco.silvaponce10@gmail.com';

  async deliver(dto: ContactDto): Promise<void> {
    const preview = dto.message.slice(0, 140) + (dto.message.length > 140 ? '…' : '');

    if (!this.transporter) {
      this.logger.warn(`SMTP sin configurar — NO enviado. ${dto.name} <${dto.email}>: ${preview}`);
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: this.to,
      replyTo: `${dto.name} <${dto.email}>`,
      subject: `Portafolio — mensaje de ${dto.name}`,
      text: `${dto.message}\n\n—\n${dto.name} · ${dto.email}`,
    });
    this.logger.log(`Contacto enviado a ${this.to} (de ${dto.email})`);
  }

  private buildTransporter(): Transporter | null {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return null;
    }
    const port = Number(SMTP_PORT ?? 587);
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
}
