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

import { crearClienteAction } from '../actions/crear-cliente.action';
import { CrearClienteSchema } from '../schemas/crear-cliente.schema';

/** Tipo de lo que el usuario teclea (input de Zod). */
type FormInput = z.input<typeof CrearClienteSchema>;
/** Tipo de lo que sale tras validar (output de Zod). */
type FormOutput = z.output<typeof CrearClienteSchema>;

interface ClienteFormProps {
  onSuccess?: (clienteId: string) => void;
}

export function ClienteForm({ onSuccess }: ClienteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(CrearClienteSchema),
    defaultValues: {
      tipo: 'FISICA',
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      telefonoAlternativo: '',
      rfc: '',
      razonSocial: '',
      notas: '',
    },
  });

  const tipo = useWatch({ control: form.control, name: 'tipo' });
  const esJuridica = tipo === 'JURIDICA';

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await crearClienteAction(data);

      if (!result.success) {
        toast.error('Error al crear cliente', { description: result.error });
        return;
      }

      toast.success('Cliente creado', {
        description: `${result.data.nombre} ${result.data.apellidos ?? ''}`.trim(),
      });

      form.reset();

      if (onSuccess) {
        onSuccess(result.data.id);
      } else {
        router.push(`/clientes/${result.data.id}`);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ─── Tipo de cliente ─── */}
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
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

        {/* ─── Razón social (solo jurídica) ─── */}
        {esJuridica && (
          <FormField
            control={form.control}
            name="razonSocial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razón social</FormLabel>
                <FormControl>
                  <Input placeholder="Mi Empresa S.A." {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* ─── Nombre y apellidos ─── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre{esJuridica ? ' del contacto' : ''}</FormLabel>
                <FormControl>
                  <Input placeholder="Juan" {...field} />
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
                    <Input placeholder="Pérez" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* ─── RFC ─── */}
        <FormField
          control={form.control}
          name="rfc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RFC (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="XAXX010101000"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>14 caracteres, sin guiones</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ─── Contacto ─── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="juan@ejemplo.com"
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
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="+50588881000" {...field} />
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
                <Input placeholder="+50588881001" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ─── Notas ─── */}
        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Información adicional del cliente..."
                  rows={4}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ─── Acciones ─── */}
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
            {isPending ? 'Guardando...' : 'Crear cliente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
