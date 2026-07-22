# BMSC - Agency Management System

BMSC (Brand Management System Creativ) adalah aplikasi platform manajemen *agency* terintegrasi yang dirancang khusus untuk kreator konten dan *creative agency*. Sistem ini memusatkan seluruh kebutuhan operasional bisnis mulai dari manajemen proyek, kolaborasi naskah (*script*), pembuatan Quotation & Invoice yang kustomabel, hingga komunikasi langsung (*real-time chat*) dengan klien di dalam satu platform.

## 🚀 Fitur Utama

- **Manajemen Proyek Lengkap:** Melacak fase pengerjaan proyek dari *drafting*, revisi, hingga *approval* final.
- **Quotation & Invoice Otomatis:** Pembuatan tagihan (Invoice) dan penawaran harga (Quotation) secara dinamis yang bisa diakses oleh klien (publik). Format, identitas *agency*, logo, dan rincian bank dapat dikustomisasi penuh.
- **Kolaborasi Naskah (Script):** Fasilitas untuk menulis dan mengomentari naskah antar tim internal dan eksternal (Brand/Klien).
- **Real-Time Chat:** Komunikasi yang terpusat di setiap proyek menggunakan teknologi WebSockets (Socket.io).
- **Sistem Role & Akses (RBAC):** Role-based access control yang dinamis. *Super Administrator*, *Admin*, dan *Klien* memiliki batasan aksi masing-masing (mulai dari hak melihat, mengedit, hingga hak untuk mencetak dokumen).
- **Pengaturan & Identitas Agensi:** Kustomisasi profil lengkap perusahaan, alamat, kontak, dan logo yang akan dicetak secara dinamis ke dokumen-dokumen resmi penagihan.

---

## 🛠️ Tech Stack & Kebutuhan (Requirements)

Proyek ini dipisah menjadi dua bagian utama: **Frontend** dan **Backend**. Keduanya dikembangkan dengan arsitektur monorepo sederhana.

**Kebutuhan Sistem Minimum:**
- **Node.js**: v18.x atau lebih baru (Disarankan v20 LTS).
- **MySQL**: v8.0 atau lebih baru.
- **NPM** atau **Yarn**.

### Frontend
- **Framework:** React 19 + TypeScript + Vite.
- **Styling:** Tailwind CSS + Radix UI + class-variance-authority.
- **State Management & Fetching:** Zustand & TanStack React Query.
- **Routing:** React Router DOM v7.
- **Icons & Charts:** Lucide React & Recharts.

### Backend
- **Framework:** Express + TypeScript.
- **Database ORM:** Prisma ORM.
- **Real-time Engine:** Socket.IO.
- **Authentication:** JSON Web Tokens (JWT) & bcrypt.
- **File Upload:** Multer.

---

## ⚙️ Panduan Instalasi (Installation)

### 1. Persiapan Database
Buat sebuah database kosong di MySQL Anda. Contoh nama databasenya: `bmsc_db`.

### 2. Setup Backend
Masuk ke folder backend dan install dependensinya:
```bash
cd backend
npm install
```

Buat file `.env` di dalam folder `backend/` dan sesuaikan koneksi databasenya (berikut adalah contoh):
```env
# URL koneksi MySQL Prisma
DATABASE_URL="mysql://root:password@localhost:3306/bmsc_db"

# Kunci rahasia untuk Token Authentication (Ubah dengan string acak)
JWT_SECRET="rahasia-bmsc-super-aman"

# Port server backend (default)
PORT=3000
```

Selanjutnya, migrasi database dan buat tabel-tabelnya (serta men-seed role dan super admin awal):
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed   # (Jika Anda memiliki file seed)
```

Untuk menjalankan server backend (Mode Development):
```bash
npm run dev
```
Backend akan berjalan di `http://localhost:3000`.

### 3. Setup Frontend
Buka terminal baru, masuk ke folder root proyek (frontend) dan install dependensi:
```bash
npm install
```

Secara default, frontend akan menghubungi API backend di `http://localhost:3000/api`. (Anda bisa mengubahnya di `src/lib/api.ts` bila perlu).

Jalankan server Vite untuk frontend:
```bash
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`.

---

## 💡 Cara Penggunaan

1. **Login:** Buka browser dan arahkan ke `http://localhost:5173`. Gunakan akun *Super Administrator* atau Admin yang sudah terdaftar.
2. **Setup Awal:** Masuk ke menu **Pengaturan (Settings)**. Lengkapi Identitas & Profil Agensi, unggah Logo HQ, dan atur rekening Bank agar fitur cetak tagihan (Invoice/Quotation) bisa mencantumkan informasi bisnis Anda dengan benar.
3. **Manajemen Pengguna:** Masuk ke menu **Roles** dan **Users** untuk mengundang tim internal Anda atau akun perwakilan klien (Brand). Jangan lupa atur izin/hak akses (*permissions*) sesuai peran masing-masing.
4. **Buat Proyek:** Melalui menu Dashboard atau **Projects**, buat proyek baru. Tetapkan Klien/Brand yang akan ditagihkan dan undang PIC dari klien untuk bisa masuk dan ikut memberikan ulasan atau *chat* bersama tim Anda.

## 🔒 Keamanan
Sistem ini menggunakan JWT berlapis dan pengecekan otorisasi berbasis _roles/permissions_ pada setiap _endpoint_ mutasi (*create*, *update*, *delete*). Pastikan Anda menyimpan `JWT_SECRET` dengan aman pada lingkungan _production_.

---

## 🐧 Linux / Production Deployment

Untuk meng-deploy aplikasi ini di server Linux (VPS/Cloud) agar bisa diakses secara publik (bukan localhost):

### 1. Konfigurasi Environment (`.env`)
Pastikan Anda membuat file `.env` di dua tempat:
**Di folder utama (Frontend):**
```env
VITE_API_URL=http://<IP_SERVER_ANDA>:3000/api
VITE_BACKEND_URL=http://<IP_SERVER_ANDA>:3000
```
**Di folder `backend/`:**
```env
PORT=3000
HOST=0.0.0.0
DATABASE_URL="mysql://user:password@localhost:3306/bmsc_db"
JWT_SECRET="rahasia-super-aman"
```

### 2. Menjalankan Backend (menggunakan PM2)
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run build
npm install -g pm2
pm2 start dist/server.js --name bmsc-backend
```

### 3. Menjalankan Frontend (menggunakan PM2 & Serve)
```bash
# Kembali ke folder root proyek
cd ..
npm install
npm run build
npm install -g serve
pm2 start "serve -s dist -p 5173" --name bmsc-frontend
```

Sekarang aplikasi BMSC Anda bisa diakses dari jaringan luar/publik melalui `http://<IP_SERVER_ANDA>:5173`.
