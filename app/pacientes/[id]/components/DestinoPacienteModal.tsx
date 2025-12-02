/**
 * ============================================================
 * DESTINO PACIENTE MODAL
 * ============================================================
 * Modal para registrar el destino del paciente:
 * - Alta definitiva
 * - Presupuesto enviado para cirugía
 * - Cirugía realizada
 * - Seguimiento
 */

'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, FileText, Scissors, Clock, DollarSign, MapPin, AlertCircle, Save, Plus, Send, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  type TipoDestino,
  TIPOS_DESTINO, 
  TIPOS_CIRUGIA, 
  DESTINO_LABELS 
} from '@/types/destinos-pacientes';

// Tipos locales para el modal (UI)
interface PresupuestoCirugia {
  tipoCirugia?: string;
  monto?: number;
  moneda: 'MXN' | 'USD';
  fechaEnvio?: string;
  inclusiones?: string[];
  notas?: string;
  sede?: 'polanco' | 'satelite';
}

interface CirugiaRealizada {
  tipoCirugia?: string;
  costo?: number;
  moneda: 'MXN' | 'USD';
  fechaCirugia?: string;
  sedeOperacion?: string;
  notas?: string;
}

interface DestinoPaciente {
  tipo: TipoDestino;
  fechaRegistro: string;
  observaciones?: string;
  motivoAlta?: string;
  presupuesto?: PresupuestoCirugia;
  cirugia?: CirugiaRealizada;
}

// Import dinámico para jspdf (para evitar errores en build si no se usa)
// Nota: Requiere instalar jspdf y jspdf-autotable
// npm install jspdf jspdf-autotable

interface DestinoPacienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (destino: DestinoPaciente) => void;
  destinoActual?: DestinoPaciente;
  pacienteNombre: string;
}

