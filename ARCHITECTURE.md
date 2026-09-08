# ARCHITECTURE.md — Portfolio-Developer

> **Referencia viva del proyecto.** Al retomar el trabajo en cualquier sesión, léelo primero:
> acá está en qué punto vamos, cuál es el próximo paso, qué falta que entregue Marco, y por qué
> se tomó cada decisión. Se actualiza en el mismo commit que introduce cada cambio.

**Última actualización:** 2026-09-06 — **Fase 10 cerrada** (SEO/GEO + Lighthouse CI + a11y, todo
verde). **Fase 12 (deploy) — sitio + API + email real funcionando en producción. Solo falta el
alta en Google Search Console.**
- ✅ Blueprint desplegado en Render (`portfoliodev-api`, a partir de `render.yaml`).
- ✅ **Render confirmado "Live":** `https://portfoliodev-api.onrender.com` responde 200 (`GET /` →
  "Hello World!"). Nota: el free tier duerme el servicio sin tráfico — el primer request en frío
  puede tardar ~30-50s en responder, no es un error.
- ✅ `apiUrl` en `apps/web/src/environments/environment.ts` ya apuntaba a esta misma URL (se había
  puesto de anticipo en el commit `0737275`, antes del deploy real) — coincide, no requirió cambio.
- ✅ **Sitio en Netlify desplegado:** `gentle-ganache-580791` → `https://gentle-ganache-580791.netlify.app`
  (200 OK). El primer build falló dos veces por el plugin `@netlify/angular-runtime` (no encontraba
  `angular.json` en la raíz del monorepo); Marco lo mandó a arreglar con el agente de Netlify
  (PR #1, mergeado) — la solución final: `base = "apps/web"` en `netlify.toml` (así el plugin busca
  `angular.json` donde corresponde) + `command = "npm run build"` (corre ya adentro de `apps/web`,
  sin `--workspace`) + `publish = "dist/web/browser"` (relativo a ese `base`).
- **Dominio elegido: el subdominio gratis de Netlify** (`gentle-ganache-580791.netlify.app`) — Marco
  decidió no comprar dominio propio por ahora, se puede agregar después sin rehacer nada (solo
  cambiar estas mismas 3 URLs).
- ✅ `siteUrl` en `environment.ts` y `SITE_URL` en `netlify.toml` → actualizados a
  `https://gentle-ganache-580791.netlify.app`.
- ✅ `CORS_ORIGIN=https://gentle-ganache-580791.netlify.app` cargado a mano en Render → `portfoliodev-api`
  → Environment. `siteUrl`/`SITE_URL` ya commiteados y pusheados (`df7a114`).
- ✅ **Email real funcionando (2026-09-06).** Se cambió SMTP/nodemailer → **API HTTP de Resend**: el
  plan free de Render **bloquea los puertos SMTP salientes (25/465/587) desde 2025-09** — con
  nodemailer el envío quedaba colgado hasta el timeout y el endpoint devolvía 500. `ContactService`
  postea a `api.resend.com` (HTTP, no bloqueado); `RESEND_API_KEY` cargada en Render, `SMTP_*`
  borradas. Además el endpoint se endureció: si la entrega falla, loguea el mensaje completo (no se
  pierde) y devuelve **502** en vez de 500 → el form muestra su fallback. **Probado en producción:
  el mensaje del form llega al Gmail de Marco.** Ver §6.
- ✅ Commit `7b92fdd` (`fix(api)`) pusheado y desplegado en Render. Netlify: el deploy de ese commit
  se canceló solo (concurrencia/hiccup) — no crítico, el commit no tocó `apps/web`; conviene un
  Retry para dejar el último deploy en verde.
- ⬜ **Único pendiente de la Fase 12: alta del sitio en Google Search Console** (verificar propiedad
  + subir `sitemap.xml`).

**Próxima sesión (2026-09-07):**
1. Commit de docs pendiente (esta actualización de `ARCHITECTURE.md`): `docs: Fase 12 casi cerrada — email real por Resend en prod`.
2. Google Search Console: Marco arranca el alta (URL prefix `https://gentle-ganache-580791.netlify.app`,
   método "Etiqueta HTML"), pasa el `content="..."` del `<meta google-site-verification>` → se agrega
   en `scripts/root-index.mjs` (una línea) → commit + push → Verify → subir `sitemap.xml`.
3. ~~Agregar "Este portafolio" como 3er proyecto~~ — hecho (2026-09-07), ver §3.

Guía completa del deploy paso a paso: ver "Operativo pendiente" más abajo en esta sección.

---

## 1. Qué es esto y por qué

Portafolio de **Marco Andrés Silva**, carta de presentación para conseguir trabajo. Debe verse
moderno, profesional y sobrio, mostrar sus proyectos con impacto visual, y ser encontrable por
**reclutadores humanos Y por buscadores / crawlers de IA**.

