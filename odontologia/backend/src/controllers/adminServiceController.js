import { z } from "zod";
import prisma from "../config/prisma.js";

const serviceSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).nullable().optional(),
  durationMinutes: z.number().int().min(15).max(480),
  active: z.boolean().optional(),
}).strict();

const updateServiceSchema = serviceSchema.partial();

function parseId(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "ID do procedimento inválido.",
    });
    return null;
  }

  return id;
}

// GET /api/admin/services
export async function listAdminServices(req, res, next) {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });

    return res.json({
      success: true,
      services,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/services
export async function createAdminService(req, res, next) {
  try {
    const parsed = serviceSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Dados do procedimento inválidos.",
        errors: parsed.error.flatten(),
      });
    }

    const service = await prisma.service.create({
      data: parsed.data,
    });

    return res.status(201).json({
      success: true,
      message: "Procedimento cadastrado com sucesso.",
      service,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/services/:id
export async function updateAdminService(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    const parsed = updateServiceSchema.safeParse(req.body);

    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Dados de atualização inválidos.",
      });
    }

    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Procedimento não encontrado.",
      });
    }

    const service = await prisma.service.update({
      where: { id },
      data: parsed.data,
    });

    return res.json({
      success: true,
      message: "Procedimento atualizado com sucesso.",
      service,
    });
  } catch (error) {
    next(error);
  }
}
