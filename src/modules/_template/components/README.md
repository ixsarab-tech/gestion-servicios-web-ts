---

## D1.4 — `components/README.md`

**Carpeta:** `src/modules/_template/components/`

**Contenido:**

```markdown
# `components/` — UI del módulo

Componentes React específicos de este módulo.

## Reglas

1. **Server Components por defecto**: solo añadir `'use client'` cuando sea estrictamente necesario.
2. **Consumir Server Actions** desde Client Components.
3. **Shadcn UI primero**: usar componentes de `@/components/ui/*` antes de crear uno nuevo.
4. **Tailwind puro**: sin CSS modules.
5. **Nombres descriptivos**: `ClienteForm.tsx`, `ClienteTable.tsx`.

## Estructura sugerida
```
