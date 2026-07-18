import { useNavigate } from 'react-router-dom'
import {
  Zap,
  FolderKanban,
  Receipt,
  Users,
  ArrowRight,

  Star,
  ChevronRight,
  TrendingUp,
  Clock,
  Shield,
} from 'lucide-react'

const features = [
  {
    icon: FolderKanban,
    title: 'Manajemen Project Multi-Platform',
    desc: 'Kelola project di Instagram, TikTok, YouTube, dan platform lainnya dalam satu dasbor terpusat. 6 fase terstruktur dari konsep hingga upload.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Receipt,
    title: 'Transparansi Pembayaran',
    desc: 'Quotation otomatis menjadi invoice. Brand dapat upload bukti bayar langsung. Admin verifikasi dengan mudah. Riwayat lengkap.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Users,
    title: 'Kolaborasi Real-time',
    desc: 'Chat per project untuk semua pihak yang terlibat. Kreator, editor, brand, dan admin dalam satu ruang diskusi.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Shield,
    title: 'Kontrol Akses Granular',
    desc: 'Role & permission matrix yang fleksibel. Setiap user hanya melihat data yang relevan dengan mereka.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: TrendingUp,
    title: 'Analitik & Pelaporan',
    desc: 'Dashboard analytics dengan grafik pemasukan bulanan, performa platform, dan status pembayaran secara real-time.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: Clock,
    title: 'Fase Konten Terstruktur',
    desc: 'Dari Ide & Konsep, Script dengan word count otomatis, Produksi dengan Kanban board, hingga Upload dengan thumbnail fetcher.',
    color: 'bg-indigo-50 text-indigo-600',
  },
]

const testimonials = [
  {
    name: 'Sarah Wijaya',
    company: 'Kopi Nusantara',
    role: 'Brand Manager',
    content: 'BMSC membuat proses approval konten jadi jauh lebih mudah. Saya bisa pantau progres project dan status pembayaran kapan saja.',
    rating: 5,
  },
  {
    name: 'Dimas Aditya',
    company: 'Creative Agency',
    role: 'Tim Internal',
    content: 'Script table dengan word count otomatis dan rich text editor mirip Notion sangat membantu tim kreator kami.',
    rating: 5,
  },
  {
    name: 'Budi Santoso',
    company: 'Freelance Creator',
    role: 'Konten Kreator',
    content: 'Akses ke project yang di-assign ke saya saja. Interface bersih, tidak membingungkan. Fitur chat per project sangat helpful.',
    rating: 5,
  },
]

