/**
 * Setup de tests de integración.
 * Se ejecuta antes de cada archivo de test.
 * NO tocamos NODE_ENV (es read-only en Node 24).
 *
 * Nota: los tests de integración requieren:
 *   - Docker MySQL corriendo (`pnpm db:up`)
 *   - DB migrada (`pnpm db:migrate`)
 *   - Seeds base cargados (`pnpm db:seed`)
 */
export {};
