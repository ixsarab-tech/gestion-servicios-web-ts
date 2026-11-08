'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { crearDireccionAction } from '../actions/crear-direccion.action';
import { editarDireccionAction } from '../actions/editar-direccion.action';
import { CrearDireccionSchema } from '../schemas/direccion.schema';

type FormInput = z.input<typeof CrearDireccionSchema>;
type FormOutput = z.output<typeof CrearDireccionSchema>;

interface Direccion {
  id: string;
  etiqueta: string;
  calle: string;
  ciudad: string;
  departamento: string | null;
  pais: string;
  codigoPostal: string | null;
  referencias: string | null;
  esPrincipal: boolean;
}

interface DireccionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  direccion?: Direccion | null;
  onSuccess?: () => void;
}

export function DireccionFormDialog({
  open,
  onOpenChange,
  clienteId,
  direccion,
  onSuccess,
}: DireccionFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const esEdicion = !!direccion;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(CrearDireccionSchema),
    defaultValues: {
      clienteId,
      etiqueta: direccion?.etiqueta ?? '',
      calle: direccion?.calle ?? '',
      ciudad: direccion?.ciudad ?? '',
      departamento: direccion?.departamento ?? '',
      pais: direccion?.pais ?? 'NI',
      codigoPostal: direccion?.codigoPostal ?? '',
      referencias: direccion?.referencias ?? '',
      esPrincipal: direccion?.esPrincipal ?? false,
    },
  });

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = direccion
        ? await editarDireccionAction({ ...data, id: direccion.id })
        : await crearDireccionAction(data);

      if (!result.success) {
        toast.error(esEdicion ? 'Error al actualizar dirección' : 'Error al crear dirección', {
          description: result.error,
        });
        return;
      }

      toast.success(esEdicion ? 'Dirección actualizada' : 'Dirección creada');
      form.reset();
      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar dirección' : 'Nueva dirección'}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Modifica los datos de la dirección'
              : 'Registra una nueva dirección para este cliente'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="etiqueta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiqueta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Casa, Oficina, Bodega" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="calle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calle y número</FormLabel>
                  <FormControl>
                    <Input placeholder="Frente al Parque Central, Casa #123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="ciudad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input placeholder="Managua" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Managua" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="pais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País (ISO 2 letras)</FormLabel>
                    <FormControl>
                      <Input placeholder="NI" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigoPostal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código postal (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="11001" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="referencias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencias (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Portón negro, timbre a la derecha..."
                      rows={2}
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
              name="esPrincipal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">Dirección principal</FormLabel>
                    <FormDescription>
                      Marca esta dirección como la predeterminada del cliente
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

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
                {isPending ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear dirección'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
