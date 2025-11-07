import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Função para criar o Admin
async function main() {
  const salt = await bcrypt.genSalt();
  const hashSenha = await bcrypt.hash('123456', salt); // Senha padrão: 123456

  // Deleta o admin@teste.com se ele já existir (para evitar conflito)
  await prisma.adminUser.deleteMany({
    where: { email: 'admin@teste.com' },
  });

  // Cria o novo Admin
  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@teste.com',
      password: hashSenha,
      nome: 'Admin Master',
      isAdmin: true,
    },
  });
  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });