'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserX } from 'lucide-react';
import { toast } from 'sonner';

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

import { desactivarUsuarioAction } from '../actions/desactivar-usuario.action';

interface DesactivarUsuarioDialogProps {
  usuarioId: string;
  email: string;
}

export function DesactivarUsuarioDialog({ usuarioId, email }: DesactivarUsuarioDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDesactivar() {
    startTransition(async () => {
      const result = await desactivarUsuarioAction({ id: usuarioId });
      if (!result.success) {
        toast.error('No se pudo desactivar', { description: result.error });
        return;
      }
      toast.success('Usuario desactivado', {
        description: `${email} ya no podrá iniciar sesión.`,
      });
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <UserX className="mr-1 h-3 w-3" /> Desactivar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Desactivar usuario?</DialogTitle>
          <DialogDescription>
            <strong>{email}</strong> no podrá iniciar sesión hasta que lo reactives. Su historial
            de órdenes, diagnósticos y reparaciones se conserva.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDesactivar}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Desactivando...' : 'Desactivar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
