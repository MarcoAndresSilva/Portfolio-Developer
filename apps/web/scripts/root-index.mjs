// El i18n genera dos builds estáticos bajo dist/web/browser/{es,en}/ y no deja
// nada en la raíz. Este script escribe un dist/web/browser/index.html mínimo que
// redirige al idioma del visitante (por defecto `es`), para que el `dist` sea
// desplegable tal cual en cualquier hosting estático sin reglas extra.
// En el despliegue real (Fase 12) esto se puede reemplazar por una regla de
// redirección del hosting.
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const outDir = join(import.meta.dirname, '..', 'dist', 'web', 'browser');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Marco Andrés Silva — Desarrollador Full Stack</title>
<meta name="google-site-verification" content="CTJKM5X9BI_yQDWw_6SPW-CXKhxUlJRU1HCoFhdS85Q" />
<link rel="canonical" href="/es/">
<meta name="robots" content="noindex">
<script>
(function () {
  var lang = (navigator.language || 'es').toLowerCase();
  var target = lang.indexOf('en') === 0 ? '/en/' : '/es/';
  location.replace(target + location.search + location.hash);
})();
</script>
<meta http-equiv="refresh" content="0; url=/es/">
</head>
<body>
<p><a href="/es/">Ir al portafolio</a> · <a href="/en/">Go to the portfolio</a></p>
</body>
</html>
`;

await writeFile(join(outDir, 'index.html'), html, 'utf8');
console.log('Wrote dist/web/browser/index.html (redirect es/en)');
