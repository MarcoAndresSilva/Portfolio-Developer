import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LocaleService } from './locale.service';
import { environment } from '../../environments/environment';

/**
 * Meta tags, canonical/hreflang y JSON-LD para SEO y GEO (que el sitio lo
 * entiendan buscadores Y crawlers de IA — ver ARCHITECTURE.md §1 y §9).
 *
 * Corre en el constructor (sincrónico) para que todo viaje en el HTML
 * prerenderizado. El sitio es una sola página, así que se llama una vez desde
 * `App`.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly localeService = inject(LocaleService);

  private readonly site = environment.siteUrl.replace(/\/$/, '');
  private readonly name = 'Marco Andrés Silva';
  private readonly fullName = 'Marco Andrés Silva Ponce';
  private readonly image = `${this.site}/og-image.png`;
  private readonly social = [
    'https://github.com/MarcoAndresSilva',
    'https://www.linkedin.com/in/marco-andres-silva-ponce-b42286b4/',
  ];

  apply(): void {
    const locale = this.localeService.current;
    const url = `${this.site}/${locale}/`;

    const title = $localize`:@@seo.title:Marco Andrés Silva — Desarrollador Fullstack`;
    const description = $localize`:@@seo.description:Portafolio de Marco Andrés Silva, ingeniero fullstack (Angular · NestJS). Enfocado en Fintech y OpenBanking bajo la Ley Fintech chilena.`;

    this.title.setTitle(title);
    this.setMeta('name', 'description', description);
    this.setMeta('name', 'author', this.fullName);

    // Open Graph
    this.setMeta('property', 'og:type', 'website');
    this.setMeta('property', 'og:site_name', this.name);
    this.setMeta('property', 'og:title', title);
    this.setMeta('property', 'og:description', description);
    this.setMeta('property', 'og:url', url);
    this.setMeta('property', 'og:image', this.image);
    this.setMeta('property', 'og:locale', locale === 'en' ? 'en_US' : 'es_CL');

    // Twitter
    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', title);
    this.setMeta('name', 'twitter:description', description);
    this.setMeta('name', 'twitter:image', this.image);

    this.setLink('canonical', url);
    this.setAlternate('es', `${this.site}/es/`);
    this.setAlternate('en', `${this.site}/en/`);
    this.setAlternate('x-default', `${this.site}/es/`);

    this.setJsonLd(this.buildJsonLd(locale, url, description));
  }

  private setMeta(attr: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attr]: key, content }, `${attr}='${key}'`);
  }

  private setLink(rel: string, href: string): void {
    const existing = this.doc.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    const link = existing ?? this.doc.createElement('link');
    link.setAttribute('rel', rel);
    link.setAttribute('href', href);
    if (!existing) {
      this.doc.head.appendChild(link);
    }
  }

  private setAlternate(hreflang: string, href: string): void {
    const selector = `link[rel="alternate"][hreflang="${hreflang}"]`;
    const existing = this.doc.head.querySelector<HTMLLinkElement>(selector);
    const link = existing ?? this.doc.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', href);
    if (!existing) {
      this.doc.head.appendChild(link);
    }
  }

  private setJsonLd(data: unknown): void {
    const id = 'ld-json';
    const existing = this.doc.getElementById(id);
    const script = existing ?? this.doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', id);
    script.textContent = JSON.stringify(data);
    if (!existing) {
      this.doc.head.appendChild(script);
    }
  }

  private buildJsonLd(locale: string, url: string, description: string): unknown {
    const personId = `${this.site}/#marco`;
    const jobTitle = $localize`:@@seo.jobTitle:Ingeniero de Software Fullstack`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': personId,
          name: this.fullName,
          givenName: 'Marco Andrés',
          familyName: 'Silva Ponce',
          jobTitle,
          email: 'mailto:marco.silvaponce10@gmail.com',
          url: `${this.site}/${locale}/`,
          image: this.image,
          sameAs: this.social,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Santiago',
            addressCountry: 'CL',
          },
          alumniOf: { '@type': 'CollegeOrUniversity', name: 'Duoc UC' },
          knowsAbout: [
            'Angular',
            'NestJS',
            'Node.js',
            'TypeScript',
            'RxJS',
            'PostgreSQL',
            'OpenBanking',
            'OAuth2',
            'Microservices',
            'Web Accessibility',
          ],
        },
        {
          '@type': 'WebSite',
          '@id': `${this.site}/#website`,
          url: `${this.site}/${locale}/`,
          name: this.name,
          inLanguage: locale === 'en' ? 'en' : 'es-CL',
          publisher: { '@id': personId },
        },
        {
          '@type': 'ProfilePage',
          '@id': url,
          url,
          name: `${this.name} — ${jobTitle}`,
          description,
          inLanguage: locale === 'en' ? 'en' : 'es-CL',
          isPartOf: { '@id': `${this.site}/#website` },
          about: { '@id': personId },
          mainEntity: { '@id': personId },
        },
      ],
    };
  }
}
