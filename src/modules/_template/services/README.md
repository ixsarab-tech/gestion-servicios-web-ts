---

## D1.7 — `services/README.md`

**Carpeta:** `src/modules/_template/services/`

**Contenido:**

````markdown
# `services/` — Lógica de negocio

Aquí vive la **lógica pura del dominio**: consultas a la base de datos, cálculos, validaciones de negocio.

## Responsabilidades

- Ejecutar operaciones Prisma contra el cliente **tenant-scoped**.
- Aplicar reglas de negocio.
- Combinar operaciones (idealmente en transacciones).
- Devolver datos tipados.

**NO** hace:

- Validación de forma (eso es `schemas/`).
- Autorización (eso es `actions/`).
- Formateo para UI (eso es `components/`).

## Ejemplo

```ts
import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/shared/db';
import { ConflictError } from '@/shared/errors';

import type { CrearClienteInput } from '../schemas/crear-cliente.schema';

interface Ctx {
  tx?: Prisma.TransactionClient;
}

export async function crearCliente(input: CrearClienteInput, ctx: Ctx = {}) {
  const client = ctx.tx ?? prisma;

  const existente = await client.cliente.findFirst({
    where: { email: input.email },
    select: { id: true },
  });
  if (existente) {
    throw new ConflictError('Ya existe un cliente con ese email');
  }

  return client.cliente.create({ data: input });
}
```
````
