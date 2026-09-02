/** Plataforma de un enlace de contacto / redes. */
export type SocialPlatform =
  | 'github'
  | 'linkedin'
  | 'email'
  | 'twitter'
  | 'website';

export interface SocialLink {
  platform: SocialPlatform;
  /** URL completa, o 'mailto:...' para email. */
  url: string;
  /** Texto visible y aria-label. */
  label: string;
}
