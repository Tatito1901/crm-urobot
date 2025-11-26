'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { Button } from '@/components/ui/button';
import { HelpIcon } from '@/app/components/common/InfoTooltip';
import { STATE_COLORS, formatDate } from '@/app/lib/crm-data';
import { MoreHorizontal, History, Target } from 'lucide-react';
import type { Paciente } from '@/types/pacientes';
import { DestinoPacienteModal } from '../[id]/components/DestinoPacienteModal';
import type { DestinoPaciente } from '@/types/pacientes';
import { updatePacienteDestino } from '../[id]/services/paciente-service';

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [destinoModalOpen, setDestinoModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenDestino = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setDestinoModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveDestino = async (destino: DestinoPaciente) => {
    if (!selectedPaciente?.id) return;
    
    const result = await updatePacienteDestino(selectedPaciente.id, destino);
    
    if (result.success) {
      setNotification({ type: 'success', message: 'Destino registrado correctamente' });
      setTimeout(() => setNotification(null), 3000);
    } else {
      setNotification({ type: 'error', message: result.error || 'Error al registrar destino' });
      setTimeout(() => setNotification(null), 5000);
    }
    
    setDestinoModalOpen(false);
    setSelectedPaciente(null);
  };

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
          <span className="font-medium text-foreground">{paciente.nombre}</span>
          {paciente.esReciente && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 border-blue-200 border dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20">
              Nuevo
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{paciente.telefono}</span>
      </div>
    ),
    actividad: (
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-foreground">
            {paciente.totalConsultas} {paciente.totalConsultas === 1 ? 'consulta' : 'consultas'}
          </span>
          {paciente.requiereAtencion && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 border-amber-200 border dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
              Atención
            </span>
          )}
        </div>
      </div>
    ),
    estado: <Badge label={paciente.estado} tone={STATE_COLORS[paciente.estado]} />,
    ultimaConsulta: (
      <div className="flex flex-col gap-1 text-xs">
        <span className="text-foreground">
          {paciente.ultimaConsulta ? formatDate(paciente.ultimaConsulta) : 'Sin consulta previa'}
        </span>
        {paciente.diasDesdeUltimaConsulta !== null && (
          <span className="text-muted-foreground">
            Hace {paciente.diasDesdeUltimaConsulta}d
          </span>
        )}
      </div>
    ),
    acciones: (
      <div className="flex items-center gap-2">
        {/* Dropdown de acciones */}
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === paciente.id ? null : paciente.id);
            }}
            className="flex items-center gap-1.5"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Acciones</span>
          </Button>
          
          {openMenuId === paciente.id && (
            <>
              {/* Backdrop para cerrar */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setOpenMenuId(null)}
              />
              {/* Menu dropdown */}
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(null);
                    router.push(`/pacientes/${paciente.id}`);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <History className="h-4 w-4 text-blue-500" />
                  Ver historial
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDestino(paciente);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Target className="h-4 w-4 text-indigo-500" />
                  Registrar destino
                </button>
              </div>
            </>
          )}
        </div>
        
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
  })), [pacientes, router, openMenuId]);

  return (
    <>
      {/* Notificación Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

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

      {/* Modal de Destino */}
      {selectedPaciente && (
        <DestinoPacienteModal
          isOpen={destinoModalOpen}
          onClose={() => {
            setDestinoModalOpen(false);
            setSelectedPaciente(null);
          }}
          onSave={handleSaveDestino}
          pacienteNombre={selectedPaciente.nombre}
        />
      )}
    </>
  );
});
