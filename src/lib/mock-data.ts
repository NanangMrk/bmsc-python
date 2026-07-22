// ─── Types ───────────────────────────────────────────────────────────────────

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'BRAND' | 'KREATOR' | 'EDITOR'

export type ProjectStatus = 'DRAFT' | 'BERJALAN' | 'PROSES_VERIFIKASI' | 'SELESAI'

export type PaymentStatus = 'MENUNGGU' | 'PROSES_VERIFIKASI' | 'LUNAS' | 'OVERDUE'

export type ShipmentStatus = 'BELUM_DIKIRIM' | 'DIKIRIM' | 'DIKONFIRMASI'

export type QuotationStatus = 'DRAFT' | 'TERKIRIM' | 'DIPROSES' | 'DITOLAK'

export type InvoiceStatus = 'BELUM_DIBAYAR' | 'TERMIN' | 'MENUNGGU_VERIFIKASI' | 'LUNAS' | 'OVERDUE'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  createdAt: string
}

export interface Brand {
  id: string
  name: string
  logo?: string
  email: string
}

export interface Platform {
  id: string
  name: string
  icon: string
  color: string
}

export interface Project {
  id: string
  name: string
  brandId: string
  brand: Brand
  platforms: Platform[]
  startDate: string
  deadline: string
  value: number
  status: ProjectStatus
  picIds: string[]
  progress: number // 0-6 phases
  createdAt: string
}

export interface Payment {
  id: string
  projectId: string
  type: 'DP' | 'PELUNASAN'
  amount: number
  status: PaymentStatus
  paymentProof?: string
  verifiedBy?: string
  verifiedAt?: string
  createdAt: string
  title?: string
  description?: string
  billTo?: {
    name?: string
    companyName?: string
    picName?: string
    email?: string
    phone?: string
    address?: string
    brand?: { name?: string }
  }
}

export interface QuotationItem {
  id: string
  name: string
  qty: number
  unit: string
  price: number
  subtotal: number
}

export interface Quotation {
  id: string
  number: string
  brandId: string
  brand: Brand
  items: QuotationItem[]
  total: number
  status: QuotationStatus
  note?: string
  createdAt: string
  sentAt?: string
}

export interface Invoice {
  id: string
  number: string
  quotationId?: string
  brandId: string
  brand: Brand
  projectId: string
  items?: QuotationItem[]
  total: number
  status: InvoiceStatus
  paymentProof?: string
  shareToken?: string
  createdAt: string
  dueDate: string
}

export interface RateCard {
  id: string
  name: string
  platformId?: string
  platform?: Platform
  price: number
  unit: string
  published: boolean
  profileId: string
  image?: string
  description?: string
}

export interface RateCardProfile {
  id: string
  name: string
  description: string
  avatar: string
  whatsapp: string
  email: string
  isDefault: boolean
  nichesText?: string
  termsText?: string
  statsJson?: string
}

export interface ChatMessage {
  id: string
  projectId: string
  userId: string
  user: User
  content: string
  attachment?: string
  createdAt: string
}

