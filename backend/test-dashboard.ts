import { prisma } from './src/lib/prisma';

async function test() {
  try {
    const userAccessFilter = {};
    const recentInvoices = await prisma.invoice.findMany({
      where: { project: userAccessFilter },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        quotation: { select: { title: true } },
      }
    });
    console.log("Invoices:", recentInvoices.length);
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit();
}
test();
