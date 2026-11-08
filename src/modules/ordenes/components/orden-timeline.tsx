import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ESTADO_LABELS } from '../constants/estados-orden';
import type { OrdenConRelaciones } from '../types';

interface OrdenTimelineProps {
  historial: OrdenConRelaciones['historialEstados'];
}

export function OrdenTimeline({ historial }: OrdenTimelineProps) {
  if (historial.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de estados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sin cambios registrados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Historial de estados</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l border-border pl-6">
          {historial.map((h, idx) => (
            <li key={h.id} className="relative">
              {/* Punto en el timeline */}
              <span
                className={`absolute top-1.5 -left-[1.71rem] flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-background ${
                  idx === 0 ? 'bg-primary' : 'bg-muted-foreground/40'
                }`}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {h.estadoAnterior
                      ? `${ESTADO_LABELS[h.estadoAnterior]} → ${ESTADO_LABELS[h.estadoNuevo]}`
                      : ESTADO_LABELS[h.estadoNuevo]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(h.createdAt).toLocaleString('es-NI')}
                  </span>
                </div>
                {h.comentario && <p className="text-sm text-muted-foreground">{h.comentario}</p>}
                {h.usuario && (
                  <p className="text-xs text-muted-foreground">Por: {h.usuario.nombre}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
