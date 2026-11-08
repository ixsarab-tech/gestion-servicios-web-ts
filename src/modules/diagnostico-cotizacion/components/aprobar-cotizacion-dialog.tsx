'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
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

import { aprobarCotizacionAction } from '../actions/aprobar-cotizacion.action';

interface AprobarCotizacionDialogProps {
  cotizacionId: string;
  folio: string;
  total: number;
  moneda: string;
  formatearMonto: (n: number) => string;
}

export function AprobarCotizacionDialog({
  cotizacionId,
  folio,
  total,
  moneda,
  formatearMonto,
}: AprobarCotizacionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAprobar() {
    startTransition(async () => {
      const result = await aprobarCotizacionAction({ id: cotizacionId });
      if (!result.success) {
        toast.error('No se pudo aprobar', { description: result.error });
        return;
      }
      toast.success('Cotización aprobada', {
        description: 'La orden avanzó a estado APROBADO.',
      });
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <CheckCircle2 className="mr-1 h-4 w-4" /> Aprobar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Aprobar cotización {folio}?</DialogTitle>
          <DialogDescription>
            El cliente aceptó el presupuesto de <strong>{formatearMonto(total)} {moneda}</strong>.
            La orden avanzará a <strong>APROBADO</strong> y se habilitará la reparación.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleAprobar} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Aprobando...' : 'Aprobar cotización'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
