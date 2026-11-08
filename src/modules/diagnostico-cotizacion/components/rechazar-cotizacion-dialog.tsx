'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

import { rechazarCotizacionAction } from '../actions/rechazar-cotizacion.action';
import { RechazarCotizacionSchema } from '../schemas';

type FormInput = z.input<typeof RechazarCotizacionSchema>;
type FormOutput = z.output<typeof RechazarCotizacionSchema>;

interface RechazarCotizacionDialogProps {
  cotizacionId: string;
  folio: string;
}

export function RechazarCotizacionDialog({
  cotizacionId,
  folio,
}: RechazarCotizacionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(RechazarCotizacionSchema),
    defaultValues: { id: cotizacionId, motivo: '' },
  });

  useEffect(() => {
    form.reset({ id: cotizacionId, motivo: '' });
  }, [cotizacionId, form]);

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await rechazarCotizacionAction(data);
      if (!result.success) {
        toast.error('No se pudo rechazar', { description: result.error });
        return;
      }
      toast.success('Cotización rechazada', {
        description: 'La orden volvió a EN_DIAGNÓSTICO para re-cotizar.',
      });
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <XCircle className="mr-1 h-4 w-4" /> Rechazar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar cotización {folio}</DialogTitle>
          <DialogDescription>
            La orden volverá a estado <strong>EN_DIAGNÓSTICO</strong> para que puedas re-cotizar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo del rechazo *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Ej: El cliente considera el precio elevado, prefiere reparar solo la fuente..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Rechazando...' : 'Rechazar cotización'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
