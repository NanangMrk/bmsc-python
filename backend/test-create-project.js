const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const project = await prisma.$transaction(async (tx) => {
      const p = await tx.project.create({
        data: {
          name: 'tesq2',
          brandId: 'b1',
          startDate: new Date(),
          totalValue: 500000,
          status: 'ACTIVE',
        }
      });
      await tx.projectPlatform.create({
        data: { projectId: p.id, platformId: 'p1' }
      });
      await tx.paymentTermin.createMany({
        data: [
          { projectId: p.id, type: 'DP', percentage: 50, amount: 250000, status: 'MENUNGGU' },
          { projectId: p.id, type: 'PELUNASAN', percentage: 50, amount: 250000, status: 'MENUNGGU' }
        ]
      });
      return p;
    });
    console.log("Success:", project.id);
  } catch (e) {
    console.error("Failed:", e);
  }
}
run();
