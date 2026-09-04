import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import type { Locale } from '@portfolio/shared';
import { LocaleService } from '../../core/locale.service';
import { Reveal } from '../../core/motion/reveal.directive';

type Localized<T = string> = Record<Locale, T>;

/** Enfoque con el que se leen los logros — refleja los 3 CVs de Marco. */
type Focus = 'fullstack' | 'frontend' | 'backend';

interface Job {
  company: string;
  role: Localized;
  /** 'YYYY-MM'. */
  start: string;
  /** 'YYYY-MM' o null si es el trabajo actual. */
  end: string | null;
  location?: string;
  stack: string[];
  /**
   * Logros por enfoque. `fullstack` es obligatorio y es el fallback cuando un
   * enfoque no aporta una versión distinta (ej. trabajos no-dev).
   */
  highlights: { fullstack: Localized<string[]> } & Partial<Record<Focus, Localized<string[]>>>;
}

// =============================================================================
// Datos tipados (sin CMS, ver ARCHITECTURE.md §6). Fuente: los 3 CVs de Marco
// (Fullstack / Frontend / Backend). El toggle cambia los `highlights`; solo
// Megadev y Rindegastos varían por enfoque, el resto comparte la versión base.
// =============================================================================
const JOBS: Job[] = [
  {
    company: 'Megadev Ingeniería Informática',
    role: {
      es: 'Desarrollador Fullstack — Proyecto BancoEstado',
      en: 'Fullstack Developer — BancoEstado project',
    },
    start: '2025-09',
    end: null,
    location: 'Santiago, Chile',
    stack: ['Angular', 'NestJS', 'RxJS', 'OAuth2', 'PostgreSQL', 'Microservicios'],
    highlights: {
      fullstack: {
        es: [
          'Módulos clave de la plataforma de OpenBanking: integración segura entre el banco y el ecosistema Fintech chileno bajo la Ley Fintech.',
          'Microservicios con NestJS y RxJS, con comunicación de baja latencia y alta disponibilidad.',
          'Interfaces en Angular 18+ con flujos de consentimiento y autorización OAuth2.',
          'Reducción del 20% en los tiempos de carga del frontend con lazy loading.',
        ],
        en: [
          'Key modules of the OpenBanking platform: secure integration between the bank and the Chilean Fintech ecosystem under the Fintech Law.',
          'Microservices with NestJS and RxJS, with low-latency, highly available communication.',
          'Angular 18+ interfaces with OAuth2 consent and authorization flows.',
          '20% reduction in frontend load times through lazy loading.',
        ],
      },
      frontend: {
        es: [
          'Componentes de alta fidelidad en Angular 18+ para la plataforma de OpenBanking Empresa.',
          'Flujos complejos de autenticación y consentimiento con RxJS, con una experiencia fluida y segura.',
          'Reducción del 20% en los tiempos de carga con lazy loading.',
          'Colaboración en el diseño de los microservicios NestJS consumidos por el frontend.',
        ],
        en: [
          'High-fidelity Angular 18+ components for the OpenBanking Empresa platform.',
          'Complex authentication and consent flows with RxJS, smooth and secure.',
          '20% reduction in load times through lazy loading.',
          'Contributed to the design of the NestJS microservices consumed by the frontend.',
        ],
      },
      backend: {
        es: [
          'Arquitectura y desarrollo de microservicios NestJS para procesar autorizaciones bancarias en tiempo real bajo la Ley Fintech.',
          'Esquemas de base de datos en PostgreSQL optimizados para consultas de alta concurrencia.',
          'Tokens de seguridad y validaciones estrictas de API para asegurar la integridad de la plataforma.',
          'Arquitectura Hexagonal para desacoplar la lógica de negocio de la infraestructura.',
        ],
        en: [
          'Architected and built NestJS microservices to process real-time banking authorizations under the Fintech Law.',
          'PostgreSQL database schemas tuned for high-concurrency queries.',
          'Security tokens and strict API validation to protect platform integrity.',
          'Hexagonal Architecture to decouple business logic from infrastructure.',
        ],
      },
    },
  },
  {
    company: 'Rindegastos',
    role: { es: 'Desarrollador Frontend', en: 'Frontend Developer' },
    start: '2025-02',
    end: '2025-05',
    location: 'Santiago, Chile',
    stack: ['Angular', 'TypeScript', 'SCSS'],
    highlights: {
      fullstack: {
        es: [
          'Evolución de la plataforma corporativa con Angular y TypeScript, mejorando el procesamiento de reportes de gastos.',
          'Mejoras de UI/UX que subieron la satisfacción del usuario y bajaron los tickets de soporte.',
        ],
        en: [
          'Evolved the corporate platform with Angular and TypeScript, improving expense-report processing.',
          'UI/UX improvements that raised user satisfaction and cut support tickets.',
        ],
      },
      frontend: {
        es: [
          'Refactorización de módulos críticos en Angular, mejorando el rendimiento de carga en móvil.',
          'Calidad de código con principios SOLID y revisiones técnicas constantes.',
          'Traducción de prototipos de Figma a código modular y reutilizable junto a UX.',
        ],
        en: [
          'Refactored critical Angular modules, improving load performance on mobile.',
          'Code quality through SOLID principles and constant technical reviews.',
          'Turned Figma prototypes into modular, reusable code alongside UX.',
        ],
      },
    },
  },
  {
    company: 'Ilustre Municipalidad de Melipilla',
    role: { es: 'Desarrollador Frontend', en: 'Frontend Developer' },
    start: '2024-01',
    end: '2024-12',
    location: 'Melipilla, Chile',
    stack: ['Angular', 'Docker', 'WCAG 2.0', 'Scrum'],
    highlights: {
      fullstack: {
        es: [
          'Modernización del portal institucional (melipilla.cl) y de los sistemas de emergencia comunal, con Scrum.',
          'Chatbot ciudadano y cumplimiento de accesibilidad WCAG 2.0.',
          'Entornos de desarrollo estandarizados con Docker, reduciendo errores de despliegue.',
        ],
        en: [
          'Modernized the institutional portal (melipilla.cl) and the municipal emergency systems, with Scrum.',
          'Citizen chatbot and WCAG 2.0 accessibility compliance.',
          'Standardized dev environments with Docker, reducing deployment errors.',
        ],
      },
    },
  },
  {
    company: 'Freelance',
    role: { es: 'Desarrollador Web — Independiente', en: 'Web Developer — Freelance' },
    start: '2020-01',
    end: '2023-12',
    stack: ['HTML', 'CSS', 'JavaScript'],
    highlights: {
      fullstack: {
        es: [
          'Sitios web para clientes particulares.',
          'Reconversión profesional: formación autodidacta e intensiva en desarrollo de software.',
        ],
        en: [
          'Websites for individual clients.',
          'Career switch: intensive self-taught software development.',
        ],
      },
    },
  },
  {
    company: 'NTT Ltd. (ex Dimension Data)',
    role: { es: 'IT Support Engineer', en: 'IT Support Engineer' },
    start: '2015-12',
    end: '2019-11',
    location: 'Santiago, Chile',
    stack: ['Active Directory', 'Citrix', 'Infraestructura TI'],
    highlights: {
      fullstack: {
        es: [
          'De practicante profesional a IT Support Engineer dentro de la organización.',
          'Continuidad operativa de infraestructura TI y administración de plataformas corporativas (Active Directory, Citrix).',
        ],
        en: [
          'From professional intern to IT Support Engineer within the company.',
          'Operational continuity of IT infrastructure and administration of corporate platforms (Active Directory, Citrix).',
        ],
      },
    },
  },
];

