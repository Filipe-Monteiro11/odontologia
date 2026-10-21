import { z } from "zod";
import prisma from "../config/prisma.js";

const querySchema = z.object({
  date: z.iso.date().optional(),
}).strict();

export async function listAdminAppointments(req, res, next) {
  try {
    const parsed = querySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Data inválida.",
      });
    }

    const { date } = parsed.data;

    const where = date
      ? {
          startAt: {
            gte: new Date(`${date}T00:00:00-03:00`),
            lt: new Date(`${date}T00:00:00-03:00`).getTime() + 86400000
              ? new Date(
                  new Date(`${date}T00:00:00-03:00`).getTime() + 86400000
                )
              : undefined,
          },
        }
      : {
          startAt: { gte: new Date() },
        };

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { startAt: "asc" },
      take: 100,
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        createdAt: true,
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelAdminAppointment(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID da consulta inválido.",
      });
    }

    const result = await prisma.appointment.updateMany({
      where: {
        id,
        status: "confirmed",
      },
      data: {
        status: "cancelled",
      },
    });

    if (result.count === 0) {
      return res.status(409).json({
        success: false,
        message: "Consulta inexistente ou já cancelada.",
      });
    }

    return res.json({
      success: true,
      message: "Consulta cancelada com sucesso.",
    });
  } catch (error) {
    next(error);
  }
}