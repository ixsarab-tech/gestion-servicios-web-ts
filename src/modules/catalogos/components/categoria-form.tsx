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

import { crearCategoriaAction } from '../actions/categoria/crear-categoria.action';
import { CrearCategoriaSchema } from '../schemas/categoria.schema';

type FormInput = z.input<typeof CrearCategoriaSchema>;
type FormOutput = z.output<typeof CrearCategoriaSchema>;

interface CategoriaFormProps {
  onSuccess?: (id: string) => void;
}

export function CategoriaForm({ onSuccess }: CategoriaFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(CrearCategoriaSchema),
    defaultValues: { nombre: '', descripcion: '' },
  });

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await crearCategoriaAction(data);

      if (!result.success) {
        toast.error('Error al crear categoría', { description: result.error });
        return;
      }

      toast.success('Categoría creada', { description: result.data.nombre });
      form.reset();

      if (onSuccess) {
        onSuccess(result.data.id);
      } else {
        router.push('/catalogos/categorias');
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
                <Input placeholder="Ej: Refrigeración" {...field} autoFocus />
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
                  placeholder="Refrigeradoras, congeladores, vitrinas..."
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
            {isPending ? 'Guardando...' : 'Crear categoría'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
