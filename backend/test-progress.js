const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const project = await prisma.project.findFirst();
  console.log("Before:", project.phaseStatuses);
  
  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { 
      phaseStatuses: { payment: "SELESAI", concept: "MENUNGGU" } 
    }
  });
  console.log("After:", updated.phaseStatuses);
}
run().catch(console.error);
