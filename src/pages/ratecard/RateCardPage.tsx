import { useState } from 'react'
import { 
  Plus, 
  Trash2, 
  Share2, 
  Sparkles, 
  Settings, 
  Youtube,
  Instagram,
  Tv,
  CheckCircle2,
  HardDrive,
  Wifi,
  Cpu,
  Cloud,
  Sun,
  ChevronDown,
  Monitor,
  Save,
  ExternalLink,
  Music,
  Facebook,
  Globe,
  Users,
  Award
} from 'lucide-react'
import { mockRateCards, mockRateCardProfiles, mockPlatforms } from '@/lib/mock-data'
import { formatCurrency, cn } from '@/lib/utils'

interface RateCard {
  id: string
  name: string
  platformId?: string
  platform?: typeof mockPlatforms[0]
  price: number
  unit: string
  published: boolean
  profileId: string
  image?: string
  description?: string
}

interface RateCardProfile {
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

export default function RateCardPage() {
  // Profiles and Rate Cards state
  const [profiles, setProfiles] = useState<RateCardProfile[]>(mockRateCardProfiles)
  const [selectedProfileId, setSelectedProfileId] = useState(mockRateCardProfiles[0].id)
  const [rateCards, setRateCards] = useState<RateCard[]>(mockRateCards)

  // Elementor sidebar accordion state
  const [activeSection, setActiveSection] = useState<'profile' | 'stats' | 'niches' | 'items' | 'terms'>('profile')

  // Live preview expanded card state
  const [previewExpandedId, setPreviewExpandedId] = useState<string | null>(null)

  // Current editing state references
  const currentProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0]
  const profileRateCards = rateCards.filter(rc => rc.profileId === selectedProfileId)

  // Handlers to edit profile properties on the fly:
  const updateProfileProp = (key: keyof RateCardProfile, value: any) => {
    setProfiles(prev => prev.map(p => p.id === selectedProfileId ? { ...p, [key]: value } : p))
  }

  // Parse stats from currentProfile.statsJson
  const stats: { label: string, value: string, icon: string }[] = currentProfile.statsJson
    ? JSON.parse(currentProfile.statsJson)
    : []

  const updateStatItem = (index: number, key: 'label' | 'value' | 'icon', val: string) => {
    const updated = [...stats]
    updated[index] = { ...updated[index], [key]: val }
    updateProfileProp('statsJson', JSON.stringify(updated))
  }

  const addStatItem = () => {
    const updated = [...stats, { label: 'Statistik Baru', value: '10K', icon: 'youtube' }]
    updateProfileProp('statsJson', JSON.stringify(updated))
  }

  const removeStatItem = (index: number) => {
    const updated = stats.filter((_, i) => i !== index)
    updateProfileProp('statsJson', JSON.stringify(updated))
  }

  // Parse niches from currentProfile.nichesText
  const niches = currentProfile.nichesText 
    ? currentProfile.nichesText.split('\n').filter(line => line.includes(':')).map(line => {
        const firstColon = line.indexOf(':')
        if (firstColon === -1) return { title: line.trim(), desc: '', icon: '' }
        
        const title = line.substring(0, firstColon).trim()
        const rest = line.substring(firstColon + 1).trim()
        
        let desc = rest
        let icon = ''
        
        const httpIdx = rest.indexOf('http')
        if (httpIdx > 0) {
          const colonBeforeHttp = rest.lastIndexOf(':', httpIdx)
          if (colonBeforeHttp !== -1) {
            desc = rest.substring(0, colonBeforeHttp).trim()
            icon = rest.substring(colonBeforeHttp + 1).trim()
            return { title, desc, icon }
          }
        }
        
        const lastColon = rest.lastIndexOf(':')
        if (lastColon !== -1) {
          desc = rest.substring(0, lastColon).trim()
          icon = rest.substring(lastColon + 1).trim()
          return { title, desc, icon }
        }
        
        return { title, desc, icon }
      })
    : []

