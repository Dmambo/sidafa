import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config(); // Load .env file
const prisma = new PrismaClient();

async function main() {
  // Check if root member already exists
  const existingRoot = await prisma.member.findFirst({
    where: { relationship: 'root' },
  });

  if (!existingRoot) {
    console.log('Creating root member: Sidafa Sano');
    await prisma.member.create({
      data: {
        id: 'root-sidafa',
        name: 'Sidafa Sano',
        gender: 'male',
        relationship: 'root',
        birthYear: 1916,
        photoUrl: '/sidafa-sano.jpeg',
      },
    });
    console.log('✓ Root member created');
  } else {
    console.log('Root member already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