**El hallazgo que define el enfoque:** el sitio de referencia (`mauricioACV/portfolio`) es una SPA
React 100% client-side. Al leerlo con una herramienta automática (como un crawler) no se obtiene
contenido, solo "necesitas JavaScript". Este proyecto lo corrige de raíz con **Angular SSG**: el
contenido real viaja dentro del HTML.

---

## 2. Estado actual

| Fase | Descripción | Estado |
|---|---|---|
| 1 | Esqueleto del monorepo (npm workspaces, docs) | ✅ |
| 2 | `apps/web` — Angular 22 con SSG | ✅ |
| 3 | `apps/api` — NestJS 12 | ✅ |
| 4 | `libs/shared` — interfaces TS + wiring | ✅ |
| 5 | CI (GitHub Actions) | ✅ |
| 6 | Sistema de diseño + layout + i18n base | ✅ |
| 7 | Hero real + Sobre mí + Skills, con animaciones | ✅ |
| 8 | Proyectos destacados — sección lista; falta afinar `stack`/links (Marco) | ✅ |
| 9 | Contacto (form → API + anti-spam + email) · Experiencia (timeline + toggle) | ✅ |
| 10 | SEO/GEO + Lighthouse CI (pasando en GitHub Actions) + fixes de a11y | ✅ |
| 11 | Pulido: micro-interacciones, performance, responsive, analytics | ⬜ |
| 12 | Despliegue web + api + email real ✅ · falta Google Search Console (ver §2 arriba) | ⏳ **← acá estamos** |

**Paso 7 — sub-progreso (cerrado):**

| Chunk | Qué | Estado |
|---|---|---|
| A | Base de animaciones (`[appReveal]` + `_motion.scss` + GSAP lazy) · sección Stack · efecto máquina de escribir en la frase del hero (`[appTypewriter]`) | ✅ |
| B | Hero definitivo: eyebrow + frase de valor (foco Fintech/OpenBanking) + CTAs + links GitHub/LinkedIn + timeline GSAP | ✅ |
| C | Sección "Sobre mí" (`app/sections/about/`, `id="sobre-mi"`): bio en prosa + ficha `<dl>` de datos (formación, experiencia, enfoque, ubicación, disponibilidad). Sin foto. | ✅ |

**Próximo paso concreto:** Fase 11 (pulido) o directo Fase 12 (deploy) — a elección de Marco. Igual
quedan 2 cosas chicas de la Fase 10 abiertas:
1. Subir `categories:performance` de `warn` a `error` en `lighthouserc.json` una vez que se vean
   varios runs verdes con buen puntaje (hoy está en warn porque nunca se probó localmente — no hay
   Chrome en el entorno de desarrollo — y no quisimos bloquear el CI a ciegas con el primer número).

**Operativo pendiente — deploy paso a paso (no es código, Marco conecta las cuentas):**
1. ✅ **API en Render:** render.com → New → **Blueprint** → repo → Render leyó `render.yaml` solo.
   Env vars cargadas: `CORS_ORIGIN=http://localhost:4200` (placeholder a propósito, se corrige en
   el paso 5), `SMTP_*` **vacías** (a propósito — el form funciona igual, solo loguea en vez de
   mandar mail hasta que se completen), `CONTACT_TO` vacío (usa el default del código).
2. ✅ **Confirmado "Live":** `https://portfoliodev-api.onrender.com` responde 200. (Free tier: si
   no tuvo tráfico se duerme, el primer request en frío tarda ~30-50s — normal, no es que se cayó.)
3. ✅ `apiUrl` ya apuntaba a esa URL en `apps/web/src/environments/environment.ts` (puesto de
   anticipo antes del deploy). Nada que tocar acá.
4. ✅ **Sitio en Netlify:** `https://gentle-ganache-580791.netlify.app` — Live. `netlify.toml` final:
   `base = "apps/web"` + `command = "npm run build"` + `publish = "dist/web/browser"` (ver §2 arriba
   por qué). Se limpiaron del repo los `apps/web/.netlify/` y `apps/web/apps/web/.netlify/` que el
   agente de Netlify había commiteado por error (caché de build, ahora en `.gitignore`).
5. ✅ Cruzadas en el repo: `siteUrl` de `environment.ts` y `SITE_URL` de `netlify.toml` →
   `https://gentle-ganache-580791.netlify.app` (subdominio gratis de Netlify — Marco decidió no
   comprar dominio propio por ahora).
6. ✅ `CORS_ORIGIN=https://gentle-ganache-580791.netlify.app` cargado a mano en Render → `portfoliodev-api`
   → Environment. `environment.ts`/`netlify.toml` commiteados y pusheados (`df7a114`) → Netlify redesplegó.
7. ✅ **Email real por Resend.** El plan free de Render bloquea SMTP saliente → se cambió el
   transporte a la API HTTP de Resend (ver §6). Cuenta creada, `RESEND_API_KEY` en Render, `SMTP_*`
   borradas, `from = onboarding@resend.dev` (default). **Probado en producción: el mensaje del form
   llega al Gmail de Marco.** Commit `7b92fdd`.
