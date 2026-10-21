import prisma from "../config/prisma.js";
import { checkAvailability } from "./availabilityService.js";

export class AppointmentError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppointmentError";
    this.statusCode = statusCode;
  }
}

export async function createAppointment(data) {
  const { name, phone, email, serviceId, startAt } = data;

  const appointmentDate = new Date(startAt);

  // Verifica o serviço, expediente, bloqueios e conflitos.
  const availability = await checkAvailability(
    serviceId,
    appointmentDate
  );

  try {
    return await prisma.$transaction(async (tx) => {
      // Os dados do paciente só são gravados
      // se o agendamento também for concluído.
      const patient = await tx.patient.create({
        data: {
          name,
          phone,
          email: email || null,
        },
      });

      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          serviceId,
          startAt: availability.startAt,
          endAt: availability.endAt,
          status: "confirmed",
        },
        select: {
          id: true,
          startAt: true,
          endAt: true,
          status: true,
          service: {
            select: {
              name: true,
              durationMinutes: true,
            },
          },
        },
      });

      return appointment;
    });
  } catch (error) {
    // PostgreSQL: conflito de restrição de exclusão.
    // 23P01 = exclusion_violation.
    const details = [
      error?.code,
      error?.meta?.code,
      error?.meta?.database_error,
      error?.message,
    ].filter(Boolean).join(" ");

    if (
      details.includes("23P01") ||
      details.includes("appointment_no_overlap")
    ) {
      throw new AppointmentError(
        "Este horário acabou de ser reservado. Escolha outro.",
        409
      );
    }

    throw error;
  }
}
