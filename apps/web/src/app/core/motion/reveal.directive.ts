import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * `[appReveal]` — anima la entrada del elemento cuando aparece en el viewport.
 *
 * - Pone la host class `reveal`, así el estado inicial (oculto) ya viaja en el
 *   HTML prerenderizado y no hay flash. El look lo define `_motion.scss`.
 * - `afterNextRender` solo corre en el browser: el server nunca oculta nada.
 * - Si no hay `IntersectionObserver`, revela de inmediato.
 * - `prefers-reduced-motion` lo maneja el CSS (no hace falta tocar el directive).
 *
 * @example
 * <section appReveal> ... </section>
 * <li appReveal [appRevealDelay]="i * 80"> ... </li>   // escalonar un grupo
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal' },
})
export class Reveal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Retardo en ms antes de animar, para escalonar elementos de un grupo. */
  readonly delay = input(0, { alias: 'appRevealDelay' });

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;

      const ms = this.delay();
      if (ms) {
        el.style.setProperty('--reveal-delay', `${ms}ms`);
      }

      if (!('IntersectionObserver' in window)) {
        el.classList.add('is-revealed');
        return;
      }

      const observer = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              el.classList.add('is-revealed');
              obs.disconnect();
            }
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      );
      observer.observe(el);
    });
  }
}
