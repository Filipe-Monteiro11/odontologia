import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Configure ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD no .env."
    );
  }

  if (password.length < 12) {
    throw new Error("A senha deve ter pelo menos 12 caracteres.");
  }

  const existing = await prisma.admin.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("Administrador já cadastrado.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  console.log("Administrador criado com sucesso!");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
