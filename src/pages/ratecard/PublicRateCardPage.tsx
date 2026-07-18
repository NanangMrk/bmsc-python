import { useState } from 'react'
import { mockRateCards, mockRateCardProfiles } from '@/lib/mock-data'
import { Card } from '@/components/ui/Card'
import { formatCurrency, cn } from '@/lib/utils'
import { 
  Youtube, 
  Instagram, 
  Tv, 
  CheckCircle2, 
  HardDrive, 
  Wifi, 
  Cpu, 
  Cloud, 
  Sun, 
  Info,
  ChevronDown,
  ChevronUp,
  Music,
  Facebook,
  Globe,
  Users,
  Award
} from 'lucide-react'

interface StatItem {
  label: string
  value: string
  icon: string
}

export default function PublicRateCardPage() {
  // Read profile ID from URL search query parameter
  const queryParams = new URLSearchParams(window.location.search)
  const profileId = queryParams.get('profile') || 'rcp1'

  // Look up matching profile or fall back to default
  const profile = mockRateCardProfiles.find((p) => p.id === profileId) || mockRateCardProfiles[0]

  // Filter rate card services associated with this profile
  const publishedRateCards = mockRateCards.filter(
    (rc) => rc.profileId === profile.id && rc.published
  )

  // Expanded card ID state for details
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Parse stats dynamically from JSON
  const parsedStats: StatItem[] = profile.statsJson
    ? JSON.parse(profile.statsJson)
    : [
        { label: 'YouTube', value: '522K', icon: 'youtube' },
        { label: 'Instagram', value: '19K', icon: 'instagram' },
        { label: 'Kemitraan', value: '50+', icon: 'award' }
      ]

  // Niches/Goods based on channel
  const defaultNiches = [
    { title: 'Network Gear', desc: 'Router, Access Point, Switch, FTTH Tools, Modem', icon: Wifi },
    { title: 'Surveillance & NVR', desc: 'IP Camera, NVR, Smart Security systems', icon: Tv },
    { title: 'OS & Software IT', desc: 'Operating Systems, IT Enterprise Software, Tools', icon: Cpu },
    { title: 'NAS Storage', desc: 'Network Attached Storage & Data Backup Solutions', icon: HardDrive },
    { title: 'VPS & Cloud Services', desc: 'Cloud Computing, Hosting, Virtual Servers', icon: Cloud },
    { title: 'Solar Panel & IoT', desc: 'IoT Sensors, Solar Power systems, Microcontrollers', icon: Sun },
  ]

  // Parse niches from profile nichesText
  const parsedNiches = profile.nichesText 
    ? profile.nichesText.split('\n').filter(line => line.includes(':')).map((line) => {
        // Find first colon
        const firstColon = line.indexOf(':')
        if (firstColon === -1) return { title: line.trim(), desc: '', iconName: '' }
        
        const title = line.substring(0, firstColon).trim()
        const rest = line.substring(firstColon + 1).trim()
        
        let desc = rest
        let iconName = ''
        
        // Check if there is a colon before "http" in rest
        const httpIdx = rest.indexOf('http')
        if (httpIdx > 0) {
          const colonBeforeHttp = rest.lastIndexOf(':', httpIdx)
          if (colonBeforeHttp !== -1) {
            desc = rest.substring(0, colonBeforeHttp).trim()
            iconName = rest.substring(colonBeforeHttp + 1).trim()
            return { title, desc, iconName }
          }
        }
        
        const lastColon = rest.lastIndexOf(':')
        if (lastColon !== -1) {
          desc = rest.substring(0, lastColon).trim()
          iconName = rest.substring(lastColon + 1).trim()
          return { title, desc, iconName }
        }
        
        return { title, desc, iconName }
      })
    : defaultNiches.map(n => ({ title: n.title, desc: n.desc, iconName: '' }))

  // Parse general notes (T&C) from profile termsText
  const defaultNotes = [
    'Skrip video akan dikirimkan setelah pembayaran termin pertama (50%) dilakukan.',
    'Kami tidak melayani skema barter/tukar barang apabila nilai barang kurang dari Rp 25.000.000.',
    'Maksimal 2 item produk dibahas di dalam 1 video reguler.',
    'Apabila barang dikirim dari luar negeri, pembayaran bea cukai ditanggung oleh pihak brand.',
    'Kami tidak bertanggung jawab atas kerusakan barang akibat proses pengiriman ekspedisi.',
    'Kami sangat terbuka untuk segala bentuk brand, rate di atas dapat didiskusikan lebih lanjut.'
  ]

  const parsedNotes = profile.termsText
    ? profile.termsText.split('\n').map(line => line.trim()).filter(line => line !== '')
    : defaultNotes

  // Helper to render stat icon
  const getStatIcon = (iconName: string) => {
    if (iconName.startsWith('http://') || iconName.startsWith('https://')) {
      return <img src={iconName} alt="icon" className="h-3.5 w-3.5 object-contain shrink-0 rounded-sm" />
    }
    switch (iconName.toLowerCase()) {
      case 'youtube':
        return <Youtube className="h-3.5 w-3.5 text-red-600 shrink-0" />
      case 'instagram':
        return <Instagram className="h-3.5 w-3.5 text-rose-500 shrink-0" />
      case 'tiktok':
        return <Music className="h-3.5 w-3.5 text-stone-850 shrink-0" />
      case 'facebook':
        return <Facebook className="h-3.5 w-3.5 text-blue-600 shrink-0" />
      case 'globe':
      case 'website':
        return <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
      case 'users':
      case 'followers':
        return <Users className="h-3.5 w-3.5 text-teal-600 shrink-0" />
      case 'award':
      case 'kemitraan':
        return <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      default:
        return null
    }
  }

  // Helper to render niche icon
  const renderNicheIcon = (iconName: string, title: string) => {
    const name = iconName ? iconName.trim().toLowerCase() : ''
    
    // Check if it's a URL
    if (name.startsWith('http://') || name.startsWith('https://')) {
      return <img src={iconName} alt="niche logo" className="h-5 w-5 object-contain rounded-sm shrink-0" />
    }
    
    // Resolve Lucide presets:
    switch (name) {
      case 'wifi':
        return <Wifi className="h-5 w-5" />
      case 'tv':
      case 'video':
      case 'cctv':
        return <Tv className="h-5 w-5" />
      case 'cpu':
      case 'software':
      case 'system':
        return <Cpu className="h-5 w-5" />
      case 'harddrive':
      case 'nas':
      case 'storage':
        return <HardDrive className="h-5 w-5" />
      case 'cloud':
      case 'vps':
        return <Cloud className="h-5 w-5" />
      case 'sun':
      case 'solar':
      case 'iot':
        return <Sun className="h-5 w-5" />
      case 'globe':
      case 'website':
        return <Globe className="h-5 w-5" />
      case 'users':
      case 'followers':
        return <Users className="h-5 w-5" />
      case 'award':
      case 'kemitraan':
        return <Award className="h-5 w-5" />
      case 'youtube':
        return <Youtube className="h-5 w-5" />
      case 'instagram':
        return <Instagram className="h-5 w-5" />
      default:
        // Fallback to title-based dynamic resolution
        const lowerTitle = title.toLowerCase()
        if (lowerTitle.includes('nvr') || lowerTitle.includes('surveillance') || lowerTitle.includes('cctv') || lowerTitle.includes('video')) {
          return <Tv className="h-5 w-5" />
        } else if (lowerTitle.includes('software') || lowerTitle.includes('os') || lowerTitle.includes('system') || lowerTitle.includes('strategy')) {
          return <Cpu className="h-5 w-5" />
        } else if (lowerTitle.includes('nas') || lowerTitle.includes('storage') || lowerTitle.includes('backup') || lowerTitle.includes('harddrive')) {
          return <HardDrive className="h-5 w-5" />
        } else if (lowerTitle.includes('cloud') || lowerTitle.includes('vps') || lowerTitle.includes('hosting')) {
          return <Cloud className="h-5 w-5" />
        } else if (lowerTitle.includes('solar') || lowerTitle.includes('iot') || lowerTitle.includes('electronics') || lowerTitle.includes('sensor')) {
          return <Sun className="h-5 w-5" />
        }
        return <Wifi className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-orange-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md shadow-orange-600/20">
              {profile.name.charAt(0)}
            </div>
            <span className="font-extrabold text-sm uppercase tracking-wider text-stone-800">{profile.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200/50">
              OFFICIAL RATE CARD
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4">
        {/* Background gradient blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-72 bg-gradient-to-b from-orange-100/40 to-transparent blur-3xl -z-10 rounded-full" />
        
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {profile.avatar && (
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="h-24 w-24 rounded-3xl object-cover mx-auto border-4 border-white shadow-xl ring-1 ring-stone-200/80"
            />
          )}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-stone-900">
              Kolaborasi & Kampanye <br/>
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                {profile.name}
              </span>
            </h1>
            <p className="text-stone-500 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
              {profile.description}
            </p>
          </div>

          {/* Dynamic Channels Stats Grid */}
          {parsedStats.length > 0 && (
            <div className="flex flex-wrap gap-3 max-w-3xl mx-auto pt-4 justify-center">
              {parsedStats.map((stat, idx) => (
                <div key={idx} className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-sm text-center flex flex-col justify-center items-center w-[calc(50%-6px)] sm:w-[160px] md:w-[180px] shrink-0">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center justify-center gap-1">
                    {getStatIcon(stat.icon)} {stat.label}
                  </p>
                  <p className="text-2xl font-black text-stone-900 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Expertise / Niches Section */}
      {parsedNiches.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-xs font-bold text-orange-600 uppercase tracking-widest">KATEGORI & KEAHLIAN</h2>
            <p className="text-xl font-extrabold text-stone-950">Fokus Produk Konten Kami</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parsedNiches.map((n, idx) => {
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-stone-200/60 hover:border-orange-200 rounded-2xl p-5 shadow-sm transition-all duration-300 group flex items-start gap-4"
                >
                  <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                    {renderNicheIcon(n.iconName, n.title)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-900 text-sm">{n.title}</h3>
                    <p className="text-[11px] text-stone-500 leading-normal font-medium">{n.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Pricing / Rates Section */}
      <section className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-1.5">
          <h2 className="text-xs font-bold text-orange-600 uppercase tracking-widest">DAFTAR TARIF JASA</h2>
          <p className="text-xl font-extrabold text-stone-950">Pilihan Paket & Penawaran Harga</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedRateCards.map((rc) => {
            let platformBadgeColor = "bg-stone-100 text-stone-700 border-stone-200";
            if (rc.platform?.name === 'Instagram') {
              platformBadgeColor = "bg-rose-50 text-rose-600 border-rose-100";
            } else if (rc.platform?.name === 'TikTok') {
              platformBadgeColor = "bg-stone-900 text-white border-transparent";
            } else if (rc.platform?.name === 'YouTube') {
              platformBadgeColor = "bg-red-50 text-red-600 border-red-100";
            }

            const isExpanded = expandedId === rc.id

            return (
              <Card 
                key={rc.id} 
                onClick={() => setExpandedId(isExpanded ? null : rc.id)}
                className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all hover:border-orange-300 group p-0 cursor-pointer select-none"
              >
                {/* Service Header Photo */}
                {rc.image ? (
                  <div className="h-44 w-full overflow-hidden relative bg-stone-100">
                    <img 
                      src={rc.image} 
                      alt={rc.name} 
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-60" />
                  </div>
                ) : (
                  <div className="h-4 w-full bg-gradient-to-r from-orange-400 to-orange-500" />
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    {/* Badge Platform & Toggle Details */}
                    <div className="flex items-center justify-between">
                      {rc.platform ? (
                        <span className={cn("text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded border", platformBadgeColor)}>
                          {rc.platform.name}
                        </span>
                      ) : (
                        <span className="text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded border bg-orange-50 text-orange-600 border-orange-100">
                          PROYEK / JASA
                        </span>
                      )}
                      
                      <span className="text-[10px] font-bold text-orange-600 flex items-center gap-0.5 group-hover:underline">
                        {isExpanded ? (
                          <>Tutup <ChevronUp className="h-3.5 w-3.5" /></>
                        ) : (
                          <>Ketentuan <ChevronDown className="h-3.5 w-3.5" /></>
                        )}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-base text-stone-900 group-hover:text-orange-600 transition-colors uppercase tracking-wide">
                      {rc.name}
                    </h3>
                    
                    {/* Collapsible Detailed Description */}
                    {isExpanded ? (
                      <div className="text-xs text-stone-600 leading-relaxed bg-stone-50 border border-stone-100 rounded-2xl p-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="font-bold text-stone-800 text-[10px] uppercase tracking-wider border-b border-stone-200 pb-1 flex items-center gap-1">
                          <Info className="h-3.5 w-3.5 text-orange-600" /> Detail Syarat Konten:
                        </p>
                        {rc.description ? (
                          <p className="whitespace-pre-line text-[11px] leading-normal font-medium">{rc.description}</p>
                        ) : (
                          <p className="text-[11px] font-medium">Layanan pengerjaan konten berkualitas tinggi oleh {profile.name}.</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 font-medium">
                        {rc.description ? rc.description : `Layanan pengerjaan konten berkualitas tinggi oleh ${profile.name}.`}
                      </p>
                    )}
                  </div>

                  {/* Pricing Display */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col justify-end">
                    <span className="text-[8px] font-extrabold text-stone-400 uppercase tracking-widest">TARIF KAMPANYE</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-stone-950 font-mono tracking-tight">{formatCurrency(rc.price)}</span>
                      <span className="text-xs text-stone-400 font-bold">/ {rc.unit.replace('per ', '')}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Terms & Conditions Block */}
      {parsedNotes.length > 0 && (
        <section className="bg-stone-100/50 border-y border-stone-200/60 py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-1.5">
              <h2 className="text-xs font-bold text-orange-600 uppercase tracking-widest">TERM & CONDITIONS</h2>
              <p className="text-xl font-extrabold text-stone-950">Ketentuan Umum Kerjasama</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {parsedNotes.map((note, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border border-stone-200/60 p-4 rounded-2xl flex items-start gap-3 shadow-sm"
                >
                  <CheckCircle2 className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-600 leading-relaxed font-semibold">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer Info */}
      <footer className="py-12 bg-white text-stone-400 text-xs text-center border-t border-stone-200/60">
        <div className="max-w-md mx-auto space-y-3 px-4">
          <p className="font-semibold text-stone-600">Butuh Kustomisasi Brief atau Penawaran Khusus?</p>
          <p className="text-[11px] leading-relaxed text-stone-400">
            Tarif di atas adalah harga acuan dasar. Silakan hubungi kami melalui kontak resmi untuk mendiskusikan timeline publikasi, skenario konten, diskon paket bulk, atau kebutuhan kerjasama agensi.
          </p>
          <p className="mt-8 text-[9px] uppercase font-bold tracking-widest text-orange-600 pt-4">
            © {new Date().getFullYear()} {profile.name.toUpperCase()}. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

    </div>
  )
}
