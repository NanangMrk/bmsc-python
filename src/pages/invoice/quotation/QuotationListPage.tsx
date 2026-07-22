import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, X, Trash2, Sparkles, LayoutGrid, LayoutList, Calendar, FileText, Pencil } from 'lucide-react'
import { mockQuotations } from '@/lib/mock-data'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatCurrency, formatDateShort, cn } from '@/lib/utils'
import { usePermissions } from '@/hooks/usePermissions'

export default function QuotationListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const hasQuoCreate = hasPermission('quo_create')
  const hasQuoEdit = hasPermission('quo_edit')
  const hasQuoDelete = hasPermission('quo_delete')
  
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const queryClient = useQueryClient()
  
  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => api<any[]>('/finance/quotations')
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api<any[]>('/users')
  })
  const [view, setView] = useState<'table' | 'grid'>('grid')

  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'TERKIRIM'>('DRAFT')
  const [items, setItems] = useState<Array<{
    id: string
    name: string
    qty: number
    unit: string
    price: number
  }>>([
    { id: '1', name: 'Instagram Reels', qty: 1, unit: 'video', price: 1500000 }
  ])

  const openCreateDrawer = () => {
    setEditingId(null)
    setSelectedUserId(null)
    setTitle('')
    setDescription('')
    setStatus('DRAFT')
    setItems([{ id: '1', name: 'Instagram Reels', qty: 1, unit: 'video', price: 1500000 }])
    setNote('')
    setIsOpen(true)
  }

  const openEditDrawer = (q: typeof quotations[0]) => {
    setEditingId(q.id)
    setSelectedUserId(q.userAccess?.[0]?.userId || null)
    setTitle(q.title || '')
    setDescription(q.description || '')
    setStatus(q.status as any)
    setItems([...q.items])
    setNote(q.note || '')
    setIsOpen(true)
  }

  const filtered = quotations.filter((q) => {
    const matchSearch = (q.number || '').toLowerCase().includes(search.toLowerCase()) || 
                        (q.brand?.name || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || q.status === filterStatus
    return matchSearch && matchStatus
  })

  // Total calculator
  const calculateTotal = (itemsList: Array<{ qty: number; price: number }>) => {
    return itemsList.reduce((sum, item) => sum + (item.qty * item.price), 0)
  }



  // Add blank manual item
  const addBlankItem = () => {
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      qty: 1,
      unit: 'video',
      price: 0
    }
    setItems([...items, newItem])
  }

  // Update item field value
  const updateItem = (id: string, field: 'name' | 'qty' | 'unit' | 'price', value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  // Remove item
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  // Form submission handler
  const saveMutation = useMutation({
    mutationFn: (data: any) => api('/finance/quotations', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      setEditingId(null)
      setSelectedUserId(null)
      setTitle('')
      setDescription('')
      setItems([{ id: '1', name: 'Instagram Reels', qty: 1, unit: 'video', price: 1500000 }])
      setNote('')
      setStatus('DRAFT')
      setIsOpen(false)
    },
    onError: (err: any) => {
      alert('Gagal menyimpan quotation: ' + err.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/finance/quotations/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: (err: any) => {
      alert('Gagal menghapus quotation: ' + err.message)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api(`/finance/quotations/${id}`, { method: 'PATCH', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      setEditingId(null)
      setSelectedUserId(null)
      setTitle('')
      setDescription('')
      setItems([{ id: '1', name: 'Instagram Reels', qty: 1, unit: 'video', price: 1500000 }])
      setNote('')
      setStatus('DRAFT')
      setIsOpen(false)
    },
    onError: (err: any) => {
      alert('Gagal memperbarui quotation: ' + err.message)
    }
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      alert('Tambahkan minimal 1 item quotation.')
      return
    }

    const quotationItems = items.map((item, idx) => ({
      id: item.id.startsWith('qi-') ? item.id : `qi-${Date.now()}-${idx}`,
      name: item.name || 'Jasa Kampanye',
      qty: item.qty,
      unit: item.unit,
      price: item.price,
      subtotal: item.qty * item.price
    }))

    const subtotal = calculateTotal(items)

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          title: title || undefined,
          description: description || undefined,
          items: quotationItems,
          total: subtotal,
          status,
          note,
          userId: selectedUserId || undefined
        }
      })
    } else {
      const now = new Date()
      const d = String(now.getDate()).padStart(2, '0')
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const y = now.getFullYear()
      const todayStr = now.toISOString().split('T')[0]

      saveMutation.mutate({
        number: `QUO-BMSC-${Date.now().toString().slice(-4)}`,
        brandId: null,
        userId: selectedUserId || null,
        title: title || undefined,
        description: description || undefined,
        items: quotationItems,
        total: subtotal,
        status,
        note,
        sentAt: status !== 'DRAFT' ? todayStr : undefined
      })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quotation</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} quotation</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'h-8 w-8 rounded-md flex items-center justify-center transition-all',
                view === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={cn(
                'h-8 w-8 rounded-md flex items-center justify-center transition-all',
                view === 'table' ? 'bg-white shadow-sm text-orange-600' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
          {hasQuoCreate && (
          <Button 
            id="add-quotation-btn" 
            icon={<Plus className="h-4 w-4" />}
            onClick={openCreateDrawer}
            className="bg-orange-600 hover:bg-orange-700 font-semibold"
          >
            Buat Quotation
          </Button>
          )}
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Cari quotation..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-muted-foreground" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
            <option value="ALL">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="TERKIRIM">Terkirim</option>
            <option value="DIPROSES">Diproses</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
        </div>
      </Card>

      {view === 'table' ? (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Nomor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Brand</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => navigate(`/invoice/quotation/${q.id}`)}>
                  <td className="px-5 py-3.5 font-mono text-xs font-medium">{q.number}</td>
                  <td className="px-4 py-3.5"><span className="text-sm">{q.brand?.name || q.userAccess?.[0]?.user?.name || '-'}</span></td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">{q.items.length} item</td>
                  <td className="px-4 py-3.5 font-semibold">{formatCurrency(q.total)}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={q.status} size="sm" /></td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDateShort(q.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => navigate(`/invoice/quotation/${q.id}`)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {hasQuoEdit && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditDrawer(q); }}
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      )}
                      {hasQuoDelete && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('Yakin ingin menghapus quotation ini?')) deleteMutation.mutate(q.id); }}
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground text-sm">
                    Tidak ada quotation yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((q) => (
            <Card key={q.id} className="overflow-hidden flex flex-col hover:border-orange-500/50 transition-colors cursor-pointer group" onClick={() => navigate(`/invoice/quotation/${q.id}`)}>
              <div className="p-4 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{q.brand?.name || q.userAccess?.[0]?.user?.name || '-'}</span>
                    <h3 className="font-bold text-sm font-mono text-foreground">{q.number}</h3>
                  </div>
                  <StatusBadge status={q.status} size="sm" />
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Items</span>
                    <span className="font-semibold">{q.items.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">Total</span>
                    <span className="font-bold text-orange-600">{formatCurrency(q.total)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 px-4 py-3 border-t border-border flex items-center justify-between mt-auto">
                <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateShort(q.createdAt)}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => navigate(`/invoice/quotation/${q.id}`)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-muted-foreground shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {hasQuoEdit && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditDrawer(q); }}
                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-muted-foreground shadow-sm"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  )}
                  {hasQuoDelete && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Yakin ingin menghapus quotation ini?')) deleteMutation.mutate(q.id); }}
                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500 shadow-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
              Tidak ada quotation yang ditemukan.
            </div>
          )}
        </div>
      )}

      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out border-l border-border/80",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">{editingId ? 'Edit Quotation' : 'Buat Quotation Baru'}</h2>
              <p className="text-xs text-muted-foreground">{editingId ? 'Ubah detail dan item penawaran' : 'Formulir pembuatan penawaran untuk client/brand.'}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-black/5 hover:text-foreground rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Informasi Client & Status */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest">Informasi Client & Status</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Status Awal</label>
                <div className="flex bg-gray-100 rounded-lg p-1 h-10">
                  <button
                    type="button"
                    onClick={() => setStatus('DRAFT')}
                    className={cn(
                      "flex-1 text-xs font-bold rounded-md transition-all",
                      status === 'DRAFT' ? "bg-white text-orange-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    DRAFT
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('TERKIRIM')}
                    className={cn(
                      "flex-1 text-xs font-bold rounded-md transition-all",
                      status === 'TERKIRIM' ? "bg-white text-orange-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    TERKIRIM
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('DISETUJUI')}
                    className={cn(
                      "flex-1 text-xs font-bold rounded-md transition-all",
                      status === 'DISETUJUI' ? "bg-white text-orange-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    DISETUJUI
                  </button>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Section 2: Pemetaan Akses & Detail Kampanye */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest">Detail Kampanye & Akses</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Pilih User (Opsional)</label>
                  <select 
                    value={selectedUserId || ''} 
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">-- Bebas (Pilih Nanti) --</option>
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.name} {u.role === 'BRAND' ? `(Klien: ${u.brand?.name || '-'})` : ''}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Otomatis melampirkan identitas Brand-nya.</p>
                </div>
              
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Judul Kampanye (Opsional)</label>
                <input
                  type="text"
                  placeholder="KLIEN MARKETING CAMPAIGN"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Deskripsi Kampanye (Opsional)</label>
                <textarea
                  placeholder="Rencana anggaran & usulan penawaran untuk kampanye influencer."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[60px] p-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y"
                />
              </div>
            </div>
          </div>



          <hr className="border-border/60" />

          {/* Section 3: Item Penawaran */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest">Daftar Item Penawaran</h3>
              <button
                type="button"
                onClick={addBlankItem}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Tambah Item Baru
              </button>
            </div>

            <div className="border border-border/80 rounded-2xl overflow-hidden bg-gray-50/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    <th className="px-4 py-2.5 text-left">Deskripsi Jasa</th>
                    <th className="px-3 py-2.5 text-right w-16">Qty</th>
                    <th className="px-3 py-2.5 text-left w-20">Unit</th>
                    <th className="px-3 py-2.5 text-right w-32">Harga Satuan</th>
                    <th className="px-3 py-2.5 text-right w-28">Subtotal</th>
                    <th className="px-4 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          required
                          value={item.name}
                          placeholder="Contoh: Pembuatan Video TikTok"
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                          className="w-full h-8 px-1.5 rounded-md border border-border bg-white text-center text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          required
                          value={item.unit}
                          placeholder="video"
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          required
                          min="0"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                          className="w-full h-8 px-2 rounded-md border border-border bg-white text-right text-xs focus:outline-none focus:ring-1 focus:ring-orange-400 font-mono"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-semibold font-mono text-xs text-foreground/80">
                        {formatCurrency(item.qty * item.price)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                        Belum ada item penawaran. Gunakan autofill di atas atau klik "Tambah Item Baru".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Section 4: Catatan Tambahan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Catatan Tambahan</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Pembayaran dilakukan 2 termin (DP 50%, Pelunasan 50% setelah live)."
              className="w-full min-h-[80px] p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-muted-foreground/60 resize-y"
            />
          </div>

          {/* Section 5: Ringkasan Biaya */}
          <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-5 space-y-2 text-sm font-medium">
            <div className="flex justify-between text-muted-foreground text-xs uppercase tracking-wider">
              <span>Subtotal Penawaran</span>
              <span className="font-mono font-semibold">{formatCurrency(calculateTotal(items))}</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-xs uppercase tracking-wider">
              <span>PPN (11%)</span>
              <span className="font-mono font-semibold">{formatCurrency(calculateTotal(items) * 0.11)}</span>
            </div>
            <div className="border-t border-orange-200/50 pt-2 flex justify-between items-baseline">
              <span className="font-bold text-foreground">Total Penawaran (Termasuk Pajak)</span>
              <span className="text-lg font-black font-mono text-orange-600">{formatCurrency(calculateTotal(items) * 1.11)}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-md shadow-orange-600/20"
              loading={saveMutation.isPending}
            >
              Simpan Quotation
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
