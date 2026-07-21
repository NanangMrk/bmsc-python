const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const data = await prisma.quotation.findUnique({where: {id: "c54f9fb8-ea08-4971-bc1d-fcab3bb6bfa4"}});
  console.log(data);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
