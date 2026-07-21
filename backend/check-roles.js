const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({ include: { role: true } });
  console.log(users.map(u => `${u.name} -> ${u.role.name}`));
}
check();
