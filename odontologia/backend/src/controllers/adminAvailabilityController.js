import { z } from "zod";
import prisma from "../config/prisma.js";

const timeSchema = z.string().regex(
  /^([01]\d|2[0-3]):[0-5]\d$/,
  "Horário inválido."
);

const periodSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: timeSchema,
  endTime: timeSchema,
}).strict();

const scheduleSchema = z.object({
  periods: z.array(periodSchema).max(28),
}).strict().superRefine(({ periods }, ctx) => {
  const byDay = new Map();

  for (const period of periods) {
    if (period.startTime >= period.endTime) {
      ctx.addIssue({
        code: "custom",
        message: "O horário inicial deve ser anterior ao final.",
      });
    }

    const dayPeriods = byDay.get(period.weekday) ?? [];
    dayPeriods.push(period);
    byDay.set(period.weekday, dayPeriods);
  }

  for (const dayPeriods of byDay.values()) {
    dayPeriods.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    for (let i = 1; i < dayPeriods.length; i++) {
      if (dayPeriods[i].startTime < dayPeriods[i - 1].endTime) {
        ctx.addIssue({
          code: "custom",
          message: "Existem períodos sobrepostos no mesmo dia.",
        });
      }
    }
  }
});

export async function getAdminAvailability(req, res, next) {
  try {
    const periods = await prisma.availability.findMany({
      where: { active: true },
      select: {
        weekday: true,
        startTime: true,
        endTime: true,
      },
      orderBy: [
        { weekday: "asc" },
        { startTime: "asc" },
      ],
    });

    return res.json({
      success: true,
      periods,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminAvailability(req, res, next) {
  try {
    const parsed = scheduleSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Expediente inválido. Verifique os dias e horários.",
      });
    }

    const periods = parsed.data.periods.map((period) => ({
      ...period,
      active: true,
    }));

    await prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany();

      if (periods.length > 0) {
        await tx.availability.createMany({ data: periods });
      }
    });

    const updated = await prisma.availability.findMany({
      select: {
        weekday: true,
        startTime: true,
        endTime: true,
      },
      orderBy: [
        { weekday: "asc" },
        { startTime: "asc" },
      ],
    });

    return res.json({
      success: true,
      message: "Expediente atualizado com sucesso.",
      periods: updated,
    });
  } catch (error) {
    next(error);
  }
}