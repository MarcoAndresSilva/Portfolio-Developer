# ARCHITECTURE.md — Portfolio-Developer

> Diario de arquitectura y decisiones técnicas: qué se construyó en cada fase, cómo, y por qué se
> eligió cada camino. Este documento **no** dice en qué fase está el proyecto hoy ni qué falta —
> eso es información de trabajo entre Marco y el asistente, no algo que deba vivir en el repo.

## 1. Qué es esto y por qué

Portafolio de **Marco Andrés Silva**, carta de presentación para conseguir trabajo. Debe verse
moderno, profesional y sobrio, mostrar sus proyectos con impacto visual, y ser encontrable por
**reclutadores humanos Y por buscadores / crawlers de IA**.

**El hallazgo que define el enfoque:** el sitio de referencia (`mauricioACV/portfolio`) es una SPA
React 100% client-side. Al leerlo con una herramienta automática (como un crawler) no se obtiene
contenido, solo "necesitas JavaScript". Este proyecto lo corrige de raíz con **Angular SSG**: el
contenido real viaja dentro del HTML.

---

## 2. Diario de construcción

### Fase 1 — Esqueleto del monorepo

**Objetivo:** base del repo con npm workspaces (`apps/*`, `libs/*`) y este `ARCHITECTURE.md` como
referencia viva de decisiones.

**Decisión — npm workspaces, no Nx, no repos separados:** Nx aporta cache de builds y `affected`,
valioso en monorepos grandes; acá hay 2 apps + 1 lib y el beneficio no se nota, solo el costo (deps
que migrar en cada release de Angular). Workspaces da la misma estructura `apps/`+`libs/` con cero
deps extra. Repos separados obligarían a duplicar o publicar `libs/shared`.

### Fase 2 — `apps/web`: Angular 22 con SSG

**Implementación:** Angular 22 standalone, con SSR/prerender configurado desde el arranque.
Requiere **Node ≥22.22.3** (`.nvmrc` → `22.23.1`; la máquina de desarrollo tiene v20 y v22 vía
nvm, hay que `nvm use`). SSG verificado con `curl`/view-source del build.

**Decisión — SSG/prerender, no SPA client-side:** corrección directa del hallazgo del §1. SSG en
vez de SSR porque el contenido es casi todo estático y permite hosting estático más barato y
rápido (sin servidor Node corriendo en producción).

### Fase 3 — `apps/api`: NestJS 12

**Implementación:** API NestJS ligera. Se quitó `@nestjs/mau` del scaffold inicial → 0
vulnerabilidades reportadas.

**Decisión — backend NestJS ligero, no Formspree/Web3Forms:** aporta valor de portafolio (mostrar
full-stack Angular + NestJS, no solo frontend). Scope acotado a propósito: 1 endpoint de contacto +
rate limiting + honeypot.

### Fase 4 — `libs/shared`

**Implementación:** `@portfolio/shared` — interfaces `Project`, `Experience`, `Skill`,
`SocialLink` + `Locale`/`Localized<T>`. **Solo tipos, sin build**: `exports` apunta a
`src/index.ts` y los `import type` se borran al compilar. Si en algún momento se necesita un valor
en runtime (no solo un tipo), hay que agregar un paso de build a `dist/`.

### Fase 5 — CI (GitHub Actions)

**Implementación:** `.github/workflows/ci.yml` — push a `main` + PRs disparan un job en ubuntu que
corre `typecheck` / `lint` / `test` / `build`. Scripts de la raíz **explícitos por workspace**
(el combo `--workspaces --if-present` falla al anidar `npm run`). Badge de estado en el README.

### Fase 6 — Sistema de diseño, layout e i18n

**6A — Diseño base** (`src/styles/`): `_tokens.scss` (escala de tipografía, espaciado 4px, radios,
sombras, movimiento, z-index como CSS custom properties; breakpoints como vars SCSS),
`_theme.scss` (colores semánticos `--bg`/`--surface`/`--text`/`--accent`…, oscuro por defecto,
claro con `[data-theme='light']`), `_reset.scss` (reset moderno + `prefers-reduced-motion`),
`_base.scss` (`.container`/`.visually-hidden`/`.skip-link` + primitivas `.section*`).

