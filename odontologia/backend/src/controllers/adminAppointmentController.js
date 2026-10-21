import prisma from "../config/prisma.js";

export async function listAdminAppointments(req, res, next) {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { startAt: "desc" },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        createdAt: true,
        patient: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        service: {
          select: {
            name: true,
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
        message: "Consulta não encontrada ou já cancelada.",
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