  const updateNiche = (index: number, key: 'title' | 'desc' | 'icon', val: string) => {
    const updated = [...niches]
    updated[index] = { ...updated[index], [key]: val }
    const serialized = updated.map(n => {
      if (n.icon) {
        return `${n.title}: ${n.desc}: ${n.icon}`
      }
      return `${n.title}: ${n.desc}`
    }).join('\n')
    updateProfileProp('nichesText', serialized)
  }

  const addNiche = () => {
    const updated = [...niches, { title: 'Kategori Baru', desc: 'Deskripsi singkat...', icon: 'wifi' }]
    const serialized = updated.map(n => {
      if (n.icon) {
        return `${n.title}: ${n.desc}: ${n.icon}`
      }
      return `${n.title}: ${n.desc}`
    }).join('\n')
    updateProfileProp('nichesText', serialized)
  }

  const removeNiche = (index: number) => {
    const updated = niches.filter((_, i) => i !== index)
    const serialized = updated.map(n => {
      if (n.icon) {
        return `${n.title}: ${n.desc}: ${n.icon}`
      }
      return `${n.title}: ${n.desc}`
    }).join('\n')
    updateProfileProp('nichesText', serialized)
  }

  // Parse terms from currentProfile.termsText
  const terms = currentProfile.termsText
    ? currentProfile.termsText.split('\n').map(line => line.trim()).filter(line => line !== '')
    : []

  const updateTerm = (index: number, val: string) => {
    const updated = [...terms]
    updated[index] = val
    updateProfileProp('termsText', updated.join('\n'))
  }

  const addTerm = () => {
    const updated = [...terms, 'Ketentuan baru kerja sama...']
    updateProfileProp('termsText', updated.join('\n'))
  }

  const removeTerm = (index: number) => {
    const updated = terms.filter((_, i) => i !== index)
    updateProfileProp('termsText', updated.join('\n'))
  }

  // Rate Card Item handlers
  const updateRateCardItem = (id: string, key: keyof RateCard, val: any) => {
    setRateCards(prev => prev.map(rc => rc.id === id ? { ...rc, [key]: val } : rc))
  }

  const addRateCardItem = () => {
    const newItem: RateCard = {
      id: `rc-${Date.now()}`,
      name: 'Layanan Konten Baru',
      price: 1500000,
      unit: 'per video',
      published: true,
      profileId: selectedProfileId,
      description: 'Ketentuan dan detail layanan baru pengerjaan konten media sosial.'
    }
    setRateCards(prev => [...prev, newItem])
  }

  const removeRateCardItem = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus item layanan ini?')) {
      setRateCards(prev => prev.filter(rc => rc.id !== id))
    }
  }

  const handleCreateProfile = () => {
    const newProfile: RateCardProfile = {
      id: `rcp-${Date.now()}`,
      name: 'Profil Baru',
      description: 'Deskripsi profil singkat...',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      whatsapp: '6285156014905',
      email: 'hello@bmsc.id',
      isDefault: false,
      statsJson: '[{"label":"YouTube","value":"0","icon":"youtube"}]',
      nichesText: 'Kategori: Deskripsi kategori baru...',
      termsText: 'Ketentuan pertama kerjasama...'
    }
    setProfiles(prev => [...prev, newProfile])
    setSelectedProfileId(newProfile.id)
  }

  // Helper to resolve stats icons dynamically
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

  const handleSaveChanges = () => {
    alert('Perubahan berhasil disimpan! Landing page Anda telah terupdate secara langsung.')
  }



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
    <div className="flex flex-col h-[calc(100vh-80px)] -m-6 bg-stone-50 overflow-hidden font-sans">
      
      {/* Builder Top Navbar */}
      <div className="h-16 border-b border-stone-200 bg-white px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              Rate Card Builder
              <span className="bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                ELEMENTOR MODE
              </span>
            </h1>
            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Edit dan rancang landing page penawaran harga secara real-time</p>
          </div>
        </div>

        {/* Profile Selector & Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Pilih Profil:</span>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="h-9 px-3 rounded-lg border border-stone-200 bg-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={handleCreateProfile}
              className="h-9 px-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-lg text-xs transition-all"
            >
              + Profil Baru
            </button>
          </div>

          <div className="h-6 w-[1px] bg-stone-200" />

          {/* Copy Public Link */}
          <a
            href={`/public/ratecard?profile=${selectedProfileId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 border border-stone-200 hover:bg-stone-50 rounded-lg text-xs font-bold text-stone-600 flex items-center gap-1.5 transition-all"
          >
            Pratinjau <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/public/ratecard?profile=${selectedProfileId}`)
              alert('Link publik berhasil disalin ke clipboard!')
            }}
            className="h-9 px-3 border border-stone-200 hover:bg-stone-50 rounded-lg text-xs font-bold text-stone-600 flex items-center gap-1.5 transition-all"
          >
            <Share2 className="h-3.5 w-3.5" /> Bagikan Link
          </button>

          {/* Save Changes */}
          <button
            onClick={handleSaveChanges}
            className="h-9 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm shadow-orange-600/10 transition-all hover:scale-[1.01]"
          >
            <Save className="h-4 w-4" /> Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Main Builder Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: Elementor Control Panel */}
        <div className="w-[380px] bg-white border-r border-stone-200 flex flex-col overflow-hidden shrink-0 shadow-sm">
          {/* Header Panel */}
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
            <Settings className="h-4 w-4 text-stone-500" />
            <span className="font-extrabold text-[10px] uppercase tracking-widest text-stone-500">Edit Widget & Elemen</span>
          </div>

          {/* Widget list (Accordions) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            
            {/* 1. Identity Widget */}
            <div className="border border-stone-200/80 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveSection(activeSection === 'profile' ? '' as any : 'profile')}
                className="w-full px-4 py-3 bg-stone-50/50 hover:bg-stone-50 border-b border-stone-200/60 flex items-center justify-between text-left"
              >
                <span className="text-xs font-extrabold text-stone-700 uppercase tracking-wide flex items-center gap-2">
                  👤 Identitas & Profil
                </span>
                <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", activeSection === 'profile' && 'rotate-180')} />
              </button>

              {activeSection === 'profile' && (
                <div className="p-4 space-y-3.5 bg-white text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                  <div>
                    <label className="block mb-1">Nama Profil / Talent</label>
                    <input
                      type="text"
                      value={currentProfile.name}
                      onChange={(e) => updateProfileProp('name', e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Deskripsi Utama</label>
                    <textarea
                      value={currentProfile.description}
                      onChange={(e) => updateProfileProp('description', e.target.value)}
                      className="w-full h-20 p-2.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-stone-800 resize-y"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Avatar / Link Foto</label>
                    <input
                      type="text"
                      value={currentProfile.avatar}
                      onChange={(e) => updateProfileProp('avatar', e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-stone-800 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={currentProfile.whatsapp}
                        onChange={(e) => updateProfileProp('whatsapp', e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Email</label>
                      <input
                        type="text"
                        value={currentProfile.email}
                        onChange={(e) => updateProfileProp('email', e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 text-stone-800"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Stats Widget */}
            <div className="border border-stone-200/80 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveSection(activeSection === 'stats' ? '' as any : 'stats')}
                className="w-full px-4 py-3 bg-stone-50/50 hover:bg-stone-50 border-b border-stone-200/60 flex items-center justify-between text-left"
              >
                <span className="text-xs font-extrabold text-stone-700 uppercase tracking-wide flex items-center gap-2">
                  📊 Statistik Saluran
                </span>
                <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", activeSection === 'stats' && 'rotate-180')} />
              </button>

              {activeSection === 'stats' && (
                <div className="p-4 bg-white space-y-4">
                  <div className="space-y-3.5">
                    {stats.map((stat, idx) => (
                      <div key={idx} className="bg-stone-50 border border-stone-200/60 p-3.5 rounded-2xl relative space-y-3.5 group">
                        <button
                          type="button"
                          onClick={() => removeStatItem(idx)}
                          className="absolute top-2 right-2 h-6 w-6 rounded-lg flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-stone-200/50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide space-y-1.5 pr-6">
                          <label>Label Statistik</label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => updateStatItem(idx, 'label', e.target.value)}
                            className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                          <div>
                            <label>Nilai / Angka</label>
                            <input
                              type="text"
                              value={stat.value}
                              onChange={(e) => updateStatItem(idx, 'value', e.target.value)}
                              className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </div>
                          <div>
                            <label>Logo / Icon</label>
                            <select
                              value={['youtube', 'instagram', 'tiktok', 'facebook', 'globe', 'users', 'award'].includes(stat.icon.toLowerCase()) ? stat.icon.toLowerCase() : 'custom'}
                              onChange={(e) => {
                                const val = e.target.value
                                if (val !== 'custom') {
                                  updateStatItem(idx, 'icon', val)
                                } else {
                                  updateStatItem(idx, 'icon', 'https://')
                                }
                              }}
                              className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            >
                              <option value="youtube">YouTube</option>
                              <option value="instagram">Instagram</option>
                              <option value="tiktok">TikTok</option>
                              <option value="facebook">Facebook</option>
                              <option value="globe">Website / Globe</option>
                              <option value="users">Followers / Users</option>
                              <option value="award">Kemitraan / Award</option>
                              <option value="custom">Custom URL / Upload 🌐</option>
                            </select>
                          </div>
                        </div>

                        {/* Custom URL Input & Upload Simulation */}
                        {(!['youtube', 'instagram', 'tiktok', 'facebook', 'globe', 'users', 'award'].includes(stat.icon.toLowerCase()) || stat.icon.startsWith('http')) && (
                          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide space-y-1">
                            <div className="flex justify-between items-center">
                              <label>Link Logo Custom / Uploaded</label>
                              <button
                                type="button"
                                onClick={() => {
                                  updateStatItem(idx, 'icon', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=64&q=80')
                                  alert('Simulasi Unggah Logo Berhasil! Logo kustom telah disematkan.')
                                }}
                                className="text-[9px] text-orange-600 hover:underline"
                              >
                                📤 Unggah File (Simulasi)
                              </button>
                            </div>
                            <input
                              type="text"
                              value={stat.icon}
                              onChange={(e) => updateStatItem(idx, 'icon', e.target.value)}
                              placeholder="https://..."
                              className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 font-mono focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addStatItem}
                    className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Tambah Stat Baru
                  </button>
                </div>
              )}
            </div>

            {/* 3. Niches Widget */}
            <div className="border border-stone-200/80 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveSection(activeSection === 'niches' ? '' as any : 'niches')}
                className="w-full px-4 py-3 bg-stone-50/50 hover:bg-stone-50 border-b border-stone-200/60 flex items-center justify-between text-left"
              >
                <span className="text-xs font-extrabold text-stone-700 uppercase tracking-wide flex items-center gap-2">
                  🎯 Kategori & Keahlian
                </span>
                <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", activeSection === 'niches' && 'rotate-180')} />
              </button>

              {activeSection === 'niches' && (
                <div className="p-4 bg-white space-y-3.5">
                  <div className="space-y-3">
                    {niches.map((n, idx) => (
                      <div key={idx} className="bg-stone-50 border border-stone-200/60 p-3.5 rounded-2xl relative space-y-3.5 group">
                        <button
                          type="button"
                          onClick={() => removeNiche(idx)}
                          className="absolute top-2 right-2 h-6 w-6 rounded-lg flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-stone-200/50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide space-y-1.5 pr-6">
                          <label>Nama Kategori</label>
                          <input
                            type="text"
                            value={n.title}
                            onChange={(e) => updateNiche(idx, 'title', e.target.value)}
                            className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-400"
                          />
                        </div>

                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide space-y-1.5">
                          <label>Deskripsi Layanan</label>
                          <input
                            type="text"
                            value={n.desc}
                            onChange={(e) => updateNiche(idx, 'desc', e.target.value)}
                            className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-400"
                          />
                        </div>

                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide space-y-1.5">
                          <label>Logo / Icon Preset</label>
                          <select
                            value={['wifi', 'tv', 'cpu', 'harddrive', 'cloud', 'sun', 'globe', 'users', 'award', 'youtube', 'instagram'].includes(n.icon?.toLowerCase()) ? n.icon.toLowerCase() : 'custom'}
                            onChange={(e) => {
                              const val = e.target.value
                              if (val !== 'custom') {
                                updateNiche(idx, 'icon', val)
                              } else {
                                updateNiche(idx, 'icon', 'https://')
                              }
                            }}
                            className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-400"
                          >
                            <option value="wifi">Wifi / Network</option>
                            <option value="tv">Kamera / TV</option>
                            <option value="cpu">Processor / CPU</option>
                            <option value="harddrive">NAS / HardDrive</option>
                            <option value="cloud">Cloud / VPS</option>
                            <option value="sun">Solar / IoT</option>
                            <option value="globe">Globe / Website</option>
                            <option value="users">Followers / Users</option>
                            <option value="award">Kemitraan / Award</option>
                            <option value="youtube">YouTube</option>
                            <option value="instagram">Instagram</option>
                            <option value="custom">Custom URL / Upload 🌐</option>
                          </select>
                        </div>

                        {/* Custom URL Input & Upload Simulation */}
                        {(!['wifi', 'tv', 'cpu', 'harddrive', 'cloud', 'sun', 'globe', 'users', 'award', 'youtube', 'instagram'].includes(n.icon?.toLowerCase()) || n.icon?.startsWith('http')) && (
                          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide space-y-1">
                            <div className="flex justify-between items-center">
                              <label>Link Logo Kategori Kustom</label>
                              <button
                                type="button"
                                onClick={() => {
                                  updateNiche(idx, 'icon', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=64&q=80')
                                  alert('Simulasi Unggah Logo Kategori Berhasil!')
                                }}
                                className="text-[9px] text-orange-600 hover:underline"
                              >
                                📤 Unggah File (Simulasi)
                              </button>
                            </div>
                            <input
                              type="text"
                              value={n.icon}
                              onChange={(e) => updateNiche(idx, 'icon', e.target.value)}
                              placeholder="https://..."
                              className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-850 font-mono focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addNiche}
                    className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Tambah Kategori Baru
                  </button>
                </div>
              )}
            </div>

            {/* 4. Rates Widget */}
            <div className="border border-stone-200/80 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveSection(activeSection === 'items' ? '' as any : 'items')}
                className="w-full px-4 py-3 bg-stone-50/50 hover:bg-stone-50 border-b border-stone-200/60 flex items-center justify-between text-left"
              >
                <span className="text-xs font-extrabold text-stone-700 uppercase tracking-wide flex items-center gap-2">
                  💰 Tarif & Jasa Penawaran
                </span>
                <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", activeSection === 'items' && 'rotate-180')} />
              </button>

              {activeSection === 'items' && (
                <div className="p-4 bg-white space-y-4">
                  <div className="space-y-3.5">
                    {profileRateCards.map((rc) => (
                      <div key={rc.id} className="bg-stone-50 border border-stone-200/60 p-3.5 rounded-2xl relative space-y-3.5">
                        {/* Remove Service Button */}
                        <button
                          type="button"
                          onClick={() => removeRateCardItem(rc.id)}
                          className="absolute top-2 right-2 h-6 w-6 rounded-lg flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-stone-200/50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide space-y-1.5 pr-6">
                          <label>Nama Layanan Jasa</label>
                          <input
                            type="text"
                            value={rc.name}
                            onChange={(e) => updateRateCardItem(rc.id, 'name', e.target.value)}
                            className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                          <div>
                            <label>Platform</label>
                            <select
                              value={rc.platformId || 'ALL'}
                              onChange={(e) => {
                                const val = e.target.value
                                const platform = val !== 'ALL' ? mockPlatforms.find(p => p.id === val) : undefined
                                updateRateCardItem(rc.id, 'platformId', val !== 'ALL' ? val : undefined)
                                updateRateCardItem(rc.id, 'platform', platform)
                              }}
                              className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            >
                              <option value="ALL">Semua Platform</option>
                              {mockPlatforms.map(pl => (
                                <option key={pl.id} value={pl.id}>{pl.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label>Unit / Satuan</label>
                            <input
                              type="text"
                              value={rc.unit}
                              onChange={(e) => updateRateCardItem(rc.id, 'unit', e.target.value)}
                              className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                          <div>
                            <label>Harga (IDR)</label>
                            <input
                              type="number"
                              value={rc.price}
                              onChange={(e) => updateRateCardItem(rc.id, 'price', parseInt(e.target.value) || 0)}
                              className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-400 font-mono"
                            />
                          </div>
                          <div>
                            <label>Status Tampil</label>
                            <div className="flex bg-stone-200/60 rounded-lg p-0.5 h-8">
                              <button
                                type="button"
                                onClick={() => updateRateCardItem(rc.id, 'published', true)}
                                className={cn(
                                  "flex-1 text-[9px] font-bold rounded-md transition-all",
                                  rc.published ? "bg-white text-orange-600 shadow-sm" : "text-stone-500"
                                )}
                              >
                                Tampil
                              </button>
                              <button
                                type="button"
                                onClick={() => updateRateCardItem(rc.id, 'published', false)}
                                className={cn(
                                  "flex-1 text-[9px] font-bold rounded-md transition-all",
                                  !rc.published ? "bg-white text-orange-600 shadow-sm" : "text-stone-500"
                                )}
                              >
                                Sembunyi
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide space-y-1">
                          <label>Foto Banner Jasa URL</label>
                          <input
                            type="text"
                            value={rc.image || ''}
                            onChange={(e) => updateRateCardItem(rc.id, 'image', e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full h-8 px-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-400 font-mono"
                          />
                        </div>

                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide space-y-1">
                          <label>Ketentuan Khusus Jasa</label>
                          <textarea
                            value={rc.description || ''}
                            onChange={(e) => updateRateCardItem(rc.id, 'description', e.target.value)}
                            className="w-full h-16 p-2 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-400 resize-y"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addRateCardItem}
                    className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Tambah Item Jasa Baru
                  </button>
                </div>
              )}
            </div>

            {/* 5. Terms & Conditions Widget */}
            <div className="border border-stone-200/80 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveSection(activeSection === 'terms' ? '' as any : 'terms')}
                className="w-full px-4 py-3 bg-stone-50/50 hover:bg-stone-50 border-b border-stone-200/60 flex items-center justify-between text-left"
              >
                <span className="text-xs font-extrabold text-stone-700 uppercase tracking-wide flex items-center gap-2">
                  📝 Ketentuan Umum (T&C)
                </span>
                <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", activeSection === 'terms' && 'rotate-180')} />
              </button>

              {activeSection === 'terms' && (
                <div className="p-4 bg-white space-y-3.5">
                  <div className="space-y-3.5">
                    {terms.map((term, idx) => (
                      <div key={idx} className="flex gap-2 items-start bg-stone-50 p-2.5 border border-stone-200/50 rounded-xl group relative">
                        <textarea
                          value={term}
                          onChange={(e) => updateTerm(idx, e.target.value)}
                          className="flex-1 bg-white border border-stone-200 p-2 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-400 resize-y h-16 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => removeTerm(idx)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-stone-200/50 transition-colors shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addTerm}
                    className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Tambah Ketentuan Baru
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Live View Mockup Window */}
        <div className="flex-1 bg-stone-100/50 p-6 flex flex-col overflow-hidden relative">
          {/* Header Preview Controls */}
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div className="flex items-center gap-2 text-stone-500">
              <Monitor className="h-4 w-4" />
              <span className="font-extrabold text-[10px] uppercase tracking-widest">Live Preview Editor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Sinkronisasi Instan Aktif</span>
            </div>
          </div>

          {/* Web Browser Frame Mockup */}
          <div className="flex-1 border border-stone-200/80 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
            {/* Browser URL Bar Mockup */}
            <div className="h-10 bg-stone-100 border-b border-stone-200/80 px-4 flex items-center gap-3 shrink-0">
              <div className="flex gap-1.5 shrink-0">
                <span className="h-3 w-3 rounded-full bg-stone-200 border border-stone-300" />
                <span className="h-3 w-3 rounded-full bg-stone-200 border border-stone-300" />
                <span className="h-3 w-3 rounded-full bg-stone-200 border border-stone-300" />
              </div>
              <div className="flex-1 max-w-lg mx-auto bg-stone-200/60 border border-stone-200 rounded-lg h-6 px-3 flex items-center text-[10px] text-stone-400 font-semibold font-mono truncate select-all">
                localhost:5173/public/ratecard?profile={currentProfile.id}
              </div>
            </div>

            {/* Dynamic Landing Page Content inside preview */}
            <div className="flex-1 overflow-y-auto bg-[#fafaf9] text-[#1c1917] select-none scrollbar-thin">
              
              {/* Preview Header */}
              <div className="h-14 border-b border-stone-200/60 bg-white px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-orange-600 text-white rounded-lg flex items-center justify-center font-black text-sm">
                    {currentProfile.name.charAt(0)}
                  </div>
                  <span className="font-black text-xs uppercase tracking-wide text-stone-800">{currentProfile.name}</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/50">
                  RATE CARD
                </span>
              </div>

              {/* Preview Hero */}
              <div className="relative pt-8 pb-10 px-4 text-center space-y-4">
                {currentProfile.avatar && (
                  <img 
                    src={currentProfile.avatar} 
                    alt={currentProfile.name} 
                    className="h-16 w-16 rounded-2xl object-cover mx-auto border-2 border-white shadow-md ring-1 ring-stone-200/80"
                  />
                )}
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-stone-900 tracking-tight leading-none">
                    Kolaborasi & Kampanye <br/>
                    <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                      {currentProfile.name}
                    </span>
                  </h1>
                  <p className="text-stone-500 text-[10px] font-medium max-w-md mx-auto leading-relaxed pt-1">
                    {currentProfile.description}
                  </p>
                </div>

                {/* Dynamic Stats Grid */}
                {stats.length > 0 && (
                  <div className="flex flex-wrap gap-2 max-w-sm mx-auto pt-2 justify-center">
                    {stats.map((stat, idx) => (
                      <div key={idx} className="bg-white border border-stone-200/60 p-2.5 rounded-xl text-center shadow-sm flex flex-col justify-center items-center w-[calc(50%-4px)] sm:w-[100px] shrink-0">
                        <p className="text-[8px] font-extrabold text-stone-400 uppercase tracking-widest flex items-center justify-center gap-0.5">
                          {getStatIcon(stat.icon)} {stat.label}
                        </p>
                        <p className="text-sm font-black text-stone-900 mt-0.5">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview Niches Section */}
              {niches.length > 0 && (
                <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                  <div className="text-center">
                    <h2 className="text-[8px] font-bold text-orange-600 uppercase tracking-widest">KATEGORI & KEAHLIAN</h2>
                    <p className="text-sm font-extrabold text-stone-950">Fokus Produk Konten Kami</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {niches.map((n, idx) => {
                      return (
                        <div key={idx} className="bg-white border border-stone-200/60 p-3 rounded-xl flex items-start gap-3 shadow-sm">
                          <div className="h-7 w-7 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                            {renderNicheIcon(n.icon, n.title)}
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="font-extrabold text-stone-900 text-xs">{n.title}</h3>
                            <p className="text-[10px] text-stone-500 leading-tight font-medium">{n.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Preview Pricing Cards Section */}
              <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-[8px] font-bold text-orange-600 uppercase tracking-widest">DAFTAR TARIF JASA</h2>
                  <p className="text-sm font-extrabold text-stone-950">Pilihan Paket & Penawaran Harga</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {profileRateCards.filter(rc => rc.published).map((rc) => {
                    let platformBadgeColor = "bg-stone-100 text-stone-700 border-stone-200";
                    if (rc.platform?.name === 'Instagram') {
                      platformBadgeColor = "bg-rose-50 text-rose-600 border-rose-100";
                    } else if (rc.platform?.name === 'TikTok') {
                      platformBadgeColor = "bg-stone-900 text-white border-transparent";
                    } else if (rc.platform?.name === 'YouTube') {
                      platformBadgeColor = "bg-red-50 text-red-600 border-red-100";
                    }

                    const isExpanded = previewExpandedId === rc.id

                    return (
                      <div
                        key={rc.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewExpandedId(isExpanded ? null : rc.id)
                        }}
                        className="bg-white border border-stone-200 rounded-[20px] overflow-hidden flex flex-col justify-between hover:border-orange-300 transition-all cursor-pointer p-0 shadow-sm"
                      >
                        {rc.image ? (
                          <div className="h-28 w-full overflow-hidden bg-stone-100 shrink-0">
                            <img src={rc.image} alt={rc.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-orange-500 shrink-0" />
                        )}

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              {rc.platform ? (
                                <span className={cn("text-[7px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border", platformBadgeColor)}>
                                  {rc.platform.name}
                                </span>
                              ) : (
                                <span className="text-[7px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border bg-orange-50 text-orange-600 border-orange-100">
                                  JASA
                                </span>
                              )}
                              <span className="text-[8px] font-bold text-orange-600 uppercase">
                                {isExpanded ? "Tutup ▲" : "Detail ▼"}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-xs text-stone-900 leading-snug uppercase tracking-wide truncate">
                              {rc.name}
                            </h4>

                            {isExpanded ? (
                              <div className="text-[10px] text-stone-600 leading-normal bg-stone-50 border border-stone-100 rounded-lg p-2 mt-1 space-y-1">
                                <p className="font-bold text-[9px] uppercase tracking-wide border-b pb-0.5">Syarat & Ketentuan:</p>
                                <p className="whitespace-pre-line leading-tight">{rc.description || 'Pengerjaan konten profesional.'}</p>
                              </div>
                            ) : (
                              <p className="text-[10px] text-stone-400 leading-snug line-clamp-1 font-medium">
                                {rc.description || 'Pengerjaan konten profesional.'}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-stone-100 flex flex-col justify-end">
                            <span className="text-[7px] font-extrabold text-stone-400 uppercase tracking-widest">TARIF</span>
                            <div className="flex items-baseline gap-0.5 mt-0.5">
                              <span className="text-sm font-black text-stone-950 font-mono">{formatCurrency(rc.price)}</span>
                              <span className="text-[9px] text-stone-400 font-bold">/ {rc.unit.replace('per ', '')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Preview Terms Section */}
              {terms.length > 0 && (
                <div className="bg-stone-100/50 border-t border-stone-200/60 py-8 px-4 space-y-4">
                  <div className="text-center">
                    <h2 className="text-[8px] font-bold text-orange-600 uppercase tracking-widest">TERM & CONDITIONS</h2>
                    <p className="text-xs font-extrabold text-stone-950">Ketentuan Umum Kerjasama</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-w-xl mx-auto">
                    {terms.map((term, idx) => (
                      <div key={idx} className="bg-white border border-stone-200/60 p-2.5 rounded-xl flex items-start gap-2 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-stone-600 leading-normal font-semibold">{term}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Footer */}
              <div className="py-6 bg-white border-t border-stone-200/60 text-center text-[9px] text-stone-400 font-medium">
                © {new Date().getFullYear()} {currentProfile.name.toUpperCase()}. ALL RIGHTS RESERVED.
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
