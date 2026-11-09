'use client';

import { useEffect, useTransition } from 'react';
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

import { crearUsuarioAction } from '../actions/crear-usuario.action';
import { editarUsuarioAction } from '../actions/editar-usuario.action';
import { CrearUsuarioSchema, EditarUsuarioSchema } from '../schemas';
import type { RolMini } from '../types';

interface UsuarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: {
    id: string;
    email: string;
    nombre: string;
    apellidos: string | null;
    telefono: string | null;
    rolIds: string[];
  } | null;
  roles: RolMini[];
  onSuccess?: () => void;
}

export function UsuarioFormDialog({
  open,
  onOpenChange,
  usuario,
  roles,
  onSuccess,
}: UsuarioFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const esEdicion = !!usuario;

  const schema = esEdicion ? EditarUsuarioSchema : CrearUsuarioSchema;
  type FormInput = z.input<typeof schema>;
  type FormOutput = z.output<typeof schema>;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: usuario
      ? {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos ?? '',
          telefono: usuario.telefono ?? '',
        }
      : {
          email: '',
          nombre: '',
          apellidos: '',
          telefono: '',
          password: '',
          rolIds: [],
        },
  } as never);

  useEffect(() => {
    if (open) {
      form.reset(
        (usuario
          ? {
              id: usuario.id,
              email: usuario.email,
              nombre: usuario.nombre,
              apellidos: usuario.apellidos ?? '',
              telefono: usuario.telefono ?? '',
            }
          : {
              email: '',
              nombre: '',
              apellidos: '',
              telefono: '',
              password: '',
              rolIds: [],
            }) as never,
      );
    }
  }, [open, usuario, form]);

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = esEdicion
        ? await editarUsuarioAction(data)
        : await crearUsuarioAction(data);

      if (!result.success) {
        toast.error(esEdicion ? 'Error al actualizar' : 'Error al crear', {
          description: result.error,
        });
        return;
      }
      toast.success(esEdicion ? 'Usuario actualizado' : 'Usuario creado');
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? 'Modifica los datos del usuario. Para cambiar contraseña usa el botón dedicado.'
              : 'Crea un usuario y asigna los roles que tendrá en el sistema.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="usuario@taller.local" {...field} />
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
                      <Input placeholder="Juan" {...field} />
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
                      <Input placeholder="Pérez" {...field} value={field.value ?? ''} />
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
                    <Input placeholder="8888-8888" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!esEdicion && (
              <FormField
                control={form.control}
                name={'password' as never}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Mínimo 8 caracteres, 1 letra + 1 número"
                        {...field}
                        value={(field.value as string | undefined) ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!esEdicion && (
              <div>
                <FormLabel>Roles *</FormLabel>
                <div className="mt-2 space-y-1.5">
                  {roles.map((r) => (
                    <label
                      key={r.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={r.id}
                        {...form.register('rolIds' as never)}
                      />
                      <span className="font-medium">{r.nombre}</span>
                      {r.descripcion && (
                        <span className="text-muted-foreground text-xs">
                          — {r.descripcion}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
                {(form.formState.errors as Record<string, { message?: string } | undefined>).rolIds && (
                  <p className="text-destructive mt-1 text-xs">
                    {(form.formState.errors as Record<string, { message?: string } | undefined>).rolIds?.message}
                  </p>
                )}
              </div>
            )}

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
                {isPending ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

