import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { Locale } from '@portfolio/shared';
import { LocaleService } from '../../core/locale.service';
import { Reveal } from '../../core/motion/reveal.directive';

/**
 * Contenido bilingüe en el mismo objeto: los *datos* no pasan por `@angular/localize`
 * (ver ARCHITECTURE.md §6). El locale activo lo da `LocaleService`.
 */
type Localized<T = string> = Record<Locale, T>;

interface HomeProject {
  /** Para una futura página de detalle (/proyectos/<slug>). */
  slug: string;
  /** Nombre del proyecto (no se traduce). */
  title: string;
  /** Año, para ordenar y mostrar. */
  year: number;
  /** Badge de estado, opcional (ej. "En uso a diario"). */
  status?: Localized;
  /** Frase corta para la card. */
  summary: Localized;
  /** 2-4 bullets: qué problema resolvía, qué hace, impacto. Opcional. */
  highlights?: Localized<string[]>;
  /** Tecnologías → se muestran como badges. */
  stack: string[];
  /** Media de la card: video (preferido) o imagen. */
  media: { type: 'video'; src: string; poster?: string } | { type: 'image'; src: string };
  /** Alt / descripción de la media (a11y + SEO). */
  mediaAlt: Localized;
  links: { demo?: string; repo?: string };
}

