const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.project.findFirst();
  console.log(JSON.stringify(p, null, 2));
}
run();
