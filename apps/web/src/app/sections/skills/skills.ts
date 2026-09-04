import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Reveal } from '../../core/motion/reveal.directive';

interface SkillGroup {
  /** Etiqueta de la categoría, traducible. */
  label: string;
  /** Nombres de tecnologías (no se traducen). */
  skills: string[];
}

/**
 * Sección "Stack & habilidades" — tecnologías agrupadas por área.
 *
 * El contenido son datos tipados, sin CMS (ver ARCHITECTURE.md §6). La lista
 * refleja lo realmente usado en los proyectos del portafolio.
 */
@Component({
  selector: 'app-skills',
  imports: [Reveal],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skills {
  protected readonly groups: SkillGroup[] = [
    {
      label: $localize`:@@skills.cat.language:Lenguajes`,
      skills: ['TypeScript', 'JavaScript', 'SQL', 'HTML', 'CSS / SCSS'],
    },
    {
      label: $localize`:@@skills.cat.frontend:Frontend`,
      skills: [
        'Angular',
        'RxJS',
        'Angular Signals',
        'Angular Material',
        'SSR / SSG',
        'PWA',
      ],
    },
    {
      label: $localize`:@@skills.cat.backend:Backend`,
      skills: ['NestJS', 'Node.js', 'REST APIs', 'JWT / Passport', 'class-validator'],
    },
    {
      label: $localize`:@@skills.cat.database:Bases de datos`,
      skills: ['PostgreSQL', 'MySQL', 'Prisma', 'Transacciones ACID'],
    },
    {
      label: $localize`:@@skills.cat.devops:DevOps & despliegue`,
      skills: ['Docker', 'Docker Compose', 'GitHub Actions', 'Render', 'Netlify', 'Neon'],
    },
    {
      label: $localize`:@@skills.cat.tooling:Testing & tooling`,
      skills: ['Jest', 'Vitest', 'Playwright', 'Git', 'ESLint / Prettier'],
    },
  ];
}