8. ⏳ **← acá estamos: alta del sitio en Google Search Console.**
   - `search.google.com/search-console` → Add property → **URL prefix** → `https://gentle-ganache-580791.netlify.app`
   - Verificación: método **HTML tag** (un `<meta name="google-site-verification">`) — se agrega en
     `SeoService` o directo en `index.html` de `apps/web`, commit + push, y después "Verify".
     Alternativa sin tocar código: DNS TXT (no aplica, no hay dominio propio) o subir un archivo
     HTML a `apps/web/public/` (se copia tal cual a la raíz del `dist`).
   - Ya verificado: **Sitemaps → Add** → `sitemap.xml`.
   - `robots.txt` / `sitemap.xml` / `llms.txt` ya se generan en el postbuild (`scripts/seo-files.mjs`)
     y quedan en la raíz del sitio.

**Pendiente menor de Proyectos** (no bloquea): `stack`/`repo` de FinTrack, `stack`/`demo` de
Imperio Barber (Marco decidió dejarlos como están por ahora). ¿Página de detalle por proyecto? —
sin decidir. ~~Comprimir los `.mp4` de `apps/web/public/media/`~~ — hecho (2026-09-07), ver §3.

Marcar cada texto nuevo con `i18n` / `$localize`, correr `npm run extract-i18n --workspace apps/web`
y traducir en `messages.en.xlf`.

---

## 3. Pendiente de Marco

- [x] ~~**Email real por Resend**~~ — hecho (2026-09-06), probado en producción.
- [ ] **Google Search Console** — alta del sitio + verificación + subir `sitemap.xml`. Ver §2 paso 8.
- [ ] **Netlify** — Retry del deploy cancelado de `7b92fdd` para dejar el último en verde.
- [x] ~~**Agregar "Este portafolio" como 3er proyecto**~~ — hecho (2026-09-07). Card de craft
      técnico (no la principal, pero al ser el más nuevo sale primero en el orden por año): Angular
      22 SSG contra el hallazgo de §1 (SPA ilegible para crawlers/IA), monorepo + API NestJS de
      contacto, i18n es/en, SEO/GEO + Lighthouse CI. `slug: 'portfolio-developer'`, media tipo
      `image` con el `og-image.png` existente (no hizo falta hacer `media` opcional).
      `links.repo` = `https://github.com/MarcoAndresSilva/Portfolio-Developer`. Falta que Marco
      ponga el repo en público en GitHub.
- [ ] **Contenido real de proyectos** (`app/sections/projects/projects.ts`) — Marco decidió dejar
      esto como está por ahora, no bloquea:
      - **FinTrack:** confirmar `stack`, afinar `highlights` (sobre todo qué problema resolvía),
        `links.repo` si es público. Demo ya puesto (`financialtrackapp.netlify.app`), badge
        "En uso a diario", Prisma agregado.
      - **Imperio Barber:** confirmar `stack` real, `links.demo` cuando termine el despliegue.
      - ~~Los videos están en `apps/web/public/media/` — conviene comprimirlos~~ — hecho
        (2026-09-07): re-encodeados con `ffmpeg` (H.264 CRF 28, `+faststart`), sin pérdida visible.
        `fintrack-reel-16x9.mp4` 7.2MB→3.8MB, `demo-imperio-barber.mp4` 2.6MB→1.0MB.
- [ ] **Paleta de color / vibe visual.** Hoy hay una paleta **provisional** (tema oscuro, acento
      periwinkle `#7c8cff`). Cambiarla = editar solo `apps/web/src/styles/_theme.scss`.
- ~~Foto / avatar~~ — **descartado por Marco** (2026-09-04): el hero va sin foto.

**Entregado (2026-09-04, del perfil de LinkedIn):**

- **Headline:** Software Engineer · Fullstack Developer · Angular & NestJS · TypeScript · Microfront ·
  BFF · Fintech & OpenBanking.
- **Bio:** Ingeniero en Informática (Duoc UC), +3 años de experiencia. Foco actual en Fintech —
  ecosistemas de OpenBanking bajo la Ley Fintech chilena. Frontend: Angular (v5–v19), RxJS,
  performance. Backend: APIs con NestJS y Node.js. Seguridad: OAuth2, estándares transaccionales
  bancarios. Calidad: accesibilidad (WCAG 2.0), SOLID, código limpio. Experiencia en entornos
  corporativos, públicos y startups; Scrum. Ubicación: Área metropolitana de Santiago, Chile.
- **Redes:** GitHub `https://github.com/MarcoAndresSilva` ·
  LinkedIn `https://www.linkedin.com/in/marco-andres-silva-ponce-b42286b4/` ·
  email `marco.silvaponce10@gmail.com`.
- Nombre completo: **Marco Andrés Silva Ponce**. En el sitio se usa **Marco Silva** como nombre corto.
- **CVs** (Fullstack / Frontend / Backend, 2026): entregados el 2026-09-04. **Gitignoreados** (traen
  teléfono personal). El historial laboral ya vive tipado en `app/sections/experience/experience.ts`;
  el toggle de la sección refleja las 3 versiones. Correo de contacto: `marco.silvaponce10@gmail.com`.

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

