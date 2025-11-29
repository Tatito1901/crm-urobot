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
import { X, CheckCircle, FileText, Scissors, Clock, DollarSign, MapPin, AlertCircle, Save, Plus, Send, FileDown, Loader2 } from 'lucide-react';
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
      alert('Por favor complete el tipo de cirugía y el monto.');
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
      alert('Presupuesto generado correctamente.');
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un error al generar el PDF.');
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
        alert('Por favor ingresa el monto del presupuesto');
        return;
      }
      destino.presupuesto = presupuesto as PresupuestoCirugia;
    }

    if (tipoDestino === 'cirugia_realizada' && cirugia.tipoCirugia) {
      // Validación básica
      if (!cirugia.costo) {
        alert('Por favor ingresa el costo de la cirugía');
        return;
      }
      destino.cirugia = cirugia as CirugiaRealizada;
    }

    onSave(destino);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Window */}
      <div className="relative w-full sm:max-w-2xl md:max-w-3xl bg-white dark:bg-[#0f1623] sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-200 dark:border-blue-900/30 flex flex-col max-h-[92vh] sm:max-h-[88vh] transition-transform animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-blue-900/20 shrink-0">
          <div className="min-w-0 flex-1 mr-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TargetIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
              <span className="truncate">Destino del Paciente</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
              Registrar resultado para <span className="font-medium text-slate-700 dark:text-slate-300">{pacienteNombre}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Selección de Tipo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {TIPOS_DESTINO.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoDestino(tipo)}
                className={`
                  relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 gap-1.5 sm:gap-2 min-h-[80px] sm:min-h-[90px]
                  ${tipoDestino === tipo 
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-600/10 dark:border-blue-500' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                `}
              >
                <div className={`
                  p-1.5 sm:p-2 rounded-full shrink-0
                  ${tipoDestino === tipo ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}
                `}>
                  <div className="h-4 w-4 sm:h-5 sm:w-5">
                    {getIconForType(tipo)}
                  </div>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight ${tipoDestino === tipo ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                  {DESTINO_LABELS[tipo]}
                </span>
                {tipoDestino === tipo && (
                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Formularios Condicionales */}
          <div className="bg-slate-50 dark:bg-[#131b2b] rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-100 dark:border-blue-900/10 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Formulario Alta Definitiva */}
            {tipoDestino === 'alta_definitiva' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Detalles del Alta</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Motivo del Alta</label>
                  <textarea
                    value={motivoAlta}
                    onChange={(e) => setMotivoAlta(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[100px]"
                    placeholder="Describa el motivo del alta médica..."
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
                  <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Sede y Fecha</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Selector de Sede */}
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sede de Atención</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setPresupuesto({ ...presupuesto, sede: 'polanco' })}
                              className={`
                                relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:shadow-md
                                ${presupuesto.sede === 'polanco'
                                  ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500 dark:bg-emerald-500/10 dark:border-emerald-500'
                                  : 'bg-white border-slate-200 hover:border-emerald-200 dark:bg-slate-900 dark:border-slate-700'}
                              `}
                            >
                              <div className={`p-2 rounded-lg ${presupuesto.sede === 'polanco' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <MapPin className="h-5 w-5" />
                              </div>
                              <div>
                                <span className={`block text-sm font-bold ${presupuesto.sede === 'polanco' ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>Polanco</span>
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
                                relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:shadow-md
                                ${presupuesto.sede === 'satelite'
                                  ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500 dark:bg-emerald-500/10 dark:border-emerald-500'
                                  : 'bg-white border-slate-200 hover:border-emerald-200 dark:bg-slate-900 dark:border-slate-700'}
                              `}
                            >
                              <div className={`p-2 rounded-lg ${presupuesto.sede === 'satelite' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <MapPin className="h-5 w-5" />
                              </div>
                              <div>
                                <span className={`block text-sm font-bold ${presupuesto.sede === 'satelite' ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>Satélite</span>
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
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fecha de Envío</label>
                          <input
                            type="date"
                            value={presupuesto.fechaEnvio}
                            onChange={(e) => setPresupuesto({ ...presupuesto, fechaEnvio: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          />
                        </div>
                     </div>
                  </div>

                  {/* Sección 2: Detalles Económicos */}
                  <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">2. Detalles del Procedimiento</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipo de Cirugía</label>
                          <select
                            value={presupuesto.tipoCirugia || ''}
                            onChange={(e) => setPresupuesto({ ...presupuesto, tipoCirugia: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          >
                            <option value="">Seleccionar cirugía...</option>
                            {TIPOS_CIRUGIA.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monto Total (MXN)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="number"
                              value={presupuesto.monto || ''}
                              onChange={(e) => setPresupuesto({ ...presupuesto, monto: Number(e.target.value) })}
                              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
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
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Items Incluidos</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={nuevoItemInclusion}
                          onChange={(e) => setNuevoItemInclusion(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddInclusion()}
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
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
                          <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm group animate-in zoom-in-95">
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
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notas Adicionales</label>
                      <textarea
                        value={presupuesto.notas || ''}
                        onChange={(e) => setPresupuesto({ ...presupuesto, notas: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all min-h-[80px]"
                        placeholder="Condiciones, validez, forma de pago..."
                      />
                    </div>
                  </div>

                  {/* Botón Generar PDF */}
                  <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
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
                          <FileDown className="h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
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
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Cirugía Realizada</label>
                    <select
                      value={cirugia.tipoCirugia || ''}
                      onChange={(e) => setCirugia({ ...cirugia, tipoCirugia: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="">Seleccionar cirugía...</option>
                      {TIPOS_CIRUGIA.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Costo Final (MXN)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="number"
                        value={cirugia.costo || ''}
                        onChange={(e) => setCirugia({ ...cirugia, costo: Number(e.target.value) })}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fecha Cirugía</label>
                    <input
                      type="date"
                      value={cirugia.fechaCirugia}
                      onChange={(e) => setCirugia({ ...cirugia, fechaCirugia: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Sede</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={cirugia.sedeOperacion || ''}
                        onChange={(e) => setCirugia({ ...cirugia, sedeOperacion: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="Ej: Polanco, Satélite..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Notas de Cirugía</label>
                    <textarea
                      value={cirugia.notas || ''}
                      onChange={(e) => setCirugia({ ...cirugia, notas: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[80px]"
                      placeholder="Complicaciones, observaciones post-op..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mensajes para otros estados */}
            {tipoDestino === 'seguimiento' && (
              <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                <Clock className="h-5 w-5 mt-0.5 text-blue-500" />
                <p className="text-sm">El paciente continuará en seguimiento regular. Use el campo de observaciones para detallar el plan.</p>
              </div>
            )}

            {tipoDestino === 'pendiente' && (
              <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                <AlertCircle className="h-5 w-5 mt-0.5 text-amber-500" />
                <p className="text-sm">El estado del paciente está pendiente de definición. Puede agregar notas temporales abajo.</p>
              </div>
            )}
          </div>

          {/* Observaciones Generales */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Observaciones Generales</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#131b2b] border border-slate-200 dark:border-blue-900/30 rounded-lg text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[80px]"
              placeholder="Cualquier otra información relevante sobre el destino del paciente..."
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-blue-900/20 bg-slate-50 dark:bg-[#0f1623]/50 flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none sm:min-w-[120px] px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm order-2 sm:order-1"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-[2] px-4 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg sm:rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm order-1 sm:order-2"
          >
            <Save className="h-4 w-4" />
            Guardar Destino
          </button>
        </div>

      </div>
    </div>
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
