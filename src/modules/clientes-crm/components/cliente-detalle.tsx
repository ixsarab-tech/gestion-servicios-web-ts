import { Building2, Calendar, Mail, Phone, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import type { ClienteConRelaciones } from '../types';
import { DireccionesList } from './direcciones-list';
import { EquiposList } from './equipos-list';

interface Categoria {
  id: string;
  nombre: string;
}

interface Marca {
  id: string;
  nombre: string;
}

interface ClienteDetalleProps {
  cliente: ClienteConRelaciones;
  categorias: Categoria[];
  marcas: Marca[];
}

export function ClienteDetalle({ cliente, categorias, marcas }: ClienteDetalleProps) {
  const nombreCompleto = cliente.razonSocial
    ? cliente.razonSocial
    : `${cliente.nombre} ${cliente.apellidos ?? ''}`.trim();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ─── Datos principales (server) ─── */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{nombreCompleto}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Cliente desde {new Date(cliente.createdAt).toLocaleDateString('es-NI')}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{cliente.tipo === 'JURIDICA' ? 'Jurídica' : 'Física'}</Badge>
              <Badge variant={cliente.activo ? 'default' : 'secondary'}>
                {cliente.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="text-sm font-medium">{cliente.nombre}</p>
              </div>
            </div>

            {cliente.rfc && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">RFC</p>
                  <p className="font-mono text-sm font-medium">{cliente.rfc}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="text-sm font-medium">{cliente.telefono}</p>
              </div>
            </div>

            {cliente.telefonoAlternativo && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono alternativo</p>
                  <p className="text-sm font-medium">{cliente.telefonoAlternativo}</p>
                </div>
              </div>
            )}

            {cliente.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{cliente.email}</p>
                </div>
              </div>
            )}

            {cliente.fechaNacimiento && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de nacimiento</p>
                  <p className="text-sm font-medium">
                    {new Date(cliente.fechaNacimiento).toLocaleDateString('es-NI')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {cliente.notas && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Notas</p>
                <p className="text-sm whitespace-pre-wrap">{cliente.notas}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ─── Sidebar (client components) ─── */}
      <div className="space-y-6">
        <DireccionesList clienteId={cliente.id} direcciones={cliente.direcciones} />
        <EquiposList
          clienteId={cliente.id}
          equipos={cliente.equipos}
          categorias={categorias}
          marcas={marcas}
        />
      </div>
    </div>
  );
}