**6B+C — Tema y layout shell:** `app/core/theme.service.ts` (signal + `localStorage`, SSR-safe,
escribe `data-theme` en `<html>`; script anti-flash inline en `index.html`) y el layout
(`app/layout/header` sticky + `app/layout/footer` + `app/pages/home`).

**6D — i18n ES/EN:** `@angular/localize` con **builds localizados** (no runtime como
`ngx-translate`). `angular.json` → `sourceLocale` `es` (`subPath: "es"`), locale `en`
(`subPath: "en"`). `npm run build` genera `dist/web/browser/es/` y `dist/web/browser/en/` como
sitios estáticos independientes; el postbuild `scripts/root-index.mjs` escribe un
`dist/web/browser/index.html` que redirige según `navigator.language`.

**Decisión — builds localizados, no i18n runtime:** `/es` y `/en` como HTML estático propio e
indexable — correcto para SEO/SSG. Se cambió `outputMode` de `server` a `static`: el sitio no tiene
lógica de servidor (el form de contacto va a la API NestJS aparte), y con `static` cada locale es
una carpeta estática independiente desplegable en cualquier hosting.

**Decisión — `Localized<T> = { es: T; en: T }` para datos, no dos archivos por idioma:**
`@angular/localize` traduce las cadenas de UI, pero los *datos* (proyectos, experiencia) no pasan
por ese pipeline. Van con los dos idiomas en el mismo objeto — dos archivos por idioma es difícil
de mantener sincronizado.

### Fase 7 — Hero, Sobre mí, Skills y animaciones

**7A — Base de animaciones:** `core/motion/reveal.directive.ts` (`[appReveal]`,
`[appRevealDelay]`) revela contenido con `IntersectionObserver` al entrar en viewport. Progressive
enhancement: un script inline en `index.html` pone `.js` en `<html>` **antes del primer pintado**;
los estados iniciales ocultos viven bajo `:root.js` en `_motion.scss`, así sin JS no se oculta nada
y no hay flash en el HTML prerenderizado. Sección "Stack" (tecnologías por categoría).

**7B — Hero definitivo:** copy real con foco Fintech/OpenBanking, CTAs ("Ver proyectos",
"Contacto"), links GitHub/LinkedIn. `core/motion/typewriter.directive.ts` re-teclea el nombre
carácter por carácter atravesando también los hijos (conserva el `<span>` del degradado). Entrada
animada con `gsap.timeline()` (eyebrow → título → lead → acciones, solapadas).

**7C — Sección "Sobre mí":** bio en prosa + ficha `<dl>` de datos (formación, experiencia, enfoque,
ubicación, disponibilidad). Sin foto (decisión de Marco).

**Decisión — GSAP + Angular Animations, con `IntersectionObserver` para los reveals simples:**
GSAP entra con `import()` diferido (chunk aparte, fuera del bundle inicial, nunca en SSR, corre en
`afterNextRender`) porque solo se usa post-render en el hero. Los reveals al hacer scroll no
necesitan GSAP — `IntersectionObserver` es gratis y alcanza. Todo respeta
`prefers-reduced-motion` vía CSS / early-return.

### Fase 8 — Proyectos destacados

**Implementación:** sección `app/sections/projects` con cards de FinTrack e Imperio Barber:
`<video>`/`<img>`, badge de estado, resumen, highlights, badges de stack y links. Datos bilingües
con `Localized<T>` en el componente.

### Fase 9 — Contacto y Experiencia

**9A — Contacto:** formulario reactivo + honeypot oculto (`app/sections/contact`) → `POST
/contact` en NestJS. `contact.dto.ts` valida a mano (nombre 2-80, email regex ≤160, mensaje
10-2000). Honeypot `company`: si trae algo, responde 202 igual pero descarta el mensaje.
`RateLimitGuard` — ventana deslizante en memoria, 5 req/min por IP.

**Decisión — validación a mano y guard propio, no `class-validator`/`@nestjs/throttler`:** son 3
campos y 1 endpoint — no justifica arrastrar deps + decoradores nuevos (además `@nestjs/throttler`
no soportaba NestJS 12 al momento de implementarlo).

**9B — Email inicial:** `ContactService` enviaba por SMTP/nodemailer (reemplazado en la Fase 12,
ver más abajo).

