/**
 * ============================================================
 * HOOK: useAppointmentForm - Manejo de formulario de cita
 * ============================================================
 * Hook para manejar estado y validación del formulario de cita
 */

import { useState, useCallback, useMemo } from 'react';
import type { TimeSlot } from '@/types/agenda';
import {
  validateAppointmentForm,
  getDefaultDuration,
  type AppointmentFormData,
  type FormErrors,
} from '../lib/validation-rules';

interface UseAppointmentFormOptions {
  initialSlot?: TimeSlot;
  onSubmit?: (data: AppointmentFormData) => Promise<void>;
}

export function useAppointmentForm(options: UseAppointmentFormOptions = {}) {
  const { initialSlot, onSubmit } = options;

  // Estado del formulario
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    patientName: '',
    tipo: 'primera_vez',
    motivoConsulta: '',
    duracionMinutos: 45,
    sede: initialSlot?.sede || 'POLANCO',
    modalidad: 'presencial',
    prioridad: 'normal',
    notasInternas: '',
  });

  // Errores de validación
  const [errors, setErrors] = useState<FormErrors>({});

  // Campos tocados (para mostrar errores solo en campos editados)
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Estado de submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Actualizar un campo del formulario
   */
  const updateField = useCallback(
    <K extends keyof AppointmentFormData>(field: K, value: AppointmentFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Limpiar error del campo al editar
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      // Limpiar error general de submit
      if (submitError) {
        setSubmitError(null);
      }

      // Si cambia el tipo, actualizar duración por defecto
      if (field === 'tipo') {
        const defaultDuration = getDefaultDuration(value as string);
        setFormData((prev) => ({ ...prev, duracionMinutos: defaultDuration }));
      }
    },
    [errors, submitError]
  );

  /**
   * Marcar campo como tocado
   */
  const touchField = useCallback((field: keyof AppointmentFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  /**
   * Validar formulario completo
   */
  const validate = useCallback(() => {
    const validationErrors = validateAppointmentForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData, initialSlot]);

  /**
   * Manejar submit del formulario
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Marcar todos los campos como tocados
      const allTouched = Object.keys(formData).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // Validar
      if (!validate()) {
        return false;
      }

      // Submit
      if (onSubmit) {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
          await onSubmit(formData);
          return true;
        } catch (error) {
          setSubmitError(error instanceof Error ? error.message : 'Error al guardar la cita');
          return false;
        } finally {
          setIsSubmitting(false);
        }
      }

      return true;
    },
    [formData, validate, onSubmit]
  );

  /**
   * Resetear formulario
   */
  const reset = useCallback(() => {
    setFormData({
      patientId: '',
      patientName: '',
      tipo: 'primera_vez',
      motivoConsulta: '',
      duracionMinutos: 45,
      sede: initialSlot?.sede || 'POLANCO',
      modalidad: 'presencial',
      prioridad: 'normal',
      notasInternas: '',
    });
    setErrors({});
    setTouched({});
    setSubmitError(null);
  }, [initialSlot]);

  // Calcular si el formulario es válido
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && formData.patientId !== '';
  }, [errors, formData.patientId]);

  // Calcular si hay cambios
  const isDirty = useMemo(() => {
    return Object.keys(touched).length > 0;
  }, [touched]);

  return {
    // Estado
    formData,
    errors,
    touched,
    isSubmitting,
    submitError,
    isValid,
    isDirty,

    // Métodos
    updateField,
    touchField,
    validate,
    handleSubmit,
    reset,
  };
}
