import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../config/prisma.js";

const accountSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.email().trim().toLowerCase().max(254).optional(),
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).max(128).optional(),
  })
  .strict()
  .refine(
    ({ name, email, newPassword }) =>
      name !== undefined ||
      email !== undefined ||
      newPassword !== undefined,
    { message: "Informe pelo menos um dado para alterar." }
  );

export async function updateAdminAccount(req, res, next) {
  try {
    const parsed = accountSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Dados de atualização inválidos.",
      });
    }

    const { name, email, currentPassword, newPassword } = parsed.data;

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Administrador não encontrado.",
      });
    }

    const validPassword = await bcrypt.compare(
      currentPassword,
      admin.passwordHash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Senha atual incorreta.",
      });
    }

    const data = {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
    };

    if (newPassword !== undefined) {
      data.passwordHash = await bcrypt.hash(newPassword, 12);
      data.tokenVersion = { increment: 1 };
    }

    const updated = await prisma.admin.update({
      where: { id: admin.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      message: "Conta atualizada com sucesso.",
      admin: updated,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Este e-mail já está cadastrado.",
      });
    }

    next(error);
  }
}
