import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

/**
 * Middleware de autenticação administrativa.
 *
 * Responsabilidades:
 * - Exigir um token JWT válido.
 * - Verificar a assinatura e a expiração do token.
 * - Confirmar as permissões administrativas.
 * - Verificar se o administrador ainda existe.
 * - Invalidar sessões antigas após alterações de senha.
 * - Disponibilizar os dados do administrador à próxima rota.
 */
export async function requireAdmin(req, res, next) {
  try {
    // 1. Verificar se o cabeçalho Authorization existe.
    const authorization = req.headers.authorization;

    if (
      typeof authorization !== "string" ||
      !/^Bearer \S+$/i.test(authorization)
    ) {
      return res.status(401).json({
        success: false,
        message: "Autenticação necessária.",
      });
    }

    // 2. Extrair o token.
    const token = authorization.replace(/^Bearer /i, "");

    // 3. Verificar a configuração do servidor.
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET não configurado.");
    }

    // 4. Validar assinatura e expiração do JWT.
    let payload;

    try {
      payload = jwt.verify(token, jwtSecret, {
        algorithms: ["HS256"],
      });
    } catch {
      return res.status(401).json({
        success: false,
        message: "Sessão inválida ou expirada.",
      });
    }

    // 5. Validar a estrutura e as permissões do token.
    if (
      typeof payload !== "object" ||
      payload === null ||
      payload.role !== "admin" ||
      typeof payload.sub !== "string" ||
      !/^[1-9]\d*$/.test(payload.sub)
    ) {
      return res.status(401).json({
        success: false,
        message: "Token de autenticação inválido.",
      });
    }

    // 6. Validar o ID antes de consultar o banco.
    const adminId = Number(payload.sub);

    if (!Number.isSafeInteger(adminId)) {
      return res.status(401).json({
        success: false,
        message: "Token de autenticação inválido.",
      });
    }

    // 7. Consultar o administrador no Neon.
    const admin = await prisma.admin.findUnique({
      where: {
        id: adminId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        tokenVersion: true,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Sessão inválida. Faça login novamente.",
      });
    }

    // 8. Verificar se o token pertence à versão atual.
    //
    // Quando a senha é alterada, tokenVersion aumenta.
    // Tokens emitidos anteriormente deixam de funcionar.
    if (
      !Number.isSafeInteger(payload.tokenVersion) ||
      payload.tokenVersion !== admin.tokenVersion
    ) {
      return res.status(401).json({
        success: false,
        message: "Sessão expirada. Faça login novamente.",
      });
    }

    // 9. Disponibilizar apenas os dados necessários.
    //
    // Não expomos passwordHash nem tokenVersion nas rotas.
    req.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    };

    // 10. Autorizar a próxima etapa.
    return next();
  } catch (error) {
    // Erros inesperados seguem para o middleware global.
    return next(error);
  }
}
