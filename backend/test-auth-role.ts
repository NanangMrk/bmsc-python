import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ include: { role: true }, take: 2 });
  console.log(JSON.stringify(users.map(u => ({ email: u.email, role: u.role.name })), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
