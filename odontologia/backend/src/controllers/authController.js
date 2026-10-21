import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../config/prisma.js";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
}).strict();

export async function loginAdmin(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }

    const { email, password } = parsed.data;

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Mensagem genérica para não revelar se o e-mail existe.
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não configurado.");
    }

    const token = jwt.sign(
      { sub: String(admin.id), role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h", algorithm: "HS256" }
    );

    return res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
}
