'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
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

import { completarReparacionAction } from '../actions/completar-reparacion.action';
import { CompletarReparacionSchema } from '../schemas';

type FormInput = z.input<typeof CompletarReparacionSchema>;
type FormOutput = z.output<typeof CompletarReparacionSchema>;

interface CompletarReparacionDialogProps {
  reparacionId: string;
  folio: string;
}

export function CompletarReparacionDialog({ reparacionId, folio }: CompletarReparacionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(CompletarReparacionSchema),
    defaultValues: { id: reparacionId, notas: '' },
  });

  useEffect(() => {
    form.reset({ id: reparacionId, notas: '' });
  }, [reparacionId, form]);

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await completarReparacionAction(data);
      if (!result.success) {
        toast.error('No se pudo completar', { description: result.error });
        return;
      }
      toast.success('Reparación completada', {
        description: 'La orden avanzó a LISTO.',
      });
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <CheckCircle2 className="mr-1 h-4 w-4" /> Completar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Completar reparación de {folio}?</DialogTitle>
          <DialogDescription>
            La orden pasará a estado <strong>LISTO</strong>. No se podrán agregar más repuestos
            después.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas finales (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Resultado de la reparación, pruebas realizadas, etc."
                      {...field}
                      value={field.value ?? ''}
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
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Completando...' : 'Completar reparación'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
