---

## D1.6 — `schemas/README.md`

**Carpeta:** `src/modules/_template/schemas/`

**Contenido:**

````markdown
# `schemas/` — Esquemas Zod

Validación de datos de entrada/salida del módulo.

## Convenciones

- Un archivo por operación: `crear-x.schema.ts`, `editar-x.schema.ts`.
- Los tipos inferidos se exportan con `z.infer<typeof Schema>`.
- Los mensajes de error son **en español** y descriptivos.
- **Nunca `any`**: usar `.safeParse()`.

## Ejemplo

```ts
import { z } from 'zod';

export const CrearClienteSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  apellidos: z.string().max(120).optional(),
  email: z.email('Email inválido'),
  telefono: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Teléfono inválido')
    .optional(),
  rfc: z.string().length(13, 'RFC debe tener 13 caracteres').optional(),
  direccion: z
    .object({
      calle: z.string().min(1),
      ciudad: z.string().min(1),
      pais: z.string().length(2).default('NI'),
    })
    .optional(),
});

export type CrearClienteInput = z.infer<typeof CrearClienteSchema>;
```
````
