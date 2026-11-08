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

import { crearMarcaAction } from '../actions/marca/crear-marca.action';
import { CrearMarcaSchema } from '../schemas/marca.schema';

type FormInput = z.input<typeof CrearMarcaSchema>;
type FormOutput = z.output<typeof CrearMarcaSchema>;

interface MarcaFormProps {
  onSuccess?: (id: string) => void;
}

export function MarcaForm({ onSuccess }: MarcaFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(CrearMarcaSchema),
    defaultValues: { nombre: '' },
  });

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await crearMarcaAction(data);

      if (!result.success) {
        toast.error('Error al crear marca', { description: result.error });
        return;
      }

      toast.success('Marca creada', { description: result.data.nombre });
      form.reset();

      if (onSuccess) {
        onSuccess(result.data.id);
      } else {
        router.push('/catalogos/marcas');
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
              <FormLabel>Nombre de la marca</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Samsung" {...field} autoFocus />
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
            {isPending ? 'Guardando...' : 'Crear marca'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
