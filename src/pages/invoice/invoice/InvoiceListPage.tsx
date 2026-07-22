import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, LayoutGrid, LayoutList, Calendar, Clock, X, Sparkles, Pencil } from 'lucide-react'
// mock-data types used at runtime
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDateShort, cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { usePermissions } from '@/hooks/usePermissions'

export default function InvoiceListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const hasInvEditStatus = hasPermission('inv_edit_status')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [view, setView] = useState<'table' | 'grid'>('grid')
  
  const queryClient = useQueryClient()
  
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api<any[]>('/finance/invoices')
  })

  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [invoiceStatus, setInvoiceStatus] = useState<any>('BELUM_DIBAYAR')

  const openEditDrawer = (inv: any) => {
    setEditingId(inv.id)
    setInvoiceStatus(inv.status)
    setIsOpen(true)
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api(`/finance/invoices/${id}/status`, { method: 'PATCH', data: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setIsOpen(false)
      setEditingId(null)
    },
    onError: (err: any) => {
      alert('Gagal memperbarui invoice: ' + err.message)
    }
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, status: invoiceStatus })
    }
  }

  const filtered = invoices.filter((inv: any) => {
    const matchSearch = (inv.number || '').toLowerCase().includes(search.toLowerCase()) || 
                        (inv.brand?.name || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || inv.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalRevenue = invoices.filter((i: any) => i.status === 'LUNAS').reduce((acc: number, i: any) => acc + Number(i.total), 0)
  const pendingRevenue = invoices.filter((i: any) => i.status !== 'LUNAS').reduce((acc: number, i: any) => acc + Number(i.total), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoice</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} invoice</p>
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Lunas', value: formatCurrency(totalRevenue), color: 'text-green-600 bg-green-50' },
          { label: 'Pending', value: formatCurrency(pendingRevenue), color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Menunggu Verifikasi', value: invoices.filter((i) => i.status === 'MENUNGGU_VERIFIKASI').length, color: 'text-orange-600 bg-orange-50' },
          { label: 'Overdue', value: invoices.filter((i) => i.status === 'OVERDUE').length, color: 'text-red-600 bg-red-50' },
        ].map((stat) => (
          <div key={stat.label} className={`p-4 rounded-xl border border-border ${stat.color.split(' ')[1]}`}>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${stat.color.split(' ')[0]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Cari invoice..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-muted-foreground" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
            <option value="ALL">Semua Status</option>
            <option value="BELUM_DIBAYAR">Belum Dibayar</option>
            <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
            <option value="LUNAS">Lunas</option>
            <option value="OVERDUE">Overdue</option>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Jatuh Tempo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => navigate(`/invoice/invoice/${inv.id}`)}>
                  <td className="px-5 py-3.5 font-mono text-xs font-medium">{inv.number}</td>
                  <td className="px-4 py-3.5"><span className="text-sm">{inv.brand?.name || '-'}</span></td>
                  <td className="px-4 py-3.5 font-semibold">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={inv.status} size="sm" /></td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDateShort(inv.dueDate)}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDateShort(inv.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {hasInvEditStatus && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditDrawer(inv); }}
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground text-sm">
                    Tidak ada invoice yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((inv) => (
            <Card key={inv.id} className="overflow-hidden flex flex-col hover:border-orange-500/50 transition-colors cursor-pointer group" onClick={() => navigate(`/invoice/invoice/${inv.id}`)}>
              <div className="p-4 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{inv.brand?.name || '-'}</span>
                    <h3 className="font-bold text-sm font-mono text-foreground">{inv.number}</h3>
                  </div>
                  <StatusBadge status={inv.status} size="sm" />
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-500" /> Jatuh Tempo</span>
                    <span className="font-semibold text-xs">{formatDateShort(inv.dueDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">Total Tagihan</span>
                    <span className="font-bold text-orange-600">{formatCurrency(inv.total)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 px-4 py-3 border-t border-border flex items-center justify-between mt-auto">
                <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateShort(inv.createdAt)}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-muted-foreground shadow-sm">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {hasInvEditStatus && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditDrawer(inv); }}
                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-muted-foreground shadow-sm"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
              Tidak ada invoice yang ditemukan.
            </div>
          )}
        </div>
      )}

      {/* Status Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-orange-50/50 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-600">
                <Sparkles className="h-4 w-4" />
                <h2 className="font-bold text-sm uppercase tracking-wider">Ubah Status Invoice</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:bg-black/5 hover:text-foreground rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Pilih Status Baru</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'BELUM_DIBAYAR', label: 'Belum Bayar' },
                    { value: 'TERMIN', label: 'Termin' },
                    { value: 'MENUNGGU_VERIFIKASI', label: 'Verifikasi' },
                    { value: 'LUNAS', label: 'Lunas' },
                    { value: 'OVERDUE', label: 'Overdue' }
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setInvoiceStatus(opt.value)}
                      className={cn(
                        "py-2 px-2 text-[10px] font-bold rounded-lg border transition-all text-center uppercase tracking-wider",
                        invoiceStatus === opt.value
                          ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                          : "bg-white text-muted-foreground border-border hover:bg-muted"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
