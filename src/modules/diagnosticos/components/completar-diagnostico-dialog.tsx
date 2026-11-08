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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

import { completarDiagnosticoAction } from '../actions/completar-diagnostico.action';
import { CompletarDiagnosticoSchema } from '../schemas/diagnostico.schema';

type FormInput = z.input<typeof CompletarDiagnosticoSchema>;
type FormOutput = z.output<typeof CompletarDiagnosticoSchema>;

interface CompletarDiagnosticoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diagnosticoId: string;
  conclusionInicial?: string | null;
  onSuccess?: () => void;
}

export function CompletarDiagnosticoDialog({
  open,
  onOpenChange,
  diagnosticoId,
  conclusionInicial,
  onSuccess,
}: CompletarDiagnosticoDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(CompletarDiagnosticoSchema),
    defaultValues: {
      id: diagnosticoId,
      conclusion: conclusionInicial ?? '',
    },
  });

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await completarDiagnosticoAction(data);

      if (!result.success) {
        toast.error('Error al completar diagnóstico', { description: result.error });
        return;
      }

      toast.success('Diagnóstico completado');
      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Completar diagnóstico</DialogTitle>
          <DialogDescription>
            Al completar el diagnóstico ya no se podrá editar ni agregar evidencias.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="conclusion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conclusión</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Describe la causa del fallo y el resultado del diagnóstico..."
                      {...field}
                      autoFocus
                    />
                  </FormControl>
                  <FormDescription>
                    Mínimo 10 caracteres. Esta conclusión será visible en el detalle de la orden.
                  </FormDescription>
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
                {isPending ? 'Completando...' : 'Completar diagnóstico'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
