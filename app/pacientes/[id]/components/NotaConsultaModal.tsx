import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Save, Loader2, FileText, Stethoscope, ClipboardList, 
  Brain, Target, Clock, CheckCircle2, AlertCircle,
  ChevronDown, Sparkles
} from 'lucide-react';

// Estructura SOAP para notas clínicas
interface NotaSOAP {
  subjetivo: string;    // Lo que el paciente reporta
  objetivo: string;     // Hallazgos del examen físico
  analisis: string;     // Diagnóstico/Impresión clínica
  plan: string;         // Plan de tratamiento
  notasAdicionales: string;
}

interface NotaConsultaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nota: string) => Promise<void>;
  notaInicial?: string;
  titulo: string;
  consulta?: {
    tipoCita?: string;
    motivoConsulta?: string;
    sede?: string;
  };
}

// Plantillas rápidas por sección
const PLANTILLAS = {
  subjetivo: [
    'Paciente refiere mejoría de síntomas',
    'Sin cambios desde última consulta',
    'Refiere molestias urinarias',
    'Presenta dolor en región lumbar',
  ],
  objetivo: [
    'Signos vitales estables',
    'Abdomen blando, sin dolor a la palpación',
    'Sin hallazgos patológicos',
    'Próstata de tamaño normal',
  ],
  analisis: [
    'Evolución favorable',
    'Pendiente resultados de laboratorio',
    'Cuadro compatible con ITU',
    'HPB sintomática',
  ],
  plan: [
    'Continuar tratamiento actual',
    'Solicitar estudios de laboratorio',
    'Cita de seguimiento en 1 mes',
    'Referir a especialista',
  ],
};

// Parser y serializer para el formato SOAP
function parseNotaToSOAP(nota: string): NotaSOAP {
  const defaultSOAP: NotaSOAP = {
    subjetivo: '',
    objetivo: '',
    analisis: '',
    plan: '',
    notasAdicionales: '',
  };

  if (!nota) return defaultSOAP;

  // Intentar parsear formato estructurado
  const sections: Record<string, keyof NotaSOAP> = {
    '## SUBJETIVO': 'subjetivo',
    '## OBJETIVO': 'objetivo',
    '## ANÁLISIS': 'analisis',
    '## PLAN': 'plan',
    '## NOTAS ADICIONALES': 'notasAdicionales',
  };

  let currentSection: keyof NotaSOAP | null = null;
  const lines = nota.split('\n');
  
  for (const line of lines) {
    const sectionKey = Object.keys(sections).find(key => line.startsWith(key));
    if (sectionKey) {
      currentSection = sections[sectionKey];
    } else if (currentSection) {
      defaultSOAP[currentSection] += (defaultSOAP[currentSection] ? '\n' : '') + line;
    }
  }

  // Si no tiene formato estructurado, poner todo en notas adicionales
  if (!Object.values(defaultSOAP).some(v => v.trim())) {
    defaultSOAP.notasAdicionales = nota;
  }

  // Limpiar espacios
  Object.keys(defaultSOAP).forEach(key => {
    defaultSOAP[key as keyof NotaSOAP] = defaultSOAP[key as keyof NotaSOAP].trim();
  });

  return defaultSOAP;
}

function serializeSOAPToNota(soap: NotaSOAP): string {
  const parts: string[] = [];
  
  if (soap.subjetivo.trim()) {
    parts.push(`## SUBJETIVO\n${soap.subjetivo.trim()}`);
  }
  if (soap.objetivo.trim()) {
    parts.push(`## OBJETIVO\n${soap.objetivo.trim()}`);
  }
  if (soap.analisis.trim()) {
    parts.push(`## ANÁLISIS\n${soap.analisis.trim()}`);
  }
  if (soap.plan.trim()) {
    parts.push(`## PLAN\n${soap.plan.trim()}`);
  }
  if (soap.notasAdicionales.trim()) {
    parts.push(`## NOTAS ADICIONALES\n${soap.notasAdicionales.trim()}`);
  }

  return parts.join('\n\n');
}

type SeccionSOAP = 'subjetivo' | 'objetivo' | 'analisis' | 'plan' | 'notasAdicionales';

