'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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

import { crearReparacionAction } from '../actions/crear-reparacion.action';
import { editarReparacionAction } from '../actions/editar-reparacion.action';
import { CrearReparacionSchema, EditarReparacionSchema } from '../schemas';
import type { ReparacionConRelaciones } from '../types';

interface ReparacionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordenId: string;
  reparacion?: ReparacionConRelaciones | null;
  onSuccess?: () => void;
}

export function ReparacionFormDialog({
  open,
  onOpenChange,
  ordenId,
  reparacion,
  onSuccess,
}: ReparacionFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const esEdicion = !!reparacion;

  const schema = esEdicion ? EditarReparacionSchema : CrearReparacionSchema;
  type FormInput = z.input<typeof schema>;
  type FormOutput = z.output<typeof schema>;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      ordenId,
      ...(esEdicion && reparacion ? { id: reparacion.id } : {}),
      notas: reparacion?.notas ?? '',
    } as FormInput,
  });

  useEffect(() => {
    if (open) {
      form.reset({
        ordenId,
        ...(esEdicion && reparacion ? { id: reparacion.id } : {}),
        notas: reparacion?.notas ?? '',
      } as FormInput);
    }
  }, [open, ordenId, reparacion, esEdicion, form]);

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = esEdicion
        ? await editarReparacionAction(data)
        : await crearReparacionAction(data);

      if (!result.success) {
        toast.error(esEdicion ? 'Error al actualizar' : 'Error al crear', {
          description: result.error,
        });
        return;
      }
      toast.success(esEdicion ? 'Reparación actualizada' : 'Reparación creada');
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar reparación' : 'Nueva reparación'}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Modifica las notas de la reparación.'
              : 'Inicia la reparación. Podrás agregar repuestos después.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Observaciones, plan de trabajo, etc."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Iniciar reparación'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
