'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PauseCircle } from 'lucide-react';
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

import { bloquearReparacionAction } from '../actions/bloquear-reparacion.action';
import { BloquearReparacionSchema } from '../schemas';

type FormInput = z.input<typeof BloquearReparacionSchema>;
type FormOutput = z.output<typeof BloquearReparacionSchema>;

interface BloquearReparacionDialogProps {
  reparacionId: string;
  folio: string;
}

export function BloquearReparacionDialog({ reparacionId, folio }: BloquearReparacionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(BloquearReparacionSchema),
    defaultValues: { id: reparacionId, motivo: '' },
  });

  useEffect(() => {
    form.reset({ id: reparacionId, motivo: '' });
  }, [reparacionId, form]);

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await bloquearReparacionAction(data);
      if (!result.success) {
        toast.error('No se pudo bloquear', { description: result.error });
        return;
      }
      toast.success('Reparación bloqueada', {
        description: 'El motivo quedó registrado en las notas.',
      });
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PauseCircle className="mr-1 h-4 w-4" /> Bloquear
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquear reparación de {folio}</DialogTitle>
          <DialogDescription>
            Usa esto cuando estés esperando un repuesto o alguna condición externa.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo del bloqueo *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Ej: Esperando repuesto del proveedor (3-5 días hábiles)"
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
                {isPending ? 'Bloqueando...' : 'Bloquear reparación'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
