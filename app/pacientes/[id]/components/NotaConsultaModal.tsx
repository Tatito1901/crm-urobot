import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, FileText } from 'lucide-react';

interface NotaConsultaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nota: string) => Promise<void>;
  notaInicial?: string;
  titulo: string;
}

export const NotaConsultaModal: React.FC<NotaConsultaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  notaInicial = '',
  titulo
}) => {
  const [nota, setNota] = useState(notaInicial);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNota(notaInicial);
  }, [notaInicial, isOpen]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(nota);
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
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nota Clínica</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{titulo}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="w-full h-[400px] p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm leading-relaxed"
            placeholder="Escriba aquí las notas médicas, evolución, diagnóstico y plan de tratamiento..."
          />
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-70 text-sm font-medium"
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
  );
};
