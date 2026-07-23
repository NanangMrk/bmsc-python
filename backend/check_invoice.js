const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const invoice = await prisma.invoice.findFirst({
    where: { shareToken: "15b8ce81-f53a-48a1-88a3-123a10c641f2" }
  });
  console.log("Invoice by token:", invoice);
}
main().finally(() => prisma.$disconnect());
