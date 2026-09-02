# ARCHITECTURE.md — Portfolio-Developer

> **Este archivo es la referencia viva del proyecto.** Al retomar el trabajo en cualquier sesión,
> léelo primero: acá está qué se construyó, por qué se tomó cada decisión, y cuáles son los
> siguientes pasos. Se actualiza en cada hito (idealmente en el mismo commit que introduce el cambio).

Última actualización: **2026-09-02** — Paso 3 completado (NestJS scaffoldeado y verificado).

---

## 1. Propósito

Marco necesita un portafolio que funcione como carta de presentación para conseguir trabajo:

- Se ve moderno, profesional y sobrio.
- Muestra sus proyectos más relevantes con impacto visual (animaciones, transiciones).
- Está optimizado para que lo encuentren **reclutadores humanos** y **sistemas de IA / buscadores**.

### Hallazgo que originó el enfoque

El sitio de referencia analizado (`mauricioacv.github.io/portfolio`, repo `mauricioACV/portfolio`)
es una SPA en React 17, 100% renderizada en el cliente. Al leerlo con una herramienta automática
(como lo haría un crawler de buscador o de IA) **no se pudo leer contenido real** — solo el mensaje
"necesitas JavaScript para ejecutar esta app".

Este proyecto corrige eso de raíz con **Angular SSG**: el contenido real viaja dentro del HTML.

---

## 2. Estado actual

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Esqueleto del monorepo (git, workspaces, archivos raíz, docs) | ✅ Hecho |
| 2 | `apps/web` — Angular con SSG | ✅ Hecho |
| 3 | `apps/api` — NestJS | ✅ Hecho |
| 4 | `libs/shared` + wiring entre apps | ⏳ Siguiente |
| 5 | CI (GitHub Actions) | ⬜ Pendiente |
| 6 | Sistema de diseño + layout + i18n base | ⬜ Pendiente |
| 7 | Hero + Sobre mí + Skills con animaciones | ⬜ Pendiente |
| 8 | Proyectos destacados (bloqueado: necesita contenido real de Marco) | ⬜ Pendiente |
| 9 | Experiencia + Contacto (form conectado a API + anti-spam) | ⬜ Pendiente |
| 10 | Pasada SEO/GEO + Lighthouse CI + auditoría a11y | ⬜ Pendiente |
| 11 | Pulido: micro-interacciones, performance, responsive, analytics | ⬜ Pendiente |
| 12 | Despliegue (web + api) + Google Search Console | ⬜ Pendiente |

**Próximo paso concreto:** Paso 4 — `libs/shared`: paquete TS con las interfaces
(`Project`, `Experience`, `Skill`, `SocialLink`) y wiring para que `apps/web` y `apps/api`
lo importen como `@portfolio/shared`. Commit `feat(shared): add shared types package`.

### Notas de entorno

- **Node 22.23.1** (ver `.nvmrc`). El proyecto usa Angular 22, cuyo CLI exige Node ≥ 22.22.3.
  La máquina tiene v20 y v22 vía nvm — hay que `nvm use` (o `nvm use` lee el `.nvmrc`).
- **Angular 22** (paquetes `@angular/*@^22`), TypeScript ~6.0, builder `@angular/build:application`,
  tests con Vitest (nuevo default del CLI, ya no Karma).

### Estado de `apps/web` (scaffold)

- `ng new` con `--ssr --routing --style=scss`. Genera SSR + prerender.
- `apps/web/src/app/app.routes.server.ts`: `{ path: '**', renderMode: RenderMode.Prerender }` →
  **todas las rutas se prerenderean a HTML estático en build**.
- `angular.json` → `outputMode: "server"`: además del HTML estático genera un server bundle Express
  como fallback. En la fase de despliegue evaluar cambiar a `outputMode: "static"` (prerender puro,
  sin server Node) si el hosting es estático — es lo más simple para Vercel/Netlify.
- **Verificación SSG hecha:** `npm run build -w apps/web` → `dist/web/browser/index.html` (21 KB)
  contiene el contenido real renderizado, no un shell vacío. Esto es exactamente la corrección del
  hallazgo de la sección 1.
- El `app.html` por defecto es la landing de bienvenida de Angular (~20 KB); se reemplaza en la
  fase de layout (Fase 6).

### Estado de `apps/api` (scaffold)

- `nest new` (NestJS 12). Genera `AppModule` / `AppController` / `AppService` con un `GET /` que
  devuelve "Hello World!" — placeholder, se reemplaza por el endpoint de contacto real en Fase 9.
- **ESM:** el scaffold usa `"type": "module"` y los imports llevan extensión `.js` (ej.
  `./app.module.js`). Es lo normal en NestJS moderno, no confundir con un error.
