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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { agregarRepuestoAction } from '../actions/agregar-repuesto.action';
import { editarRepuestoAction } from '../actions/editar-repuesto.action';
import { AgregarRepuestoSchema, EditarRepuestoSchema } from '../schemas';
import type { RepuestoResumen } from '../types';

interface RepuestoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reparacionId: string;
  repuesto?: RepuestoResumen | null;
  onSuccess?: () => void;
}

export function RepuestoFormDialog({
  open,
  onOpenChange,
  reparacionId,
  repuesto,
  onSuccess,
}: RepuestoFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const esEdicion = !!repuesto;

  const schema = esEdicion ? EditarRepuestoSchema : AgregarRepuestoSchema;
  type FormInput = z.input<typeof schema>;
  type FormOutput = z.output<typeof schema>;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...(esEdicion && repuesto ? { id: repuesto.id } : { reparacionId }),
      nombre: repuesto?.nombre ?? '',
      descripcion: repuesto?.descripcion ?? '',
      cantidad: repuesto?.cantidad ?? 1,
      costoUnitario: repuesto?.costoUnitario ?? 0,
    } as FormInput,
  });

  useEffect(() => {
    if (open) {
      form.reset({
        ...(esEdicion && repuesto ? { id: repuesto.id } : { reparacionId }),
        nombre: repuesto?.nombre ?? '',
        descripcion: repuesto?.descripcion ?? '',
        cantidad: repuesto?.cantidad ?? 1,
        costoUnitario: repuesto?.costoUnitario ?? 0,
      } as FormInput);
    }
  }, [open, reparacionId, repuesto, esEdicion, form]);

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = esEdicion
        ? await editarRepuestoAction(data)
        : await agregarRepuestoAction(data);

      if (!result.success) {
        toast.error(esEdicion ? 'Error al actualizar ítem' : 'Error al agregar ítem', {
          description: result.error,
        });
        return;
      }
      toast.success(esEdicion ? 'Ítem actualizado' : 'Ítem agregado');
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar ítem' : 'Agregar ítem'}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Modifica los datos del ítem.'
              : 'Registra un repuesto o servicio usado en esta reparación.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concepto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Capacitor 470µF 25V o Mano de obra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad *</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="1" {...field} value={(field.value as number | string | undefined) ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costoUnitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo unitario *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} value={(field.value as number | string | undefined) ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ''} />
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
                {isPending ? 'Guardando...' : esEdicion ? 'Guardar' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