`git push` lo hace Marco (el ssh-agent no siempre está cargado en la sesión del asistente).

---

## 5. Qué hay construido hoy

**Stack:** monorepo npm workspaces · `apps/web` Angular 22 (standalone, signals, SSG/prerender,
SCSS) · `apps/api` NestJS 12 (ESM, oxlint, Vitest) · `libs/shared` paquete TS solo-tipos.

- **`apps/web` — SSG:** `app.routes.server.ts` prerenderea `**` → todas las rutas a HTML estático.
  `angular.json` usa `outputMode: "static"` (prerender puro vía `main.server.ts`, sin server
  Express). El scaffold `server.ts` se eliminó. `express` sigue como dep transitiva de `@angular/ssr`.
- **`apps/web` — i18n:** `@angular/localize` con **builds localizados** (`localize: true` en el
  config de producción). `angular.json` → `i18n`: `sourceLocale` `es` (`subPath: "es"`) y locale
  `en` (`subPath: "en"`, `src/locale/messages.en.xlf`). `npm run build` genera
  `dist/web/browser/es/` y `dist/web/browser/en/` como sitios estáticos independientes; el postbuild
  `scripts/root-index.mjs` escribe un `dist/web/browser/index.html` que redirige según
  `navigator.language`. Textos de UI marcados con `i18n=` / `$localize` (IDs explícitos `@@...`).
  `core/locale.service.ts` calcula el link al otro idioma (preserva ruta/query/hash) y el header
  tiene el toggle ES/EN. Los **datos** (proyectos, etc.) no pasan por este pipeline — van con
  `Localized<T>`. Pendiente Fase 10: `<link rel="alternate" hreflang>` y `<meta description>` por
  locale (hoy el `index.html` base queda en es en ambos builds).
- **`apps/web` — sistema de diseño** (`src/styles/`): `_tokens.scss` (escala: tipografía, espaciado
  4px, radios, sombras, movimiento, z-index — como CSS custom properties; breakpoints como vars
  SCSS), `_theme.scss` (colores semánticos: `--bg`, `--surface`, `--text`, `--accent`…; oscuro por
  defecto, claro con `[data-theme='light']`), `_reset.scss` (reset moderno + `prefers-reduced-motion`),
  `_base.scss` (estilos base + `.container` / `.visually-hidden` / `.skip-link` + primitivas
  `.section*`), `_motion.scss` (estados de animación).
- **`apps/web` — animaciones:** progressive enhancement. El script inline de `index.html` pone
  `.js` en `<html>` **antes del primer pintado**; todos los estados iniciales (ocultos) viven bajo
  `:root.js` en `_motion.scss`, así sin JS no se oculta nada y no hay flash en el HTML
  prerenderizado. `core/motion/reveal.directive.ts` (`[appReveal]`, `[appRevealDelay]`) revela con
  `IntersectionObserver` al entrar en viewport (host class `reveal` → viaja en el SSR). El hero
  anima con **GSAP** (`import()` diferido → chunk aparte, nunca en SSR, corre en `afterNextRender`).
  `core/motion/typewriter.directive.ts` (`[appTypewriter]`, `[appTypewriterDelay]`) re-teclea el
  contenido del elemento carácter por carácter, atravesando también los hijos (así el `<span>` del
  degradado del nombre se conserva y se llena en su turno); el texto real vive en la plantilla
  (indexable y accesible), reserva el alto antes de arrancar para no desmaquetar, y el cursor
  parpadeante es un `::after` al final del `<h1>` (`_motion.scss`). Se usa en la frase del hero.
  Todo respeta `prefers-reduced-motion` vía CSS / early-return.
- **`apps/web` — tema:** `app/core/theme.service.ts` — signal + `localStorage`, SSR-safe, escribe
  `data-theme` en `<html>`. Script anti-flash en `index.html`. Pendiente: respetar
  `prefers-color-scheme` en la primera visita (hoy siempre arranca oscuro).
- **`apps/web` — SEO/GEO:** `app/core/seo.service.ts` — lo llama `App` en el constructor
  (sincrónico → prerender). Pone `<title>` + `description` + Open Graph + Twitter Card (`Meta`/
  `Title`), `canonical` + `hreflang` (es/en/x-default) y un `<script type="application/ld+json">`
  con `Person` + `WebSite` + `ProfilePage`. Textos con `$localize` (`@@seo.*`); URLs desde
  `environment.siteUrl`. `scripts/seo-files.mjs` (postbuild) escribe `robots.txt` / `sitemap.xml` /
  `llms.txt` en la raíz del `dist`.
- **`apps/web` — layout:** `app/layout/header` (sticky, marca, nav a secciones futuras, toggle
  sol/luna, toggle ES/EN), `app/layout/footer`, `app/pages/home`. `app.html` = skip-link →
  header → `<main>` con router-outlet → footer. Convención de nombres del scaffold de Angular 22:
  archivo `nombre.ts`, clase sin sufijo (`Header`), selector `app-…`, componentes `OnPush`.
