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

import { editarMarcaAction } from '../actions/marca/editar-marca.action';
import { EditarMarcaSchema } from '../schemas/marca.schema';

type FormInput = z.input<typeof EditarMarcaSchema>;
type FormOutput = z.output<typeof EditarMarcaSchema>;

interface MarcaFormEditProps {
  marca: {
    id: string;
    nombre: string;
  };
}

export function MarcaFormEdit({ marca }: MarcaFormEditProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(EditarMarcaSchema),
    defaultValues: {
      id: marca.id,
      nombre: marca.nombre,
    },
  });

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await editarMarcaAction(data);

      if (!result.success) {
        toast.error('Error al actualizar marca', { description: result.error });
        return;
      }

      toast.success('Marca actualizada', { description: result.data.nombre });
      router.push('/catalogos/marcas');
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
              <FormLabel>Nombre de la marca</FormLabel>
              <FormControl>
                <Input {...field} autoFocus />
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
