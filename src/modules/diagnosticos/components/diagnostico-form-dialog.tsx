'use client';

import { useTransition } from 'react';
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

import { crearDiagnosticoAction } from '../actions/crear-diagnostico.action';
import { editarDiagnosticoAction } from '../actions/editar-diagnostico.action';
import { CrearDiagnosticoSchema } from '../schemas/diagnostico.schema';
import { EditarDiagnosticoSchema } from '../schemas/diagnostico.schema';
import type { DiagnosticoConRelaciones } from '../types';

interface DiagnosticoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordenId: string;
  diagnostico?: DiagnosticoConRelaciones | null;
  onSuccess?: () => void;
}

export function DiagnosticoFormDialog({
  open,
  onOpenChange,
  ordenId,
  diagnostico,
  onSuccess,
}: DiagnosticoFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const esEdicion = !!diagnostico;

  const schema = esEdicion ? EditarDiagnosticoSchema : CrearDiagnosticoSchema;
  type FormInput = z.input<typeof schema>;
  type FormOutput = z.output<typeof schema>;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      ordenId,
      ...(esEdicion && diagnostico
        ? {
            id: diagnostico.id,
            conclusion: diagnostico.conclusion ?? '',
          }
        : {}),
      pruebasRealizadas: diagnostico?.pruebasRealizadas ?? '',
      voltajesMedidos: diagnostico?.voltajesMedidos ?? '',
      componentesDanados: diagnostico?.componentesDanados ?? '',
      observaciones: diagnostico?.observaciones ?? '',
    } as FormInput,
  });

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = esEdicion
        ? await editarDiagnosticoAction(data)
        : await crearDiagnosticoAction(data);

      if (!result.success) {
        toast.error(esEdicion ? 'Error al actualizar diagnóstico' : 'Error al crear diagnóstico', {
          description: result.error,
        });
        return;
      }

      toast.success(esEdicion ? 'Diagnóstico actualizado' : 'Diagnóstico creado');
      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar diagnóstico' : 'Nuevo diagnóstico'}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Modifica los datos del diagnóstico técnico.'
              : 'Registra las pruebas, mediciones y observaciones del diagnóstico.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="pruebasRealizadas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pruebas realizadas</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Ej: Medición de continuidad en el motor, revisión de fusibles..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voltajesMedidos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voltajes medidos</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Ej: 120V entrada, 12V salida, 0V en tierra..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="componentesDanados"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Componentes dañados</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Ej: Capacitor principal, fusible térmico, tarjeta de control..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Notas adicionales del técnico..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {esEdicion && (
              <FormField
                control={form.control}
                name={'conclusion' as never}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conclusión preliminar (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Diagnóstico técnico preliminar..."
                        {...field}
                        value={(field.value as string | undefined) ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Iniciar diagnóstico'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
