# Brand App

![Brand App](https://img.shields.io/badge/Status-Active-success) ![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue) ![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green) ![Prisma](https://img.shields.io/badge/ORM-Prisma-white) ![MySQL](https://img.shields.io/badge/Database-MySQL-orange)

Dokumentasi lengkap instalasi, konfigurasi, dan *deployment* untuk **Brand App**. Sistem ini menggunakan arsitektur modern berbasis Node.js untuk backend dan React.js untuk antarmuka (*frontend*).

---

## 📋 Daftar Isi
- [Struktur Direktori](#1-struktur-direktori)
- [Persiapan & Instalasi Backend](#2-persiapan--instalasi-backend)
- [Konfigurasi Database](#3-konfigurasi-database)
- [Setup Frontend](#4-setup-frontend)
- [Menjalankan Aplikasi Secara Manual](#5-menjalankan-aplikasi-secara-manual)
- [Deployment via Systemd (Auto-start)](#6-deployment-via-systemd-auto-start)
- [Troubleshooting](#7-troubleshooting)
- [Saran untuk Lingkungan Produksi](#8-saran-untuk-lingkungan-produksi)
- [Kredensial Default](#9-kredensial-default)

---

## 1. Struktur Direktori

Aplikasi ini dibagi menjadi dua bagian utama di dalam root direktori `/var/www/html`:

```text
/var/www/html/
├── src/                # Kode sumber Frontend (React)
├── backend/            # Lingkungan Backend (Node.js)
│   ├── src/            # Express API, Controllers, Routes
│   ├── prisma/         # Konfigurasi ORM dan Migrasi
│   └── .env            # Environment variabel backend
└── package.json        # Dependencies Frontend
```

---

## 2. Persiapan & Instalasi Backend

Masuk ke direktori backend dan instal seluruh dependensi yang dibutuhkan, termasuk *runtime* TypeScript.

```bash
cd /var/www/html/backend
npm install
npm install -D typescript tsx
```

---

## 3. Konfigurasi Database

### Mengatur Environment
Salin template konfigurasi dan atur kredensial koneksi MySQL Anda.

```bash
nano .env
```
Isi file `.env` dengan format berikut (sesuaikan dengan kredensial server Anda):
```env
DATABASE_URL="mysql://username:password@localhost:3306/bmsc_db"
JWT_SECRET="secret-key-super-aman-anda"
PORT=3000
```

### Inisialisasi Prisma & Database
Setelah database MySQL berjalan, sinkronkan skema dan isi data awal (*seed*).

```bash
# Generate Prisma Client
npx prisma generate

# Sinkronisasi skema ke database (buat tabel)
npx prisma db push

# (Opsional) Isi database dengan data default
npx prisma db seed
```
> **Catatan:** Jika *seed* gagal, pastikan Anda memiliki script berikut di `backend/package.json`:
> ```json
> "prisma": {
>   "seed": "tsx prisma/seed.ts"
> }
> ```

---

## 4. Setup Frontend

Kembali ke direktori utama (root) untuk mengatur antarmuka.

```bash
cd /var/www/html
npm install
```

### Konfigurasi API
Hubungkan *Frontend* ke *Backend* dengan mendefinisikan *Base URL* dari server.

```bash
nano .env
```
Isi dengan alamat IP Server Anda, contoh:
```env
VITE_BACKEND_URL=http://169.69.69.37:3000
```
> **Penting:** Ganti `169.69.69.37` dengan alamat IP asli mesin server Anda atau gunakan `http://localhost:3000` jika Anda menjalankannya secara lokal di mesin yang sama.

---

## 5. Menjalankan Aplikasi Secara Manual

Anda dapat menjalankan kedua sistem di terminal yang berbeda (untuk keperluan *development* / uji coba).

**Terminal 1: Menjalankan Backend**
```bash
cd /var/www/html/backend
npm run dev
```
*(Server backend akan berjalan di `http://0.0.0.0:3000`)*

**Terminal 2: Menjalankan Frontend**
```bash
cd /var/www/html
npm run dev
```

---

## 6. Deployment via Systemd (Auto-start)

Untuk menjaga agar aplikasi terus berjalan di *background* dan otomatis menyala kembali (auto-start) ketika server *reboot*, gunakan **systemd**.

### Membuat Service Backend
Buat file service backend:
```bash
nano /etc/systemd/system/brand-backend.service
```
Isi dengan konfigurasi berikut:
```ini
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
```

### Membuat Service Frontend
Buat file service frontend:
```bash
nano /etc/systemd/system/brand-frontend.service
```
Isi dengan konfigurasi berikut:
```ini
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
```

### Mengaktifkan dan Memulai Service

Jalankan serangkaian perintah ini untuk menerapkan perubahan sistem.

```bash
# Memuat ulang daemon systemd
systemctl daemon-reload

# Menjadikan service auto-start saat boot
systemctl enable brand-backend
systemctl enable brand-frontend

# Menjalankan service sekarang
systemctl start brand-backend
systemctl start brand-frontend
```

Anda bisa memeriksa status atau melihat log (catatan error) menggunakan:
```bash
# Status
systemctl status brand-backend
systemctl status brand-frontend

# Log Real-time
journalctl -u brand-backend -f
journalctl -u brand-frontend -f
```

---

## 7. Troubleshooting

Beberapa langkah perbaikan jika terjadi masalah.

**1. Mengecek Ketersediaan Port Backend (3000)**
```bash
ss -tulpn | grep 3000
```
*(Jika port bentrok dengan aplikasi lain, cari proses ID (PID) node dan matikan).*

**2. Rebuild Backend Secara Bersih**
```bash
cd /var/www/html/backend
npm install
npx prisma generate
npm run build
systemctl restart brand-backend
```

**3. Test Konektivitas Login API (CLI)**
```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@email.com","password":"password123"}'
```

---

## 8. Saran untuk Lingkungan Produksi

Menjalankan perintah `npm run dev` sangat **tidak disarankan** untuk server publik sesungguhnya (skala besar). Pertimbangkan topologi berikut:

### Strategi Eksekusi:
- **Backend:** Kompilasi dengan `npm run build`, lalu jalankan menggunakan file `dist/server.js` (misalnya dengan modul `pm2` atau `node dist/server.js`).
- **Frontend:** Bangun aset statis dengan `npm run build`, lalu sajikan folder `dist/` tersebut dengan web server sesungguhnya.

### Web Server & Keamanan:
Gunakan **Nginx** sebagai *Reverse Proxy* untuk mendistribusikan lalu lintas secara aman.

```text
       [ KLIEN / USER ]
              │
          (HTTPS / WAF Cloudflare)
              │
        [ NGINX PROXY ]
         /           \
        /             \
   [ Aset Frontend ]  [ Node.js API (Port 3000) ]
                            │
                       [ MySQL ]
```

---

## 9. Kredensial Default

Setelah Anda mengeksekusi *seed* pada database, akun default berikut dapat digunakan untuk mengakses dashboard pertama kali:

- **Email**: `admin@email.com`
- **Password**: `password123`
- **Role**: `SUPER_ADMIN`

*(Sangat disarankan untuk mengubah kredensial ini sesegera mungkin dari menu pengguna).*