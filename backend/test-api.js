const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function main() {
  const user = await prisma.user.findFirst();
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  const id = "c54f9fb8-ea08-4971-bc1d-fcab3bb6bfa4";
  
  const res = await fetch(`http://localhost:3000/api/finance/quotations/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.text();
  console.log("STATUS:", res.status);
  console.log("BODY:", data);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
