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

import { asignarRolAction } from '../actions/asignar-rol.action';
import { AsignarRolSchema } from '../schemas';
import type { RolMini } from '../types';

type FormInput = z.input<typeof AsignarRolSchema>;
type FormOutput = z.output<typeof AsignarRolSchema>;

interface AsignarRolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioId: string;
  rolesDisponibles: RolMini[];
}

export function AsignarRolDialog({
  open,
  onOpenChange,
  usuarioId,
  rolesDisponibles,
}: AsignarRolDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(AsignarRolSchema),
    defaultValues: { usuarioId, rolId: rolesDisponibles[0]?.id ?? '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ usuarioId, rolId: rolesDisponibles[0]?.id ?? '' });
    }
  }, [open, usuarioId, rolesDisponibles, form]);

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await asignarRolAction(data);
      if (!result.success) {
        toast.error('No se pudo asignar rol', { description: result.error });
        return;
      }
      toast.success('Rol asignado');
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar rol</DialogTitle>
          <DialogDescription>Selecciona el rol que deseas asignar al usuario.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol *</FormLabel>
                  <FormControl>
                    <select
                      className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                      {...field}
                    >
                      {rolesDisponibles.length === 0 ? (
                        <option value="">Sin roles disponibles</option>
                      ) : (
                        rolesDisponibles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nombre}
                            {r.descripcion ? ` — ${r.descripcion}` : ''}
                          </option>
                        ))
                      )}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || rolesDisponibles.length === 0}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Asignando...' : 'Asignar rol'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
