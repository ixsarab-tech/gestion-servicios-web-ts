'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { editarClienteAction } from '../actions/editar-cliente.action';
import { EditarClienteSchema } from '../schemas/editar-cliente.schema';

type FormInput = z.input<typeof EditarClienteSchema>;
type FormOutput = z.output<typeof EditarClienteSchema>;

interface ClienteFormEditProps {
  cliente: {
    id: string;
    tipo: 'FISICA' | 'JURIDICA';
    rfc: string | null;
    razonSocial: string | null;
    nombre: string;
    apellidos: string | null;
    email: string | null;
    telefono: string;
    telefonoAlternativo: string | null;
    notas: string | null;
  };
}

export function ClienteFormEdit({ cliente }: ClienteFormEditProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(EditarClienteSchema),
    defaultValues: {
      id: cliente.id,
      tipo: cliente.tipo,
      rfc: cliente.rfc ?? '',
      razonSocial: cliente.razonSocial ?? '',
      nombre: cliente.nombre,
      apellidos: cliente.apellidos ?? '',
      email: cliente.email ?? '',
      telefono: cliente.telefono,
      telefonoAlternativo: cliente.telefonoAlternativo ?? '',
      notas: cliente.notas ?? '',
    },
  });

  const tipo = useWatch({ control: form.control, name: 'tipo' });
  const esJuridica = tipo === 'JURIDICA';

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await editarClienteAction(data);

      if (!result.success) {
        toast.error('Error al actualizar cliente', { description: result.error });
        return;
      }

      toast.success('Cliente actualizado', {
        description: `${result.data.nombre} ${result.data.apellidos ?? ''}`.trim(),
      });

      router.push(`/clientes/${result.data.id}`);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...form.register('id')} />

        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de cliente</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FISICA">Persona física</SelectItem>
                  <SelectItem value="JURIDICA">Persona jurídica</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {esJuridica && (
          <FormField
            control={form.control}
            name="razonSocial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razón social</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre{esJuridica ? ' del contacto' : ''}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!esJuridica && (
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
          )}
        </div>

        <FormField
          control={form.control}
          name="rfc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RFC (opcional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (opcional)</FormLabel>
                <FormControl>
                  <Input type="email" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Formato E.164</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="telefonoAlternativo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono alternativo (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (opcional)</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
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