/**
 * Sección "Experiencia" — timeline vertical. Un toggle Full stack / Frontend /
 * Backend reescribe los logros según el enfoque (los 3 CVs de Marco en una vista).
 */
@Component({
  selector: 'app-experience',
  imports: [Reveal],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Experience {
  private readonly locale = inject(LocaleService).current;

  protected readonly focus = signal<Focus>('fullstack');

  protected readonly focuses: { id: Focus; label: string }[] = [
    { id: 'fullstack', label: $localize`:@@experience.focus.fullstack:Full stack` },
    { id: 'frontend', label: $localize`:@@experience.focus.frontend:Frontend` },
    { id: 'backend', label: $localize`:@@experience.focus.backend:Backend` },
  ];

  protected readonly present = $localize`:@@experience.present:Actualidad`;
  protected readonly focusLegend = $localize`:@@experience.focus.legend:Ver los logros con enfoque:`;

  protected readonly jobs = computed(() =>
    JOBS.map((job) => ({
      company: job.company,
      role: job.role[this.locale],
      location: job.location,
      stack: job.stack,
      period: this.period(job.start, job.end),
      current: job.end === null,
      highlights: (job.highlights[this.focus()] ?? job.highlights.fullstack)[this.locale],
    })),
  );

  protected setFocus(id: Focus): void {
    this.focus.set(id);
  }

  private period(start: string, end: string | null): string {
    const from = this.month(start);
    const to = end ? this.month(end) : this.present;
    return `${from} — ${to}`;
  }

  private month(iso: string): string {
    const [year, month] = iso.split('-').map(Number);
    const date = new Date(year, (month ?? 1) - 1, 1);
    return new Intl.DateTimeFormat(this.locale, { month: 'short', year: 'numeric' }).format(date);
  }
}