**9C — Experiencia:** timeline vertical (`app/sections/experience`) con toggle Full stack /
Frontend / Backend (`signal`) que reescribe los `highlights` de cada puesto según el enfoque
elegido.

**Decisión — timeline con toggle de enfoque, no 3 páginas separadas:** Marco mantiene 3 CVs
(Fullstack / Frontend / Backend) con el mismo historial y distinta énfasis. En vez de elegir uno,
la sección tiene un toggle que reescribe los logros según el enfoque — las 3 versiones viven en una
sola vista, y de paso comunica que el sitio adapta el mensaje a la audiencia. Solo los puestos con
logros que varían de verdad por enfoque tienen las 3 versiones; el resto usa `fullstack` como
fallback.

### Fase 10 — SEO/GEO, Lighthouse CI y accesibilidad

**10A — SEO/GEO:** `app/core/seo.service.ts`, llamado desde `App` en el constructor
(sincrónico → viaja en el prerender). Pone `<title>` + `description` + Open Graph + Twitter Card,
`canonical` + `hreflang` (es/en/x-default) y un `<script type="application/ld+json">` con
`Person` + `WebSite` + `ProfilePage`. `scripts/seo-files.mjs` (postbuild) escribe `robots.txt` /
`sitemap.xml` / `llms.txt` en la raíz del `dist` (no en `public/`, porque ahí se copiarían dentro
de cada locale). OG image (`apps/web/public/og-image.png`, 1200×630) generada con `@resvg/resvg-js`
a partir de un SVG con la paleta del sitio, sin foto ni stock.

**10B — Lighthouse CI y a11y:** `@lhci/cli` + `lighthouserc.json` en el workflow de CI — corre en
cada push, sube el reporte HTML como artefacto descargable. Bloqueante (`error`, minScore 0.9) en
Accessibility/Best-Practices/SEO; Performance queda en `warn` porque nunca se pudo probar
localmente (sin Chrome en el entorno de desarrollo) y no se quiso bloquear el CI a ciegas con el
primer número real. Fixes de accesibilidad: contraste de `--text-subtle` en tema claro (3:1 →
4.8:1), honeypot sin `aria-hidden` contradictorio.

### Fase 12 — Despliegue: sitio, API y email real

**API en Render:** `render.yaml` (Blueprint) — Render lee el repo y crea el servicio solo, sin
adivinar comandos a mano en el dashboard. Env vars de arranque cargadas con placeholders a
propósito (`CORS_ORIGIN=http://localhost:4200`, `SMTP_*` vacías) para no bloquear el primer deploy
mientras se completaban las reales.

**Sitio en Netlify:** primer build falló dos veces porque el plugin `@netlify/angular-runtime` no
encontraba `angular.json` en la raíz (es un monorepo). Configuración final en `netlify.toml`:
`base = "apps/web"` (el plugin busca `angular.json` ahí) + `command = "npm run build"` (corre ya
dentro de `apps/web`, sin `--workspace`) + `publish = "dist/web/browser"` (relativo a ese `base`).

**Decisión — subdominio gratis de Netlify, no dominio propio:** Marco decidió no comprar dominio
por ahora; cambiarlo después implica editar solo 3 URLs (`siteUrl` en `environment.ts`,
`SITE_URL` en `netlify.toml`, `CORS_ORIGIN` en Render), sin rehacer nada de la arquitectura.

**Email: migración de SMTP/nodemailer a la API HTTP de Resend.** El primer intento fue SMTP con
Gmail (app password), pero **el plan free de Render bloquea el tráfico saliente a los puertos SMTP
(25/465/587) desde 2025-09** — `nodemailer` quedaba colgado hasta el timeout y el endpoint
devolvía 500. Se cambió `ContactService.deliver` a un `POST https://api.resend.com/emails` con
`fetch` nativo (HTTP no está bloqueado) — **cero deps nuevas** (se sacó `nodemailer`). Sin dominio
propio verificado: `from = onboarding@resend.dev`, `to` = el Gmail de Marco (la casilla de la
cuenta Resend), con `reply_to` al visitante — ese es exactamente el flujo de este formulario (todo
le llega a Marco). Config vía env vars: `RESEND_API_KEY` (sin ella, el servicio solo loguea —
corre en local sin configurar nada), `CONTACT_TO`, `CONTACT_FROM`.