- **Lint:** `oxlint` (rápido, en Rust) en vez de ESLint. **Tests:** Vitest (unit + e2e con
  `vitest.config.e2e.ts`), no Jest.
- **Limpieza hecha:** se quitó `@nestjs/mau` (herramienta de `nest deploy` que no usamos) y el
  script `deploy`. Eso eliminó las 5 vulnerabilidades de npm audit que arrastraba (inquirer / tmp
  / undici). `npm audit` → **0 vulnerabilidades**. También se corrigió `license` a MIT y `author`.
- **Verificado:** `npm run build -w apps/api` compila; `npm run test -w apps/api` pasa (1 test).

---

## 3. Decisiones y su porqué

### 3.1 Monorepo con **npm workspaces** (no Nx, no repos separados)

**Qué es:** un solo repositorio con 3 piezas — `apps/web`, `apps/api`, `libs/shared` — unidas por
la feature nativa `workspaces` de npm. Un `npm install` en la raíz instala todo y enlaza `libs/shared`
localmente (symlink) para que las apps la importen como un paquete pero apuntando al código fuente.

**Por qué npm workspaces y no Nx:**
- Nx aporta caching de builds, `affected` (testear solo lo que cambió) y generadores. Ese valor se
  nota en monorepos de 10+ proyectos o equipos grandes con builds lentos. Acá hay 2 apps y 1 lib;
  un build tarda segundos y el beneficio nunca se percibe — solo el costo.
- Nx agrega dependencias (Nx + plugins) que hay que migrar en cada release mayor de Angular, y a
  veces bloquean el upgrade hasta que sale el plugin compatible.
- npm workspaces da **la misma estructura** (`apps/`, `libs/`) con cero dependencias extra.

**Por qué monorepo y no repos separados:** `libs/shared` (interfaces como `Project`) tiene que estar
sincronizada entre web y api. En repos separados habría que duplicarla o publicar un paquete npm
privado. En monorepo, es una carpeta que ambas apps miran directo.

**Costo aceptado:** el deploy tiene que saber construir solo una parte del monorepo (se resuelve con
`--workspace` en los comandos de build de Vercel/Render).

### 3.2 Angular con **SSG / prerender** (no SPA client-side)

**Qué es:** en el build, Angular renderiza cada ruta a un `.html` completo con el contenido dentro.
Se sirve ese HTML estático (rápido, indexable) y luego Angular "hidrata" en el cliente para
animaciones y formulario.

**Por qué:** es la corrección directa del hallazgo de la sección 1. Un portafolio tiene que ser
legible por buscadores y crawlers de IA sin ejecutar JS. SSG > SSR acá porque el contenido es
mayormente estático (no cambia por request) y SSG permite hosting estático más barato y rápido.

### 3.3 Backend: **NestJS ligero** (no serverless function, no servicio de formularios)

**Por qué NestJS:**
- Aporta valor de portafolio: demuestra Angular + NestJS full-stack.
- El scope es chico: 1 endpoint de contacto (envía email) + rate limiting + honeypot. Opcional:
  contador de visitas/likes.

**Alternativas descartadas:** Formspree / Web3Forms (no muestran skill de backend); serverless
function suelta (menos estructura, pero se puede reconsiderar si el hosting de la API es un problema).

### 3.4 i18n: **bilingüe ES/EN con switch**

Enfoque técnico a definir en Fase 6. Preferencia actual: `@angular/localize` con builds localizados
(`/es`, `/en` como rutas reales) porque es lo correcto para SEO/SSG — cada idioma es HTML estático
propio e indexable. Alternativa más simple (`ngx-translate`, runtime) se evaluará si el build
localizado complica el pipeline.

### 3.5 Estilos: **SCSS + design tokens**, tema oscuro por defecto con toggle

Tokens (colores, espaciado, tipografía, radios) como CSS custom properties. Tema claro/oscuro por
`data-theme` en `<html>`, persistido en `localStorage`, respeta `prefers-color-scheme` en la
primera visita.

### 3.6 Animaciones: **GSAP + ScrollTrigger** + Angular Animations API

Respeta `prefers-reduced-motion` (sin animaciones no esenciales si el usuario lo pide).
GSAP para scroll-driven y timelines complejas; Angular Animations para transiciones de estado
y de ruta.

### 3.7 Contenido: **datos estructurados en TS/JSON**, sin CMS

Los proyectos, experiencia y skills viven como datos tipados en el repo. Sin CMS: menos
infraestructura, y el contenido cambia poco.

### 3.8 Extras incluidos desde el inicio

