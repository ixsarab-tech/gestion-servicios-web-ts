'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2 } from 'lucide-react';
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
  DialogTrigger,
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

import { cambiarPasswordAction } from '../actions/cambiar-password.action';
import { CambiarPasswordSchema } from '../schemas';

type FormInput = z.input<typeof CambiarPasswordSchema>;
type FormOutput = z.output<typeof CambiarPasswordSchema>;

interface CambiarPasswordDialogProps {
  usuarioId: string;
  email: string;
}

export function CambiarPasswordDialog({ usuarioId, email }: CambiarPasswordDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(CambiarPasswordSchema),
    defaultValues: { id: usuarioId, password: '', passwordConfirm: '' },
  });

  useEffect(() => {
    form.reset({ id: usuarioId, password: '', passwordConfirm: '' });
  }, [usuarioId, form]);

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await cambiarPasswordAction(data);
      if (!result.success) {
        toast.error('Error al cambiar contraseña', { description: result.error });
        return;
      }
      toast.success('Contraseña actualizada', {
        description: `Comunica la nueva contraseña a ${email}`,
      });
      form.reset();
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <KeyRound className="mr-1 h-4 w-4" /> Cambiar contraseña
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            Asigna una nueva contraseña a <strong>{email}</strong>. El usuario recibirá esta
            contraseña por un canal externo (no se envía por email).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña *</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo 8 caracteres, 1 letra + 1 número"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Repite la contraseña" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Guardando...' : 'Cambiar contraseña'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
