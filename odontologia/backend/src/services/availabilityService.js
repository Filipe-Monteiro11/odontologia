
import prisma from "../config/prisma.js";

const TIME_ZONE = "America/Recife";

function localParts(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );
}

function toMinutes(time) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!match) {
    throw new Error("Horário de expediente inválido.");
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export async function checkAvailability(serviceId, startAt) {
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    throw new Error("Serviço inválido.");
  }

  if (!(startAt instanceof Date) || Number.isNaN(startAt.getTime())) {
    throw new Error("Data inválida.");
  }

  if (startAt <= new Date()) {
    throw new Error("O horário precisa estar no futuro.");
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || !service.active) {
    throw new Error("Serviço indisponível.");
  }

  if (service.durationMinutes <= 0) {
    throw new Error("Duração do serviço inválida.");
  }

  const endAt = new Date(
    startAt.getTime() + service.durationMinutes * 60000
  );

  const start = localParts(startAt);
  const end = localParts(endAt);

  const startDay = `${start.year}-${start.month}-${start.day}`;
  const endDay = `${end.year}-${end.month}-${end.day}`;

  if (startDay !== endDay) {
    throw new Error("O atendimento não pode atravessar a meia-noite.");
  }

  const weekdays = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const weekday = weekdays[start.weekday];

  const schedules = await prisma.availability.findMany({
    where: {
      weekday,
      active: true,
    },
  });

  const startMinutes =
    Number(start.hour) * 60 + Number(start.minute);

  const endMinutes =
    Number(end.hour) * 60 + Number(end.minute);

  const withinWorkingHours = schedules.some((schedule) => {
    return (
      startMinutes >= toMinutes(schedule.startTime) &&
      endMinutes <= toMinutes(schedule.endTime)
    );
  });

  if (!withinWorkingHours) {
    throw new Error("Horário fora do expediente.");
  }

  const blocked = await prisma.blockedSlot.findFirst({
    where: {
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  if (blocked) {
    throw new Error("Horário bloqueado.");
  }

  const existing = await prisma.appointment.findFirst({
    where: {
      status: "confirmed",
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  if (existing) {
    throw new Error("Horário já reservado.");
  }

  return {
    available: true,
    service,
    startAt,
    endAt,
  };
}
