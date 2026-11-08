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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { crearTipoServicioAction } from '../actions/tipo-servicio/crear-tipo-servicio.action';
import { CrearTipoServicioSchema } from '../schemas/tipo-servicio.schema';

type FormInput = z.input<typeof CrearTipoServicioSchema>;
type FormOutput = z.output<typeof CrearTipoServicioSchema>;

interface TipoServicioFormProps {
  onSuccess?: (id: string) => void;
}

export function TipoServicioForm({ onSuccess }: TipoServicioFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(CrearTipoServicioSchema),
    defaultValues: { nombre: '', descripcion: '' },
  });

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await crearTipoServicioAction(data);

      if (!result.success) {
        toast.error('Error al crear tipo de servicio', { description: result.error });
        return;
      }

      toast.success('Tipo de servicio creado', { description: result.data.nombre });
      form.reset();

      if (onSuccess) {
        onSuccess(result.data.id);
      } else {
        router.push('/catalogos/tipos-servicio');
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Preventivo" {...field} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mantenimiento programado para evitar fallos..."
                  rows={3}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Guardando...' : 'Crear tipo de servicio'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
