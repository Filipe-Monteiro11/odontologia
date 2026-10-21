import { z } from "zod";
import prisma from "../config/prisma.js";

const blockedSlotSchema = z.object({
  startAt: z.iso.datetime({ offset: true }),
  endAt: z.iso.datetime({ offset: true }),
  reason: z.string().trim().max(200).optional(),
}).strict();

export async function listBlockedSlots(req, res, next) {
  try {
    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        endAt: { gt: new Date() },
      },
      orderBy: { startAt: "asc" },
    });

    return res.json({
      success: true,
      blockedSlots,
    });
  } catch (error) {
    next(error);
  }
}

export async function createBlockedSlot(req, res, next) {
  try {
    const parsed = blockedSlotSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Dados do bloqueio inválidos.",
      });
    }

    const startAt = new Date(parsed.data.startAt);
    const endAt = new Date(parsed.data.endAt);

    if (
      startAt.getTime() < Date.now() ||
      endAt <= startAt
    ) {
      return res.status(400).json({
        success: false,
        message: "Informe um período futuro com início anterior ao fim.",
      });
    }

    const blockedSlot = await prisma.blockedSlot.create({
      data: {
        startAt,
        endAt,
        reason: parsed.data.reason,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Horário bloqueado com sucesso.",
      blockedSlot,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBlockedSlot(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido.",
      });
    }

    const existing = await prisma.blockedSlot.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Bloqueio não encontrado.",
      });
    }

    await prisma.blockedSlot.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Bloqueio removido com sucesso.",
    });
  } catch (error) {
    next(error);
  }
}