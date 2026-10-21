import "dotenv/config";
import prisma from "../src/config/prisma.js";

const services = [
  "Extrações",
  "Restaurações",
  "Aparelhos metálicos e estéticos",
  "Atendimento de crianças",
  "Tratamento de canal",
  "Próteses dentárias",
  "Clareamento dental",
  "Cirurgias odontológicas",
  "Facetas dentárias",
  "Harmonização facial (Botox)",
];

async function main() {
  await prisma.$transaction(async (tx) => {
    // Desativa os serviços anteriores sem apagar o histórico.
    await tx.service.updateMany({
      data: { active: false },
    });

    for (const name of services) {
      const existing = await tx.service.findFirst({
        where: { name },
        select: { id: true },
      });

      if (existing) continue;

      await tx.service.create({
        data: {
          name,
          durationMinutes: 30,
          active: false,
        },
      });
    }
  });

  const result = await prisma.service.findMany({
    select: {
      id: true,
      name: true,
      durationMinutes: true,
      active: true,
    },
    orderBy: { name: "asc" },
  });

  console.table(result);

  console.log(
    "\nServiços atualizados. Defina as durações reais antes de ativá-los."
  );
}

main()
  .catch((error) => {
    console.error("Erro ao atualizar serviços:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
