import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create Super Admin Role
  const role = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
    },
  });

  console.log(`Role created: ${role.name}`);

  // Create Super Admin User
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      name: 'Super Administrator',
      username: 'admin_email',
      companyName: 'BMS',
      email: 'admin@email.com',
      password: hashedPassword,
      roleId: role.id,
    },
  });

  console.log(`Super Admin user created: ${user.email} / password123`);
  
  // You can seed other initial data like platforms, default permissions here
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
