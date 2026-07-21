import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const brand = await prisma.brand.upsert({
    where: { id: 'b1' },
    update: {},
    create: {
      id: 'b1',
      name: 'Kopi Nusantara',
    },
  });

  const platform = await prisma.platform.upsert({
    where: { id: 'p1' },
    update: {},
    create: {
      id: 'p1',
      name: 'Instagram',
      icon: 'instagram',
    },
  });
  
  await prisma.platform.upsert({
    where: { id: 'p2' },
    update: {},
    create: { id: 'p2', name: 'TikTok', icon: 'tiktok' }
  });

  console.log('Seeded brands and platforms');
}

main().catch(console.error).finally(() => prisma.$disconnect());
