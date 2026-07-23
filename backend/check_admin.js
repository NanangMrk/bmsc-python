const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ include: { role: true } });
  users.forEach(u => console.log(u.email, u.role.name, u.role.permissions));
}
main().finally(() => prisma.$disconnect());