export const NotaConsultaModal: React.FC<NotaConsultaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  notaInicial = '',
  titulo,
  consulta
}) => {
  const [soap, setSOAP] = useState<NotaSOAP>(() => parseNotaToSOAP(notaInicial));
  const [activeSection, setActiveSection] = useState<SeccionSOAP>('subjetivo');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPlantillas, setShowPlantillas] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSOAP(parseNotaToSOAP(notaInicial));
      setHasChanges(false);
      setActiveSection('subjetivo');
    }
  }, [notaInicial, isOpen]);

  const updateSection = useCallback((section: SeccionSOAP, value: string) => {
    setSOAP(prev => ({ ...prev, [section]: value }));
    setHasChanges(true);
  }, []);

  const insertPlantilla = useCallback((texto: string) => {
    setSOAP(prev => ({
      ...prev,
      [activeSection]: prev[activeSection] 
        ? `${prev[activeSection]}\n${texto}` 
        : texto
    }));
    setHasChanges(true);
    setShowPlantillas(false);
  }, [activeSection]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const notaSerializada = serializeSOAPToNota(soap);
      await onSave(notaSerializada);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Error saving nota:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const secciones: { id: SeccionSOAP; label: string; icon: React.ReactNode; color: string; placeholder: string }[] = [
    { 
      id: 'subjetivo', 
      label: 'Subjetivo', 
      icon: <Stethoscope className="h-4 w-4" />,
      color: 'blue',
      placeholder: 'Síntomas reportados por el paciente, historia actual, quejas principales...'
    },
    { 
      id: 'objetivo', 
      label: 'Objetivo', 
      icon: <ClipboardList className="h-4 w-4" />,
      color: 'emerald',
      placeholder: 'Hallazgos del examen físico, signos vitales, resultados de estudios...'
    },
    { 
      id: 'analisis', 
      label: 'Análisis', 
      icon: <Brain className="h-4 w-4" />,
      color: 'purple',
      placeholder: 'Diagnóstico diferencial, impresión clínica, interpretación de hallazgos...'
    },
    { 
      id: 'plan', 
      label: 'Plan', 
      icon: <Target className="h-4 w-4" />,
      color: 'amber',
      placeholder: 'Plan de tratamiento, estudios a solicitar, medicamentos, próxima cita...'
    },
    { 
      id: 'notasAdicionales', 
      label: 'Notas', 
      icon: <FileText className="h-4 w-4" />,
      color: 'slate',
      placeholder: 'Observaciones adicionales, recordatorios, información relevante...'
    },
  ];

  const seccionActiva = secciones.find(s => s.id === activeSection)!;
  const plantillasActivas = PLANTILLAS[activeSection as keyof typeof PLANTILLAS] || [];

  // Contar secciones completadas
  const seccionesCompletadas = secciones.filter(s => soap[s.id].trim().length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nota Clínica SOAP</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">{titulo}</p>
                {consulta?.tipoCita && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                    {consulta.tipoCita}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Indicador de cambios */}
            {hasChanges && (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full">
                <AlertCircle className="h-3 w-3" />
                Sin guardar
              </span>
            )}
            
            {/* Progreso */}
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {seccionesCompletadas}/5 secciones
            </span>
            
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Motivo de consulta si existe */}
        {consulta?.motivoConsulta && (
          <div className="px-6 py-3 bg-blue-50/50 dark:bg-blue-500/5 border-b border-blue-100 dark:border-blue-500/10">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Motivo de consulta:</p>
            <p className="text-sm text-blue-900 dark:text-blue-100 mt-0.5">{consulta.motivoConsulta}</p>
          </div>
        )}

        {/* Tabs de secciones */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 overflow-x-auto">
          {secciones.map((seccion) => {
            const isActive = activeSection === seccion.id;
            const hasContent = soap[seccion.id].trim().length > 0;
            
            return (
              <button
                key={seccion.id}
                onClick={() => setActiveSection(seccion.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-all
                  ${isActive 
                    ? `border-${seccion.color}-500 text-${seccion.color}-600 dark:text-${seccion.color}-400 bg-${seccion.color}-50/50 dark:bg-${seccion.color}-500/5` 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }
                `}
                style={{
                  borderColor: isActive ? `var(--${seccion.color}-500, #3b82f6)` : 'transparent',
                }}
              >
                <span className={isActive ? `text-${seccion.color}-500` : ''}>{seccion.icon}</span>
                {seccion.label}
                {hasContent && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Área de edición */}
        <div className="flex-1 flex flex-col min-h-0 p-6">
          {/* Header de sección con plantillas */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg bg-${seccionActiva.color}-100 dark:bg-${seccionActiva.color}-500/10 text-${seccionActiva.color}-600 dark:text-${seccionActiva.color}-400`}>
                {seccionActiva.icon}
              </span>
              <h4 className="font-medium text-slate-900 dark:text-white">{seccionActiva.label}</h4>
            </div>
            
            {/* Botón de plantillas rápidas */}
            {plantillasActivas.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowPlantillas(!showPlantillas)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Plantillas rápidas
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showPlantillas ? 'rotate-180' : ''}`} />
                </button>
                
                {showPlantillas && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-10 py-1">
                    {plantillasActivas.map((plantilla, idx) => (
                      <button
                        key={idx}
                        onClick={() => insertPlantilla(plantilla)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        {plantilla}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Textarea principal */}
          <textarea
            value={soap[activeSection]}
            onChange={(e) => updateSection(activeSection, e.target.value)}
            className="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm leading-relaxed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            placeholder={seccionActiva.placeholder}
            autoFocus
          />
          
          {/* Contador de caracteres */}
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Último guardado: {notaInicial ? 'Guardado previamente' : 'Nueva nota'}</span>
            </div>
            <span>{soap[activeSection].length} caracteres</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            💡 Usa las plantillas rápidas para agilizar el registro
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Nota
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
