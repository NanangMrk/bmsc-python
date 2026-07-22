README.md
# Brand App Deployment Guide

Dokumentasi instalasi dan deployment Brand App.

Stack:

- Frontend: React + Vite
- Backend: Node.js + Express + TypeScript
- Database: MySQL
- ORM: Prisma

---

# 1. Struktur Folder


/var/www/html
├── Frontend React
│
└── backend
├── Express API
├── Prisma
└── MySQL Connection


---

# 2. Backend Setup

Masuk backend:

```bash
cd /var/www/html/backend

Install dependency:

npm install

Install TypeScript runtime:

npm install -D typescript tsx
3. Konfigurasi Database

Edit environment:

nano .env

Contoh:

DATABASE_URL="mysql://nanangmrk:nanangmrk@localhost:3306/bmsc_db"
JWT_SECRET="secret-key"
4. Setup Prisma Database

Generate Prisma Client:

npx prisma generate

Buat tabel database:

npx prisma db push
5. Seed Database

Edit package.json:

"prisma": {
  "seed": "tsx prisma/seed.ts"
}

Jalankan:

npx prisma db seed

Default login:

Email:
admin@email.com

Password:
password123
6. Build Backend

Build:

npm run build

Cek hasil:

ls -la dist

Output:

dist/
├── server.js
├── controllers
├── routes
└── middleware
7. Test Backend

Jalankan:

npm start

Output:

Server is running on http://0.0.0.0:3000

Cek port:

ss -tulpn | grep 3000
8. Test Login API
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@email.com","password":"password123"}'

Response:

{
 "message":"Login successful",
 "token":"JWT_TOKEN"
}
9. Frontend Setup

Masuk frontend:

cd /var/www/html

Install:

npm install
10. Konfigurasi API Frontend

Edit:

nano .env

Isi:

VITE_BACKEND_URL=http://SERVER_IP:3000

Contoh:

VITE_BACKEND_URL=http://169.69.69.37:3000

Restart:

npm run dev
11. Menjalankan Manual

Frontend:

cd /var/www/html
npm run dev

Backend:

cd /var/www/html/backend
npm run dev
12. Auto Start Dengan Systemd
Backend Service

Buat file:

nano /etc/systemd/system/brand-backend.service

Isi:

[Unit]
Description=Brand App Backend
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/html/backend
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
Frontend Service

Buat:

nano /etc/systemd/system/brand-frontend.service

Isi:

[Unit]
Description=Brand App Frontend
After=network.target brand-backend.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/html
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
13. Aktifkan Service

Reload:

systemctl daemon-reload

Enable startup:

systemctl enable brand-backend
systemctl enable brand-frontend

Start:

systemctl start brand-backend
systemctl start brand-frontend
14. Cek Status

Backend:

systemctl status brand-backend

Frontend:

systemctl status brand-frontend
15. Melihat Log

Backend:

journalctl -u brand-backend -f

Frontend:

journalctl -u brand-frontend -f
16. Restart Service

Backend:

systemctl restart brand-backend

Frontend:

systemctl restart brand-frontend
17. Stop Service

Backend:

systemctl stop brand-backend

Frontend:

systemctl stop brand-frontend
18. Troubleshooting
Cek Port Backend
ss -tulpn | grep 3000

Output normal:

LISTEN 0 511 0.0.0.0:3000
Cek Node Process
ps aux | grep node
Rebuild Backend
cd /var/www/html/backend

npm install

npx prisma generate

npm run build

systemctl restart brand-backend
Update Frontend
cd /var/www/html

git pull

npm install

systemctl restart brand-frontend
19. Production Recommendation

Saat ini:

Frontend
npm run dev

Backend
npm run dev

Untuk production:

Backend:

node dist/server.js

Frontend:

npm run build

Gunakan:

Nginx Reverse Proxy
HTTPS
Domain
Cloudflare

Arsitektur:

User
 |
HTTPS
 |
Nginx
 |
+-------------+
|             |
React       Node API
             |
            MySQL
20. Default Admin
Email:
admin@email.com

Password:
password123

Role:
SUPER_ADMIN