export interface ProductionTask {
  id: string
  projectId: string
  platformId: string
  name: string
  picId?: string
  deadline?: string
  status: TaskStatus
  completed: boolean
}
export interface AppNotification {
  id: string
  icon: string
  title: string
  desc: string
  createdAt: string
  read: boolean
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const mockPlatforms: Platform[] = [
  { id: 'p1', name: 'Instagram', icon: 'instagram', color: '#E1306C' },
  { id: 'p2', name: 'TikTok', icon: 'tiktok', color: '#000000' },
  { id: 'p3', name: 'YouTube', icon: 'youtube', color: '#FF0000' },
  { id: 'p4', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
  { id: 'p5', name: 'Twitter/X', icon: 'twitter', color: '#1DA1F2' },
]

export const mockBrands: Brand[] = [
  { id: 'b1', name: 'Kopi Nusantara', email: 'kopi@nusantara.id' },
  { id: 'b2', name: 'TechVision ID', email: 'hello@techvision.id' },
  { id: 'b3', name: 'Batik Wastra', email: 'contact@batikwastra.com' },
  { id: 'b4', name: 'GreenLife FMCG', email: 'brand@greenlife.co.id' },
]

export const mockUsers: User[] = [
  { id: 'u1', name: 'Rina Kartika', email: 'rina@bmsc.id', role: 'SUPER_ADMIN', createdAt: '2024-01-10' },
  { id: 'u2', name: 'Dimas Aditya', email: 'dimas@bmsc.id', role: 'ADMIN', createdAt: '2024-02-01' },
  { id: 'u3', name: 'Sarah Wijaya', email: 'sarah@kopinusantara.id', role: 'BRAND', createdAt: '2024-03-05' },
  { id: 'u4', name: 'Budi Santoso', email: 'budi@bmsc.id', role: 'KREATOR', createdAt: '2024-03-10' },
  { id: 'u5', name: 'Nadia Rahman', email: 'nadia@bmsc.id', role: 'EDITOR', createdAt: '2024-04-01' },
  { id: 'u6', name: 'Anton Prabowo', email: 'anton@techvision.id', role: 'BRAND', createdAt: '2024-04-15' },
  { id: 'u7', name: 'Mega Lestari', email: 'mega@bmsc.id', role: 'KREATOR', createdAt: '2024-05-01' },
]

export const mockProjects: Project[] = [
  {
    id: 'proj1',
    name: 'Campaign Ramadan Kopi Nusantara 2025',
    brandId: 'b1',
    brand: mockBrands[0],
    platforms: [mockPlatforms[0], mockPlatforms[1]],
    startDate: '2025-01-15',
    deadline: '2025-03-30',
    value: 25000000,
    status: 'BERJALAN',
    picIds: ['u4', 'u5'],
    progress: 3,
    createdAt: '2025-01-10',
  },
  {
    id: 'proj2',
    name: 'Peluncuran Produk TechVision X1',
    brandId: 'b2',
    brand: mockBrands[1],
    platforms: [mockPlatforms[2], mockPlatforms[0], mockPlatforms[3]],
    startDate: '2025-02-01',
    deadline: '2025-04-15',
    value: 45000000,
    status: 'BERJALAN',
    picIds: ['u7', 'u5'],
    progress: 2,
    createdAt: '2025-01-28',
  },
  {
    id: 'proj3',
    name: 'Konten Batik Heritage Series',
    brandId: 'b3',
    brand: mockBrands[2],
    platforms: [mockPlatforms[0]],
    startDate: '2024-11-01',
    deadline: '2025-01-15',
    value: 15000000,
    status: 'SELESAI',
    picIds: ['u4'],
    progress: 6,
    createdAt: '2024-10-25',
  },
  {
    id: 'proj4',
    name: 'GreenLife Earth Day Campaign',
    brandId: 'b4',
    brand: mockBrands[3],
    platforms: [mockPlatforms[0], mockPlatforms[1], mockPlatforms[4]],
    startDate: '2025-03-01',
    deadline: '2025-04-22',
    value: 32000000,
    status: 'PROSES_VERIFIKASI',
    picIds: ['u4', 'u7'],
    progress: 1,
    createdAt: '2025-02-20',
  },
  {
    id: 'proj5',
    name: 'Brand Awareness Kopi Nusantara Q2',
    brandId: 'b1',
    brand: mockBrands[0],
    platforms: [mockPlatforms[1], mockPlatforms[2]],
    startDate: '2025-04-01',
    deadline: '2025-06-30',
    value: 18000000,
    status: 'DRAFT',
    picIds: [],
    progress: 0,
    createdAt: '2025-03-25',
  },
]

export const mockPayments: Payment[] = [
  {
    id: 'pay1',
    projectId: 'proj1',
    type: 'DP',
    amount: 12500000,
    status: 'LUNAS',
    paymentProof: '/proof-1.jpg',
    verifiedBy: 'u2',
    verifiedAt: '2025-01-16',
    createdAt: '2025-01-15',
  },
  {
    id: 'pay2',
    projectId: 'proj1',
    type: 'PELUNASAN',
    amount: 12500000,
    status: 'PROSES_VERIFIKASI',
    paymentProof: '/proof-2.jpg',
    createdAt: '2025-01-15',
  },
  {
    id: 'pay3',
    projectId: 'proj2',
    type: 'DP',
    amount: 22500000,
    status: 'MENUNGGU',
    createdAt: '2025-01-28',
  },
  {
    id: 'pay4',
    projectId: 'proj2',
    type: 'PELUNASAN',
    amount: 22500000,
    status: 'MENUNGGU',
    createdAt: '2025-01-28',
  },
]

export const mockQuotations: Quotation[] = [
  {
    id: 'q1',
    number: 'QUO-2025-001',
    brandId: 'b1',
    brand: mockBrands[0],
    items: [
      { id: 'qi1', name: 'Konten Instagram Reels (10 video)', qty: 10, unit: 'video', price: 1500000, subtotal: 15000000 },
      { id: 'qi2', name: 'Konten TikTok (8 video)', qty: 8, unit: 'video', price: 1250000, subtotal: 10000000 },
    ],
    total: 25000000,
    status: 'DIPROSES',
    note: 'Termasuk revisi 2x per konten',
    createdAt: '2025-01-10',
    sentAt: '2025-01-11',
  },
  {
    id: 'q2',
    number: 'QUO-2025-002',
    brandId: 'b2',
    brand: mockBrands[1],
    items: [
      { id: 'qi3', name: 'Konten YouTube (5 video)', qty: 5, unit: 'video', price: 5000000, subtotal: 25000000 },
      { id: 'qi4', name: 'Konten Instagram Feed (20 foto)', qty: 20, unit: 'foto', price: 500000, subtotal: 10000000 },
      { id: 'qi5', name: 'Strategy & Concept Fee', qty: 1, unit: 'paket', price: 10000000, subtotal: 10000000 },
    ],
    total: 45000000,
    status: 'TERKIRIM',
    createdAt: '2025-01-28',
    sentAt: '2025-01-29',
  },
  {
    id: 'q3',
    number: 'QUO-2025-003',
    brandId: 'b3',
    brand: mockBrands[2],
    items: [
      { id: 'qi6', name: 'Konten Instagram Feed (15 foto)', qty: 15, unit: 'foto', price: 1000000, subtotal: 15000000 },
    ],
    total: 15000000,
    status: 'DRAFT',
    createdAt: '2025-02-15',
  },
]

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    number: 'INV-2025-001',
    quotationId: 'q1',
    brandId: 'b1',
    brand: mockBrands[0],
    projectId: 'proj1',
    total: 25000000,
    status: 'LUNAS',
    shareToken: 'abc123',
    createdAt: '2025-01-15',
    dueDate: '2025-02-15',
  },
  {
    id: 'inv2',
    number: 'INV-2025-002',
    quotationId: 'q2',
    brandId: 'b2',
    brand: mockBrands[1],
    projectId: 'proj2',
    total: 45000000,
    status: 'MENUNGGU_VERIFIKASI',
    shareToken: 'def456',
    createdAt: '2025-02-01',
    dueDate: '2025-03-01',
  },
  {
    id: 'inv3',
    number: 'INV-2025-003',
    brandId: 'b4',
    brand: mockBrands[3],
    projectId: 'proj4',
    total: 32000000,
    status: 'OVERDUE',
    createdAt: '2025-02-20',
    dueDate: '2025-03-20',
  },
  {
    id: 'inv4',
    number: 'INV-2025-004',
    brandId: 'b3',
    brand: mockBrands[2],
    projectId: 'proj3',
    total: 15000000,
    status: 'BELUM_DIBAYAR',
    createdAt: '2025-03-01',
    dueDate: '2025-04-01',
  },
]

