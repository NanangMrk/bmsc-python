require('dotenv').config();
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst();
  const project = await prisma.project.findFirst({ include: { payments: true } });
  if (!project.payments.length) return console.log("No payments");
  
  const paymentId = project.payments[0].id;
  
  const data = JSON.stringify({ status: "LUNAS" });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/payments/${paymentId}/status`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + require('jsonwebtoken').sign({userId:user.id,role:'SUPER_ADMIN'}, process.env.JWT_SECRET)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(res.statusCode, body));
  });

  req.on('error', console.error);
  req.write(data);
  req.end();
}
run();
