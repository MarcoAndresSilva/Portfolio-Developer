# ARCHITECTURE.md — Portfolio-Developer

> **Referencia viva del proyecto.** Al retomar el trabajo en cualquier sesión, léelo primero:
> acá está en qué punto vamos, cuál es el próximo paso, qué falta que entregue Marco, y por qué
> se tomó cada decisión. Se actualiza en el mismo commit que introduce cada cambio.

**Última actualización:** 2026-09-04 — Pasos 7A y 7B hechos: animaciones base, sección Stack, efecto
"máquina de escribir" en la frase del hero, y hero definitivo (frase de valor Fintech/OpenBanking,
CTAs, links GitHub/LinkedIn, timeline GSAP). Marco entregó headline/bio/redes (§3) y descartó la
foto. Próximo: 7C — sección "Sobre mí".

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
| 7 | Hero real + Sobre mí + Skills, con animaciones | ⏳ **← próximo** |
| 8 | Proyectos destacados — **bloqueada: necesita contenido de Marco** | ⬜ |
| 9 | Experiencia (timeline) + Contacto (form → API + anti-spam) | ⬜ |
| 10 | Pasada SEO/GEO + Lighthouse CI + auditoría a11y | ⬜ |
| 11 | Pulido: micro-interacciones, performance, responsive, analytics | ⬜ |
| 12 | Despliegue web + api + Google Search Console | ⬜ |

**Paso 7 — sub-progreso:**

| Chunk | Qué | Estado |
|---|---|---|
| A | Base de animaciones (`[appReveal]` + `_motion.scss` + GSAP lazy) · sección Stack · efecto máquina de escribir en la frase del hero (`[appTypewriter]`) | ✅ |
| B | Hero definitivo: eyebrow + frase de valor (foco Fintech/OpenBanking) + CTAs + links GitHub/LinkedIn + timeline GSAP | ✅ |
| C | Sección "Sobre mí" (bio ya entregada) — sin bloqueos | ⬜ **← próximo** |

**Próximo paso concreto:** Paso 7 chunk C — sección "Sobre mí" (`app/sections/about/`, `id="sobre-mi"`)
con la bio de §3 (Ingeniero en Informática, +3 años, Fintech/OpenBanking, Angular/NestJS, WCAG/SOLID,
entornos corp/públicos/startups). Sin foto. Reutiliza las primitivas `.section*` y `[appReveal]`.
Después, Fase 8 (proyectos) — ya no está bloqueada del todo: hay reels de FinTrack e Imperio Barber,
falta que Marco pase descripción/stack/links de cada uno.

Marcar cada texto nuevo con `i18n` / `$localize`, correr `npm run extract-i18n --workspace apps/web`
y traducir en `messages.en.xlf`.

---

## 3. Pendiente de Marco (bloquea Fase 8 en adelante)

- [ ] **CV / lista de proyectos reales:** por proyecto — nombre, descripción, stack, link demo,
      link repo, capturas. (Ya hay reels en la raíz: `FinTrack-reel-*.mp4`, `demo-imperio-barber.mp4`.)
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

---

## 4. Cómo correr el proyecto

```bash
nvm use              # Node 22.23.1 (lo exige Angular 22; la máquina tiene v20 y v22)
npm install          # una vez, instala todos los workspaces
npm run web          # dev server de apps/web (locale es) → http://localhost:4200
npm run api          # dev server de apps/api → http://localhost:3000
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
- **`apps/web` — layout:** `app/layout/header` (sticky, marca, nav a secciones futuras, toggle
  sol/luna, toggle ES/EN), `app/layout/footer`, `app/pages/home`. `app.html` = skip-link →
  header → `<main>` con router-outlet → footer. Convención de nombres del scaffold de Angular 22:
  archivo `nombre.ts`, clase sin sufijo (`Header`), selector `app-…`, componentes `OnPush`.
- **`apps/web` — hero** (`app/pages/home`): copy real — eyebrow "Ingeniero en Informática — Fullstack",
  nombre con efecto máquina de escribir, frase de valor con foco Fintech/OpenBanking, CTAs
  ("Ver proyectos" `#proyectos`, "Contacto" `#contacto`) y links a GitHub/LinkedIn (iconos SVG inline,
  `target="_blank"` + `rel="noopener noreferrer"`, `aria-label` traducido). Entrada con
  `gsap.timeline()` (eyebrow → título → lead → acciones, solapadas).
- **`apps/web` — secciones de la home** (`app/sections/`): `skills` (Stack & habilidades —
  tecnologías por categoría, datos tipados en el componente). Pendiente: "Sobre mí".
- **`apps/api`:** solo el scaffold — `GET /` placeholder. El endpoint de contacto real llega en Fase 9.
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

- [ ] Prerender/SSG de todas las rutas
- [ ] Meta tags por página: `title`, `description`, Open Graph, Twitter Card
- [ ] JSON-LD: `schema.org/Person` + `WebSite` + `ProfilePage`
- [ ] `sitemap.xml`, `robots.txt`, `llms.txt`
- [ ] a11y: skip-link ✅ · focus-visible ✅ · roles/labels · contraste
- [ ] Lighthouse ≥ 90 en Performance / SEO / Accessibility / Best Practices

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