export const mockRateCardProfiles: RateCardProfile[] = [
  {
    id: 'rcp1',
    name: 'NanangMrk Channel',
    description: 'Layanan promosi produk IT, Network Gear (Router, Access Point, Switch, Modem), NAS, Surveillance/NVR, Cloud, dan IoT. Berfokus pada value proposition produk Anda melalui YouTube (522K Subs), Instagram (19K Followers), dan TikTok.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    whatsapp: '6285156014905',
    email: 'nanangmrkchannel@gmail.com',
    isDefault: true,
    statsJson: '[{"label":"YouTube","value":"522K","icon":"youtube"},{"label":"Instagram","value":"19K","icon":"instagram"},{"label":"Kemitraan","value":"50+","icon":"award"}]',
    nichesText: 'Network Gear: Router, Access Point, Switch, FTTH Tools, Modem: wifi\nSurveillance & NVR: IP Camera, NVR, Smart Security systems: tv\nOS & Software IT: Operating Systems, IT Enterprise Software, Tools: cpu\nNAS Storage: Network Attached Storage & Data Backup Solutions: harddrive\nVPS & Cloud Services: Cloud Computing, Hosting, Virtual Servers: cloud\nSolar Panel & IoT: IoT Sensors, Solar Power systems, Microcontrollers: sun',
    termsText: 'Skrip video akan dikirimkan setelah pembayaran termin pertama (50%) dilakukan.\nKami tidak melayani skema barter/tukar barang apabila nilai barang kurang dari Rp 25.000.000.\nMaksimal 2 item produk dibahas di dalam 1 video reguler.\nApabila barang dikirim dari luar negeri, pembayaran bea cukai ditanggung oleh pihak brand.\nKami tidak bertanggung jawab atas kerusakan barang akibat proses pengiriman ekspedisi.\nKami sangat terbuka untuk segala bentuk brand, rate di atas dapat didiskusikan lebih lanjut.'
  },
  {
    id: 'rcp2',
    name: 'BMSC Creative Agency',
    description: 'Layanan digital marketing, branding, dan produksi konten media sosial profesional.',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    whatsapp: '6285156014905',
    email: 'hello@bmsc.id',
    isDefault: false,
    statsJson: '[{"label":"Proyek Selesai","value":"120+","icon":"users"},{"label":"Klien Puas","value":"45+","icon":"award"},{"label":"Tahun Pengalaman","value":"5+","icon":"globe"}]',
    nichesText: 'Social Media: Branding, Design, Post template: globe\nVideo Production: Commercial Ad, Editing, Voice Over: tv\nContent Strategy: SEO, Pillar content, Copywriting: cpu',
    termsText: 'Pekerjaan dimulai setelah Down Payment (DP) 50% diterima.\nRevisi maksimal 3 kali untuk setiap aset desain.\nFile master akan diserahkan setelah pelunasan dilakukan.'
  }
]

