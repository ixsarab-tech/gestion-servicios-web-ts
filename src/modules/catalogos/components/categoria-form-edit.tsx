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

import { editarCategoriaAction } from '../actions/categoria/editar-categoria.action';
import { EditarCategoriaSchema } from '../schemas/categoria.schema';

type FormInput = z.input<typeof EditarCategoriaSchema>;
type FormOutput = z.output<typeof EditarCategoriaSchema>;

interface CategoriaFormEditProps {
  categoria: {
    id: string;
    nombre: string;
    descripcion: string | null;
  };
}

export function CategoriaFormEdit({ categoria }: CategoriaFormEditProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(EditarCategoriaSchema),
    defaultValues: {
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
    },
  });

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await editarCategoriaAction(data);

      if (!result.success) {
        toast.error('Error al actualizar categoría', { description: result.error });
        return;
      }

      toast.success('Categoría actualizada', { description: result.data.nombre });
      router.push('/catalogos/categorias');
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
