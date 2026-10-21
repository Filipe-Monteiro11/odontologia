import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Serviços de exemplo para desenvolvimento.
  const services = [
    {
      name: "Avaliação odontológica",
      durationMinutes: 30,
      description: "Consulta inicial de avaliação.",
    },
    {
      name: "Limpeza dental",
      durationMinutes: 60,
      description: "Procedimento de limpeza e prevenção.",
    },
    {
      name: "Clareamento dental",
      durationMinutes: 90,
      description: "Avaliação e procedimento de clareamento.",
    },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (!existing) {
      await prisma.service.create({
        data: service,
      });
    }
  }

  // Horário de exemplo: segunda a sexta,
  // das 08:00 às 12:00 e das 14:00 às 18:00.
  for (let weekday = 1; weekday <= 5; weekday++) {
    for (const period of [
      { startTime: "08:00", endTime: "12:00" },
      { startTime: "14:00", endTime: "18:00" },
    ]) {
      const existing = await prisma.availability.findFirst({
        where: {
          weekday,
          startTime: period.startTime,
          endTime: period.endTime,
        },
      });

      if (!existing) {
        await prisma.availability.create({
          data: {
            weekday,
            ...period,
          },
        });
      }
    }
  }

  console.log("Serviços e horários cadastrados!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
