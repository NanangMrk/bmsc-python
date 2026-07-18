# PRD — Brand Management System (BMS)
**Versi:** 1.0
**Tech Stack:** React (Vite) + TypeScript, Prisma ORM, MySQL, Node.js/Express (BE), TailwindCSS
**Tipe Aplikasi:** Multi-user, Multi-role, SaaS internal untuk Brand, Konten Kreator, Editor, Admin

---

## 1. Latar Belakang & Tujuan

Aplikasi ini adalah sistem manajemen brand & konten yang mempertemukan **Brand (klien)**, **Admin/Internal Team**, **Konten Kreator**, dan **Editor** dalam satu platform terpusat. Tujuannya:

1. Melacak seluruh **project** dari tahap konsep sampai upload konten, per platform (Instagram, TikTok, YouTube, dll).
2. Melacak **pemasukan & pembayaran** (quotation → invoice → payment proof) secara transparan antara Admin dan Brand.
3. Menyediakan **kolaborasi real-time** (chat per project) antara semua pihak yang terlibat.
4. Menyediakan **kontrol akses granular** (role & permission per menu, per project, per invoice).

Aplikasi terdiri dari dua area besar:
- **Landing Page (Public)** — halaman marketing/informasi sebelum login.
- **Dashboard App (Private)** — aplikasi utama setelah login, berbeda tampilan berdasarkan role.

---

## 2. Tech Stack & Arsitektur

| Layer | Teknologi |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | TailwindCSS + shadcn/ui (component library) |
| State Management | Zustand / React Query (TanStack Query) untuk server state |
| Backend | Node.js + Express (atau Fastify) REST API |
| ORM | Prisma |
| Database | MySQL |
| Auth | JWT (access + refresh token), bcrypt untuk password |
| File Storage | Local disk / S3-compatible (untuk foto resi, bukti bayar, thumbnail) |
| Realtime Chat | Socket.IO / WebSocket |
| PDF Export | Puppeteer atau react-pdf (untuk quotation & invoice) |
| Rich Text Editor | Tiptap / Editor.js (untuk fitur "Ide & Konsep" ala Notion) |

### 2.1 Arsitektur Folder (Frontend, ringkas)
```
src/
├── pages/
│   ├── landing/                # halaman publik
│   ├── auth/                   # login, forgot password
│   ├── dashboard/               # dashboard admin & brand
│   ├── projects/
│   │   ├── [id]/
│   │   │   ├── payment/
│   │   │   ├── shipment/
│   │   │   ├── concept/
│   │   │   ├── script/
│   │   │   ├── production/
│   │   │   ├── upload/
│   │   │   └── chat/
│   ├── invoice/
│   │   ├── quotation/
│   │   └── invoice/
│   ├── platform/
│   ├── ratecard/
│   └── users-roles/
├── components/
├── hooks/
├── stores/
├── services/ (API client)
└── lib/
```

---

## 3. User Roles (Default)

Sistem menggunakan **role dinamis** (dibuat sendiri oleh admin di menu "Kelola User & Role"), namun default awal yang disarankan:

| Role | Deskripsi |
|---|---|
| Super Admin | Akses penuh ke semua menu & data |
| Admin/Internal | Kelola project, invoice, konfirmasi pengiriman, dll (permission dapat dibatasi) |
| Brand | Klien, hanya melihat project & invoice miliknya |
| Konten Kreator | Akses menu Ide & Konsep, Script, Produksi pada project yang di-assign |
| Editor | Akses menu Produksi & Upload pada project yang di-assign |

> Semua role selain Super Admin **dibuat & dikustomisasi bebas** melalui sistem permission matrix (lihat bagian 6.7).

---

## 4. Core Features — Ringkasan Menu

1. **Dashboard**
2. **Project** (6 Fase + Chat)
3. **Invoice & Payment** (Quotation → Invoice → Bukti Bayar)
4. **Kelola Platform**
5. **Rate Card**
6. **Kelola User & Role**

---

## 5. Landing Page (Public)

