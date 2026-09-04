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
//   Imperio Barber→ confirmá el `stack` real ("hartas tecnologías") y agregá
//                   `links.demo` cuando termines de desplegarlo.
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
    slug: 'imperio-barber',
    title: 'Imperio Barber',
    year: 2025,
    summary: {
      es: 'Landing y sistema de reservas para una barbería: agenda online para los clientes y administración de horarios para el dueño y los barberos.',
      en: 'Landing page and booking system for a barbershop: online scheduling for clients and shift management for the owner and barbers.',
    },
    highlights: {
      es: [
        'Reserva de horas online — resuelve el ida y vuelta con los clientes.',
        'Administración de horarios y disponibilidad para el dueño y cada barbero.',
      ],
      en: [
        'Online appointment booking — removes the back-and-forth with clients.',
        'Schedule and availability management for the owner and each barber.',
      ],
    },
    stack: ['Angular', 'TypeScript', 'SCSS'],
    media: { type: 'video', src: 'media/demo-imperio-barber.mp4' },
    mediaAlt: {
      es: 'Recorrido por el sitio de Imperio Barber y el proceso de reserva.',
      en: 'Walkthrough of the Imperio Barber site and the booking process.',
    },
    links: {},
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