- **`apps/web` — hero** (`app/pages/home`): copy real — eyebrow "Ingeniero en Informática — Fullstack",
  nombre con efecto máquina de escribir, frase de valor con foco Fintech/OpenBanking, CTAs
  ("Ver proyectos" `#proyectos`, "Contacto" `#contacto`) y links a GitHub/LinkedIn (iconos SVG inline,
  `target="_blank"` + `rel="noopener noreferrer"`, `aria-label` traducido). Entrada con
  `gsap.timeline()` (eyebrow → título → lead → acciones, solapadas).
- **`apps/web` — secciones de la home** (`app/sections/`): `about` ("Sobre mí" — bio + ficha `<dl>`)
  · `skills` (Stack — tecnologías por categoría) · `projects` ("Proyectos destacados" — cards con
  `<video>`/`<img>`, badge de estado, resumen, highlights, badges de stack y links; datos bilingües
  con `Localized<T>` en el componente, locale vía `LocaleService`) · `experience` ("Experiencia" —
  timeline vertical `<ol>` con eje; toggle Full stack / Frontend / Backend (`signal`) que reescribe
  los `highlights` de cada puesto; datos tipados de los 3 CVs, fechas `YYYY-MM` formateadas con
  `Intl`) · `contact` (formulario reactivo + honeypot oculto; estados `idle/sending/ok/error` con
  signal; `HttpClient` → `POST {apiUrl}/contact`; `aria-invalid`/`aria-describedby`,
  `role="status"`/`"alert"`). Numeradas con eyebrow (`01`…`05`). Orden: hero → about → skills →
  projects → experience → contact. `.chip` y `.btn` son primitivas compartidas en `_base.scss`.
  `apiUrl` sale de `src/environments/` (`environment.ts` prod / `environment.development.ts` dev,
  vía `fileReplacements`).
- **`apps/api` — contacto** (`src/contact/`): `POST /contact` → 202 `{ ok: true }`.
  `contact.dto.ts` valida a mano (nombre 2-80, email regex ≤160, mensaje 10-2000) — sin
  `class-validator` (NestJS 12 + TS 6 recientes, y son 3 campos). Honeypot `company`: si trae algo
  responde 202 igual pero descarta. `RateLimitGuard` — ventana deslizante en memoria, 5 req/min por
  IP (`@nestjs/throttler` aún no soporta NestJS 12). `ContactService.deliver` postea a la **API HTTP
  de Resend** (`fetch`, sin deps) si hay `RESEND_API_KEY` (destino `CONTACT_TO` / remitente
  `CONTACT_FROM`, con defaults); si no, registra en log (así corre en local sin config). Si el envío
  falla, loguea el mensaje entero y relanza → el controller responde **502** (no 500) y el form
  muestra su fallback. `main.ts`: CORS desde `CORS_ORIGIN` (coma-separado, default `localhost:4200`).
  `GET /` sigue siendo el placeholder.
- **`libs/shared`** (`@portfolio/shared`): interfaces `Project`, `Experience`, `Skill`, `SocialLink`
  + `Locale` / `Localized<T>`. **Solo tipos, sin build** — `exports` apunta a `src/index.ts` y los
  `import type` se borran al compilar. Si se necesita un valor en runtime, hay que agregar build a
  `dist/`. Detalle en `libs/shared/README.md`.
- **CI** (`.github/workflows/ci.yml`): push a `main` + PRs → un job en ubuntu que corre
  typecheck / lint / test / build. Scripts de la raíz **explícitos por workspace** (el combo
  `--workspaces --if-present` falla al anidar `npm run`). Pendiente: `apps/web` no tiene linter
  (agregar `angular-eslint`).

---

## 6. Decisiones y su porqué

### npm workspaces (no Nx, no repos separados)
Nx aporta cache de builds y `affected`, valioso en monorepos grandes; acá hay 2 apps + 1 lib y el
beneficio no se nota, solo el costo (deps que migrar en cada release de Angular). Workspaces da la
misma estructura `apps/`+`libs/` con cero deps extra. Repos separados obligarían a duplicar o
publicar `libs/shared`.

### Angular SSG / prerender (no SPA client-side)
Corrección directa del hallazgo (§1). SSG > SSR porque el contenido es casi todo estático y permite
hosting estático más barato y rápido.

### Backend NestJS ligero
Aporta valor de portafolio (full-stack Angular + NestJS). Scope chico: 1 endpoint de contacto +
rate limiting + honeypot. Descartado Formspree/Web3Forms (no muestran skill de backend).
**Implementado en Fase 9.** Validación **a mano** en vez de `class-validator`, y rate-limit con un
**guard propio** en vez de `@nestjs/throttler` (no soporta NestJS 12 todavía): son 3 campos y 1
endpoint, no justifica arrastrar deps + decoradores nuevos con TS 6 recién salido.

