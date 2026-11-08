import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { prismaRaw } = await import('../src/shared/db/client');

  const rows = await prismaRaw.bitacoraAuditoria.findMany({
    where: {
      OR: [
        { tablaAfectada: { in: ['diagnosticos', 'diagnostico_evidencias'] } },
        { modulo: { contains: 'diagn' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      modulo: true,
      accion: true,
      tablaAfectada: true,
      registroId: true,
      createdAt: true,
    },
  });

  if (rows.length === 0) {
    console.log('⚠️  No hay registros de auditoría de diagnóstico todavía.');
    console.log('   Ejecuta las E2E primero (crear / editar / completar diagnóstico).');
    await prismaRaw.$disconnect();
    return;
  }

  console.table(rows);

  const conTilde = rows.filter((r) => /[áéíóúñ]/.test(r.modulo));
  if (conTilde.length > 0) {
    console.log(`\n⚠️  BUG: ${conTilde.length} registros tienen tilde en modulo.`);
    console.log('   Valores:', [...new Set(conTilde.map((r) => r.modulo))]);
  } else {
    const modulos = [...new Set(rows.map((r) => r.modulo))];
    console.log(`\n✅ modulo está sin tildes. Valores: ${modulos.join(', ')}`);
  }

  await prismaRaw.$disconnect();
}

main().catch(async (err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
