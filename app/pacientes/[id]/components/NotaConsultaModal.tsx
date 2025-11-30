import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Save, Loader2, FileText, Sparkles, 
  Clock, AlertCircle, ChevronDown
} from 'lucide-react';

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

// Plantillas de frases comunes para inserción rápida
const FRASES_COMUNES = [
  'Paciente refiere mejoría significativa.',
  'Se solicita estudio de laboratorio control.',
  'Continúa con el mismo tratamiento.',
  'Signos vitales dentro de parámetros normales.',
  'Se explica el procedimiento y riesgos al paciente.',
  'Cita de seguimiento en 1 mes.',
];

export const NotaConsultaModal: React.FC<NotaConsultaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  notaInicial = '',
  titulo,
  consulta
}) => {
  const [nota, setNota] = useState(notaInicial);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPlantillas, setShowPlantillas] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNota(notaInicial);
      setHasChanges(false);
      // Auto-focus al abrir
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [notaInicial, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNota(e.target.value);
    setHasChanges(true);
  };

  const insertFrase = (frase: string) => {
    setNota(prev => {
      const prefix = prev.trim() ? '\n' : '';
      return prev + prefix + frase;
    });
    setHasChanges(true);
    setShowPlantillas(false);
    textareaRef.current?.focus();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(nota);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Error saving nota:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col h-[85vh] max-h-[800px] animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nota Clínica</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">{titulo}</p>
                {consulta?.tipoCita && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
                    {consulta.tipoCita}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Indicador de cambios */}
            {hasChanges && (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-500/20">
                <AlertCircle className="h-3 w-3" />
                Sin guardar
              </span>
            )}
            
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Motivo de consulta context */}
        {consulta?.motivoConsulta && (
          <div className="px-6 py-2 bg-blue-50/50 dark:bg-blue-500/5 border-b border-blue-100 dark:border-blue-500/10 flex items-start gap-2">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap mt-0.5">Motivo:</p>
            <p className="text-sm text-blue-900 dark:text-blue-100 line-clamp-1">{consulta.motivoConsulta}</p>
          </div>
        )}

        {/* Toolbar de Herramientas */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowPlantillas(!showPlantillas)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Frases Rápidas
                <ChevronDown className={`h-3 w-3 transition-transform ${showPlantillas ? 'rotate-180' : ''}`} />
              </button>
              
              {showPlantillas && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowPlantillas(false)} />
                  <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-500">Insertar frase</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {FRASES_COMUNES.map((frase, idx) => (
                        <button
                          key={idx}
                          onClick={() => insertFrase(frase)}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-b last:border-0 border-slate-50 dark:border-slate-700/50"
                        >
                          {frase}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{nota.length} caracteres</span>
          </div>
        </div>

        {/* Área de edición principal */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={nota}
            onChange={handleChange}
            className="w-full h-full p-6 bg-white dark:bg-[#0f1623] resize-none focus:outline-none text-base leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-sans"
            placeholder="Escriba las notas de la consulta aquí..."
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-between z-10">
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Se guardará en el historial clínico del paciente.
          </p>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-white hover:shadow-sm dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || (!hasChanges && !notaInicial)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm font-medium"
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
