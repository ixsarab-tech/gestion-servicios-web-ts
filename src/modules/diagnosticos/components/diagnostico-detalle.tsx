'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, ClipboardList, Pencil, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import type { DiagnosticoConRelaciones } from '../types';
import { CompletarDiagnosticoDialog } from './completar-diagnostico-dialog';
import { DiagnosticoFormDialog } from './diagnostico-form-dialog';
import { DiagnosticoTimeline } from './diagnostico-timeline';
import { EvidenciasList } from './evidencias-list';

const ESTADO_LABEL = {
  BORRADOR: 'Borrador',
  EN_PROCESO: 'En proceso',
  COMPLETADO: 'Completado',
} as const;

const ESTADO_VARIANT = {
  BORRADOR: 'secondary',
  EN_PROCESO: 'outline',
  COMPLETADO: 'default',
} as const;

interface DiagnosticoDetalleProps {
  diagnostico: DiagnosticoConRelaciones;
  ordenId: string;
  puedeEditar: boolean;
  puedeCompletar: boolean;
  defaultExpanded?: boolean;
}

export function DiagnosticoDetalle({
  diagnostico,
  ordenId,
  puedeEditar,
  puedeCompletar,
  defaultExpanded = false,
}: DiagnosticoDetalleProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [editOpen, setEditOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  const completado = diagnostico.estado === 'COMPLETADO';
  const nombreTecnico =
    `${diagnostico.tecnico.nombre} ${diagnostico.tecnico.apellidos ?? ''}`.trim();

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" />
                Diagnóstico técnico
              </CardTitle>
              <Badge variant={ESTADO_VARIANT[diagnostico.estado]}>
                {ESTADO_LABEL[diagnostico.estado]}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {nombreTecnico}
              </span>
              <span>
                Iniciado el{' '}
                {new Date(diagnostico.fechaInicio ?? diagnostico.createdAt).toLocaleDateString(
                  'es-NI',
                )}
              </span>
              <span>{diagnostico.evidencias.length} evidencias</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Expandir">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-6">
          <DiagnosticoTimeline diagnostico={diagnostico} />

          <Separator />

          {/* Campos del diagnóstico */}
          <div className="grid gap-4 sm:grid-cols-2">
            {diagnostico.pruebasRealizadas && (
              <Campo label="Pruebas realizadas" valor={diagnostico.pruebasRealizadas} />
            )}
            {diagnostico.voltajesMedidos && (
              <Campo label="Voltajes medidos" valor={diagnostico.voltajesMedidos} />
            )}
            {diagnostico.componentesDanados && (
              <Campo label="Componentes dañados" valor={diagnostico.componentesDanados} />
            )}
            {diagnostico.observaciones && (
              <Campo label="Observaciones" valor={diagnostico.observaciones} />
            )}
          </div>

          {completado && diagnostico.conclusion && (
            <>
              <Separator />
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Conclusión
                </p>
                <p className="text-sm whitespace-pre-wrap">{diagnostico.conclusion}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Evidencias */}
          <EvidenciasList
            diagnosticoId={diagnostico.id}
            evidencias={diagnostico.evidencias}
            readonly={completado}
          />

          {/* Acciones */}
          {!completado && (puedeEditar || puedeCompletar) && (
            <>
              <Separator />
              <div className="flex justify-end gap-2">
                {puedeEditar && (
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                )}
                {puedeCompletar && (
                  <Button size="sm" onClick={() => setCompleteOpen(true)}>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completar diagnóstico
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      )}

      <DiagnosticoFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        ordenId={ordenId}
        diagnostico={diagnostico}
      />

      <CompletarDiagnosticoDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        diagnosticoId={diagnostico.id}
        conclusionInicial={diagnostico.conclusion}
      />
    </Card>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm whitespace-pre-wrap">{valor}</p>
    </div>
  );
}
