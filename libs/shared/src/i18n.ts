/** Idiomas soportados por el sitio. */
export type Locale = 'es' | 'en';

/**
 * Un contenido disponible en cada idioma soportado.
 *
 * @example
 * const title: Localized = { es: 'Hola', en: 'Hi' };
 * const bullets: Localized<string[]> = { es: ['uno'], en: ['one'] };
 */
export type Localized<T = string> = Record<Locale, T>;
