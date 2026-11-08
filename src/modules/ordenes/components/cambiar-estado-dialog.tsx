'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { cambiarEstadoAction } from '../actions/cambiar-estado.action';
import { ESTADO_LABELS, TRANSICIONES_VALIDAS } from '../constants/estados-orden';

interface EstadoOrden {
  id: string;
  estado: keyof typeof TRANSICIONES_VALIDAS;
}

interface CambiarEstadoDialogProps {
  orden: EstadoOrden;
}

export function CambiarEstadoDialog({ orden }: CambiarEstadoDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  const [comentario, setComentario] = useState('');

  const estadosDisponibles = TRANSICIONES_VALIDAS[orden.estado] ?? [];

  function handleSubmit() {
    if (!nuevoEstado) return;

    startTransition(async () => {
      const result = await cambiarEstadoAction({
        id: orden.id,
        nuevoEstado: nuevoEstado as keyof typeof ESTADO_LABELS,
        comentario: comentario || undefined,
      });

      if (!result.success) {
        toast.error('Error al cambiar estado', { description: result.error });
        return;
      }

      toast.success('Estado actualizado');
      setOpen(false);
      setNuevoEstado('');
      setComentario('');
      router.refresh();
    });
  }

  // Si no hay transiciones disponibles, no mostramos el botón
  if (estadosDisponibles.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Cambiar estado</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar estado de la orden</DialogTitle>
          <DialogDescription>
            Estado actual: <strong>{ESTADO_LABELS[orden.estado]}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="estado">Nuevo estado</Label>
            <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
              <SelectTrigger id="estado">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {estadosDisponibles.map((e) => (
                  <SelectItem key={e} value={e}>
                    {ESTADO_LABELS[e]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comentario">Comentario (opcional)</Label>
            <Textarea
              id="comentario"
              placeholder="Notas sobre el cambio de estado..."
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!nuevoEstado || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Cambiando...' : 'Cambiar estado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
