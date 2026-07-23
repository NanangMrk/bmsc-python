# BMSC (Brand Management System) Production Deployment Guide

This guide provides step-by-step instructions for deploying the BMSC application to a Linux production server under a domain name using Nginx or Apache reverse proxy.

---

## 1. Server Requirements

- **Operating System**: Linux (Ubuntu 22.04 LTS, Debian 12, CentOS 9, or RHEL 9 recommended).
- **CPU**: 2 Cores or higher.
- **RAM**: 2 GB RAM or higher.
- **Disk Space**: 10 GB+ SSD.
- **Web Server**: Nginx 1.18+ or Apache 2.4+.
- **Database**: MySQL 8.0+ or MariaDB 10.5+.

---

## 2. Node.js Version Standard

- **Required Node Version**: **Node.js 22 LTS** (or 20 LTS minimum).
- **TypeScript**: Version >= 5.x.
- **Package Manager**: npm 10+.

### Installing Node.js 22 LTS via NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v # Should display v22.x.x
```

---

## 3. Environment Setup

### A. Frontend Environment (`.env.production`)
In the root directory, configure `.env.production`:
```env
VITE_API_URL=https://domain-saya.com/api
```
*(Replace `domain-saya.com` with your production domain name)*.

### B. Backend Environment (`backend/.env`)
In the `backend/` directory, configure `.env`:
```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
DATABASE_URL="mysql://bmsc_user:StrongPassword123!@127.0.0.1:3306/bmsc_db"
JWT_SECRET="generate_a_secure_64_character_random_secret_here"
ALLOWED_ORIGINS="https://domain-saya.com,https://www.domain-saya.com"
```

---

## 4. Database Setup & Migration

1. Create the MySQL database and user:
   ```sql
   CREATE DATABASE bmsc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'bmsc_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
   GRANT ALL PRIVILEGES ON bmsc_db.* TO 'bmsc_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. Run Prisma migrations and seed initial data:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   cd ..
   ```
   *(Seed creates default admin: `admin@email.com` / `password123`)*.

---

## 5. Building the Frontend & Backend

1. **Build Frontend Bundle**:
   ```bash
   npm install
   npm run build
   ```
   *`npm run build` runs TypeScript check (`tsc`), Vite build, and the `check-build.mjs` verification script to ensure no IP addresses leak into `dist/`.*

2. **Build Backend TypeScript**:
   ```bash
   cd backend
   npm run build
   cd ..
   ```

---

## 6. Upload Directory Permissions

Ensure the `backend/uploads` directory exists and has appropriate permissions:
```bash
mkdir -p backend/uploads
sudo chown -R www-data:www-data backend/uploads
sudo chmod -R 755 backend/uploads
```

---

## 7. Web Server (Reverse Proxy) Setup

Copy the built frontend static files to the web server directory (e.g. `/var/www/bmsc`):
```bash
sudo mkdir -p /var/www/bmsc
sudo cp -r dist /var/www/bmsc/dist
sudo cp -r backend /var/www/bmsc/backend
```

### Option A: Nginx (Recommended)
1. Copy `nginx-bmsc.conf` to `/etc/nginx/sites-available/bmsc.conf`:
   ```bash
   sudo cp nginx-bmsc.conf /etc/nginx/sites-available/bmsc.conf
   sudo ln -s /etc/nginx/sites-available/bmsc.conf /etc/nginx/sites-enabled/
   ```
2. Test configuration and reload:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```
3. Enable SSL with Certbot:
   ```bash
   sudo certbot --nginx -d domain-saya.com -d www.domain-saya.com
   ```

### Option B: Apache
1. Enable required Apache modules:
   ```bash
   sudo a2enmod proxy proxy_http rewrite headers
   ```
2. Copy `apache-bmsc.conf` to `/etc/apache2/sites-available/bmsc.conf`:
   ```bash
   sudo cp apache-bmsc.conf /etc/apache2/sites-available/bmsc.conf
   sudo a2ensite bmsc.conf
   sudo systemctl reload apache2
   ```

---

## 8. Process Management (PM2 or Systemd)

### Option A: Running with PM2 (Recommended)
```bash
sudo npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Option B: Running with Systemd
```bash
sudo cp bmsc-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable bmsc-backend
sudo systemctl start bmsc-backend
```

---

## 9. Automated Deployment Script

Deployments can be executed in a single command using `./deploy.sh`:
```bash
./deploy.sh
```

---

## 10. Verification & Health Check

After deployment, test the endpoints using `curl` or a web browser:

1. **Frontend App**: `https://domain-saya.com`
2. **Health Check Endpoint**:
   ```bash
   curl https://domain-saya.com/api/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "service": "BMSC API",
     "timestamp": "...",
     "uptime": 1234.5
   }
   ```

---

## 11. Troubleshooting Guide

| Issue | Root Cause | Solution |
|---|---|---|
| **404 Page Not Found on Refresh** | Missing SPA fallback in web server | Ensure Nginx `try_files $uri $uri/ /index.html;` or Apache `RewriteRule . /index.html` is enabled. |
| **404 on API calls (`/auth/login`)** | Missing `/api` prefix or proxy mismatch | Verify `VITE_API_URL` contains `/api` and web server routes `/api/` to `http://127.0.0.1:3000/api/`. |
| **CORS Error in Console** | Frontend origin not in `ALLOWED_ORIGINS` | Add frontend domain to `ALLOWED_ORIGINS` in `backend/.env` and restart backend. |
| **Prisma Seed Error** | Incompatible `ts-node` configuration | Ensure `backend/package.json` uses `"seed": "tsx prisma/seed.ts"`. |
| **Uploaded images broken** | Permission issue on `backend/uploads` | Run `sudo chown -R www-data:www-data backend/uploads` and `sudo chmod -R 755 backend/uploads`. |
