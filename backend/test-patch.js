require('dotenv').config();
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst();
  const data = JSON.stringify({
    progress: 1,
    phaseStatuses: { payment: "SELESAI", concept: "SELESAI" }
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/projects/80a6cfb9-2068-44bc-bb05-92e2add4cc8c/progress',
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
