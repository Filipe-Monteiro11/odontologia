import prisma from "../config/prisma.js";

export async function listServices(req, res, next) {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        description: true,
        durationMinutes: true,
      },
      orderBy: { name: "asc" },
    });

    return res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    next(error);
  }
}