| Extra | Por qué ahora |
|-------|---------------|
| **CI (GitHub Actions)** | Lint + test + build en cada push/PR. Base para deploy automático. Barato de montar con el repo vacío, caro después. |
| **Playwright E2E** | El plan pide "prueba end-to-end del formulario". Playwright prueba flujos reales (form, switch idioma/tema) en navegador. |
| **Lighthouse CI** | Meta del plan: Lighthouse ≥90. Lo hace automático y bloqueante en cada PR, en vez de una revisión manual al final. |

**Pospuesto:** OG images dinámicas — se decide junto con "¿hay páginas de detalle por proyecto?".
Si son pocas rutas fijas, bastan 1-2 imágenes estáticas.

---

## 4. Estructura del repo

```
Portfolio-Developer/
├── apps/
│   ├── web/          # Angular (SSG) — la página
│   └── api/          # NestJS — contacto por email + anti-spam
├── libs/
│   └── shared/       # interfaces TS: Project, Experience, Skill, SocialLink
├── .github/
│   └── workflows/    # CI
├── package.json      # raíz: define workspaces + scripts orquestadores
├── .nvmrc            # Node 20.19.2
├── .editorconfig
├── .gitignore
├── ARCHITECTURE.md   # este archivo
├── README.md
└── LICENSE           # MIT
```

---

## 5. Secciones del sitio (Fase 7+)

1. **Hero** — nombre, rol, propuesta de valor, animación de texto, CTAs, marquee de tecnologías.
2. **Sobre mí** — foto, historia, stats.
3. **Stack / Habilidades** — por categoría.
4. **Proyectos destacados** (3-6) — la sección más importante: imagen, badges de tech, links
   demo/repo, estructura problema → solución → impacto.
5. **Experiencia** — timeline.
6. **Certificaciones / logros** — opcional.
7. **Contacto** — formulario + links directos.
8. **Footer**.

---

## 6. SEO / GEO (Fase 10)

- Prerender/SSG de todas las rutas.
- Meta tags por página: `title`, `description`, Open Graph, Twitter Card.
- JSON-LD: `schema.org/Person` + `WebSite` + `ProfilePage`.
- `sitemap.xml`, `robots.txt`.
- `llms.txt` en la raíz.
- Accesibilidad (a11y): skip-link, focus-visible, roles/labels, contraste.
- Performance: Lighthouse ≥90 en Performance / SEO / Accessibility / Best Practices.

---

## 7. Convenciones

### Commits (Conventional Commits)

`tipo(scope): descripción en minúscula`

- **tipos:** `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `ci`, `perf`, `build`
- **scopes:** `web`, `api`, `shared`, `ci`, `repo` (o vacío para cambios transversales)
- Un commit por hito / funcionalidad. `ARCHITECTURE.md` se actualiza en el mismo commit cuando aplica.

Ejemplos: `feat(web): scaffold angular app with ssg`, `docs: update architecture status`,
`ci: add lint and build workflow`.

### Branching

`main` es la rama de despliegue. Trabajo en ramas `feat/...` o `fix/...` cuando el cambio es grande;
commits directos a `main` para el scaffolding inicial.

### Push

El `ssh-agent` de esta máquina no siempre está cargado en la sesión. Los `git push` los ejecuta
Marco (con su passphrase). Los commits locales los hace el asistente.

---

## 8. Pendiente de Marco (bloquea Fase 8 en adelante)

- [ ] **CV / lista de proyectos reales:** nombre, descripción, stack, link demo, link repo, capturas.
- [ ] **Foto / avatar** y links de redes (LinkedIn, GitHub, email, etc.).
- [ ] **Preferencia de paleta de color / vibe visual.**

---

## 9. Verificación (antes de dar por cerrado)

- `curl` / view-source del build final: contenido presente sin ejecutar JS (valida SSG).
- Lighthouse ≥90 en Performance / SEO / Accessibility / Best Practices.
- Prueba end-to-end del formulario de contacto.
- Prueba del switch de idioma y de tema.
- Revisión responsive: mobile / tablet / desktop.

---

## 10. Bitácora de cambios

| Fecha | Cambio |
|-------|--------|
| 2026-09-01 | Paso 1: esqueleto del monorepo — git init, npm workspaces, archivos raíz, `ARCHITECTURE.md`. |
| 2026-09-02 | Paso 2: `apps/web` scaffoldeado con Angular 22 + SSR/prerender. Node subido a 22.23.1 (Angular 22 lo exige). Build verificado: el HTML prerendereado tiene contenido real. |
| 2026-09-02 | Paso 3: `apps/api` scaffoldeado con NestJS 12 (ESM, oxlint, Vitest). Quitado `@nestjs/mau` → 0 vulnerabilidades. Build y test verificados. |