**Email: API HTTP de Resend** (Fase 12, era nodemailer/SMTP). El primer intento fue SMTP con Gmail
(app password) — pero el **plan free de Render bloquea el tráfico saliente a los puertos SMTP
(25/465/587) desde 2025-09**, así que `nodemailer` quedaba colgado hasta el timeout y el endpoint
devolvía 500. Se cambió `ContactService.deliver` a un `POST https://api.resend.com/emails` con
`fetch` (HTTP no está bloqueado) — **cero deps nuevas** (se sacó `nodemailer`), coherente con el
resto del módulo. Sin dominio propio verificado: `from` = `onboarding@resend.dev` y `to` = el gmail
de Marco (la casilla de la cuenta Resend) — que es exactamente el flujo de este form (todo le llega
a Marco, con `reply_to` al visitante). Config: `RESEND_API_KEY` (sin ella → solo loguea, corre en
local), `CONTACT_TO`, `CONTACT_FROM`. Además el controller **atrapa el fallo de envío**: loguea el
mensaje completo (no se pierde) y responde **502** en vez de 500 → el form muestra su fallback.

### Sección Experiencia: un timeline con toggle de enfoque
Marco mantiene 3 CVs (Fullstack / Frontend / Backend) con el mismo historial y distinta énfasis.
En vez de elegir uno, la sección tiene un toggle que reescribe los logros según el enfoque — las 3
versiones vivas en una vista, y de paso comunica que adapta el mensaje a la audiencia. Solo Megadev
y Rindegastos varían por enfoque; el resto usa la versión `fullstack` como fallback.

### i18n con `@angular/localize` (builds localizados)
`/es` y `/en` como HTML estático propio e indexable — correcto para SEO/SSG. Alternativa runtime
(`ngx-translate`) se evaluaría solo si el build localizado complica el pipeline. **Implementado en
Paso 6D.** Se cambió `outputMode` de `server` a `static`: el sitio no tiene lógica de servidor
(el form de contacto va a la API NestJS aparte), y con `static` cada locale es una carpeta estática
independiente desplegable en cualquier hosting — evita tener dos bundles de servidor y un router
raíz. Ambos locales van con `subPath` (`/es`, `/en`); la raíz `/` la resuelve un `index.html` de
redirección generado en el postbuild (en Fase 12 se puede pasar a una regla del hosting).

### Contenido bilingüe en el modelo de datos: `Localized<T> = { es: T; en: T }`
`@angular/localize` traduce las cadenas de UI, pero los *datos* (proyectos, experiencia) no pasan
por ese pipeline. Van con los dos idiomas en el mismo objeto. Descartado: dos archivos de datos por
idioma (difícil de mantener sincronizados).

### Estilos: SCSS + design tokens, tema oscuro por defecto
Tokens como CSS custom properties (permiten cambiar de tema y leerse desde JS). `data-theme` en
`<html>`, persistido en `localStorage`.

### Animaciones: GSAP + Angular Animations API
GSAP para timelines y scroll-driven; Angular Animations para transiciones de estado/ruta. Respeta
`prefers-reduced-motion`. **Instalado en Paso 7A.** GSAP entra con `import()` diferido (chunk
aparte, fuera del bundle inicial) porque solo se usa post-render. Los *reveals* simples al hacer
scroll no usan GSAP — van con `IntersectionObserver` (`[appReveal]`), que es gratis. `ScrollTrigger`
se sumará cuando haya efectos scroll-driven reales (Fase 11); hoy no hace falta.

### Contenido en datos tipados, sin CMS
Menos infraestructura y el contenido cambia poco.

### Extras desde el inicio: CI, Playwright E2E, Lighthouse CI
Baratos de montar temprano, caros después. Playwright cubre la "prueba E2E del formulario" del plan;
Lighthouse CI hace la meta "≥90" automática y bloqueante. **Pospuesto:** OG images dinámicas (se
decide junto con "¿hay páginas de detalle por proyecto?").

---

## 7. Estructura del repo

```
Portfolio-Developer/
├── apps/
│   ├── web/     # Angular 22 (SSG) — el sitio
│   └── api/     # NestJS 12 — contacto por email + anti-spam
├── libs/
│   └── shared/  # @portfolio/shared — interfaces TS (solo tipos)
├── .github/workflows/ci.yml
├── render.yaml          # Blueprint de Render para apps/api (Fase 12)
├── netlify.toml         # Config de Netlify para apps/web (Fase 12)
├── lighthouserc.json    # Config de Lighthouse CI
├── package.json         # raíz: workspaces + scripts orquestadores
├── .nvmrc               # 22.23.1
├── ARCHITECTURE.md · README.md · LICENSE (MIT) · .editorconfig · .gitignore
```

---

## 8. Secciones del sitio (Fase 7+)

Hero · Sobre mí · Stack/Habilidades (por categoría) · **Proyectos destacados** (3–6, la sección más
importante: imagen, badges de tech, links demo/repo, problema→solución→impacto) · Experiencia
(timeline) · Certificaciones (opcional) · Contacto (form + links) · Footer.

---

## 9. SEO / GEO (Fase 10)

