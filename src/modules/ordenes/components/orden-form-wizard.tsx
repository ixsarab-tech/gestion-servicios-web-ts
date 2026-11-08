'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Trash2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import { crearOrdenAction } from '../actions/crear-orden.action';
import { CrearOrdenSchema } from '../schemas/crear-orden.schema';

type FormInput = z.input<typeof CrearOrdenSchema>;
type FormOutput = z.output<typeof CrearOrdenSchema>;

interface ClienteOption {
  id: string;
  nombre: string;
  apellidos: string | null;
  razonSocial: string | null;
  telefono: string;
  equipos: Array<{
    id: string;
    descripcion: string | null;
    numeroSerie: string | null;
    modelo: string | null;
  }>;
  direcciones: Array<{
    id: string;
    etiqueta: string;
    calle: string;
    ciudad: string;
  }>;
}

interface TipoServicioOption {
  id: string;
  nombre: string;
}

interface OrdenFormWizardProps {
  clientes: ClienteOption[];
  tiposServicio: TipoServicioOption[];
}

const PASOS = [
  'Cliente y Equipo',
  'Detalles del Servicio',
  'Checklist y Accesorios',
  'Resumen',
] as const;

export function OrdenFormWizard({ clientes, tiposServicio }: OrdenFormWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [paso, setPaso] = useState(0);
  const [accesorios, setAccesorios] = useState<string[]>([]);
  const [nuevoAccesorio, setNuevoAccesorio] = useState('');

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(CrearOrdenSchema),
    defaultValues: {
      clienteId: '',
      equipoId: '',
      tipoServicioId: '',
      direccionId: '',
      modalidad: 'TALLER',
      prioridad: 'MEDIA',
      fallaReportada: '',
      observaciones: '',
      accesorios: [],
    },
  });

  const clienteId = useWatch({ control: form.control, name: 'clienteId' });
  const modalidad = useWatch({ control: form.control, name: 'modalidad' });
  const equipoId = useWatch({ control: form.control, name: 'equipoId' });
  const direccionId = useWatch({ control: form.control, name: 'direccionId' });
  const prioridad = useWatch({ control: form.control, name: 'prioridad' });
  const fallaReportada = useWatch({ control: form.control, name: 'fallaReportada' });

  const clienteActual = clientes.find((c) => c.id === clienteId);
  const equipoActual = clienteActual?.equipos.find((e) => e.id === equipoId);
  const direccionActual = clienteActual?.direcciones.find((d) => d.id === direccionId);

  const puedeAvanzar = (): boolean => {
    if (paso === 0) return !!(clienteId && equipoId);
    if (paso === 1) {
      if (modalidad === 'DOMICILIO' && !direccionId) return false;
      return true;
    }
    return true;
  };

  function agregarAccesorio() {
    const nombre = nuevoAccesorio.trim();
    if (!nombre || accesorios.includes(nombre)) return;
    setAccesorios([...accesorios, nombre]);
    setNuevoAccesorio('');
  }

  function quitarAccesorio(nombre: string) {
    setAccesorios(accesorios.filter((a) => a !== nombre));
  }

  function onSubmit(data: FormOutput) {
    const payload = {
      ...data,
      tipoServicioId: data.tipoServicioId === '__none__' ? undefined : data.tipoServicioId,
      direccionId: data.direccionId === '__none__' ? undefined : data.direccionId,
      accesorios,
    };
    startTransition(async () => {
      const result = await crearOrdenAction(payload);

      if (!result.success) {
        toast.error('Error al crear orden', { description: result.error });
        return;
      }

      toast.success('Orden creada', { description: `Folio: ${result.data.folio}` });
      router.push(`/ordenes/${result.data.id}`);
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {PASOS.map((nombre, idx) => (
          <div key={nombre} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium ${
                  idx < paso
                    ? 'border-primary bg-primary text-primary-foreground'
                    : idx === paso
                      ? 'border-primary text-primary'
                      : 'border-muted text-muted-foreground'
                }`}
              >
                {idx < paso ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span className="mt-1 hidden text-xs text-muted-foreground sm:block">{nombre}</span>
            </div>
            {idx < PASOS.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 ${idx < paso ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ─── PASO 1: Cliente y Equipo ─── */}
          {paso === 0 && (
            <div className="space-y-4 rounded-lg border p-6">
              <FormField
                control={form.control}
                name="clienteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue('equipoId', '');
                        form.setValue('direccionId', '');
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientes.map((c) => {
                          const nombre = c.razonSocial ?? `${c.nombre} ${c.apellidos ?? ''}`.trim();
                          return (
                            <SelectItem key={c.id} value={c.id}>
                              {nombre} — {c.telefono}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {clienteId && clienteActual && (
                <FormField
                  control={form.control}
                  name="equipoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipo del cliente</FormLabel>
                      {clienteActual.equipos.length === 0 ? (
                        <p className="text-sm text-destructive">
                          Este cliente no tiene equipos registrados. Añade uno primero desde su
                          ficha.
                        </p>
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un equipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clienteActual.equipos.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.descripcion ?? e.modelo ?? 'Equipo'}
                                {e.numeroSerie ? ` — S/N: ${e.numeroSerie}` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}

          {/* ─── PASO 2: Detalles del Servicio ─── */}
          {paso === 1 && (
            <div className="space-y-4 rounded-lg border p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="modalidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TALLER">Ingreso directo a taller</SelectItem>
                          <SelectItem value="DOMICILIO">Recolección a domicilio</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prioridad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BAJA">Baja</SelectItem>
                          <SelectItem value="MEDIA">Media</SelectItem>
                          <SelectItem value="ALTA">Alta</SelectItem>
                          <SelectItem value="URGENTE">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {modalidad === 'DOMICILIO' && clienteActual && (
                <FormField
                  control={form.control}
                  name="direccionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección de recolección</FormLabel>
                      {clienteActual.direcciones.length === 0 ? (
                        <p className="text-sm text-destructive">
                          El cliente no tiene direcciones registradas. Añade una primero.
                        </p>
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una dirección" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clienteActual.direcciones.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.etiqueta}: {d.calle}, {d.ciudad}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="tipoServicioId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de servicio (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? '__none__'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Sin especificar</SelectItem>
                        {tiposServicio.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.nombre}
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
                name="fallaReportada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Falla reportada por el cliente</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: No enciende, hace ruido extraño, no enfría..."
                        rows={3}
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
                name="fechaCompromiso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de entrega comprometida (opcional)</FormLabel>
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
            </div>
          )}

          {/* ─── PASO 3: Checklist y Accesorios ─── */}
          {paso === 2 && (
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <h3 className="mb-4 text-sm font-medium">Checklist estético</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ['golpes', 'Golpes visibles'],
                      ['rayones', 'Rayones'],
                      ['pantallaRota', 'Pantalla rota'],
                      ['carcasaDanada', 'Carcasa dañada'],
                      ['humedad', 'Humedad'],
                      ['faltanTornillos', 'Faltan tornillos'],
                    ] as const
                  ).map(([name, label]) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={`checklist.${name}`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-y-0 space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={(c) => field.onChange(c === true)}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer text-sm font-normal">
                            {label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="mb-4 text-sm font-medium">Accesorios recibidos</h3>
                <div className="mb-3 flex gap-2">
                  <Input
                    placeholder="Ej: Cable de poder"
                    value={nuevoAccesorio}
                    onChange={(e) => setNuevoAccesorio(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        agregarAccesorio();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={agregarAccesorio}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {accesorios.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin accesorios registrados</p>
                ) : (
                  <ul className="space-y-2">
                    {accesorios.map((a) => (
                      <li
                        key={a}
                        className="flex items-center justify-between rounded-md border p-2 text-sm"
                      >
                        <span>{a}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => quitarAccesorio(a)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* ─── PASO 4: Resumen ─── */}
          {paso === 3 && clienteActual && equipoActual && (
            <div className="space-y-4 rounded-lg border p-6">
              <h3 className="text-sm font-medium">Resumen de la orden</h3>
              <Separator />
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="font-medium">
                    {clienteActual.razonSocial ??
                      `${clienteActual.nombre} ${clienteActual.apellidos ?? ''}`.trim()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Equipo</p>
                  <p className="font-medium">
                    {equipoActual.descripcion ?? equipoActual.modelo ?? 'Equipo'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Modalidad</p>
                  <p className="font-medium">{modalidad}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prioridad</p>
                  <Badge variant="outline">{prioridad}</Badge>
                </div>
                {direccionActual && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Dirección de recolección</p>
                    <p className="font-medium">
                      {direccionActual.etiqueta}: {direccionActual.calle}, {direccionActual.ciudad}
                    </p>
                  </div>
                )}
                {fallaReportada && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Falla reportada</p>
                    <p className="text-sm">{fallaReportada}</p>
                  </div>
                )}
                {accesorios.length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">
                      Accesorios ({accesorios.length})
                    </p>
                    <p className="text-sm">{accesorios.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => (paso === 0 ? router.back() : setPaso(paso - 1))}
              disabled={isPending}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {paso === 0 ? 'Cancelar' : 'Anterior'}
            </Button>

            {paso < PASOS.length - 1 ? (
              <Button type="button" onClick={() => setPaso(paso + 1)} disabled={!puedeAvanzar()}>
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Creando...' : 'Crear Orden'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
