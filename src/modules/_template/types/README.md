# `types/` — Tipos TypeScript del módulo

Tipos que no derivan directamente de Zod (esos viven en `schemas/`).

## Qué va aquí

- Tipos que representan **entidades compuestas**.
- Tipos de **respuesta** de servicios.
- Utilidades de tipos.

## Ejemplo

```ts
import type { Cliente, Direccion } from '@/generated/prisma/client';

export type ClienteConDirecciones = Cliente & {
  direcciones: Direccion[];
};

export type ClienteResumen = {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono: string | null;
  totalOrdenes: number;
  ultimaVisita: Date | null;
};

export type FiltrosClientes = {
  busqueda?: string;
  activo?: boolean;
  ciudad?: string;
};
```