- [x] Prerender/SSG de todas las rutas
- [x] Meta tags por locale: `title`, `description`, Open Graph, Twitter Card — `core/seo.service.ts`,
      llamado desde `App` (sincrónico → viaja en el prerender). Textos con `$localize` (`@@seo.*`).
- [x] `canonical` + `<link rel="alternate" hreflang>` (es / en / x-default)
- [x] JSON-LD: `Person` + `WebSite` + `ProfilePage` en un `@graph` (mismo `SeoService`)
- [x] `sitemap.xml`, `robots.txt`, `llms.txt` — `scripts/seo-files.mjs` (postbuild, a la raíz del
      `dist`; no en `public/` porque ahí se copiarían dentro de cada locale). `SITE_URL` (env) debe
      coincidir con `siteUrl` de `environment.ts`.
- [x] **OG image** `apps/web/public/og-image.png` (1200×630) — generada con `@resvg/resvg-js`
      (SVG con la paleta del sitio, sin foto), copiada a la raíz del `dist` por `seo-files.mjs`.
- [x] a11y: skip-link · focus-visible · roles/labels (form, toggles) · contraste AA en ambos temas
      (se corrigió `--text-subtle` en claro, 3:1 → 4.8:1) · honeypot sin `aria-hidden` contradictorio.
- [x] Lighthouse CI (`@lhci/cli` + `lighthouserc.json`) en el workflow — corre en cada push, sube el
      reporte HTML como artefacto descargable del run ("Subir reporte de Lighthouse"). Bloqueante
      (`error`, minScore 0.9) en Accessibility/Best-Practices/SEO; Performance en `warn` hasta ver
      varios runs reales (no se pudo probar en el entorno de desarrollo, sin Chrome). **Primer run
      en GitHub Actions: los 5 pasos en verde.**

---

## 10. Convenciones

**Commits** (Conventional Commits): `tipo(scope): descripción en minúscula`. Tipos: `feat`, `fix`,
`chore`, `docs`, `style`, `refactor`, `test`, `ci`, `perf`, `build`. Scopes: `web`, `api`, `shared`,
`ci`, `repo`. **Sin footer de atribución de IA.** `ARCHITECTURE.md` se actualiza en el mismo commit.

**Flujo de trabajo:** el asistente escribe el código (incluido lo visual) y explica cada archivo;
**Marco revisa y hace el commit** con el mensaje que se le entrega; Marco hace el `git push`.

**Branching:** commits directos a `main` por ahora (repo nuevo, un solo dev).

---

## 11. Verificación antes de dar por cerrado

- `curl` / view-source del build: contenido presente sin ejecutar JS (valida SSG)
- Lighthouse ≥ 90 en las 4 categorías
- Prueba E2E del formulario de contacto
- Prueba del switch de idioma y de tema
- Responsive: mobile / tablet / desktop

---

## 12. Bitácora

