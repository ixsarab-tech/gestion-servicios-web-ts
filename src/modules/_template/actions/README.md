# `actions/` — Server Actions

Aquí viven las **Server Actions** del módulo. Cada acción:

- Empieza con `'use server'`.
- Se envuelve con `validatedAction()` de `@/shared/validation`.
- Valida el input con un schema Zod de `../schemas/`.
- Ejecuta lógica de negocio delegando a `../services/`.
- Registra auditoría automáticamente (si `audit` está configurado).
- Devuelve `Result<T>` — nunca lanza.

## Plantilla

```ts
'use server';

import { sanitizeForAudit } from '@/shared/audit';
import { validatedAction } from '@/shared/validation';

import { CrearXSchema } from '../schemas/crear-x.schema';
import { crearX } from '../services/x.service';

export const accionCrearX = validatedAction(
  {
    modulo: 'mi-modulo',
    accion: 'crear',
    schema: CrearXSchema,
    permission: 'mi-modulo:crear',
    transactional: true,
    audit: {
      accionAuditoria: 'CREATE',
      tablaAfectada: 'x',
      registroId: (out) => out.id,
      datosNuevos: (out) => sanitizeForAudit(out),
    },
  },
  async (input, { user, tx }) => {
    return crearX(input, { user, tx: tx! });
  },
);
```
