'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Image, Plus, Trash2, Video } from 'lucide-react';
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

import { eliminarEvidenciaAction } from '../actions/eliminar-evidencia.action';
import type { DiagnosticoConRelaciones } from '../types';
import { EvidenciaFormDialog } from './evidencia-form-dialog';

const ICONO_POR_TIPO = {
  FOTO: Image,
  VIDEO: Video,
  DOCUMENTO: FileText,
} as const;

interface EvidenciasListProps {
  diagnosticoId: string;
  evidencias: DiagnosticoConRelaciones['evidencias'];
  readonly?: boolean;
}

export function EvidenciasList({ diagnosticoId, evidencias, readonly }: EvidenciasListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete() {
    if (!deletingId) return;

    startTransition(async () => {
      const result = await eliminarEvidenciaAction({ id: deletingId });

      if (!result.success) {
        toast.error('Error al eliminar evidencia', { description: result.error });
        setDeletingId(null);
        return;
      }

      toast.success('Evidencia eliminada');
      setDeletingId(null);
      router.refresh();
    });
  }

  const evidenciaAEliminar = evidencias.find((e) => e.id === deletingId);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Evidencias ({evidencias.length})</h4>
          {!readonly && (
            <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
              <Plus className="mr-1 h-3 w-3" />
              Añadir
            </Button>
          )}
        </div>

        {evidencias.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin evidencias registradas</p>
        ) : (
          <ul className="space-y-2">
            {evidencias.map((ev) => {
              const Icon = ICONO_POR_TIPO[ev.tipo];
              return (
                <li
                  key={ev.id}
                  className="group flex items-start gap-3 rounded-md border p-2.5 text-sm"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {ev.tipo}
                      </Badge>
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate font-mono text-xs text-primary hover:underline"
                      >
                        {ev.url}
                      </a>
                    </div>
                    {ev.descripcion && (
                      <p className="text-xs text-muted-foreground">{ev.descripcion}</p>
                    )}
                  </div>
                  {!readonly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-60 transition-opacity group-hover:opacity-100"
                      onClick={() => setDeletingId(ev.id)}
                      aria-label="Eliminar evidencia"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <EvidenciaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        diagnosticoId={diagnosticoId}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar evidencia?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar la evidencia{' '}
              <strong>{evidenciaAEliminar?.descripcion ?? evidenciaAEliminar?.url}</strong>. Esta
              acción no se puede deshacer.
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
