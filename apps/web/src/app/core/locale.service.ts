import { DOCUMENT, Injectable, LOCALE_ID, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Locale = 'es' | 'en';

/**
 * Saber en qué idioma estamos y construir el link al otro.
 *
 * El i18n son builds separados servidos bajo `/es/` y `/en/` (ver `angular.json`),
 * así que cambiar de idioma es navegar a la otra carpeta, no un estado en runtime.
 * SSR/prerender-safe: en el server no toca `location`.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly localeId = inject(LOCALE_ID);

  readonly current: Locale = this.detect();
  readonly other: Locale = this.current === 'es' ? 'en' : 'es';

  /** URL al mismo contenido en el otro idioma, preservando ruta, query y hash. */
  otherHref(): string {
    if (!this.isBrowser) {
      return `/${this.other}/`;
    }
    const { pathname, search, hash } = this.doc.location;
    const rest = pathname.replace(/^\/(es|en)(?=\/|$)/, '') || '/';
    return `/${this.other}${rest}${search}${hash}`;
  }

  private detect(): Locale {
    if (this.localeId === 'es' || this.localeId === 'en') {
      return this.localeId;
    }
    if (this.isBrowser) {
      const seg = this.doc.location.pathname.split('/')[1];
      if (seg === 'es' || seg === 'en') {
        return seg;
      }
    }
    return 'es';
  }
}
