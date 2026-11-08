import bcrypt from 'bcryptjs';

/**
 * Hashea una contraseña con bcrypt (10 rounds).
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Imprime un separador de sección en la consola.
 */
export function logSeccion(titulo: string): void {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${titulo}`);
  console.log(`${'═'.repeat(60)}`);
}

/**
 * Imprime un mensaje de éxito con ✓.
 */
export function logOk(mensaje: string): void {
  console.log(`  ✓ ${mensaje}`);
}

/**
 * Imprime un mensaje informativo con ℹ.
 */
export function logInfo(mensaje: string): void {
  console.log(`  ℹ ${mensaje}`);
}
