/**
 * Configuración de producción (valor por defecto).
 * En dev, `angular.json` lo reemplaza por `environment.development.ts`.
 *
 * TODO(Marco): poner la URL real de la API cuando se despliegue (Render / Railway
 * / Fly). Ese mismo dominio hay que agregarlo a `CORS_ORIGIN` en la API.
 */
export const environment = {
  production: true,
  apiUrl: 'https://portfoliodev-api.onrender.com',
};