Landing page statis/marketing berisi:
- Hero section (value proposition aplikasi)
- Fitur unggulan (highlight: manajemen project multi-platform, transparansi pembayaran, kolaborasi tim)
- Testimoni brand (opsional)
- CTA "Login" di navbar → membuka form login → redirect ke `/dashboard`

Tidak perlu registrasi publik — user dibuat oleh Admin melalui menu **Kelola User & Role**.

---

## 6. Detail Fitur & Requirement

### 6.1 Dashboard

**Tampilan berbeda berdasarkan role:**

**Admin/Super Admin:**
- Total pemasukan (global, semua brand) — grafik per bulan/tahun
- Total project aktif, selesai, terlambat
- Status pembayaran seluruh project (menunggu / verifikasi / lunas)
- List project terbaru & yang butuh perhatian (misal: resi belum dikonfirmasi, pembayaran menunggu verifikasi)
- Ringkasan performa per platform

**Brand:**
- Total dana yang sudah dibayarkan & sisa tagihan (khusus project miliknya)
- List project miliknya beserta progress fase (progress bar 6 fase)
- Notifikasi (invoice baru, status pengiriman berubah, dll)

**Requirement:**
- Data harus difilter otomatis berdasarkan `project_user_access` — brand hanya lihat project yang di-assign ke akunnya.
- Widget dashboard sebaiknya dibuat modular (card-based) agar mudah dikembangkan.

---

### 6.2 Project

#### 6.2.1 CRUD Project
- Tambah project baru: nama project, brand terkait, platform yang digunakan (multi-select dari "Kelola Platform"), tanggal mulai, deadline, PIC (konten kreator/editor yang di-assign), nilai project (total invoice).
- Edit & hapus project — dibatasi oleh permission (`project.create`, `project.edit`, `project.delete`).
- Setiap project otomatis membuat **6 Fase** sebagai sub-menu/tab.
- Setiap project juga otomatis membuat **2 termin pembayaran**: DP 50% dan Pelunasan 50%.

#### 6.2.2 Fase 1 — Payment
- Menampilkan 2 termin: **DP (50%)** dan **Pelunasan (50%)**.
- Setiap termin punya status: `Menunggu` → `Proses Verifikasi` → `Lunas`.
- Brand dapat mengupload bukti transfer pada termin terkait (status otomatis berubah ke "Proses Verifikasi").
- Admin melakukan verifikasi manual → ubah status ke "Lunas" (atau tolak → kembali ke "Menunggu" dengan catatan).
- Histori perubahan status dicatat (audit trail: siapa, kapan, status apa).
- Progress bar total pembayaran project ditampilkan (contoh: 50% Lunas, 50% Menunggu).

#### 6.2.3 Fase 2 — Pengiriman Barang
- Brand dapat **upload foto resi pengiriman**.
- Status pengiriman: `Belum Dikirim` → `Dikirim (menunggu konfirmasi)` → `Dikonfirmasi Admin`.
- Setelah paket sampai, brand dapat **upload foto/video unboxing** sebagai bukti barang diterima.
- Admin dapat melihat & mengkonfirmasi resi, serta melihat foto/video yang diupload brand.
- Riwayat pengiriman (jika ada lebih dari 1 pengiriman per project) ditampilkan sebagai list/log.

#### 6.2.4 Fase 3 — Ide & Konsep (Notion-like Editor)
- **Setiap platform yang dipilih di project memiliki page-nya sendiri** (page terpisah, independen).
- Editor rich-text interaktif (mirip Notion), mendukung:
  - Heading (H1/H2/H3), bold, italic, underline, strikethrough
  - Bullet list, numbered list, checklist/todo
  - Ganti font & ukuran font
  - Blok gambar/embed
  - Divider, quote block
  - Slash command (`/`) untuk insert blok cepat
- Auto-save (debounce) ke database sebagai JSON block-based content.
- Ada menu **"Kelola Platform"** di dalam project untuk menambah/menghapus platform mana saja yang aktif untuk project tersebut (mengambil master data dari menu global "Kelola Platform").

