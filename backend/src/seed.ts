import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@flowmap.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminName = process.env.ADMIN_NAME || "Administrador";

  const adminExistente = await prisma.administrador.findUnique({
    where: { email: adminEmail },
  });

  if (adminExistente) {
    console.log("Administrador inicial já existe.");
    return;
  }

  const senhaHash = await bcrypt.hash(adminPassword, 10);

  await prisma.administrador.create({
    data: {
      nome: adminName,
      email: adminEmail,
      senha: senhaHash,
    },
  });

  console.log("Administrador inicial criado com sucesso.");
}

main()
  .catch((error) => {
    console.error("Erro ao criar administrador inicial:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });