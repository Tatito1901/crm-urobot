'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { Button } from '@/components/ui/button';
import { HelpIcon } from '@/app/components/common/InfoTooltip';
import { STATE_COLORS, formatDate } from '@/app/lib/crm-data';
import { Eye, Calendar, MessageCircle, MoreHorizontal, Stethoscope, FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Paciente } from '@/types/pacientes';
import { DestinoPacienteModal } from '../[id]/components/DestinoPacienteModal';
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
  const [destinoModalOpen, setDestinoModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenDestino = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setDestinoModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveDestino = async (destino: any) => {
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
        <div className="flex items-center justify-end gap-1.5">
          <span>Acciones</span>
        </div>
      ),
      align: 'right' as const
    },
  ], []);

  const rows = useMemo(() => pacientes.map((paciente) => {
    const estado = paciente.estado || 'Activo';
    
    return {
      id: paciente.id,
      nombre: (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{paciente.nombre || 'Sin nombre'}</span>
          </div>
          <span className="text-xs text-muted-foreground">{paciente.telefono}</span>
        </div>
      ),
      actividad: (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-foreground">
              {paciente.totalConsultas ?? 0} {paciente.totalConsultas === 1 ? 'consulta' : 'consultas'}
            </span>
          </div>
        </div>
      ),
      estado: <Badge label={estado} tone={STATE_COLORS[estado]} />,
      ultimaConsulta: (
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-foreground">
            {paciente.ultimaConsulta ? formatDate(paciente.ultimaConsulta) : 'Sin consulta previa'}
          </span>
        </div>
      ),
      acciones: (
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center justify-end gap-0.5">
            {/* Botón principal: Ver perfil */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/pacientes/${paciente.id}`);
                  }}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-popover text-popover-foreground border">
                <p className="text-xs font-medium">Ver perfil completo</p>
              </TooltipContent>
            </Tooltip>

            {/* Botón WhatsApp - el más usado */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://wa.me/52${paciente.telefono}`, '_blank');
                  }}
                  className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-popover text-popover-foreground border">
                <p className="text-xs font-medium">Enviar WhatsApp</p>
              </TooltipContent>
            </Tooltip>

            {/* Menú de más acciones */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/agenda?paciente=${paciente.id}`);
                  }}
                  className="gap-2 cursor-pointer"
                >
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Agendar consulta</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDestino(paciente);
                  }}
                  className="gap-2 cursor-pointer"
                >
                  <Stethoscope className="h-4 w-4 text-indigo-500" />
                  <span>Registrar cirugía</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/pacientes/${paciente.id}#notas`);
                  }}
                  className="gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span>Agregar nota</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
      ),
    };
  }), [pacientes, router]);

  return (
    <>
      {/* Notificación Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border transition-all animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'success' 
            ? 'bg-background border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10' 
            : 'bg-background border-red-500/20 text-red-600 dark:text-red-400 shadow-red-500/10'
        }`}>
          <div className={`p-1 rounded-full ${notification.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {notification.type === 'success' 
              ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            }
          </div>
          <span className="text-sm font-medium text-foreground">{notification.message}</span>
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
          pacienteNombre={selectedPaciente.nombre || 'Paciente'}
        />
      )}
    </>
  );
});
