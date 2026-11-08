'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { eliminarEquipoAction } from '../actions/eliminar-equipo.action';
import { EquipoFormDialog } from './equipo-form-dialog';

interface Equipo {
  id: string;
  categoriaId: string | null;
  marcaId: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  descripcion: string | null;
  fechaAdquisicion: Date | null;
  observaciones: string | null;
  categoria?: { id: string; nombre: string } | null;
  marca?: { id: string; nombre: string } | null;
}

interface Categoria {
  id: string;
  nombre: string;
}

interface Marca {
  id: string;
  nombre: string;
}

interface EquiposListProps {
  clienteId: string;
  equipos: Equipo[];
  categorias: Categoria[];
  marcas: Marca[];
}

export function EquiposList({ clienteId, equipos, categorias, marcas }: EquiposListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleCreate() {
    setEditingEquipo(null);
    setFormOpen(true);
  }

  function handleEdit(eq: Equipo) {
    setEditingEquipo(eq);
    setFormOpen(true);
  }

  function handleDelete() {
    if (!deletingId) return;

    startTransition(async () => {
      const result = await eliminarEquipoAction({ id: deletingId });

      if (!result.success) {
        toast.error('Error al eliminar equipo', { description: result.error });
        setDeletingId(null);
        return;
      }

      toast.success('Equipo eliminado');
      setDeletingId(null);
      router.refresh();
    });
  }

  const equipoAEliminar = equipos.find((e) => e.id === deletingId);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Equipos ({equipos.length})
            </CardTitle>
            <Button size="sm" variant="outline" onClick={handleCreate}>
              <Plus className="mr-1 h-3 w-3" />
              Añadir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {equipos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin equipos registrados</p>
          ) : (
            <ul className="space-y-3">
              {equipos.map((eq) => (
                <li key={eq.id} className="group rounded-md border p-3 text-sm">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="font-medium">{eq.descripcion ?? 'Equipo'}</p>
                    <div className="flex gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEdit(eq)}
                        aria-label="Editar equipo"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setDeletingId(eq.id)}
                        aria-label="Eliminar equipo"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {eq.marca && <p className="text-muted-foreground">Marca: {eq.marca.nombre}</p>}
                  {eq.modelo && <p className="text-muted-foreground">Modelo: {eq.modelo}</p>}
                  {eq.numeroSerie && (
                    <p className="font-mono text-xs text-muted-foreground">S/N: {eq.numeroSerie}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <EquipoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        clienteId={clienteId}
        equipo={editingEquipo}
        categorias={categorias}
        marcas={marcas}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar el equipo <strong>{equipoAEliminar?.descripcion}</strong>. Esta acción
              no se puede deshacer.
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
