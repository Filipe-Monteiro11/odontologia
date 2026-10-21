import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export async function requireAdmin(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Autenticação necessária.",
      });
    }

    const token = authorization.slice(7);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não configurado.");
    }

    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      });
    } catch {
      return res.status(401).json({
        success: false,
        message: "Sessão inválida ou expirada.",
      });
    }

    if (
      typeof payload !== "object" ||
      payload.role !== "admin" ||
      !/^\d+$/.test(String(payload.sub))
    ) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado.",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true, name: true, email: true },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Administrador não encontrado.",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
}
