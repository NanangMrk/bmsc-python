import { useState } from 'react'
import { Plus, Trash2, Check, Settings2, Pencil, Instagram, Youtube, Layers, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface PlatformItem {
  id: string
  name: string
  iconBg: string
  iconColor: string
  icon: React.ReactNode
  budget: number
  description?: string
  status: 'AKTIF' | 'NONAKTIF'
  logo?: string
}

export default function PlatformPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  const { data: rawPlatforms = [], isLoading } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => api<any[]>('/platforms')
  })

  const getPlatformIcon = (platformName: string) => {
    const lower = platformName.toLowerCase()
    if (lower.includes('youtube')) {
      return {
        icon: <Youtube className="h-5 w-5" />,
        bg: 'bg-red-50',
        color: 'text-red-600',
        nameStr: 'youtube'
      }
    }
    if (lower.includes('instagram')) {
      return {
        icon: <Instagram className="h-5 w-5" />,
        bg: 'bg-pink-50',
        color: 'text-pink-600',
        nameStr: 'instagram'
      }
    }
    if (lower.includes('tiktok')) {
      return {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music-2"><circle cx="8" cy="18" r="4"/><path d="M12 18V2l7 4"/></svg>,
        bg: 'bg-gray-100',
        color: 'text-gray-900',
        nameStr: 'tiktok'
      }
    }
    return {
      icon: <Layers className="h-5 w-5" />,
      bg: 'bg-orange-50',
      color: 'text-orange-600',
      nameStr: 'layers'
    }
  }

  const platforms: PlatformItem[] = rawPlatforms.map(p => {
    const style = getPlatformIcon(p.name)
    return {
      id: p.id,
      name: p.name,
      budget: parseFloat(p.idealCost || '0'),
      icon: style.icon,
      iconBg: style.bg,
      iconColor: style.color,
      status: 'AKTIF', // Not in DB yet
      description: 'Platform pemasaran media sosial.' // Not in DB yet
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api('/platforms', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] })
      setIsModalOpen(false)
    }
  })

  const openEditModal = (p: PlatformItem) => {
    setEditingId(p.id)
    setName(p.name)
    setBudget(p.budget.toString())
    setDescription(p.description || '')
    setLogoUrl(p.logo || '')
    setIsModalOpen(true)
  }
  
  const openAddModal = () => {
    setEditingId(null)
    setName('')
    setBudget('')
    setDescription('')
    setLogoUrl('')
    setIsModalOpen(true)
  }

  const handleSavePlatform = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const style = getPlatformIcon(name)
    
    if (editingId) {
      alert("Fitur update belum tersedia di API backend saat ini.")
    } else {
      createMutation.mutate({
        name,
        icon: style.nameStr,
        idealCost: parseFloat(budget) || 0
      })
    }
  }

  const handleDeletePlatform = (id: string) => {
    if (confirm('Fitur hapus belum terhubung dengan API backend saat ini.')) {
      // noop
    }
  }

  const togglePlatformStatus = (id: string) => {
    alert('Fitur ubah status belum terhubung ke API.')
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-border/60 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">
            <Settings2 className="h-3.5 w-3.5" />
            <span>PLATFORM MANAGEMENT ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Kelola Platform & Kebutuhan Kampanye</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Konfigurasikan pilihan platform yang tersedia di platform endorsement BMS. Tambahkan platform baru, tentukan standar budget minimal kampanye.
          </p>
        </div>
        
        <Button 
          onClick={openAddModal}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-5 whitespace-nowrap flex-shrink-0" 
          icon={<Plus className="h-4 w-4" />}
        >
          {editingId ? "Edit Platform" : "Tambah Platform Baru"}
        </Button>
      </div>

      {/* Grid Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {platforms.map((pl) => (
          <div 
            key={pl.id} 
            className={`bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all ${
              pl.status === 'AKTIF' ? 'border-border/60 opacity-100' : 'border-stone-200/40 opacity-70 bg-stone-50/50'
            }`}
          >
            <div className="p-5 flex-1">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-start gap-3">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center overflow-hidden ${pl.iconBg} ${pl.iconColor}`}>
                    {pl.logo ? (
                      <img src={pl.logo} alt={pl.name} className="w-full h-full object-cover" />
                    ) : (
                      pl.icon
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px]">{pl.name}</h3>
                    <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                      pl.status === 'AKTIF' ? 'bg-orange-50 text-orange-600' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {pl.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openEditModal(pl)}
                    className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-orange-500 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDeletePlatform(pl.id)}
                    className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">
                {pl.description || 'Platform pemasaran media sosial.'}
              </p>

              {/* Stats Box */}
              <div className="bg-gray-50/80 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">STANDAR BUDGET</div>
                  <div className="text-xs sm:text-sm font-bold text-stone-800">{formatCurrency(pl.budget)}</div>
                </div>
              </div>
            </div>

            {/* Footer Status Toggle */}
            <div className="px-5 py-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                UBAH STATUS:
              </span>
              <button 
                onClick={() => togglePlatformStatus(pl.id)}
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase transition-colors ${
                  pl.status === 'AKTIF'
                    ? 'bg-green-50 text-green-600 hover:bg-green-100'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                <Check className="h-3 w-3" />
                {pl.status === 'AKTIF' ? 'AKTIF' : 'AKTIFKAN'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Platform Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
              <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                <Layers className="h-4.5 w-4.5 text-orange-500" /> {editingId ? "Edit Platform" : "Tambah Platform Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePlatform} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Platform / Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TikTok Shop, Shopee Live, Twitter/X"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Logo / Icon (Opsional)</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-stone-100 flex items-center justify-center border border-stone-200 overflow-hidden">
                    {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Layers className="h-5 w-5 text-stone-400" />}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = URL.createObjectURL(file)
                          setLogoUrl(url)
                        }
                      }}
                      className="w-full text-xs text-stone-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                    />
                    <p className="text-[9px] text-stone-400 mt-1">Format: JPG, PNG. Max: 2MB.</p>
                  </div>
                  {logoUrl && (
                    <button type="button" onClick={() => setLogoUrl('')} className="text-xs text-red-500 hover:underline">Hapus</button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Standar Budget (IDR)</label>
                <input
                  type="number"
                  placeholder="Contoh: 1500000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Deskripsi Singkat</label>
                <textarea
                  placeholder="Masukkan deskripsi singkat platform..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 h-16 resize-none"
                />
              </div>

              <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl flex items-start gap-2 text-[10px] text-stone-500">
                <AlertCircle className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                <p className="leading-normal">
                  Platform baru yang ditambahkan akan otomatis diaktifkan dan terdaftar pada mesin kampanye BMSC.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan Platform"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
