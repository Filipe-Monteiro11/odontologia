import { z } from "zod";
import { createAppointment } from "../services/appointmentService.js";

const appointmentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{10,20}$/),
  email: z.union([
    z.email(),
    z.literal(""),
  ]).optional(),
  serviceId: z.number().int().positive(),
  startAt: z.iso.datetime({ offset: true }),
}).strict();

export async function storeAppointment(req, res, next) {
  try {
    const result = appointmentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Dados do agendamento inválidos.",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const appointment = await createAppointment(result.data);

    return res.status(201).json({
      success: true,
      message: "Agendamento realizado com sucesso!",
      appointment,
    });
  } catch (error) {
    next(error);
  }
}
