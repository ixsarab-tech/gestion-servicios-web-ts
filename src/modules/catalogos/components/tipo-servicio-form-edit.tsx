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

import { editarTipoServicioAction } from '../actions/tipo-servicio/editar-tipo-servicio.action';
import { EditarTipoServicioSchema } from '../schemas/tipo-servicio.schema';

type FormInput = z.input<typeof EditarTipoServicioSchema>;
type FormOutput = z.output<typeof EditarTipoServicioSchema>;

interface TipoServicioFormEditProps {
  tipo: {
    id: string;
    nombre: string;
    descripcion: string | null;
  };
}

export function TipoServicioFormEdit({ tipo }: TipoServicioFormEditProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(EditarTipoServicioSchema),
    defaultValues: {
      id: tipo.id,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion ?? '',
    },
  });

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await editarTipoServicioAction(data);

      if (!result.success) {
        toast.error('Error al actualizar tipo de servicio', { description: result.error });
        return;
      }

      toast.success('Tipo de servicio actualizado', { description: result.data.nombre });
      router.push('/catalogos/tipos-servicio');
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...form.register('id')} />

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} autoFocus />
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
                <Textarea rows={3} {...field} value={field.value ?? ''} />
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
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
