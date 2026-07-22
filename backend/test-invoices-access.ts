import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const invoice = await prisma.invoice.findUnique({ 
    where: { id: "411babf0-451f-40a8-b905-9e0814f829af" }, 
    include: { userAccess: true } 
  });
  console.log(JSON.stringify(invoice, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