#### 6.2.5 Fase 4 — Script
Berdasarkan referensi desain (lampiran screenshot "AIRMETRO"):
- Setiap platform punya script sendiri, disusun per **Segment** (misal: "Opening", "Isi", "Closing").
- Setiap segment memiliki beberapa **Row** (format: `1.1`, `1.2`, `1.3`, dst).
- Kolom tabel script:
  | Kolom | Deskripsi |
  |---|---|
  | Row | Nomor otomatis (segment.urutan) |
  | Audio | Teks naskah/voice over, dengan word count & estimasi durasi (RT) otomatis |
  | Visual | Deskripsi visual adegan |
  | Image | Thumbnail/reference gambar (upload) |
  | Duration | Durasi manual/estimasi per row |
- Word count & Total RT (running time) dihitung otomatis di level row, segment, dan total script.
- Bisa tambah/hapus row & segment.
- Bisa checkbox multi-select row (untuk bulk action: hapus, duplikat, dsb — tombol checkbox di kiri atas seperti pada referensi).
- Tombol "Share" untuk membagikan script (generate link view-only, mirip referensi gambar).

#### 6.2.6 Fase 5 — Produksi
- Setiap platform punya task list sendiri.
- Task berbentuk checklist (checkbox selesai/belum), dengan field: nama task, PIC, deadline, status (`To Do`, `In Progress`, `Review`, `Done`).
- Bisa tampilan **List** dan opsional **Kanban board** (drag-drop antar status).
- Progress produksi ditampilkan sebagai persentase (jumlah task selesai / total task) per platform.

#### 6.2.7 Fase 6 — Upload
- Setiap platform punya area upload sendiri.
- User cukup **paste link** (link YouTube/TikTok/Instagram/Drive dll), sistem otomatis fetch **thumbnail & judul** via oEmbed/API/scraping metadata.
- List link yang sudah diupload ditampilkan sebagai card (thumbnail + judul + tanggal upload + platform).
- Bisa hapus/edit link.

#### 6.2.8 Chat Project (Interaktif)
- Chat real-time per project (menggunakan Socket.IO/WebSocket), diakses dari dalam halaman project (sidebar/tab).
- Semua user yang punya akses ke project tersebut (admin, brand, kreator, editor yang di-assign) dapat ikut chat.
- Mendukung: teks, upload lampiran (gambar/file), mention (`@user`), read-receipt/status "sudah dibaca" (opsional).
- Notifikasi in-app (dan opsional email) saat ada pesan baru.

---

### 6.3 Invoice & Payment

#### 6.3.1 Quotation
- Buat penawaran (quotation) untuk brand: item/deskripsi jasa, qty, harga satuan, subtotal, pajak (opsional), total.
- Bisa dikaitkan ke project tertentu (opsional, atau berdiri sendiri sebelum project dibuat).
- Aksi yang tersedia (sesuai permission): **Edit, Hapus, Cetak, Salin Link (share link view-only), Export PDF**.
- Brand yang memiliki akses (via `invoice_user_access`) dapat melihat quotation miliknya melalui link atau dashboard-nya, dengan aksi: **Lihat, Cetak, Export PDF** (tanpa edit/hapus).
- Status quotation: `Draft`, `Terkirim`, `Diproses`, `Ditolak`.

#### 6.3.2 Invoice
- Ketika quotation berstatus **"Diproses"/disetujui**, sistem otomatis men-generate **Invoice** dari data quotation tersebut.
- Menu & aksi invoice identik dengan quotation (edit, hapus, cetak, salin link, export PDF) — dibatasi oleh permission.
- Invoice terhubung ke termin pembayaran project (DP/Pelunasan) bila terkait project.
- Status invoice: `Belum Dibayar`, `Menunggu Verifikasi`, `Lunas`, `Overdue`.

#### 6.3.3 Bukti Pembayaran
- Tab terpisah untuk upload bukti pembayaran (brand upload bukti transfer, terhubung ke invoice/termin terkait).
- Admin memverifikasi bukti pembayaran → update status invoice/termin.
- Riwayat semua bukti pembayaran yang pernah diupload, ditampilkan sebagai log.

---

### 6.4 Kelola Platform

