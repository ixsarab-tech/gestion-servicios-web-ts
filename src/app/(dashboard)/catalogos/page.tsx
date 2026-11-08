import Link from 'next/link';
import { connection } from 'next/server';
import { FolderTree,Layers, Tag, Tags } from 'lucide-react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requirePermission } from '@/shared/auth';

export const instant = false;

const SECCIONES = [
  {
    href: '/catalogos/categorias',
    label: 'Categorías',
    descripcion: 'Agrupa equipos por familia (laptops, impresoras, etc.).',
    icon: Tags,
    permission: 'catalogos:categorias:ver',
  },
  {
    href: '/catalogos/marcas',
    label: 'Marcas',
    descripcion: 'Fabricantes de equipos (HP, Dell, Lenovo…).',
    icon: Tag,
    permission: 'catalogos:marcas:ver',
  },
  {
    href: '/catalogos/tipos-servicio',
    label: 'Tipos de servicio',
    descripcion: 'Clasificación de trabajos (diagnóstico, reparación, mantenimiento…).',
    icon: Layers,
    permission: 'catalogos:tipos-servicio:ver',
  },
] as const;

export default async function CatalogosPage() {
  await connection();
  const user = await requirePermission('catalogos:marcas:ver');

  const visibles = SECCIONES.filter((s) => user.permisos.includes(s.permission));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <FolderTree className="h-6 w-6" /> Catálogos
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Datos maestros del taller. Selecciona una sección para gestionarla.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href}>
              <Card className="hover:border-primary h-full cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" /> {s.label}
                  </CardTitle>
                  <CardDescription>{s.descripcion}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
