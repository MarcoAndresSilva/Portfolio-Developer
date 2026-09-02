import type { Localized } from './i18n.js';

export interface ProjectLinks {
  /** Demo en vivo. */
  demo?: string;
  /** Repositorio de código. */
  repo?: string;
  /** Página de detalle / caso de estudio dentro del sitio. */
  caseStudy?: string;
}

export interface ProjectImage {
  /** Ruta de la imagen (en /public o URL). */
  src: string;
  /** Texto alternativo, bilingüe (a11y + SEO). */
  alt: Localized;
}

/**
 * Un proyecto del portafolio. La sección más importante del sitio: cada proyecto
 * se cuenta como problema → solución → impacto.
 */
export interface Project {
  /** Identificador para la URL: /proyectos/<slug>. */
  slug: string;
  /** Nombre del proyecto (no se traduce). */
  title: string;
  /** Frase corta para la card. */
  summary: Localized;
  /** Qué problema resolvía. */
  problem: Localized;
  /** Cómo se resolvió. */
  solution: Localized;
  /** Resultado / impacto medible. */
  impact: Localized;
  /** Tecnologías, se muestran como badges. */
  stack: string[];
  links: ProjectLinks;
  images: ProjectImage[];
  /** Si aparece en la sección destacada de la home. */
  featured: boolean;
  /** Año del proyecto, para ordenar. */
  year: number;
}