- Master data platform (misal: Instagram, TikTok, YouTube, Shopee, dll).
- Field: nama platform, icon/logo, **biaya ideal** (rate dasar/acuan untuk platform ini — dipakai sebagai referensi saat membuat rate card/quotation).
- CRUD penuh oleh user dengan permission `platform.manage`.
- Data platform inilah yang menjadi pilihan multi-select saat membuat project (fase Ide & Konsep, Script, Produksi, Upload otomatis mengikuti platform yang dipilih di project).

---

### 6.5 Rate Card

- Buat & kelola rate card (daftar harga jasa per jenis konten/platform), misal: "Video TikTok 30 detik — Rp X", "Foto Produk — Rp Y".
- Brand dapat **melihat** rate card yang di-publish (read-only), untuk referensi sebelum request quotation.
- Rate card dapat dijadikan referensi/template saat admin membuat quotation baru (auto-fill harga).

---

### 6.6 Kelola User & Role

#### 6.6.1 Kelola User
- Tambah/edit/hapus user: nama, email, password, role, status aktif/nonaktif.
- Reset password oleh admin.
- Assign user ke brand tertentu (jika role = Brand) atau ke project tertentu (jika role = Kreator/Editor).

#### 6.6.2 Kelola Role & Permission
- Admin dapat membuat role baru bebas (nama role custom).
- **Permission matrix granular per menu**, contoh struktur:

| Modul | Aksi yang tersedia |
|---|---|
| Dashboard | `view` |
| Project | `create`, `view`, `edit`, `delete`, `view_all` (lihat semua project) vs `view_assigned` (hanya yang di-assign) |
| Project - Payment | `view`, `update_status`, `upload_proof` |
| Project - Shipment | `view`, `upload_resi`, `confirm` (khusus admin) |
| Project - Concept | `view`, `edit` |
| Project - Script | `view`, `edit`, `share` |
| Project - Production | `view`, `edit_task`, `check_task` |
| Project - Upload | `view`, `add_link`, `delete_link` |
| Project - Chat | `view`, `send_message` |
| Quotation | `create`, `edit`, `delete`, `export`, `view` |
| Invoice | `create`, `edit`, `delete`, `export`, `view`, `verify_payment` |
| Platform | `manage` |
| Rate Card | `manage`, `view` |
| User & Role | `manage_user`, `manage_role` |

- Setiap role x modul x aksi disimpan sebagai baris di tabel `role_permission` (boolean/enum).
- **Scoping data per user**: selain permission per menu, admin dapat menentukan secara spesifik:
  - Project mana saja yang bisa dilihat oleh user tertentu (`project_user_access`)
  - Invoice/Quotation mana saja yang bisa dilihat oleh user tertentu (`invoice_user_access`)
- UI permission matrix disarankan berbentuk **tabel checkbox** (baris = modul/aksi, kolom = ceklis on/off), dengan preset role agar mudah dikonfigurasi.

---

## 7. Skema Database (Prisma — Ringkasan Model)

