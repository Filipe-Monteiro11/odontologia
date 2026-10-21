import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import prisma from "../config/prisma.js";

// Validação dos dados de login.
const loginSchema = z
  .object({
    email: z.email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

/**
 * POST /api/admin/login
 *
 * Autentica o administrador e gera um JWT.
 * O token inclui a versão atual da sessão,
 * permitindo invalidar acessos antigos após
 * uma alteração de senha.
 */
export async function loginAdmin(req, res, next) {
  try {
    // 1. Validar os dados enviados.
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Dados de login inválidos.",
      });
    }

    // 2. Normalizar o e-mail.
    const email = parsed.data.email.trim().toLowerCase();
    const { password } = parsed.data;

    // 3. Verificar se a chave JWT está configurada.
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET não configurado.");
    }

    // 4. Buscar o administrador no banco.
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        tokenVersion: true,
      },
    });

    // 5. Verificar a senha.
    //
    // A mensagem é a mesma para e-mail inexistente
    // e senha incorreta, evitando revelar qual falhou.
    const passwordIsValid = admin
      ? await bcrypt.compare(password, admin.passwordHash)
      : false;

    if (!admin || !passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }

    // 6. Gerar token assinado, com validade de 2 horas.
    const token = jwt.sign(
      {
        sub: String(admin.id),
        role: "admin",
        tokenVersion: admin.tokenVersion,
      },
      jwtSecret,
      {
        expiresIn: "2h",
        algorithm: "HS256",
      }
    );

    // 7. Impedir armazenamento em cache da resposta.
    res.set("Cache-Control", "no-store");

    // 8. Retornar somente os dados públicos da conta.
    return res.status(200).json({
      success: true,
      message: "Login realizado com sucesso.",
      token,
      expiresIn: 7200,
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
