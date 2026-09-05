/**
 * Configuración de producción (valor por defecto).
 * En dev, `angular.json` lo reemplaza por `environment.development.ts`.
 *
 * TODO(Marco): poner las URLs reales cuando se despliegue.
 *  - `apiUrl`: la API en Render/Railway/Fly (ese dominio también va en `CORS_ORIGIN`).
 *  - `siteUrl`: el dominio del sitio (Netlify o dominio propio) — se usa en las
 *    meta tags, el canonical, el sitemap y el JSON-LD.
 */
export const environment = {
  production: true,
  apiUrl: 'https://portfoliodev-api.onrender.com',
  siteUrl: 'https://marco-silva.dev',
};
