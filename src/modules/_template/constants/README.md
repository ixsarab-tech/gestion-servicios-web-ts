---

## D1.5 — `constants/README.md`

**Carpeta:** `src/modules/_template/constants/`

**Contenido:**

````markdown
# `constants/` — Constantes del módulo

Valores estáticos que NO dependen del runtime.

- Enums de dominio (estados, tipos, categorías).
- Labels en español para UI.
- Valores por defecto.

## Ejemplo: estados de una orden

```ts
export const ORDEN_ESTADOS = {
  BORRADOR: 'borrador',
  RECIBIDO: 'recibido',
  EN_DIAGNOSTICO: 'en_diagnostico',
  PRESUPUESTADO: 'presupuestado',
  APROBADO: 'aprobado',
  REPARANDO: 'reparando',
  LISTO: 'listo',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
} as const;

export type OrdenEstado = (typeof ORDEN_ESTADOS)[keyof typeof ORDEN_ESTADOS];

export const ORDEN_ESTADO_LABELS: Record<OrdenEstado, string> = {
  [ORDEN_ESTADOS.BORRADOR]: 'Borrador',
  [ORDEN_ESTADOS.RECIBIDO]: 'Recibido',
  [ORDEN_ESTADOS.EN_DIAGNOSTICO]: 'En diagnóstico',
  [ORDEN_ESTADOS.PRESUPUESTADO]: 'Presupuestado',
  [ORDEN_ESTADOS.APROBADO]: 'Aprobado',
  [ORDEN_ESTADOS.REPARANDO]: 'Reparando',
  [ORDEN_ESTADOS.LISTO]: 'Listo',
  [ORDEN_ESTADOS.ENTREGADO]: 'Entregado',
  [ORDEN_ESTADOS.CANCELADO]: 'Cancelado',
};
```
````