const phases = [
  { num: '01', label: 'Payment', desc: 'DP & Pelunasan' },
  { num: '02', label: 'Pengiriman', desc: 'Resi & Unboxing' },
  { num: '03', label: 'Ide & Konsep', desc: 'Editor Notion-like' },
  { num: '04', label: 'Script', desc: 'Word count otomatis' },
  { num: '05', label: 'Produksi', desc: 'Kanban Task' },
  { num: '06', label: 'Upload', desc: 'Fetch thumbnail' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">BMSC</span>
          </a>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              {['Fitur', 'Alur Kerja', 'Testimoni'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </a>
              ))}
            </nav>
            <button
              id="landing-login-btn"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
            >
              Masuk <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-orange-50 to-transparent rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-orange-50 to-transparent rounded-full blur-3xl opacity-60" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-orange-100">
            <Zap className="h-3.5 w-3.5" />
            Platform Manajemen Konten #1 untuk Brand & Kreator
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">
            Kelola Project Konten
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Bersama NanangMrk
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Satu platform untuk Brand, Admin, Kreator, dan Editor. Lacak pembayaran, kelola konten multi-platform, dan kolaborasi real-time — semua dalam satu dasbor yang powerful.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              id="hero-cta-btn"
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 hover:-translate-y-0.5"
            >
              Mulai Sekarang <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-2 bg-white text-foreground px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-muted transition-all border border-border"
            >
              Lihat Demo
            </button>
          </div>


        </div>

        {/* Dashboard preview mockup */}
        <div className="max-w-5xl mx-auto mt-16 rounded-2xl border border-border shadow-2xl shadow-gray-200 overflow-hidden">
          <div className="bg-muted/50 h-8 flex items-center px-4 gap-1.5 border-b border-border">
            {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c, i) => (
              <div key={i} className={`h-3 w-3 rounded-full ${c}`} />
            ))}
            <div className="mx-auto bg-background rounded px-12 py-0.5 text-xs text-muted-foreground">bmsc.io/dashboard</div>
          </div>
          <div className="bg-white flex h-80">
            {/* Sidebar mini */}
            <div className="w-48 border-r border-border p-3 bg-slate-900">
              <div className="h-6 w-20 bg-orange-500 rounded mb-4 flex items-center justify-center">
                <span className="text-xs text-white font-bold">BMSC</span>
              </div>
              {['Dashboard', 'Project', 'Invoice', 'Users'].map((item, i) => (
                <div key={item} className={`h-7 rounded mb-1 flex items-center px-3 text-xs ${i === 0 ? 'bg-orange-500 text-white' : 'text-slate-400'}`}>
                  {item}
                </div>
              ))}
            </div>
            {/* Content area */}
            <div className="flex-1 p-4 overflow-hidden">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Project Aktif', val: '12', color: 'text-orange-600' },
                  { label: 'Menunggu Bayar', val: '5', color: 'text-yellow-600' },
                  { label: 'Terlambat', val: '2', color: 'text-red-600' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-muted/50 rounded-lg p-3 border border-border">
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    <p className={`text-base font-bold mt-0.5 ${stat.color}`}>{stat.val}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-muted/30 rounded-lg border border-border h-32 flex items-center justify-center">
                  <div className="flex items-end gap-2 px-4">
                    {[60, 45, 80, 35, 70, 50].map((h, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-8 rounded-sm bg-orange-400" style={{ height: `${h}px` }} />
                        <span className="text-[8px] text-muted-foreground">M{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg border border-border h-32 p-3">
                  <p className="text-[10px] font-medium text-muted-foreground mb-2">Project Terbaru</p>
                  {['Kopi Nusantara', 'TechVision', 'GreenLife'].map((name) => (
                    <div key={name} className="flex items-center gap-2 mb-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                      <span className="text-[10px] text-muted-foreground">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Phases */}
      <section id="alur-kerja" className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">6 Fase Project Terstruktur</h2>
            <p className="text-muted-foreground">Setiap project berjalan melalui 6 fase yang jelas dan terukur</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {phases.map((phase, i) => (
              <div
                key={phase.num}
                className="relative bg-white rounded-xl p-4 border border-border hover:border-orange-200 hover:shadow-md transition-all duration-200 text-center group"
              >
                {i < phases.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="text-2xl font-black text-orange-500/20 group-hover:text-orange-500/40 transition-colors mb-2">
                  {phase.num}
                </div>
                <p className="font-semibold text-sm text-foreground">{phase.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Semua yang Anda Butuhkan</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Dirancang untuk workflow tim kreatif modern yang butuh efisiensi, transparansi, dan kolaborasi.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group p-6 rounded-xl border border-border hover:border-orange-200 hover:shadow-lg transition-all duration-200 bg-white"
                >
                  <div className={`h-10 w-10 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-base mb-2 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimoni" className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Dipercaya Tim Kreatif</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white p-6 rounded-xl border border-border hover:shadow-md transition-all">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.content}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-10 text-white">
            <h2 className="text-3xl font-bold mb-3">Siap Mulai?</h2>
            <p className="text-orange-100 mb-8">
              Hubungi admin untuk mendapatkan akses ke platform BMSC.
            </p>
            <button
              id="cta-login-btn"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
            >
              Login ke Dashboard <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-foreground">BMSC</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 BMSC. Platform Manajemen Brand & Konten.
          </p>
        </div>
      </footer>
    </div>
  )
}
