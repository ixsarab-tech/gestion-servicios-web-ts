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

import { crearEquipoAction } from '../actions/crear-equipo.action';
import { editarEquipoAction } from '../actions/editar-equipo.action';
import { CrearEquipoSchema } from '../schemas/equipo.schema';

type FormInput = z.input<typeof CrearEquipoSchema>;
type FormOutput = z.output<typeof CrearEquipoSchema>;

interface Equipo {
  id: string;
  categoriaId: string | null;
  marcaId: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  descripcion: string | null;
  fechaAdquisicion: Date | null;
  observaciones: string | null;
}

interface Categoria {
  id: string;
  nombre: string;
}

interface Marca {
  id: string;
  nombre: string;
}

interface EquipoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  equipo?: Equipo | null;
  categorias: Categoria[];
  marcas: Marca[];
  onSuccess?: () => void;
}

export function EquipoFormDialog({
  open,
  onOpenChange,
  clienteId,
  equipo,
  categorias,
  marcas,
  onSuccess,
}: EquipoFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const esEdicion = !!equipo;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(CrearEquipoSchema),
    defaultValues: {
      clienteId,
      categoriaId: equipo?.categoriaId ?? '',
      marcaId: equipo?.marcaId ?? '',
      modelo: equipo?.modelo ?? '',
      numeroSerie: equipo?.numeroSerie ?? '',
      descripcion: equipo?.descripcion ?? '',
      fechaAdquisicion: equipo?.fechaAdquisicion ?? undefined,
      observaciones: equipo?.observaciones ?? '',
    },
  });

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = equipo
        ? await editarEquipoAction({ ...data, id: equipo.id })
        : await crearEquipoAction(data);

      if (!result.success) {
        toast.error(esEdicion ? 'Error al actualizar equipo' : 'Error al crear equipo', {
          description: result.error,
        });
        return;
      }

      toast.success(esEdicion ? 'Equipo actualizado' : 'Equipo creado');
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
          <DialogTitle>{esEdicion ? 'Editar equipo' : 'Nuevo equipo'}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Modifica los datos del equipo'
              : 'Registra un nuevo equipo para este cliente'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="categoriaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? '__none__'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Sin categoría</SelectItem>
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marcaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? '__none__'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin marca" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Sin marca</SelectItem>
                        {marcas.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: RT29K5030S8" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numeroSerie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de serie (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: SAM-RT29-001" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Refrigeradora Samsung 290L, dos puertas..."
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
              name="fechaAdquisicion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de adquisición (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''
                      }
                      onChange={(e) =>
                        field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas internas del equipo..."
                      rows={2}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
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
                {isPending ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear equipo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