// =============================================================================
// TODO (Marco): el contenido es un BORRADOR. Revisá / corregí:
//   FinTrack      → confirmá el `stack` completo, ajustá los `highlights` (sobre
//                   todo el problema que resolvía) y agregá `links.repo` si es
//                   público. El demo apunta a financialtrackapp.netlify.app.
// Videos en apps/web/public/media/ (preload="metadata" → solo cargan al play).
// =============================================================================
const PROJECTS: HomeProject[] = [
  {
    slug: 'fintrack',
    title: 'FinTrack',
    year: 2025,
    status: { es: 'En uso a diario', en: 'In daily use' },
    summary: {
      es: 'App de finanzas personales para llevar el control de ingresos, gastos y presupuestos día a día.',
      en: 'Personal finance app for tracking income, expenses and budgets day to day.',
    },
    highlights: {
      es: [
        'Registro de ingresos y gastos por categoría, con presupuestos mensuales.',
        'Dashboard con la evolución del saldo y el desglose por categoría.',
        'Autenticación y datos por usuario: API NestJS + Prisma sobre PostgreSQL.',
        'Desplegada y en uso real todos los días para llevar mis propias finanzas.',
      ],
      en: [
        'Income and expense tracking by category, with monthly budgets.',
        'Dashboard with balance-over-time and a per-category breakdown.',
        'Per-user auth and data: NestJS API + Prisma over PostgreSQL.',
        'Deployed and in real daily use to manage my own finances.',
      ],
    },
    stack: ['Angular', 'TypeScript', 'RxJS', 'NestJS', 'Prisma', 'PostgreSQL', 'Docker'],
    media: { type: 'video', src: 'media/fintrack-reel-16x9.mp4' },
    mediaAlt: {
      es: 'Recorrido por la interfaz de FinTrack: panel de gastos y gráficos.',
      en: 'Walkthrough of the FinTrack interface: expenses dashboard and charts.',
    },
    links: { demo: 'https://financialtrackapp.netlify.app' },
  },
  {
    slug: 'portfolio-developer',
    title: 'Portfolio-Developer',
    year: 2026,
    status: { es: 'Este sitio', en: 'This site' },
    summary: {
      es: 'Este mismo portafolio: Angular 22 con SSG para que el contenido sea legible por crawlers y buscadores de IA, no solo por humanos.',
      en: 'This very portfolio: Angular 22 with SSG so the content is readable by crawlers and AI search engines, not just humans.',
    },
    highlights: {
      es: [
        'Nace de un hallazgo: un portafolio SPA 100% client-side no le entrega contenido a un crawler — esto lo corrige con Angular SSG real.',
        'Monorepo con API propia en NestJS para el formulario de contacto, con envío real de email por Resend.',
        'i18n español/inglés con builds localizados independientes.',
        'SEO/GEO completo (JSON-LD, hreflang, sitemap) y Lighthouse CI en verde en cada push.',
      ],
      en: [
        'Born from a finding: a 100% client-side SPA portfolio serves no content to a crawler — this fixes it with real Angular SSG.',
        'Monorepo with its own NestJS API for the contact form, with real email delivery via Resend.',
        'Spanish/English i18n with independent localized builds.',
        'Full SEO/GEO (JSON-LD, hreflang, sitemap) and green Lighthouse CI on every push.',
      ],
    },
    stack: ['Angular', 'TypeScript', 'NestJS', 'SCSS', 'GitHub Actions'],
    media: { type: 'image', src: 'og-image.png' },
    mediaAlt: {
      es: 'Tarjeta de presentación de Marco Silva, del propio portafolio.',
      en: "Marco Silva's presentation card, from the portfolio itself.",
    },
    links: {
      demo: 'https://gentle-ganache-580791.netlify.app',
      repo: 'https://github.com/MarcoAndresSilva/Portfolio-Developer',
    },
  },
  {
    slug: 'imperio-barber',
    title: 'Imperio Barber',
    year: 2025,
    summary: {
      es: 'Sistema de reservas online para una barbería: reemplaza un enlace de WhatsApp sin disponibilidad real por un flujo completo por barbero, sin necesidad de crear cuenta.',
      en: 'Online booking system for a barbershop: replaces a WhatsApp link with no real availability with a full per-barber flow, no account needed.',
    },
    highlights: {
      es: [
        'Disponibilidad real por barbero: calculada en base a su horario semanal y sus reservas activas, no simulada.',
        'Anti-doble-reserva real: transacción PostgreSQL Serializable evita que dos personas se queden con el mismo horario.',
        'Confirmación por token: el barbero acepta o rechaza desde un link de WhatsApp, sin login ni panel de administración.',
        'Reservas pendientes que nadie confirma expiran solas y liberan el horario automáticamente.',
      ],
      en: [
        'Real per-barber availability: computed from their weekly schedule and active bookings, not simulated.',
        'Real double-booking prevention: a Postgres Serializable transaction stops two people from taking the same slot.',
        'Token-based confirmation: the barber accepts or rejects via a WhatsApp link, no login or admin panel.',
        'Unconfirmed pending bookings expire on their own and free up the slot automatically.',
      ],
    },
    stack: ['Angular', 'TypeScript', 'NestJS', 'Prisma', 'PostgreSQL', 'Docker'],
    media: { type: 'video', src: 'media/demo-imperio-barber.mp4' },
    mediaAlt: {
      es: 'Recorrido por el sitio de Imperio Barber y el proceso de reserva.',
      en: 'Walkthrough of the Imperio Barber site and the booking process.',
    },
    links: { demo: 'https://imperio-barber.netlify.app' },
  },
];

/**
 * Sección "Proyectos destacados" — la más importante del sitio (ARCHITECTURE.md §8).
 * Cada proyecto es una card: media, resumen, highlights, stack y links.
 */
@Component({
  selector: 'app-projects',
  imports: [Reveal],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects {
  private readonly locale = inject(LocaleService).current;

  protected readonly projects = [...PROJECTS].sort((a, b) => b.year - a.year);

  protected readonly labels = {
    demo: $localize`:@@projects.link.demo:Ver demo`,
    repo: $localize`:@@projects.link.repo:Código`,
    newTab: $localize`:@@projects.link.newTab:(abre en una pestaña nueva)`,
  };

  protected text(value: Localized): string {
    return value[this.locale] ?? value.es;
  }

  protected list(value: Localized<string[]>): string[] {
    return value[this.locale] ?? value.es;
  }
}
