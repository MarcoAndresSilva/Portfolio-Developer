# @portfolio/shared

Interfaces TypeScript compartidas entre `apps/web` (Angular) y `apps/api` (NestJS).

## Regla importante: solo tipos

Este paquete **no contiene código en runtime** — solo `interface` y `type`. No hay `const`,
`enum`, funciones ni clases.

**Por qué:** se consume directo desde el código fuente (`exports` → `src/index.ts`), sin paso de
build. Angular (esbuild) puede empaquetar `.ts`, pero NestJS (tsc + nodenext) no puede importar
`.ts` en runtime. Como los tipos se borran al compilar (`import type`), no hay nada que resolver
en runtime y funciona en las dos apps.

Si algún día se necesita un valor compartido en runtime (una constante, un enum), hay que agregarle
un paso de build (`tsc` → `dist/`) y apuntar `exports` al `.js` compilado.

## Uso

```ts
import type { Project, Skill } from '@portfolio/shared';
```

## Typecheck

```bash
npm run typecheck --workspace libs/shared
```
