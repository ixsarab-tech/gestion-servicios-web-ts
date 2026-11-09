'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { editarUsuarioAction } from '@/modules/usuarios-seguridad/actions/editar-usuario.action';
import { EditarUsuarioSchema } from '@/modules/usuarios-seguridad/schemas';

type FormInput = z.input<typeof EditarUsuarioSchema>;
type FormOutput = z.output<typeof EditarUsuarioSchema>;

interface EditarUsuarioFormProps {
  usuario: {
    id: string;
    email: string;
    nombre: string;
    apellidos: string | null;
    telefono: string | null;
  };
  roles: Array<{ id: string; nombre: string; descripcion: string | null }>;
}

export function EditarUsuarioForm({ usuario }: EditarUsuarioFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(EditarUsuarioSchema),
    defaultValues: {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos ?? '',
      telefono: usuario.telefono ?? '',
    },
  });

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await editarUsuarioAction(data);
      if (!result.success) {
        toast.error('Error al actualizar', { description: result.error });
        return;
      }
      toast.success('Usuario actualizado');
      router.push(`/usuarios/${usuario.id}`);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellidos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button asChild type="button" variant="outline">
                <Link href={`/usuarios/${usuario.id}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
