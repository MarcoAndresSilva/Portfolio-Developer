import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
} from '@angular/core';
import { About } from '../../sections/about/about';
import { Contact } from '../../sections/contact/contact';
import { Experience } from '../../sections/experience/experience';
import { Projects } from '../../sections/projects/projects';
import { Skills } from '../../sections/skills/skills';
import { Typewriter } from '../../core/motion/typewriter.directive';

@Component({
  selector: 'app-home',
  imports: [About, Contact, Experience, Projects, Skills, Typewriter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Entrada del hero. `_motion.scss` deja los hijos en opacity:0 bajo `:root.js`;
    // acá los traemos a su sitio. Con reduced-motion el CSS ya los muestra y esto
    // no corre. `afterNextRender` garantiza browser + DOM listo (SSR-safe).
    // GSAP se carga en un chunk aparte (solo se usa post-render, nunca en SSR).
    afterNextRender(async () => {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      const { gsap } = await import('gsap');
      const q = (sel: string): Element | null => this.host.nativeElement.querySelector(sel);

      // Cada línea sube y aparece; se solapan para que fluya. El nombre lo teclea
      // `[appTypewriter]` con 700ms de retardo, justo cuando el `<h1>` ya está visible.
      const rise = () => ({
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        startAt: { y: 18 },
        y: 0,
        clearProps: 'transform',
      });

      gsap
        .timeline()
        .to(q('.hero__eyebrow'), rise())
        .to(q('.hero__title'), rise(), '-=0.45')
        .to(q('.hero__lead'), rise(), '-=0.45')
        .to(q('.hero__actions'), rise(), '-=0.45');
    });
  }
}
