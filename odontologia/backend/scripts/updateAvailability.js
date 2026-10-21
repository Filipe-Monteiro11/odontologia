import "dotenv/config";
import prisma from "../src/config/prisma.js";

const schedules = [];

for (let weekday = 1; weekday <= 5; weekday++) {
  schedules.push(
    {
      weekday,
      startTime: "09:00",
      endTime: "12:00",
      active: true,
    },
    {
      weekday,
      startTime: "13:00",
      endTime: "17:00",
      active: true,
    }
  );
}

schedules.push({
  weekday: 6,
  startTime: "09:00",
  endTime: "12:00",
  active: true,
});

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.availability.deleteMany();

    await tx.availability.createMany({
      data: schedules,
    });
  });

  console.log("Expediente atualizado com sucesso!");
  console.log("Segunda a sexta: 09:00–12:00 e 13:00–17:00");
  console.log("Sábado: 09:00–12:00");
  console.log("Domingo: fechado");
  console.log(`Total de períodos: ${schedules.length}`);
}

main()
  .catch((error) => {
    console.error("Erro ao atualizar o expediente:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