**Endurecimiento del endpoint:** si el envío de email falla, el controller loguea el mensaje
completo (no se pierde) y responde **502** en vez de 500 — el formulario del frontend ya tenía
texto de fallback para ese caso.

**Google Search Console:** verificación por meta tag (`google-site-verification`), agregado en
`apps/web/scripts/root-index.mjs` para que viaje en la raíz del sitio (`index.html` de
redirección) y no solo dentro de `/es`/`/en`.

---

## 3. Decisiones transversales

**Contenido en datos tipados, sin CMS:** menos infraestructura, y el contenido cambia poco. Los
datos bilingües viven en el código con `Localized<T>` (ver Fase 6).

**Extras desde el inicio: CI + Lighthouse CI.** Baratos de montar temprano, caros después.
Lighthouse CI automatiza la meta de "≥90 en las 4 categorías" y la vuelve bloqueante en CI en vez
de un chequeo manual ocasional. (Playwright E2E se evaluó para el flujo del formulario de contacto
pero no llegó a implementarse.)

**Pospuesto, sin implementar:** OG images dinámicas por página — se decidirá junto con si el sitio
tendrá páginas de detalle por proyecto.

---

## 4. Cómo correr el proyecto

```bash
nvm use              # Node 22.23.1 (lo exige Angular 22; la máquina tiene v20 y v22)
npm install          # una vez, instala todos los workspaces
npm run web          # dev server de apps/web (locale es) → http://localhost:4200
npm run api          # dev server de apps/api → http://localhost:3100 (el form de contacto lo necesita)
npm run start:en --workspace apps/web   # dev server con el locale en (previsualizar traducción)
npm run extract-i18n --workspace apps/web   # regenerar src/locale/messages.xlf tras tocar textos

npm run typecheck    # \
npm run lint         #  } lo que corre la CI en cada push/PR
npm run test         #  }
npm run build        # /
```

Marcar cada texto nuevo con `i18n` / `$localize`, correr `npm run extract-i18n --workspace
apps/web` y traducir en `messages.en.xlf`.

---

## 5. Estructura del repo

```
Portfolio-Developer/
├── apps/
│   ├── web/     # Angular 22 (SSG) — el sitio
│   └── api/     # NestJS 12 — contacto por email + anti-spam
├── libs/
│   └── shared/  # @portfolio/shared — interfaces TS (solo tipos)
├── .github/workflows/ci.yml
├── render.yaml          # Blueprint de Render para apps/api
├── netlify.toml         # Config de Netlify para apps/web
├── lighthouserc.json    # Config de Lighthouse CI
├── package.json         # raíz: workspaces + scripts orquestadores
├── .nvmrc               # 22.23.1
├── ARCHITECTURE.md · README.md · LICENSE (MIT) · .editorconfig · .gitignore
```

---

## 6. Secciones del sitio

Hero · Sobre mí · Stack/Habilidades (por categoría) · Proyectos destacados (imagen, badges de
tech, links demo/repo, problema→solución→impacto) · Experiencia (timeline) · Contacto (form +
links) · Footer.

---

## 7. Convenciones

**Commits** (Conventional Commits): `tipo(scope): descripción en minúscula`. Tipos: `feat`, `fix`,
`chore`, `docs`, `style`, `refactor`, `test`, `ci`, `perf`, `build`. Scopes: `web`, `api`, `shared`,
`ci`, `repo`. **Sin footer de atribución de IA.** `ARCHITECTURE.md` se actualiza en el mismo commit
que introduce la decisión o el cambio que documenta.

**Flujo de trabajo:** el asistente escribe el código (incluido lo visual) y explica cada archivo;
Marco revisa y hace el commit con el mensaje que se le entrega; Marco hace el `git push`.

**Branching:** commits directos a `main` por ahora (repo nuevo, un solo dev).

---

## 8. Checklist de verificación técnica

- `curl` / view-source del build: contenido presente sin ejecutar JS (valida SSG)
- Lighthouse ≥ 90 en las 4 categorías
- Prueba E2E del formulario de contacto
- Prueba del switch de idioma y de tema
- Responsive: mobile / tablet / desktop
