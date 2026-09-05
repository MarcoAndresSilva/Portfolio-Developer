// Escribe robots.txt, sitemap.xml, llms.txt y copia og-image.png a la raíz de
// dist/web/browser/.
//
// No pueden ir en `public/` porque ahí Angular los copiaría dentro de cada
// locale (`es/robots.txt`, `en/robots.txt`, `es/og-image.png`...) y estos tienen
// que quedar en la raíz del dominio — `SeoService` arma `og:image` como
// `{siteUrl}/og-image.png`, sin el prefijo de locale.
//
// `SITE_URL` (env) debe coincidir con `siteUrl` de src/environments/environment.ts.
import { copyFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = (process.env.SITE_URL ?? 'https://marco-silva.dev').replace(/\/$/, '');
const publicDir = join(import.meta.dirname, '..', 'public');
const outDir = join(import.meta.dirname, '..', 'dist', 'web', 'browser');

const robots = `User-agent: *
Allow: /

Sitemap: ${site}/sitemap.xml
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${site}/es/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${site}/es/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${site}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${site}/es/"/>
  </url>
  <url>
    <loc>${site}/en/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${site}/es/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${site}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${site}/es/"/>
  </url>
</urlset>
`;

// llms.txt — resumen en texto plano para crawlers de IA (ver ARCHITECTURE.md §1).
const llms = `# Marco Andrés Silva Ponce

> Ingeniero en Informática y desarrollador fullstack (Angular · NestJS).
> Enfocado en Fintech y OpenBanking bajo la Ley Fintech chilena.
> Santiago, Chile. Abierto a nuevas oportunidades.

## Contacto
- Email: marco.silvaponce10@gmail.com
- GitHub: https://github.com/MarcoAndresSilva
- LinkedIn: https://www.linkedin.com/in/marco-andres-silva-ponce-b42286b4/

## Sitio
- Español: ${site}/es/
- English: ${site}/en/

## Perfil
Más de 3 años en desarrollo, con 4 años previos en infraestructura TI.
Actualmente en Megadev (proyecto BancoEstado): módulos de OpenBanking,
microservicios NestJS, flujos OAuth2 en Angular 18+.

- Frontend: Angular (v5–v19), Signals, RxJS, optimización de performance.
- Backend: NestJS, Node.js, APIs REST, arquitectura hexagonal, BFF.
- Seguridad: OAuth2, JWT, estándares transaccionales bancarios (3D Secure).
- Calidad: accesibilidad WCAG 2.0, SOLID, código limpio.
- Datos y ops: PostgreSQL, Prisma, Docker, GitHub Actions.

## Proyectos
- FinTrack — app de finanzas personales (Angular, NestJS, Prisma, PostgreSQL).
  En uso a diario. Demo: https://financialtrackapp.netlify.app
- Imperio Barber — landing y sistema de reservas para una barbería (Angular).
`;

await Promise.all([
  writeFile(join(outDir, 'robots.txt'), robots, 'utf8'),
  writeFile(join(outDir, 'sitemap.xml'), sitemap, 'utf8'),
  writeFile(join(outDir, 'llms.txt'), llms, 'utf8'),
]);

try {
  await copyFile(join(publicDir, 'og-image.png'), join(outDir, 'og-image.png'));
  console.log('Copied og-image.png to dist root');
} catch {
  console.warn('og-image.png no encontrada en apps/web/public/ — og:image quedará roto.');
}

console.log(`Wrote robots.txt, sitemap.xml, llms.txt (site: ${site})`);
