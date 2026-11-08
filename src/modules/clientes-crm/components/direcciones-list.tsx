'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { eliminarDireccionAction } from '../actions/eliminar-direccion.action';
import { DireccionFormDialog } from './direccion-form-dialog';

interface Direccion {
  id: string;
  etiqueta: string;
  calle: string;
  ciudad: string;
  departamento: string | null;
  pais: string;
  codigoPostal: string | null;
  referencias: string | null;
  esPrincipal: boolean;
}

interface DireccionesListProps {
  clienteId: string;
  direcciones: Direccion[];
}

export function DireccionesList({ clienteId, direcciones }: DireccionesListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDireccion, setEditingDireccion] = useState<Direccion | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleCreate() {
    setEditingDireccion(null);
    setFormOpen(true);
  }

  function handleEdit(dir: Direccion) {
    setEditingDireccion(dir);
    setFormOpen(true);
  }

  function handleDelete() {
    if (!deletingId) return;

    startTransition(async () => {
      const result = await eliminarDireccionAction({ id: deletingId });

      if (!result.success) {
        toast.error('Error al eliminar dirección', { description: result.error });
        setDeletingId(null);
        return;
      }

      toast.success('Dirección eliminada');
      setDeletingId(null);
      router.refresh();
    });
  }

  const direccionAEliminar = direcciones.find((d) => d.id === deletingId);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Direcciones ({direcciones.length})
            </CardTitle>
            <Button size="sm" variant="outline" onClick={handleCreate}>
              <Plus className="mr-1 h-3 w-3" />
              Añadir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {direcciones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin direcciones registradas</p>
          ) : (
            <ul className="space-y-3">
              {direcciones.map((dir) => (
                <li key={dir.id} className="group rounded-md border p-3 text-sm">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="font-medium">
                      {dir.etiqueta}
                      {dir.esPrincipal && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Principal
                        </Badge>
                      )}
                    </p>
                    <div className="flex gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEdit(dir)}
                        aria-label="Editar dirección"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setDeletingId(dir.id)}
                        aria-label="Eliminar dirección"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{dir.calle}</p>
                  <p className="text-muted-foreground">
                    {dir.ciudad}
                    {dir.departamento ? `, ${dir.departamento}` : ''}
                  </p>
                  {dir.referencias && (
                    <p className="mt-1 text-xs text-muted-foreground italic">{dir.referencias}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <DireccionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        clienteId={clienteId}
        direccion={editingDireccion}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar la dirección <strong>{direccionAEliminar?.etiqueta}</strong> de{' '}
              <strong>{direccionAEliminar?.calle}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