export const DestinoPacienteModal: React.FC<DestinoPacienteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  destinoActual,
  pacienteNombre,
}) => {
  const [tipoDestino, setTipoDestino] = useState<TipoDestino>('pendiente');
  const [observaciones, setObservaciones] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Estado para Alta
  const [motivoAlta, setMotivoAlta] = useState('');
  
  // Estado para Presupuesto
  const [presupuesto, setPresupuesto] = useState<Partial<PresupuestoCirugia>>({
    moneda: 'MXN',
    fechaEnvio: new Date().toISOString().split('T')[0],
    inclusiones: ['Honorarios Médicos', 'Hospitalización (1 noche)', 'Materiales y Medicamentos'],
    sede: 'polanco' // Default
  });
  const [nuevoItemInclusion, setNuevoItemInclusion] = useState('');

  // Direcciones de Sedes
  const SEDES = {
    polanco: {
      nombre: 'Hospital Angeles Santa Mónica',
      direccion: [
        'Calle Temístocles 210',
        'Consultorio 206',
        'Polanco, Miguel Hidalgo, CDMX',
        'Tel: 55 8437 9587'
      ]
    },
    satelite: {
      nombre: 'Hospital San Angel Inn Satélite',
      direccion: [
        'Cto. Centro Comercial 22',
        'Consultorio 1415',
        'Cd. Satélite, Naucalpan, Edo. Méx.',
        'Tel: 55 5572 1463'
      ]
    }
  };

  // Estado para Cirugía
  const [cirugia, setCirugia] = useState<Partial<CirugiaRealizada>>({
    moneda: 'MXN',
    fechaCirugia: new Date().toISOString().split('T')[0],
    sedeOperacion: 'Polanco'
  });

  // Cargar datos existentes al abrir
  useEffect(() => {
    if (isOpen && destinoActual) {
      setTipoDestino(destinoActual.tipo);
      setObservaciones(destinoActual.observaciones || '');
      
      if (destinoActual.motivoAlta) {
        setMotivoAlta(destinoActual.motivoAlta);
      }
      
      if (destinoActual.presupuesto) {
        setPresupuesto({
            ...destinoActual.presupuesto,
            inclusiones: destinoActual.presupuesto.inclusiones || ['Honorarios Médicos', 'Hospitalización (1 noche)', 'Materiales y Medicamentos']
        });
      }
      
      if (destinoActual.cirugia) {
        setCirugia(destinoActual.cirugia);
      }
    } else if (isOpen) {
      // Resetear al abrir como nuevo
      setTipoDestino('pendiente');
      setObservaciones('');
      setMotivoAlta('');
      setPresupuesto({ 
        moneda: 'MXN', 
        fechaEnvio: new Date().toISOString().split('T')[0],
        inclusiones: ['Honorarios Médicos', 'Hospitalización (1 noche)', 'Materiales y Medicamentos']
      });
      setCirugia({ moneda: 'MXN', fechaCirugia: new Date().toISOString().split('T')[0], sedeOperacion: 'Polanco' });
    }
  }, [isOpen, destinoActual]);

  const handleAddInclusion = () => {
    if (nuevoItemInclusion.trim()) {
      setPresupuesto(prev => ({
        ...prev,
        inclusiones: [...(prev.inclusiones || []), nuevoItemInclusion.trim()]
      }));
      setNuevoItemInclusion('');
    }
  };

  const handleRemoveInclusion = (index: number) => {
    setPresupuesto(prev => ({
      ...prev,
      inclusiones: (prev.inclusiones || []).filter((_, i) => i !== index)
    }));
  };

  const handleGenerarPDF = async () => {
    if (!presupuesto.tipoCirugia || !presupuesto.monto) {
      toast.warning('Por favor complete el tipo de cirugía y el monto.');
      return;
    }

    setIsGeneratingPdf(true);

    try {
      // Importación dinámica de jsPDF
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();

      // ==========================================
      // CONFIGURACIÓN DE ESTILO
      // ==========================================
      // Colores basados en la imagen proporcionada (Verde URODEX)
      const primaryColor: [number, number, number] = [14, 77, 67]; // #0E4D43 (Verde oscuro elegante)
      const textDark: [number, number, number] = [30, 41, 59]; // Slate 800
      const textGray: [number, number, number] = [100, 116, 139]; // Slate 500

      // ==========================================
      // HEADER (Diseño Minimalista y Formal)
      // ==========================================
      
      // Logo Simulado (Texto) - Más refinado
      // Icono decorativo
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(20, 15, 16, 16, 'F'); // Cuadrado un poco más pequeño
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.8);
      doc.lines([[4, 0], [0, 4], [-4, 0]], 28, 19, [1, 1], 'S', true);

      // Texto URODEX - Tracking visual (espaciado)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('URODEX', 42, 23);

      // Texto Dr. Mario Martínez Thomas
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text('Dr. Mario Martínez Thomas', 42, 29);

      // Subtítulo Especialidad
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text('CIRUGÍA UROLÓGICA DE MÍNIMA INVASIÓN', 42, 33);

      // Info de Contacto (Dinámica según sede) - Alineación derecha limpia
      doc.setFontSize(8);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.setFont('helvetica', 'normal');
      
      const sedeSeleccionada = presupuesto.sede && SEDES[presupuesto.sede] ? SEDES[presupuesto.sede] : SEDES['polanco'];
      
      // Bloque de dirección
      let yPos = 18;
      doc.setFont('helvetica', 'bold');
      doc.text(sedeSeleccionada.nombre, 190, yPos, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      yPos += 4;
      sedeSeleccionada.direccion.forEach(line => {
        doc.text(line, 190, yPos, { align: 'right' });
        yPos += 4;
      });
      doc.text('contacto@urodex.mx', 190, yPos, { align: 'right' });

      // Línea separadora header (Sutil)
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 45, 190, 45);

      // ==========================================
      // DATOS DEL PACIENTE (Diseño sin caja, estilo carta)
      // ==========================================
      
      // Título del Documento
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('PRESUPUESTO QUIRÚRGICO', 105, 60, { align: 'center' });

      const today = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

      // Grid de información (Labels en gris, valores en oscuro)
      const startInfoY = 75;
      
      // Columna Izquierda (Paciente)
      doc.setFontSize(8);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('PACIENTE', 20, startInfoY);
      
      doc.setFontSize(11);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(pacienteNombre, 20, startInfoY + 6);

      // Columna Derecha (Fecha)
      doc.setFontSize(8);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('FECHA DE EMISIÓN', 140, startInfoY);

      doc.setFontSize(11);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(today, 140, startInfoY + 6);

      // Fila 2: Procedimiento
      const row2Y = startInfoY + 18;
      doc.setFontSize(8);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('PROCEDIMIENTO PROPUESTO', 20, row2Y);

      doc.setFontSize(11);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(presupuesto.tipoCirugia || '', 20, row2Y + 6);

      // Línea separadora sutil
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.1);
      doc.line(20, row2Y + 12, 190, row2Y + 12);

      // ==========================================
      // TABLA DE COSTOS (Estilo Formal / Financiero)
      // ==========================================
      autoTable(doc, {
        startY: row2Y + 20,
        head: [['CONCEPTO', 'IMPORTE']],
        body: [
          [
            { content: presupuesto.tipoCirugia?.toUpperCase(), styles: { fontStyle: 'bold' } }, 
            { content: `$${presupuesto.monto?.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${presupuesto.moneda}`, styles: { halign: 'right', fontStyle: 'bold' } }
          ],
        ],
        theme: 'plain', // Tema limpio sin fondo
        headStyles: { 
          fillColor: false, // Sin fondo
          textColor: primaryColor, // Texto verde corporativo
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: { top: 5, bottom: 5, left: 0, right: 0 },
          lineWidth: { top: 0.5, bottom: 0.5 }, // Líneas arriba y abajo del header
          lineColor: primaryColor
        },
        bodyStyles: {
          textColor: textDark,
          fontSize: 11,
          cellPadding: { top: 10, bottom: 10, left: 0, right: 0 },
          lineWidth: { bottom: 0.1 },
          lineColor: [226, 232, 240] as [number, number, number]
        },
        columnStyles: { 
          0: { cellWidth: 'auto' }, 
          1: { cellWidth: 50 } 
        },
        margin: { left: 20, right: 20 }
      });

      // @ts-expect-error - lastAutoTable added by plugin
      let finalY = doc.lastAutoTable.finalY + 15;

      // ==========================================
      // INCLUSIONES (Lista limpia)
      // ==========================================
      if (presupuesto.inclusiones && presupuesto.inclusiones.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('EL PRESUPUESTO INCLUYE:', 20, finalY);
        finalY += 8;

        doc.setFontSize(10);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.setFont('helvetica', 'normal');
        
        presupuesto.inclusiones.forEach((item) => {
          // Bullet point pequeño y elegante
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]); // Usar color primario o acento
          doc.circle(22, finalY - 1.2, 1, 'F'); // Círculo más pequeño
          
          doc.text(item, 28, finalY);
          finalY += 7;
        });
        
        finalY += 10;
      }

      // ==========================================
      // NOTAS / OBSERVACIONES
      // ==========================================
      if (presupuesto.notas) {
        doc.setFontSize(9);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 20, finalY);
        finalY += 6;

        doc.setFontSize(9);
        doc.setTextColor(textGray[0], textGray[1], textGray[2]);
        doc.setFont('helvetica', 'italic');
        
        const splitNotes = doc.splitTextToSize(presupuesto.notas, 170);
        doc.text(splitNotes, 20, finalY);
      }

      // ==========================================
      // FOOTER (Discreto y centrado)
      // ==========================================
      const pageHeight = doc.internal.pageSize.height;
      
      // Línea footer muy fina
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.1);
      doc.line(40, pageHeight - 25, 170, pageHeight - 25);

      // Texto validez
      doc.setFontSize(7);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('ESTE PRESUPUESTO TIENE UNA VALIDEZ DE 15 DÍAS NATURALES A PARTIR DE SU FECHA DE EMISIÓN.', 105, pageHeight - 18, { align: 'center' });
      doc.text('Precios sujetos a cambio sin previo aviso. Aplican restricciones.', 105, pageHeight - 14, { align: 'center' });


      // Guardar y Enviar
      const fileName = `Presupuesto_URODEX_${pacienteNombre.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

      // Simular envío exitoso
      toast.success('Presupuesto generado correctamente.');
      
    } catch {
      toast.error('Hubo un error al generar el PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSave = () => {
    const destino: DestinoPaciente = {
      tipo: tipoDestino,
      fechaRegistro: new Date().toISOString(),
      observaciones: observaciones || undefined,
    };

    if (tipoDestino === 'alta_definitiva' && motivoAlta) {
      destino.motivoAlta = motivoAlta;
    }

    if (tipoDestino === 'presupuesto_enviado' && presupuesto.tipoCirugia) {
      // Validación básica
      if (!presupuesto.monto) {
        toast.warning('Por favor ingresa el monto del presupuesto');
        return;
      }
      destino.presupuesto = presupuesto as PresupuestoCirugia;
    }

    if (tipoDestino === 'cirugia_realizada' && cirugia.tipoCirugia) {
      // Validación básica
      if (!cirugia.costo) {
        toast.warning('Por favor ingresa el costo de la cirugía');
        return;
      }
      destino.cirugia = cirugia as CirugiaRealizada;
    }

    onSave(destino);
    onClose();
  };

  // Evitar renderizado en servidor para createPortal
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Window */}
      <div className="relative w-full max-w-[100vw] sm:max-w-5xl md:max-w-6xl bg-white dark:bg-[#0f1623] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/50 border-x-0 sm:border border-t border-b-0 sm:border-b border-slate-200 dark:border-blue-900/30 flex flex-col h-[92vh] sm:h-[85vh] max-h-[100vh] transition-transform animate-in slide-in-from-bottom-8 zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-blue-900/20 shrink-0 bg-slate-50/50 dark:bg-[#0f1623]">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-1.5 sm:p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <TargetIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              </div>
              <span className="truncate">Destino del Paciente</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate ml-1">
              Acción para <span className="font-medium text-slate-900 dark:text-slate-200">{pacienteNombre}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 scroll-smooth overscroll-contain">
          
          {/* Selección de Tipo - Grid optimizado móvil */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {TIPOS_DESTINO.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoDestino(tipo)}
                className={`
                  relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 gap-1.5 sm:gap-2 min-h-[85px] sm:min-h-[100px] group
                  ${tipoDestino === tipo 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 dark:border-indigo-500 shadow-md shadow-indigo-500/10 scale-[1.02]' 
                    : 'border-border hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-sm'}
                `}
              >
                <div className={`
                  p-2 sm:p-2.5 rounded-xl shrink-0 transition-colors duration-300
                  ${tipoDestino === tipo 
                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300' 
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10'}
                `}>
                  <div className="h-4 w-4 sm:h-5 sm:w-5">
                    {getIconForType(tipo)}
                  </div>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight transition-colors ${
                  tipoDestino === tipo 
                    ? 'text-indigo-700 dark:text-indigo-300' 
                    : 'text-muted-foreground group-hover:text-slate-900 dark:group-hover:text-slate-200'
                }`}>
                  {DESTINO_LABELS[tipo]}
                </span>
                
                {tipoDestino === tipo && (
                  <div className="absolute -top-1.5 -right-1.5 bg-white dark:bg-[#0f1623] rounded-full p-0.5 shadow-sm z-10">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 fill-white dark:fill-[#0f1623]" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Formularios Condicionales */}
          <div className="bg-muted rounded-lg sm:rounded-xl p-4 sm:p-5 border border-border animate-in fade-in zoom-in-95 duration-200">
            
            {/* Formulario Alta Definitiva */}
            {tipoDestino === 'alta_definitiva' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Detalles del Alta</h3>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Motivo del Alta</Label>
                  <Textarea
                    value={motivoAlta}
                    onChange={(e) => setMotivoAlta(e.target.value)}
                    placeholder="Describa el motivo del alta médica..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {/* Formulario Presupuesto Enviado */}
            {tipoDestino === 'presupuesto_enviado' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="font-semibold">Detalles del Presupuesto</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Sección 1: Configuración General */}
                  <div className="space-y-3 border-b border-border pb-4">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Sede y Fecha</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Selector de Sede */}
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-xs font-semibold text-foreground">Sede de Atención</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setPresupuesto({ ...presupuesto, sede: 'polanco' })}
                              className={`
                                relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all
                                ${presupuesto.sede === 'polanco'
                                  ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500 dark:bg-emerald-500/10 dark:border-emerald-500'
                                  : 'bg-white border-slate-200 hover:border-emerald-200 dark:bg-slate-900 dark:border-slate-700'}
                              `}
                            >
                              <div className={`p-2 rounded-lg ${presupuesto.sede === 'polanco' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <MapPin className="h-5 w-5" />
                              </div>
                              <div>
                                <span className={`block text-sm font-bold ${presupuesto.sede === 'polanco' ? 'text-emerald-900 dark:text-emerald-300' : 'text-foreground'}`}>Polanco</span>
                                <span className="block text-xs text-slate-500 mt-0.5">Hospital Angeles</span>
                              </div>
                              {presupuesto.sede === 'polanco' && (
                                <div className="absolute top-3 right-3">
                                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                                </div>
                              )}
                            </button>

                            <button
                              onClick={() => setPresupuesto({ ...presupuesto, sede: 'satelite' })}
                              className={`
                                relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all
                                ${presupuesto.sede === 'satelite'
                                  ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500 dark:bg-emerald-500/10 dark:border-emerald-500'
                                  : 'bg-white border-slate-200 hover:border-emerald-200 dark:bg-slate-900 dark:border-slate-700'}
                              `}
                            >
                              <div className={`p-2 rounded-lg ${presupuesto.sede === 'satelite' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <MapPin className="h-5 w-5" />
                              </div>
                              <div>
                                <span className={`block text-sm font-bold ${presupuesto.sede === 'satelite' ? 'text-emerald-900 dark:text-emerald-300' : 'text-foreground'}`}>Satélite</span>
                                <span className="block text-xs text-slate-500 mt-0.5">San Angel Inn</span>
                              </div>
                              {presupuesto.sede === 'satelite' && (
                                <div className="absolute top-3 right-3">
                                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                                </div>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-foreground">Fecha de Envío</label>
                          <input
                            type="date"
                            value={presupuesto.fechaEnvio}
                            onChange={(e) => setPresupuesto({ ...presupuesto, fechaEnvio: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-border rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          />
                        </div>
                     </div>
                  </div>

                  {/* Sección 2: Detalles Económicos */}
                  <div className="space-y-3 border-b border-border pb-4">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">2. Detalles del Procedimiento</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                          <Label className="text-xs font-semibold">Tipo de Cirugía</Label>
                          <Select
                            value={presupuesto.tipoCirugia || ''}
                            onValueChange={(value) => setPresupuesto({ ...presupuesto, tipoCirugia: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar cirugía..." />
                            </SelectTrigger>
                            <SelectContent>
                              {TIPOS_CIRUGIA.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-foreground">Monto Total (MXN)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="number"
                              value={presupuesto.monto || ''}
                              onChange={(e) => setPresupuesto({ ...presupuesto, monto: Number(e.target.value) })}
                              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Sección 3: Inclusiones */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">3. Inclusiones y Notas</h4>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">Items Incluidos</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={nuevoItemInclusion}
                          onChange={(e) => setNuevoItemInclusion(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddInclusion()}
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-border rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          placeholder="Ej: Honorarios, Hospitalización..."
                        />
                        <button
                          onClick={handleAddInclusion}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors border border-emerald-200"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {presupuesto.inclusiones?.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-full text-sm group animate-in zoom-in-95">
                            <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                              {item}
                            </span>
                            <button
                              onClick={() => handleRemoveInclusion(index)}
                              className="text-slate-400 hover:text-rose-500 transition-colors rounded-full p-0.5 hover:bg-rose-50"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {(!presupuesto.inclusiones || presupuesto.inclusiones.length === 0) && (
                          <p className="text-xs text-slate-400 italic py-1">No hay items incluidos.</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Label className="text-xs font-semibold">Notas Adicionales</Label>
                      <Textarea
                        value={presupuesto.notas || ''}
                        onChange={(e) => setPresupuesto({ ...presupuesto, notas: e.target.value })}
                        placeholder="Condiciones, validez, forma de pago..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

                  {/* Botón Generar PDF */}
                  <div className="pt-4 mt-2 border-t border-border">
                    <button
                      onClick={handleGenerarPDF}
                      disabled={isGeneratingPdf}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Generando Documento...
                        </>
                      ) : (
                        <>
                          <FileDown className="h-5 w-5" />
                          Generar PDF Formal
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
                      <Send className="h-3 w-3" />
                      Listo para enviar por WhatsApp
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario Cirugía Realizada */}
            {tipoDestino === 'cirugia_realizada' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                  <Scissors className="h-5 w-5" />
                  <h3 className="font-semibold">Detalles de la Cirugía</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider">Cirugía Realizada</Label>
                    <Select
                      value={cirugia.tipoCirugia || ''}
                      onValueChange={(value) => setCirugia({ ...cirugia, tipoCirugia: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cirugía..." />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_CIRUGIA.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Costo Final (MXN)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="number"
                        value={cirugia.costo || ''}
                        onChange={(e) => setCirugia({ ...cirugia, costo: Number(e.target.value) })}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Fecha Cirugía</label>
                    <input
                      type="date"
                      value={cirugia.fechaCirugia}
                      onChange={(e) => setCirugia({ ...cirugia, fechaCirugia: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Sede</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={cirugia.sedeOperacion || ''}
                        onChange={(e) => setCirugia({ ...cirugia, sedeOperacion: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="Ej: Polanco, Satélite..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider">Notas de Cirugía</Label>
                    <Textarea
                      value={cirugia.notas || ''}
                      onChange={(e) => setCirugia({ ...cirugia, notas: e.target.value })}
                      placeholder="Complicaciones, observaciones post-op..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mensajes para otros estados */}
            {tipoDestino === 'seguimiento' && (
              <div className="flex items-start gap-3 text-muted-foreground">
                <Clock className="h-5 w-5 mt-0.5 text-blue-500" />
                <p className="text-sm">El paciente continuará en seguimiento regular. Use el campo de observaciones para detallar el plan.</p>
              </div>
            )}

            {tipoDestino === 'pendiente' && (
              <div className="flex items-start gap-3 text-muted-foreground">
                <AlertCircle className="h-5 w-5 mt-0.5 text-amber-500" />
                <p className="text-sm">El estado del paciente está pendiente de definición. Puede agregar notas temporales abajo.</p>
              </div>
            )}
          </div>

          {/* Observaciones Generales */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider">Observaciones Generales</Label>
            <Textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Cualquier otra información relevante sobre el destino del paciente..."
              className="min-h-[80px]"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-blue-900/20 bg-slate-50/80 dark:bg-[#0f1623]/80 backdrop-blur-md flex flex-col sm:flex-row gap-3 shrink-0 rounded-b-none sm:rounded-b-2xl pb-6 sm:pb-6">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto sm:flex-[2] px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 text-sm order-1 sm:order-2"
          >
            <Save className="h-5 w-5" />
            Confirmar Destino
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto sm:flex-none sm:min-w-[140px] px-5 py-3.5 bg-white dark:bg-slate-800/50 text-foreground font-semibold rounded-xl border border-border hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-sm order-2 sm:order-1 shadow-sm hover:shadow"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

// Helper icons
function getIconForType(tipo: TipoDestino) {
  switch (tipo) {
    case 'alta_definitiva': return <CheckCircle className="w-full h-full" />;
    case 'presupuesto_enviado': return <FileText className="w-full h-full" />;
    case 'cirugia_realizada': return <Scissors className="w-full h-full" />;
    case 'seguimiento': return <Clock className="w-full h-full" />;
    case 'pendiente': return <AlertCircle className="w-full h-full" />;
  }
}

function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
