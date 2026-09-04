import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * `[appTypewriter]` — "teclea" el contenido del elemento carácter por carácter,
 * atravesando también sus hijos (así el `<span>` del degradado del nombre se
 * conserva y se va llenando en su turno).
 *
 * El texto real vive en la plantilla: viaja en el HTML prerenderizado (lo indexan
 * los crawlers, lo leen los lectores de pantalla) y esto solo lo vuelve a teclear
 * en el browser como efecto de entrada.
 *
 * - Sin JS → el texto se ve completo, sin efecto.
 * - `prefers-reduced-motion: reduce` → el texto se ve completo, sin efecto.
 * - Antes de arrancar fija el alto actual del elemento para que la línea no salte.
 * - El cursor parpadeante es un `::after` de CSS (ver `_motion.scss`); las clases
 *   `is-typing` / `is-typed` en el host lo controlan.
 *
 * @example
 * <h1 appTypewriter [appTypewriterDelay]="700">Hola, soy <span>Marco</span>.</h1>
 */
@Directive({
  selector: '[appTypewriter]',
})
export class Typewriter {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** ms por carácter. Se le suma jitter para que no suene mecánico. */
  readonly speed = input(78, { alias: 'appTypewriterSpeed' });

  /** ms de espera antes de empezar, para encadenar con la entrada del hero. */
  readonly startDelay = input(0, { alias: 'appTypewriterDelay' });

  constructor() {
    afterNextRender(() => {
      const host = this.host.nativeElement;

      // Con reduced-motion no se teclea ni se muestra cursor: el texto ya está.
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Segmentos en orden: cada nodo de texto y cada elemento hijo, con su texto.
      // Se conservan los nodos para volver a llenarlos sin perder su estructura.
      const segments = Array.from(host.childNodes).map((node) => ({
        node,
        text: node.textContent ?? '',
      }));
      if (segments.length === 0) {
        return;
      }

      // Recorta el espacio de plantilla en los bordes (mantiene el de en medio).
      segments[0].text = segments[0].text.replace(/^\s+/, '');
      const last = segments[segments.length - 1];
      last.text = last.text.replace(/\s+$/, '');

      const total = segments.reduce((n, s) => n + s.text.length, 0);
      if (total === 0) {
        return;
      }

      const setText = (node: Node, value: string): void => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.nodeValue = value;
        } else {
          (node as HTMLElement).textContent = value;
        }
      };

      // Reserva el alto del texto final → la línea no salta al teclear.
      host.style.minHeight = `${Math.ceil(host.getBoundingClientRect().height)}px`;
      for (const s of segments) {
        setText(s.node, '');
      }
      host.classList.add('is-typing');

      let typed = 0;
      const step = this.speed();

      const render = (): void => {
        let remaining = typed;
        for (const s of segments) {
          const take = Math.min(Math.max(remaining, 0), s.text.length);
          setText(s.node, s.text.slice(0, take));
          remaining -= take;
        }
      };

      const type = (): void => {
        typed += 1;
        render();
        if (typed < total) {
          window.setTimeout(type, step * (0.5 + Math.random()));
        } else {
          host.classList.remove('is-typing');
          host.classList.add('is-typed');
          host.style.minHeight = '';
        }
      };

      window.setTimeout(type, this.startDelay());
    });
  }
}