export const mockRateCards: RateCard[] = [
  { id: 'rc1', name: 'YouTube Regular Video', platformId: 'p3', platform: mockPlatforms[2], price: 18000000, unit: 'per video', published: true, profileId: 'rcp1', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80', description: 'Review mendalam, unboxing, dan demo penggunaan produk IT/networking. Syarat: Bandwidth pengujian minimal 200Mbps, disarankan barang baru & wajib IT Support. Jika modem, wajib sertakan NIK/KK untuk aktivasi.' },
  { id: 'rc2', name: 'YouTube Short Video', platformId: 'p3', platform: mockPlatforms[2], price: 5000000, unit: 'per video', published: true, profileId: 'rcp1', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=400&q=80', description: 'Video singkat di bawah 60 detik (YouTube Shorts). Konten padat, cepat, dan interaktif yang cocok untuk menjangkau audiens luas.' },
  { id: 'rc3', name: 'All Packet (Bundling)', price: 35000000, unit: 'per paket', published: true, profileId: 'rcp1', image: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&w=400&q=80', description: 'Paket bundling di seluruh platform (YouTube + Instagram + TikTok). Maksimal 2 item produk di dalam 1 video. Tarif khusus negosiasi terbuka.' },
  
  // BMSC agency
  { id: 'rc8', name: 'Social Media Branding Package', price: 7500000, unit: 'per project', published: true, profileId: 'rcp2', image: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&w=400&q=80', description: 'Desain visual feed, logo, warna identitas, dan template postingan profesional untuk Instagram/TikTok.' },
  { id: 'rc9', name: 'Commercial Video Production', price: 15000000, unit: 'per video', published: true, profileId: 'rcp2', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80', description: 'Produksi video iklan komersial resolusi 4K lengkap dengan alur cerita, talent, dan editing professional.' },
  { id: 'rc10', name: 'Content Strategy & Copywriting', price: 3000000, unit: 'per script', published: true, profileId: 'rcp2', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80', description: 'Penyusunan pilar konten, riset kompetitor, penulisan naskah (script), dan copywriting caption postingan.' }
]

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'cm1',
    projectId: 'proj1',
    userId: 'u2',
    user: mockUsers[1],
    content: 'Halo tim, brief sudah siap ya. Tolong cek dokumen konsep di tab Ide & Konsep.',
    createdAt: '2025-01-15T09:00:00',
  },
  {
    id: 'cm2',
    projectId: 'proj1',
    userId: 'u4',
    user: mockUsers[3],
    content: 'Siap Kak Dimas, sudah saya baca. Ada pertanyaan soal tone of voice untuk Reels—apakah lebih fun atau formal?',
    createdAt: '2025-01-15T09:30:00',
  },
  {
    id: 'cm3',
    projectId: 'proj1',
    userId: 'u3',
    user: mockUsers[2],
    content: 'Dari sisi brand, kami prefer tone yang fun tapi tetap informatif. Contoh referensi bisa lihat di deck ya.',
    createdAt: '2025-01-15T10:00:00',
  },
  {
    id: 'cm4',
    projectId: 'proj1',
    userId: 'u5',
    user: mockUsers[4],
    content: 'Saya sudah mulai edit raw footage yang dikirim. Estimasi selesai besok sore.',
    createdAt: '2025-01-20T14:00:00',
  },
]

export const mockTasks: ProductionTask[] = [
  { id: 't1', projectId: 'proj1', platformId: 'p1', name: 'Shoot konten outdoor', picId: 'u4', deadline: '2025-02-10', status: 'DONE', completed: true },
  { id: 't2', projectId: 'proj1', platformId: 'p1', name: 'Editing Reels #1', picId: 'u5', deadline: '2025-02-12', status: 'DONE', completed: true },
  { id: 't3', projectId: 'proj1', platformId: 'p1', name: 'Editing Reels #2', picId: 'u5', deadline: '2025-02-15', status: 'IN_PROGRESS', completed: false },
  { id: 't4', projectId: 'proj1', platformId: 'p1', name: 'Color grading', picId: 'u5', deadline: '2025-02-18', status: 'TODO', completed: false },
  { id: 't5', projectId: 'proj1', platformId: 'p1', name: 'Review by brand', picId: 'u3', deadline: '2025-02-20', status: 'TODO', completed: false },
  { id: 't6', projectId: 'proj1', platformId: 'p2', name: 'Shoot TikTok #1', picId: 'u4', deadline: '2025-02-08', status: 'DONE', completed: true },
  { id: 't7', projectId: 'proj1', platformId: 'p2', name: 'Edit TikTok #1', picId: 'u5', deadline: '2025-02-12', status: 'REVIEW', completed: false },
  { id: 't8', projectId: 'proj1', platformId: 'p2', name: 'Shoot TikTok #2', picId: 'u4', deadline: '2025-02-15', status: 'TODO', completed: false },
]

// Dashboard analytics mock
export const mockMonthlyRevenue = [
  { month: 'Jan', revenue: 25000000, target: 30000000 },
  { month: 'Feb', revenue: 45000000, target: 40000000 },
  { month: 'Mar', revenue: 32000000, target: 35000000 },
  { month: 'Apr', revenue: 18000000, target: 35000000 },
  { month: 'Mei', revenue: 0, target: 40000000 },
  { month: 'Jun', revenue: 0, target: 40000000 },
]

export const mockPlatformStats = [
  { platform: 'Instagram', projects: 8, value: 72000000, fill: '#E1306C' },
  { platform: 'TikTok', projects: 6, value: 57000000, fill: '#000000' },
  { platform: 'YouTube', projects: 4, value: 60000000, fill: '#FF0000' },
  { platform: 'Facebook', projects: 2, value: 20000000, fill: '#1877F2' },
]

export const mockNotifications: AppNotification[] = [
  { id: 'n1', icon: '💰', title: 'Pembayaran DP diterima', desc: 'Kopi Nusantara — Proj Ramadan', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false },
  { id: 'n2', icon: '📦', title: 'Resi baru dikirim', desc: 'TechVision ID mengirim barang', createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: false },
  { id: 'n3', icon: '💬', title: 'Pesan baru di project', desc: 'Budi: "Draft script sudah siap"', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: true },
]
