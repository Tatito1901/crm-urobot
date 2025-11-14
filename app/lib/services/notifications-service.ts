/**
 * ============================================================
 * NOTIFICATIONS SERVICE - Servicio de notificaciones y recordatorios
 * ============================================================
 * Base extensible para integrar notificaciones automáticas
 * y recordatorios de citas
 */

import { createClient } from '@/lib/supabase/client';
import type { Consulta } from '@/types/consultas';

const supabase = createClient();

// ============================================================
// TIPOS
// ============================================================

export interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  timing: NotificationTiming[];
}

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push';
export type NotificationTiming = 'immediate' | '1hour' | '24hours' | '48hours';

export interface ReminderSchedule {
  appointmentId: string;
  scheduledFor: Date;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
}

export interface NotificationTemplate {
  type: 'appointment_created' | 'appointment_confirmed' | 'reminder' | 'cancellation';
  subject: string;
  message: string;
  variables: Record<string, string>;
}

// ============================================================
// CONFIGURACIÓN POR DEFECTO
// ============================================================

const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  channels: ['whatsapp', 'sms'],
  timing: ['24hours', '1hour'],
};

// ============================================================
// FUNCIONES DE NOTIFICACIÓN
// ============================================================

/**
 * Programa recordatorios automáticos para una cita
 */
export async function scheduleAppointmentReminders(
  appointment: Consulta,
  config: NotificationConfig = DEFAULT_CONFIG
): Promise<void> {
  if (!config.enabled) return;

  const appointmentDateTime = new Date(`${appointment.fechaConsulta}T${appointment.horaConsulta}`);
  const now = new Date();

  // Calcular tiempos de recordatorio
  const reminders: ReminderSchedule[] = [];

  config.timing.forEach((timing) => {
    let scheduledTime: Date;

    switch (timing) {
      case 'immediate':
        scheduledTime = now;
        break;
      case '1hour':
        scheduledTime = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
        break;
      case '24hours':
        scheduledTime = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '48hours':
        scheduledTime = new Date(appointmentDateTime.getTime() - 48 * 60 * 60 * 1000);
        break;
    }

    // Solo programar si la fecha es futura
    if (scheduledTime > now) {
      config.channels.forEach((channel) => {
        reminders.push({
          appointmentId: appointment.id,
          scheduledFor: scheduledTime,
          channel,
          status: 'pending',
          attempts: 0,
        });
      });
    }
  });

  // TODO: Guardar recordatorios en tabla de base de datos
  console.log('Recordatorios programados:', reminders);
}

/**
 * Envía una notificación de confirmación de cita
 */
