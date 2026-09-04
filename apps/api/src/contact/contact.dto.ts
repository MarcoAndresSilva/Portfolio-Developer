/**
 * Datos que llegan del formulario de contacto.
 *
 * La validación es a mano (`validateContact`) en vez de `class-validator`: son
 * tres campos y así el módulo no arrastra dependencias ni decoradores extra
 * (NestJS 12 + TS 6 es reciente). Ver ARCHITECTURE.md §9.
 */
export interface ContactDto {
  name: string;
  email: string;
  message: string;
  /**
   * Honeypot. El formulario lo manda siempre vacío y está oculto para las
   * personas; si llega con contenido es un bot.
   */
  company?: string;
}

export interface ContactErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  name: { min: 2, max: 80 },
  message: { min: 10, max: 2000 },
  email: { max: 160 },
} as const;

/** Devuelve `null` si todo ok, o un objeto con el primer error de cada campo. */
export function validateContact(body: unknown): ContactErrors | null {
  const errors: ContactErrors = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const name = typeof data['name'] === 'string' ? data['name'].trim() : '';
  const email = typeof data['email'] === 'string' ? data['email'].trim() : '';
  const message = typeof data['message'] === 'string' ? data['message'].trim() : '';

  if (name.length < LIMITS.name.min || name.length > LIMITS.name.max) {
    errors.name = `El nombre debe tener entre ${LIMITS.name.min} y ${LIMITS.name.max} caracteres.`;
  }
  if (!EMAIL_RE.test(email) || email.length > LIMITS.email.max) {
    errors.email = 'El email no es válido.';
  }
  if (message.length < LIMITS.message.min || message.length > LIMITS.message.max) {
    errors.message = `El mensaje debe tener entre ${LIMITS.message.min} y ${LIMITS.message.max} caracteres.`;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/** El honeypot debe venir vacío; si trae algo, es spam. */
export function looksLikeSpam(body: unknown): boolean {
  const company = (body as Record<string, unknown> | null)?.['company'];
  return typeof company === 'string' && company.trim().length > 0;
}

/** Normaliza el body a un `ContactDto` con los strings recortados. */
export function toContactDto(body: Record<string, unknown>): ContactDto {
  return {
    name: String(body['name']).trim(),
    email: String(body['email']).trim(),
    message: String(body['message']).trim(),
  };
}