```prisma
model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  password      String
  roleId        String
  role          Role     @relation(fields: [roleId], references: [id])
  brandId       String?  // jika user adalah brand
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  projectAccess ProjectUserAccess[]
  invoiceAccess InvoiceUserAccess[]
  chatMessages  ChatMessage[]
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  permissions RolePermission[]
  users       User[]
}

model Permission {
  id     String @id @default(uuid())
  module String   // e.g. "project", "invoice", "platform"
  action String   // e.g. "create", "edit", "delete", "view"
  roles  RolePermission[]
}

model RolePermission {
  id           String     @id @default(uuid())
  roleId       String
  permissionId String
  allowed      Boolean    @default(false)
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  @@unique([roleId, permissionId])
}

model Brand {
  id       String    @id @default(uuid())
  name     String
  logo     String?
  projects Project[]
}

model Platform {
  id         String   @id @default(uuid())
  name       String
  icon       String?
  idealCost  Decimal?
  projects   ProjectPlatform[]
}

model Project {
  id            String   @id @default(uuid())
  name          String
  brandId       String
  brand         Brand    @relation(fields: [brandId], references: [id])
  startDate     DateTime
  deadline      DateTime?
  totalValue    Decimal
  status        String   // active, completed, overdue, etc
  platforms     ProjectPlatform[]
  payments      PaymentTermin[]
  shipments     Shipment[]
  conceptPages  ConceptPage[]
  scripts       ScriptSegment[]
  productionTasks ProductionTask[]
  uploads       UploadLink[]
  chatMessages  ChatMessage[]
  userAccess    ProjectUserAccess[]
  createdAt     DateTime @default(now())
}

model ProjectPlatform {
  id         String   @id @default(uuid())
  projectId  String
  platformId String
  project    Project  @relation(fields: [projectId], references: [id])
  platform   Platform @relation(fields: [platformId], references: [id])
}

model PaymentTermin {
  id         String   @id @default(uuid())
  projectId  String
  project    Project  @relation(fields: [projectId], references: [id])
  type       String   // "DP" | "PELUNASAN"
  percentage Int      // 50
  amount     Decimal
  status     String   // "MENUNGGU" | "PROSES_VERIFIKASI" | "LUNAS"
  proofFile  String?
  verifiedBy String?
  verifiedAt DateTime?
}

model Shipment {
  id           String   @id @default(uuid())
  projectId    String
  project      Project  @relation(fields: [projectId], references: [id])
  resiPhoto    String?
  status       String   // BELUM_DIKIRIM | DIKIRIM | DIKONFIRMASI
  arrivalProof String?  // foto/video unboxing
  confirmedBy  String?
  confirmedAt  DateTime?
}

model ConceptPage {
  id         String   @id @default(uuid())
  projectId  String
  platformId String
  project    Project  @relation(fields: [projectId], references: [id])
  content    Json     // block-based rich text content
  updatedAt  DateTime @updatedAt
}

model ScriptSegment {
  id        String   @id @default(uuid())
  projectId String
  platformId String
  title     String   // e.g. "OPENING"
  subtitle  String?
  project   Project  @relation(fields: [projectId], references: [id])
  rows      ScriptRow[]
}

model ScriptRow {
  id         String   @id @default(uuid())
  segmentId  String
  segment    ScriptSegment @relation(fields: [segmentId], references: [id])
  rowNumber  String   // "1.1"
  audioText  String?  @db.Text
  visualText String?  @db.Text
  imageUrl   String?
  duration   Int?     // detik
  wordCount  Int?
}

model ProductionTask {
  id        String   @id @default(uuid())
  projectId String
  platformId String
  project   Project  @relation(fields: [projectId], references: [id])
  title     String
  assigneeId String?
  status    String   // TODO | IN_PROGRESS | REVIEW | DONE
  deadline  DateTime?
}

model UploadLink {
  id         String   @id @default(uuid())
  projectId  String
  platformId String
  project    Project  @relation(fields: [projectId], references: [id])
  url        String
  title      String?
  thumbnail  String?
  createdAt  DateTime @default(now())
}

model ChatMessage {
  id        String   @id @default(uuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  message   String   @db.Text
  attachment String?
  createdAt DateTime @default(now())
}

model Quotation {
  id        String   @id @default(uuid())
  brandId   String
  projectId String?
  items     Json     // array of {desc, qty, price}
  total     Decimal
  status    String   // DRAFT | TERKIRIM | DIPROSES | DITOLAK
  shareToken String? @unique
  createdAt DateTime @default(now())
  invoice   Invoice?
}

model Invoice {
  id          String   @id @default(uuid())
  quotationId String?  @unique
  quotation   Quotation? @relation(fields: [quotationId], references: [id])
  brandId     String
  projectId   String?
  total       Decimal
  status      String   // BELUM_DIBAYAR | MENUNGGU_VERIFIKASI | LUNAS | OVERDUE
  shareToken  String?  @unique
  paymentProof String?
  createdAt   DateTime @default(now())
}

model RateCard {
  id       String  @id @default(uuid())
  name     String
  platformId String?
  price    Decimal
  unit     String? // e.g. "per video", "per foto"
  published Boolean @default(true)
}

model ProjectUserAccess {
  id        String  @id @default(uuid())
  userId    String
  projectId String
  user      User    @relation(fields: [userId], references: [id])
  project   Project @relation(fields: [projectId], references: [id])
  @@unique([userId, projectId])
}

model InvoiceUserAccess {
  id        String  @id @default(uuid())
  userId    String
  invoiceId String
  user      User    @relation(fields: [userId], references: [id])
  @@unique([userId, invoiceId])
}
```

