'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { calcularIVA } from '@/shared/constants/impuestos';
import { formatearMonto } from '@/shared/constants/monedas';

import { crearCotizacionAction } from '../actions/crear-cotizacion.action';
import { CrearCotizacionSchema } from '../schemas';

type FormInput = z.input<typeof CrearCotizacionSchema>;
type FormOutput = z.output<typeof CrearCotizacionSchema>;

interface CotizacionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordenId: string;
  onSuccess?: () => void;
}

const ITEM_VACIO = {
  concepto: '',
  descripcion: '',
  cantidad: 1,
  precioUnitario: 0,
};

export function CotizacionFormDialog({
  open,
  onOpenChange,
  ordenId,
  onSuccess,
}: CotizacionFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(CrearCotizacionSchema),
    defaultValues: {
      ordenId,
      notas: '',
      moneda: 'NIO',
      items: [ITEM_VACIO],
    } as FormInput,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items' as never,
  });

  useEffect(() => {
    if (open) {
      form.reset({
        ordenId,
        notas: '',
        moneda: 'NIO',
        items: [ITEM_VACIO],
      } as FormInput);
    }
  }, [open, ordenId, form]);

  // Preview en vivo (useWatch para evitar warning de React Compiler)
  const itemsWatch = useWatch({ control: form.control, name: 'items' as never }) as unknown as
    | Array<{ cantidad?: number; precioUnitario?: number }>
    | undefined;
  const monedaWatch = useWatch({ control: form.control, name: 'moneda' as never }) as unknown as
    | 'NIO'
    | 'USD'
    | undefined;
  const items = itemsWatch ?? [];
  const subtotal = items.reduce(
    (s, i) => s + Number(i?.cantidad ?? 0) * Number(i?.precioUnitario ?? 0),
    0,
  );
  const iva = calcularIVA(subtotal);
  const total = Math.round((subtotal + iva) * 100) / 100;
  const monedaActual = monedaWatch ?? 'NIO';

  function onSubmit(data: FormOutput) {
    startTransition(async () => {
      const result = await crearCotizacionAction(data);
      if (!result.success) {
        toast.error('No se pudo crear la cotización', { description: result.error });
        return;
      }
      toast.success('Cotización creada');
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nueva cotización</DialogTitle>
          <DialogDescription>
            Agrega los conceptos a cotizar. El IVA (15%) se calcula automáticamente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Condiciones, tiempo de entrega, garantía..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <FormLabel>Items</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append(ITEM_VACIO as never)}
                >
                  <Plus className="mr-1 h-3 w-3" /> Agregar item
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div key={field.id} className="grid grid-cols-12 items-end gap-2 rounded border p-2">
                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name={`items.${idx}.concepto` as never}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Concepto *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Reemplazo de capacitor" {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${idx}.cantidad` as never}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Cantidad *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...f}
                                value={(f.value as number | string | undefined) ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${idx}.precioUnitario` as never}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">P. unitario *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...f}
                                value={(f.value as number | string | undefined) ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end md:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(idx)}
                        disabled={fields.length <= 1}
                        aria-label="Eliminar item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatearMonto(subtotal, monedaActual)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA (15%)</span>
                  <span>{formatearMonto(iva, monedaActual)}</span>
                </div>
                <div className="flex justify-between border-t pt-1 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatearMonto(total, monedaActual)}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Guardando...' : 'Crear cotización'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