| Fecha | Hito |
|---|---|
| 2026-09-01 | Paso 1 — esqueleto del monorepo (npm workspaces, `ARCHITECTURE.md`). |
| 2026-09-02 | Paso 2 — `apps/web` Angular 22 + SSR/prerender. Node → 22.23.1. SSG verificado. |
| 2026-09-02 | Paso 3 — `apps/api` NestJS 12. Quitado `@nestjs/mau` → 0 vulnerabilidades. |
| 2026-09-02 | Historial aplastado en 1 commit inicial limpio (`push --force`). |
| 2026-09-02 | Paso 4 — `libs/shared` (`@portfolio/shared`): interfaces + `Localized<T>`, solo tipos. `2dfecab` |
| 2026-09-02 | Paso 5 — CI GitHub Actions (typecheck/lint/test/build). Badge en README. `05acc1f` |
| 2026-09-02 | Paso 6 A — base del sistema de diseño (tokens, tema, reset, fuentes). `d1d1424` |
| 2026-09-02 | Paso 6 B+C — `ThemeService` + toggle · layout shell (header/footer/home). Primera vista real del sitio. `a204ce6` |
| 2026-09-03 | Paso 6 D — i18n ES/EN con `@angular/localize` (builds localizados). `outputMode` → `static`. Toggle de idioma en el header. Cierra el Paso 6. |
| 2026-09-03 | Paso 7 A — base de animaciones (`[appReveal]` + `_motion.scss` + GSAP lazy, progressive enhancement con `.js`) y sección "Stack & habilidades". |
| 2026-09-04 | Efecto "máquina de escribir" en la frase del hero (`[appTypewriter]`, atraviesa hijos). Marco entregó headline/bio/redes desde LinkedIn (§3) y descartó la foto. |
| 2026-09-04 | Paso 7 B — hero definitivo: frase de valor (foco Fintech/OpenBanking), CTAs, links GitHub/LinkedIn, entrada con `gsap.timeline()`. |
| 2026-09-04 | Paso 7 C — sección "Sobre mí" (`app/sections/about`): bio + ficha de datos. **Cierra la Fase 7.** |
| 2026-09-04 | Fase 8 — sección "Proyectos destacados" (`app/sections/projects`): cards FinTrack + Imperio Barber con video (`public/media/`), badge de estado, highlights. Contenido casi final. |
| 2026-09-04 | Fase 9 A — **Contacto**: sección `app/sections/contact` (form reactivo + honeypot) → `POST /contact` NestJS (`apps/api/src/contact`: validación a mano, honeypot, `RateLimitGuard`). `provideHttpClient`, `src/environments/`, CORS. Probado 202/400/honeypot. |
| 2026-09-04 | Fase 9 B — envío de email por SMTP/nodemailer en `ContactService` (fallback a log). Marco entregó los 3 CVs (gitignoreados). |
| 2026-09-04 | Fase 9 C — sección **Experiencia** (`app/sections/experience`): timeline vertical con toggle Full stack / Frontend / Backend (los 3 CVs en una vista). **Cierra la Fase 9.** |
| 2026-09-04 | `fix` — API dev en :3100 (3000 tomado por otro NestJS local de Marco). `914b210` |
| 2026-09-04 | Fase 10 A — SEO/GEO: `SeoService` (meta + OG + Twitter + canonical + hreflang + JSON-LD `Person`/`WebSite`/`ProfilePage`, por locale, en el prerender) y `scripts/seo-files.mjs` (robots.txt / sitemap.xml / llms.txt). |
| 2026-09-05 | Fase 10 B — Lighthouse CI (`@lhci/cli`, `lighthouserc.json`) en el workflow + reporte como artefacto. a11y: contraste de `--text-subtle` (tema claro) y honeypot del form sin `aria-hidden` contradictorio. **Cierra la Fase 10.** Primer run en GitHub Actions: todo verde. |
| 2026-09-05 | Ordenamos el estado del proyecto (Fases 1-10 cerradas) y preparamos la Fase 12: `render.yaml` (Blueprint API) + `netlify.toml` (config del sitio) — el deploy queda en 2 clics de conectar cuenta, sin adivinar comandos. |
| 2026-09-05 | OG image generada con `@resvg/resvg-js` (SVG con la paleta del sitio → PNG, sin foto ni stock), copiada a la raíz del `dist` por `seo-files.mjs`. |
| 2026-09-05 | Fase 12 arrancada: Blueprint de la API desplegado en Render (`portfoliodev-api`), `SMTP_*`/`CORS_ORIGIN` con placeholders a propósito. Falta: URL de Render, sitio en Netlify, cruzar URLs. |
| 2026-09-05 | Confirmado "Live" en Render: `https://portfoliodev-api.onrender.com` (200, `Hello World!`). `apiUrl` en `environment.ts` ya coincidía. Falta: sitio en Netlify, cruzar `siteUrl`/`SITE_URL`/`CORS_ORIGIN`. |
| 2026-09-05 | Sitio creado en Netlify (`gentle-ganache-580791`); primer build falló 2 veces por el plugin `@netlify/angular-runtime` sin encontrar `angular.json` en el monorepo. Marco lo resolvió con el agente de Netlify (PR #1, mergeado): `netlify.toml` → `base = "apps/web"` + `command = "npm run build"` + `publish = "dist/web/browser"`. Deploy exitoso: `https://gentle-ganache-580791.netlify.app` (200). Se sacaron del repo `apps/web/.netlify/` y el duplicado `apps/web/apps/web/.netlify/` que el agente había commiteado por error (ahora en `.gitignore`). Falta: cruzar `siteUrl`/`SITE_URL`/`CORS_ORIGIN` con este dominio. |
| 2026-09-05 | Marco decidió quedarse con el subdominio gratis de Netlify (no comprar dominio propio por ahora). Cruzadas `siteUrl` (`environment.ts`) y `SITE_URL` (`netlify.toml`) → `https://gentle-ganache-580791.netlify.app`. Falta: cargar `CORS_ORIGIN` en Render (manual, dashboard) y hacer commit + push. |
| 2026-09-05 | `CORS_ORIGIN` cargado en Render + `df7a114` pusheado. Marco cargó las `SMTP_*` de Gmail y el form empezó a dar **500**: el plan free de Render bloquea los puertos SMTP salientes (25/465/587) desde 2025-09. |
| 2026-09-06 | Email: `ContactService` migrado de nodemailer/SMTP → **API HTTP de Resend** (`fetch`, se sacó `nodemailer`). Endpoint endurecido: atrapa el fallo de envío, loguea el mensaje completo y responde **502** en vez de 500 (el form ya tenía el texto de fallback). `render.yaml`: `SMTP_*` → `RESEND_API_KEY`/`CONTACT_FROM`. Tests nuevos (`contact.service.spec.ts` + caso 502 en el controller). Commit `7b92fdd`. |
| 2026-09-06 | Marco creó la cuenta de Resend, cargó `RESEND_API_KEY` en Render y borró las `SMTP_*`. **Email real confirmado en producción: el mensaje del formulario llega al Gmail.** Fase 12 casi cerrada — solo falta Google Search Console. |