> Catatan: skema di atas adalah rancangan awal; nama tabel/relasi dapat disesuaikan saat implementasi (misal menambahkan `AuditLog` untuk mencatat histori perubahan status pembayaran/pengiriman).

---

## 8. User Flow

### 8.1 Flow Umum (Semua Role)
1. User membuka landing page → klik **Login**.
2. Input email & password → sistem validasi → redirect ke `/dashboard`.
3. Dashboard menampilkan data sesuai role (lihat 6.1).
4. User memilih menu di sidebar sesuai permission yang dimiliki (menu yang tidak ada permission-nya disembunyikan otomatis).

### 8.2 Flow Admin — Membuat Project Baru
1. Admin buka menu **Project** → klik **Tambah Project**.
2. Isi form: nama project, pilih brand, pilih platform (multi-select), tanggal mulai, deadline, nilai project, assign PIC (kreator/editor).
3. Simpan → sistem otomatis membuat:
   - 2 termin pembayaran (DP 50%, Pelunasan 50%) berstatus "Menunggu".
   - Page kosong per platform untuk Fase Ide & Konsep, Script, Produksi, Upload.
4. Admin diarahkan ke halaman detail project dengan 6 tab fase + tab chat.

### 8.3 Flow Pembayaran
1. Brand login → buka project miliknya → tab **Payment**.
2. Brand upload bukti transfer untuk termin DP → status berubah menjadi "Proses Verifikasi".
3. Admin menerima notifikasi → buka tab Payment → cek bukti transfer → klik **Verifikasi** → status menjadi "Lunas".
4. Proses sama berulang untuk termin Pelunasan.

### 8.4 Flow Pengiriman
1. Brand buka tab **Pengiriman Barang** → upload foto resi.
2. Admin cek & klik **Konfirmasi**.
3. Setelah barang sampai, brand upload foto/video unboxing sebagai bukti diterima.

### 8.5 Flow Konten (Ide & Konsep → Script → Produksi → Upload)
1. Kreator buka tab **Ide & Konsep** → pilih platform → menulis konsep di editor (mirip Notion).
2. Kreator/Editor lanjut ke tab **Script** → membuat segment & row (Audio, Visual, Image, Duration) sesuai konsep.
3. Editor buka tab **Produksi** → membuat task checklist berdasarkan script → mengerjakan & mencentang task.
4. Setelah konten jadi, Editor buka tab **Upload** → paste link hasil publikasi → sistem fetch thumbnail otomatis.
5. Selama proses, semua pihak dapat berdiskusi melalui tab **Chat** di project yang sama.

### 8.6 Flow Quotation → Invoice
1. Admin buka menu **Invoice & Payment → Quotation** → klik **Buat Quotation** → isi item & harga (bisa autofill dari Rate Card) → pilih brand tujuan → simpan.
2. Admin kirim quotation (ubah status ke "Terkirim") → brand menerima notifikasi & dapat melihat via dashboard atau share link.
3. Jika brand setuju, admin ubah status quotation ke "Diproses" → sistem otomatis generate **Invoice** dari data quotation.
4. Brand melihat invoice → upload bukti pembayaran pada tab **Bukti Pembayaran**.
5. Admin verifikasi → status invoice menjadi "Lunas".

### 8.7 Flow Kelola User & Role
1. Admin buka menu **Kelola User & Role → Role** → buat role baru (misal "Editor Freelance").
2. Admin atur permission matrix (centang modul & aksi yang diizinkan).
3. Admin buka tab **User** → tambah user baru → assign role tersebut.
4. Admin assign user ke project/invoice tertentu via `project_user_access` / `invoice_user_access` agar user hanya melihat data yang relevan.

---

## 9. Frontend Design Guideline

