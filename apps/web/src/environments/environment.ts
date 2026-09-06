/**
 * Configuración de producción.
 * En dev, `angular.json` lo reemplaza por `environment.development.ts`.
 *
 * `apiUrl`: la API en Render (ese dominio también va en `CORS_ORIGIN`, en Render).
 * `siteUrl`: el dominio del sitio en Netlify — se usa en las meta tags, el
 * canonical, el sitemap y el JSON-LD. Debe coincidir con `SITE_URL` en `netlify.toml`.
 */
export const environment = {
  production: true,
  apiUrl: 'https://portfoliodev-api.onrender.com',
  siteUrl: 'https://gentle-ganache-580791.netlify.app',
};
