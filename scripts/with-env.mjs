#!/usr/bin/env node
/**
 * Wrapper que carga .env.local (y .env) antes de ejecutar un comando.
 * Uso: node scripts/with-env.mjs <comando> [args...]
 *
 * Ejemplo: node scripts/with-env.mjs prisma migrate dev
 */
import { config } from 'dotenv';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Cargar .env.local si existe (prioridad), luego .env
const envFiles = ['.env.local', '.env'];
for (const file of envFiles) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    config({ path });
  }
}

// Ejecutar el comando que vino por argumentos
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Uso: node scripts/with-env.mjs <comando> [args...]');
  process.exit(1);
}

const isWindows = process.platform === 'win32';

// Usamos npx para resolver binarios de node_modules/.bin (prisma, tsx, etc.)
// En Windows npx.cmd es el ejecutable correcto.
const npx = isWindows ? 'npx.cmd' : 'npx';

const child = spawn(npx, args, {
  stdio: 'inherit',
  shell: isWindows,
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