export async function sendAppointmentConfirmation(
  appointment: Consulta,
  channel: NotificationChannel = 'whatsapp'
): Promise<boolean> {
  try {
    const template = generateConfirmationTemplate(appointment);

    // TODO: Integrar con servicio de mensajería (Twilio, WhatsApp Business API, etc.)
    console.log('Enviando confirmación:', { channel, template });

    // Registrar notificación enviada
    await logNotification({
      appointmentId: appointment.id,
      type: 'appointment_confirmed',
      channel,
      status: 'sent',
      sentAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error enviando confirmación:', error);
    return false;
  }
}

/**
 * Envía recordatorio de cita próxima
 */
export async function sendAppointmentReminder(
  appointment: Consulta,
  hoursBeforeAppointment: number,
  channel: NotificationChannel = 'whatsapp'
): Promise<boolean> {
  try {
    const template = generateReminderTemplate(appointment, hoursBeforeAppointment);

    // TODO: Integrar con servicio de mensajería
    console.log('Enviando recordatorio:', { channel, template });

    await logNotification({
      appointmentId: appointment.id,
      type: 'reminder',
      channel,
      status: 'sent',
      sentAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
    return false;
  }
}

/**
 * Notifica cancelación de cita
 */
export async function sendCancellationNotification(
  appointment: Consulta,
  reason: string,
  channel: NotificationChannel = 'whatsapp'
): Promise<boolean> {
  try {
    const template = generateCancellationTemplate(appointment, reason);

    // TODO: Integrar con servicio de mensajería
    console.log('Enviando notificación de cancelación:', { channel, template });

    await logNotification({
      appointmentId: appointment.id,
      type: 'cancellation',
      channel,
      status: 'sent',
      sentAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error enviando cancelación:', error);
    return false;
  }
}

// ============================================================
// TEMPLATES DE MENSAJES
// ============================================================

function generateConfirmationTemplate(appointment: Consulta): NotificationTemplate {
  const fecha = new Date(appointment.fechaConsulta).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const hora = appointment.horaConsulta.substring(0, 5);

  return {
    type: 'appointment_confirmed',
    subject: 'Cita confirmada - Dr. Mario Martínez Thomas',
    message: `Hola ${appointment.paciente},\n\nTu cita ha sido confirmada:\n\n📅 Fecha: ${fecha}\n⏰ Hora: ${hora}\n📍 Sede: ${appointment.sede}\n\nTe esperamos.\n\nDr. Mario Martínez Thomas\nUrobot CRM`,
    variables: {
      paciente: appointment.paciente,
      fecha,
      hora,
      sede: appointment.sede,
    },
  };
}

function generateReminderTemplate(
  appointment: Consulta,
  hoursBeforeAppointment: number
): NotificationTemplate {
  const fecha = new Date(appointment.fechaConsulta).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const hora = appointment.horaConsulta.substring(0, 5);

  const timeMessage =
    hoursBeforeAppointment >= 24
      ? 'mañana'
      : hoursBeforeAppointment === 1
        ? 'en 1 hora'
        : `en ${hoursBeforeAppointment} horas`;

  return {
    type: 'reminder',
    subject: 'Recordatorio de cita - Dr. Mario Martínez Thomas',
    message: `Hola ${appointment.paciente},\n\nTe recordamos que tienes una cita ${timeMessage}:\n\n📅 Fecha: ${fecha}\n⏰ Hora: ${hora}\n📍 Sede: ${appointment.sede}\n\nNos vemos pronto.\n\nDr. Mario Martínez Thomas\nUrobot CRM`,
    variables: {
      paciente: appointment.paciente,
      fecha,
      hora,
      sede: appointment.sede,
      timeMessage,
    },
  };
}

function generateCancellationTemplate(
  appointment: Consulta,
  reason: string
): NotificationTemplate {
  const fecha = new Date(appointment.fechaConsulta).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const hora = appointment.horaConsulta.substring(0, 5);

  return {
    type: 'cancellation',
    subject: 'Cita cancelada - Dr. Mario Martínez Thomas',
    message: `Hola ${appointment.paciente},\n\nLamentamos informarte que tu cita ha sido cancelada:\n\n📅 Fecha: ${fecha}\n⏰ Hora: ${hora}\n📍 Sede: ${appointment.sede}\n\nMotivo: ${reason}\n\nPor favor, contacta con nosotros para reagendar.\n\nDr. Mario Martínez Thomas\nUrobot CRM`,
    variables: {
      paciente: appointment.paciente,
      fecha,
      hora,
      sede: appointment.sede,
      reason,
    },
  };
}

// ============================================================
// LOGGING Y REGISTRO
// ============================================================

interface NotificationLog {
  appointmentId: string;
  type: string;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'failed';
  sentAt: string;
  error?: string;
}

async function logNotification(log: NotificationLog): Promise<void> {
  try {
    // TODO: Crear tabla 'notification_logs' en Supabase y guardar
    console.log('Notification log:', log);
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}

// ============================================================
// FUNCIONES DE INTEGRACIÓN
// ============================================================

/**
 * Verifica recordatorios pendientes y los envía
 * Esta función debe ejecutarse periódicamente (cron job)
 */
export async function processScheduledReminders(): Promise<void> {
  // TODO: Implementar lógica de procesamiento de recordatorios
  // 1. Buscar recordatorios pendientes en BD
  // 2. Filtrar por fecha/hora actual
  // 3. Enviar notificaciones
  // 4. Actualizar estado en BD
  console.log('Processing scheduled reminders...');
}

/**
 * Obtiene estadísticas de notificaciones
 */
export async function getNotificationStats(appointmentId?: string): Promise<{
  total: number;
  sent: number;
  failed: number;
  pending: number;
}> {
  // TODO: Implementar consulta a tabla de logs
  return {
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
  };
}
