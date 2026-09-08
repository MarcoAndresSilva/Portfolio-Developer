# Portfolio-Developer

[![CI](https://github.com/MarcoAndresSilva/Portfolio-Developer/actions/workflows/ci.yml/badge.svg)](https://github.com/MarcoAndresSilva/Portfolio-Developer/actions/workflows/ci.yml)

### 🌐 [Ver sitio en vivo](https://gentle-ganache-580791.netlify.app) &nbsp;·&nbsp; 💻 [Código en GitHub](https://github.com/MarcoAndresSilva/Portfolio-Developer)

Portafolio web de **Marco Andrés Silva** — desarrollador Full Stack (Angular / NestJS).

Pensado como carta de presentación para reclutadores humanos **y** para buscadores / crawlers de IA:
contenido real en el HTML (SSG), no una SPA que muestra "necesitas JavaScript".

## Stack

- **Monorepo:** npm workspaces (`apps/*`, `libs/*`)
- **`apps/web`:** Angular (standalone + signals) con SSG / prerender, SCSS + design tokens, GSAP + Angular Animations, i18n ES/EN
- **`apps/api`:** NestJS ligero — formulario de contacto por email, rate limiting + honeypot
- **`libs/shared`:** interfaces TypeScript compartidas (`Project`, `Experience`, `Skill`, `SocialLink`)

## Requisitos

- Node `>=22.22.3` (ver `.nvmrc` → 22.23.1; lo exige Angular 22). Con nvm: `nvm use`
- npm `>=10`

## Comandos

```bash
npm install          # instala todos los workspaces
npm run web           # levanta apps/web en dev
npm run api           # levanta apps/api en dev
npm run typecheck     # tsc de libs/shared y apps/api
npm run lint          # oxlint de apps/api
npm run test          # tests de apps/web y apps/api
npm run build         # build de apps/web y apps/api
```

Estos 4 últimos son los que corre la CI (`.github/workflows/ci.yml`) en cada push y PR.

## Documentación

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — estado del proyecto, decisiones y su porqué, roadmap y próximos pasos. **Leer primero.**

## Licencia

[MIT](./LICENSE)
