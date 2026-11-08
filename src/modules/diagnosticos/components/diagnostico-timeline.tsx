import { CheckCircle2, Circle, Clock } from 'lucide-react';

import type { DiagnosticoConRelaciones } from '../types';

interface DiagnosticoTimelineProps {
  diagnostico: DiagnosticoConRelaciones;
}

export function DiagnosticoTimeline({ diagnostico }: DiagnosticoTimelineProps) {
  const completado = diagnostico.estado === 'COMPLETADO';

  const hitos = [
    {
      label: 'Creado',
      fecha: diagnostico.fechaInicio ?? diagnostico.createdAt,
      completado: true,
      icono: CheckCircle2,
    },
    {
      label: 'En proceso',
      fecha: completado ? diagnostico.fechaInicio : null,
      completado,
      icono: completado ? CheckCircle2 : Clock,
    },
    {
      label: 'Completado',
      fecha: diagnostico.fechaFin,
      completado,
      icono: completado ? CheckCircle2 : Circle,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {hitos.map((hito, idx) => {
        const Icon = hito.icono;
        const activo = hito.completado;
        return (
          <div key={hito.label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Icon
                className={`h-3.5 w-3.5 ${activo ? 'text-primary' : 'text-muted-foreground/50'}`}
              />
              <span className={`text-xs ${activo ? 'font-medium' : 'text-muted-foreground'}`}>
                {hito.label}
              </span>
              {hito.fecha && (
                <span className="text-xs text-muted-foreground">
                  · {new Date(hito.fecha).toLocaleDateString('es-NI')}
                </span>
              )}
            </div>
            {idx < hitos.length - 1 && (
              <div className={`h-px w-6 ${activo ? 'bg-primary/40' : 'bg-muted-foreground/20'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