### 9.1 Prinsip Desain
- **Clean, data-dense, dashboard-oriented** — mengikuti pola aplikasi manajemen modern (mirip Notion + Linear + accounting app).
- Sidebar navigasi kiri (collapsible), konten utama di kanan, top bar berisi breadcrumb + search + profile.
- Warna netral (putih/abu terang) sebagai base, dengan 1 warna aksen (misal orange/biru) untuk CTA (mengacu pada tombol "Share" oranye di referensi screenshot).
- Tipografi: font sans-serif tegas untuk heading (bold), font reguler untuk body.
- Gunakan **badge warna** untuk status (Menunggu = kuning, Proses Verifikasi = biru, Lunas = hijau, dst) agar cepat dikenali.
- Tabel (seperti pada Script) menggunakan garis pemisah tipis, header sticky, dan checkbox bulk-select di kolom pertama.

### 9.2 Halaman Utama yang Dibutuhkan
| Halaman | Deskripsi |
|---|---|
| `/` | Landing page |
| `/login` | Form login |
| `/dashboard` | Dashboard (admin/brand) |
| `/projects` | List semua project (table/grid + filter status, brand, platform) |
| `/projects/:id` | Detail project dengan 6 tab fase + tab chat |
| `/invoice/quotation` | List quotation |
| `/invoice/quotation/:id` | Detail/edit quotation |
| `/invoice/invoice` | List invoice |
| `/invoice/invoice/:id` | Detail invoice + upload bukti bayar |
| `/platform` | Kelola platform |
| `/ratecard` | Kelola rate card |
| `/users` | Kelola user |
| `/roles` | Kelola role & permission matrix |

### 9.3 Komponen Reusable Utama
- `<DataTable />` — tabel generik dengan sorting, filter, pagination, bulk-select.
- `<StatusBadge status="LUNAS" />`
- `<RichTextEditor />` — untuk Fase Ide & Konsep (berbasis Tiptap).
- `<ScriptTable />` — tabel khusus Fase Script (auto word-count & RT).
- `<KanbanBoard />` — untuk Fase Produksi (opsional).
- `<ChatPanel />` — panel chat real-time per project.
- `<PermissionMatrix />` — komponen checkbox grid untuk Kelola Role.
- `<FileUploader />` — untuk resi, bukti bayar, foto/video unboxing.
- `<LinkThumbnailFetcher />` — untuk Fase Upload (fetch metadata dari URL).

---

## 10. Non-Functional Requirements

- **Keamanan**: JWT auth, password hashing (bcrypt), rate limiting login, validasi permission di sisi backend (bukan hanya UI).
- **Audit Trail**: setiap perubahan status penting (pembayaran, pengiriman, quotation/invoice) dicatat siapa & kapan.
- **Skalabilitas**: struktur multi-tenant ringan (semua brand dalam 1 database, dipisah via `brandId`/relasi akses).
- **Responsif**: dashboard tetap dapat diakses baik di desktop maupun tablet (mobile-friendly untuk brand yang hanya cek status).
- **Notifikasi**: in-app notification minimal untuk perubahan status pembayaran, pengiriman, pesan chat baru.
- **File Handling**: validasi tipe & ukuran file untuk upload (foto resi, bukti bayar max misal 5MB, format jpg/png/pdf).

---

## 11. Roadmap Implementasi (Saran Fase Pengembangan)

1. **Fase 1 — Fondasi**: Auth, User & Role management, Permission system, Landing page, layout dashboard.
2. **Fase 2 — Project Core**: CRUD project, 6 fase dasar (tanpa fitur lanjutan seperti rich editor/chat), Kelola Platform.
3. **Fase 3 — Invoice & Payment**: Quotation, Invoice, upload bukti bayar, PDF export.
4. **Fase 4 — Fitur Lanjutan**: Rich text editor (Ide & Konsep), Script table dengan word-count otomatis, Kanban Produksi, thumbnail fetcher (Upload).
5. **Fase 5 — Kolaborasi**: Chat real-time, notifikasi in-app.
6. **Fase 6 — Polish**: Dashboard analytics, audit log, optimisasi permission matrix UI.

---

*Dokumen ini adalah rancangan awal (v1.0) dan dapat disesuaikan lebih lanjut seiring diskusi teknis & kebutuhan bisnis.*