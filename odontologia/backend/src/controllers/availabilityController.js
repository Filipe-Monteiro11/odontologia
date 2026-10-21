import { z } from "zod";
import prisma from "../config/prisma.js";
import { checkAvailability } from "../services/availabilityService.js";

const TIME_ZONE = "America/Recife";
const SLOT_INTERVAL = 30;

const querySchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  date: z.iso.date(),
});

function getLocalDate(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getWeekday(dateString) {
  const date = new Date(`${dateString}T12:00:00Z`);
  return date.getUTCDay();
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export async function listAvailableSlots(req, res, next) {
  try {
    const parsed = querySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Serviço ou data inválidos.",
      });
    }

    const { serviceId, date } = parsed.data;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.active) {
      return res.status(404).json({
        success: false,
        message: "Serviço não encontrado.",
      });
    }

    const weekday = getWeekday(date);

    const schedules = await prisma.availability.findMany({
      where: {
        weekday,
        active: true,
      },
    });

    const slots = [];

    for (const schedule of schedules) {
      const opening = toMinutes(schedule.startTime);
      const closing = toMinutes(schedule.endTime);

      for (
        let minutes = opening;
        minutes + service.durationMinutes <= closing;
        minutes += SLOT_INTERVAL
      ) {
        const time = toTime(minutes);

        // O expediente está configurado no horário de Recife.
        // Neste MVP, Recife usa UTC-03:00.
        const startAt = new Date(`${date}T${time}:00-03:00`);

        try {
          const result = await checkAvailability(
            serviceId,
            startAt
          );

          if (result.available) {
            slots.push(time);
          }
        } catch (error) {
          // Horários indisponíveis não são exibidos.
          // Erros inesperados devem chegar ao tratamento global.
          const unavailableMessages = [
            "O horário precisa estar no futuro.",
            "O atendimento não pode atravessar a meia-noite.",
            "Horário fora do expediente.",
            "Horário bloqueado.",
            "Horário já reservado.",
          ];

          if (!unavailableMessages.includes(error.message)) {
            throw error;
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      serviceId,
      date,
      timezone: TIME_ZONE,
      slots: [...new Set(slots)].sort(),
    });
  } catch (error) {
    next(error);
  }
}
