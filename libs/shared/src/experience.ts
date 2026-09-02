import type { Localized } from './i18n.js';

/** Un puesto en la línea de tiempo de experiencia. */
export interface Experience {
  /** Nombre de la empresa (no se traduce). */
  company: string;
  /** Cargo, bilingüe. */
  role: Localized;
  /** Fecha de inicio en formato ISO 'YYYY-MM'. */
  start: string;
  /** Fecha de término 'YYYY-MM', o null si es el trabajo actual. */
  end: string | null;
  /** Bullets de logros / responsabilidades, bilingües. */
  highlights: Localized<string[]>;
  /** Tecnologías usadas en el puesto. */
  stack: string[];
  /** Ubicación o modalidad, ej. 'Santiago, Chile' / 'Remoto'. */
  location?: string;
}
