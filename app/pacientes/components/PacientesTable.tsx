'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { Button } from '@/components/ui/button';
import { HelpIcon } from '@/app/components/common/InfoTooltip';
import { STATE_COLORS, formatDate } from '@/app/lib/crm-data';
import type { Paciente } from '@/types/pacientes';

interface PacientesTableProps {
  pacientes: Paciente[];
  emptyMessage: string;
  onHover?: (id: string) => void;
}

export const PacientesTable = React.memo(function PacientesTable({ 
  pacientes, 
  emptyMessage,
  onHover 
}: PacientesTableProps) {
  const router = useRouter();

  const headers = useMemo(() => [
    { 
      key: 'nombre', 
      label: (
        <div className="flex items-center gap-1.5">
          <span>Paciente</span>
          <HelpIcon content="Nombre completo y teléfono de contacto" side="bottom" />
        </div>
      )
    },
    { 
      key: 'actividad', 
      label: (
        <div className="flex items-center gap-1.5">
          <span>Actividad</span>
          <HelpIcon content="Número total de consultas registradas" side="bottom" />
        </div>
      )
    },
    { 
      key: 'estado', 
      label: (
        <div className="flex items-center gap-1.5">
          <span>Estado</span>
          <HelpIcon content="Activo: paciente con consultas recientes | Inactivo: sin actividad prolongada" side="bottom" />
        </div>
      )
    },
    { 
      key: 'ultimaConsulta', 
      label: (
        <div className="flex items-center gap-1.5">
          <span>Última consulta</span>
          <HelpIcon content="Fecha de la consulta más reciente y días transcurridos" side="bottom" />
        </div>
      )
    },
    { 
      key: 'acciones', 
      label: (
        <div className="flex items-center gap-1.5">
          <span>Acciones</span>
          <HelpIcon content="Ver historial completo, agendar nueva consulta o contactar al paciente" side="bottom" />
        </div>
      )
    },
  ], []);

  const rows = useMemo(() => pacientes.map((paciente) => ({
    id: paciente.id,
    nombre: (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{paciente.nombre}</span>
          {paciente.esReciente && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Nuevo
            </span>
          )}
        </div>
        <span className="text-xs text-white/40">{paciente.telefono}</span>
      </div>
    ),
    actividad: (
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-white/70">
            {paciente.totalConsultas} {paciente.totalConsultas === 1 ? 'consulta' : 'consultas'}
          </span>
          {paciente.requiereAtencion && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Atención
            </span>
          )}
        </div>
      </div>
    ),
    estado: <Badge label={paciente.estado} tone={STATE_COLORS[paciente.estado]} />,
    ultimaConsulta: (
      <div className="flex flex-col gap-1 text-xs">
        <span className="text-white/70">
          {paciente.ultimaConsulta ? formatDate(paciente.ultimaConsulta) : 'Sin consulta previa'}
        </span>
        {paciente.diasDesdeUltimaConsulta !== null && (
          <span className="text-white/50">
            Hace {paciente.diasDesdeUltimaConsulta}d
          </span>
        )}
      </div>
    ),
    acciones: (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/pacientes/${paciente.id}`);
          }}
        >
          Ver historial
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            window.open(`https://wa.me/52${paciente.telefono}`, '_blank');
          }}
          title="Contactar por WhatsApp"
        >
          💬
        </Button>
      </div>
    ),
  })), [pacientes, router]);

  return (
    <DataTable
      headers={headers}
      rows={rows}
      empty={emptyMessage}
      mobileConfig={{
        primary: 'nombre',
        secondary: 'actividad',
        metadata: ['estado', 'ultimaConsulta']
      }}
      onRowHover={onHover}
    />
  );
});
