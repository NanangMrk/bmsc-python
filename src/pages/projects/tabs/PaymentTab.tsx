import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Pencil } from 'lucide-react'
// data fetched via API
import type { Project, Payment, PaymentStatus } from '@/lib/mock-data'
import { formatCurrency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { usePermissions } from '@/hooks/usePermissions'

interface PaymentTabProps {
  project: Project
}

export function PaymentTab({ project }: PaymentTabProps) {
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const hasPayAdd = hasPermission('proj_pay_add')
  const hasPayDel = hasPermission('proj_pay_delete')
  const hasPayPrint = hasPermission('proj_pay_print')
  const hasPayEditStatus = hasPermission('proj_pay_edit_status')

  // Load payments dynamically from API project data
  const [payments, setPayments] = useState<any[]>((project as any).payments || [])

  // Load active bank accounts from settings
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => api<any[]>('/bank-accounts')
  })
  const activeBank = bankAccounts.find((b: any) => b.isActive) || bankAccounts[0]

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api<any>('/settings')
  })
  const settings = settingsData || {}

  useEffect(() => {
    if ((project as any).payments) {
      setPayments((project as any).payments);
    }
  }, [(project as any).payments]);

  // Add milestone form states
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPayType, setNewPayType] = useState('')
  const [newPayAmount, setNewPayAmount] = useState('')
  const [newPayDescription, setNewPayDescription] = useState('')
  const [newPayStatus, setNewPayStatus] = useState<PaymentStatus>('MENUNGGU')

  // Edit milestone form states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)
  const [editPayType, setEditPayType] = useState('')
  const [editPayAmount, setEditPayAmount] = useState('')
  const [editPayDescription, setEditPayDescription] = useState('')
  const [editPayBillTo, setEditPayBillTo] = useState('')

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api<any[]>('/users')
  })

  // State to track temporary status changes before save is clicked
  const [modifiedStatuses, setModifiedStatuses] = useState<Record<string, PaymentStatus>>({})

  // State to track which milestone invoice is being previewed for print
  const [printInvoicePayment, setPrintInvoicePayment] = useState<Payment | null>(null)

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => api(`/projects/payments/${paymentId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] })
    },
    onError: (err: any) => {
      alert('Gagal menghapus payment: ' + err.message)
    }
  })

  const handleDeletePayment = (paymentId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tahap pembayaran ini?')) {
      deletePaymentMutation.mutate(paymentId)
      // Remove any pending modified status
      setModifiedStatuses((prev) => {
        const copy = { ...prev }
        delete copy[paymentId]
        return copy
      })
    }
  }

  // Handle temporary select of status
  const handleSelectStatus = (paymentId: string, selectedStatus: PaymentStatus) => {
    setModifiedStatuses((prev) => ({
      ...prev,
      [paymentId]: selectedStatus,
    }))
  }

  // const queryClient = useQueryClient();

  // Commit status change to database & local state
  const handleSaveStatusChange = async (paymentId: string) => {
    const newStatus = modifiedStatuses[paymentId]
    if (!newStatus) return

    try {
      await api(`/payments/${paymentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      
      // Update local state directly for immediate feedback
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: newStatus } : p))
      )
      
      // Invalidate the project query to refetch the latest from DB
      queryClient.invalidateQueries({ queryKey: ['project', project.id] })

      // Clear tracking for this payment
      setModifiedStatuses((prev) => {
        const copy = { ...prev }
        delete copy[paymentId]
        return copy
      })
    } catch (err: any) {
      alert('Gagal mengubah status: ' + err.message)
    }
  }

  const handleEditClick = (pay: any) => {
    setEditingPaymentId(pay.id)
    setEditPayType(pay.type || pay.title || '')
    setEditPayAmount(pay.amount?.toString() || '')
    setEditPayDescription(pay.description || '')
    setEditPayBillTo(pay.billToId || '')
    setShowEditModal(true)
  }

  const updatePaymentMutation = useMutation({
    mutationFn: (data: any) => api(`/projects/payments/${editingPaymentId}`, { method: 'PATCH', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] })
      setShowEditModal(false)
    },
    onError: (err: any) => {
      alert('Gagal mengupdate payment: ' + err.message)
    }
  })

  const handleEditPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editPayType.trim() || !editPayAmount) {
      alert('Nama tahap dan nominal wajib diisi')
      return
    }

    updatePaymentMutation.mutate({
      type: editPayType,
      amount: parseInt(editPayAmount) || 0,
      billToId: editPayBillTo || null
    })
  }

  const addPaymentMutation = useMutation({
    mutationFn: (data: any) => api(`/projects/${project.id}/payments`, { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] })
      setShowAddModal(false)
      // Reset Form
      setNewPayType('')
      setNewPayAmount('')
      setNewPayDescription('')
      setNewPayStatus('MENUNGGU')
    },
    onError: (err: any) => {
      alert('Gagal membuat tahap pembayaran: ' + err.message)
    }
  })

  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPayType.trim() || !newPayAmount) {
      alert('Nama tahap dan nominal wajib diisi')
      return
    }

    addPaymentMutation.mutate({
      type: newPayType,
      amount: parseInt(newPayAmount) || 0,
      description: newPayDescription
    })
  }

  // Calculate dynamic summaries
  const totalContractValue = project.value
  const totalMilestonePlanned = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0)
  const totalPaid = payments.filter((p) => p.status === 'LUNAS').reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0)

  return (
    <div className="space-y-6">
      {/* Dynamic Style Injection for printing a specific DOM node without portal */}
      {printInvoicePayment && (
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-invoice-sheet, #printable-invoice-sheet * {
              visibility: visible !important;
            }
            #printable-invoice-sheet {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background: white !important;
              padding: 15mm !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <span className="text-orange-600 font-serif text-lg">$</span> Milestone & Tahapan Pembayaran
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola termin pembayaran proyek, sesuaikan rincian, dan perbarui status pembayarannya secara manual.
          </p>
        </div>
        {hasPayAdd && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
          >
            <span>+</span> Tambah Tahap Pembayaran
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {payments.map((pay, idx) => {
          const cardTitle = pay.title || (pay.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%')
          const cardDesc = pay.description || (pay.type === 'DP' ? 'DP 50% diperlukan sebagai komitmen awal pengerjaan konsep.' : 'Pelunasan diselesaikan saat deliverables disetujui untuk ditayangkan live.')

          const displayStatus = modifiedStatuses[pay.id] ?? pay.status
          const hasStatusChanged = modifiedStatuses[pay.id] && modifiedStatuses[pay.id] !== pay.status

          let cardBorder = "border-border/60 bg-white"
          let badgeClass = "bg-gray-100 text-gray-750"

          if (displayStatus === 'LUNAS') {
            cardBorder = "border-green-200 bg-green-50/10"
            badgeClass = "bg-green-100 text-green-700 font-semibold"
          } else if (displayStatus === 'PROSES_VERIFIKASI') {
            cardBorder = "border-blue-200 bg-blue-50/10"
            badgeClass = "bg-blue-100 text-blue-700 font-semibold"
          } else if (displayStatus === 'MENUNGGU') {
            cardBorder = "border-amber-200 bg-amber-50/10"
            badgeClass = "bg-amber-100 text-amber-700 font-semibold"
          }

          return (
            <div key={pay.id} className={cn("border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between transition-all min-h-[230px]", cardBorder)}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">TAHAP {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase", badgeClass)}>
                      {displayStatus === 'PROSES_VERIFIKASI' ? 'PROSES' : displayStatus}
                    </span>
                    {hasPayAdd && (
                      <button
                        onClick={() => handleEditClick(pay)}
                        className="text-muted-foreground hover:text-orange-600 transition-colors"
                        title="Ubah Tahap"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {hasPayDel && (
                      <button
                        onClick={() => handleDeletePayment(pay.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                        title="Hapus Tahap Pembayaran"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-sm mb-1">{cardTitle}</h4>
                <p className="font-bold text-base mb-2">{formatCurrency(pay.amount)}</p>
                
                <div className="flex items-end justify-between gap-4">
                  <p className="text-xs text-muted-foreground flex-1">{cardDesc}</p>
                  {hasPayPrint && (
                    <button
                      onClick={() => setPrintInvoicePayment(pay)}
                      className="text-[10px] font-bold text-orange-600 hover:underline flex items-center gap-1 uppercase tracking-wider shrink-0"
                      type="button"
                    >
                      CETAK INVOICE <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border/50 text-[10px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-muted-foreground tracking-wider uppercase">UBAH STATUS:</span>
                    <div className="flex items-center bg-gray-100 rounded p-0.5 font-bold">
                      <button
                        disabled={!hasPayEditStatus}
                        onClick={() => handleSelectStatus(pay.id, 'MENUNGGU')}
                        className={cn("px-2 py-0.5 rounded transition-all", displayStatus === 'MENUNGGU' ? "bg-amber-500 text-white shadow-sm" : "text-muted-foreground hover:bg-white", !hasPayEditStatus && "cursor-not-allowed")}
                        type="button"
                      >
                        MENUNGGU
                      </button>
                      <button
                        disabled={!hasPayEditStatus}
                        onClick={() => handleSelectStatus(pay.id, 'PROSES_VERIFIKASI')}
                        className={cn("px-2 py-0.5 rounded transition-all", displayStatus === 'PROSES_VERIFIKASI' ? "bg-blue-500 text-white shadow-sm" : "text-muted-foreground hover:bg-white", !hasPayEditStatus && "cursor-not-allowed")}
                        type="button"
                      >
                        PROSES
                      </button>
                      <button
                        disabled={!hasPayEditStatus}
                        onClick={() => handleSelectStatus(pay.id, 'LUNAS')}
                        className={cn("px-2 py-0.5 rounded transition-all", displayStatus === 'LUNAS' ? "bg-green-500 text-white shadow-sm" : "text-muted-foreground hover:bg-white", !hasPayEditStatus && "cursor-not-allowed")}
                        type="button"
                      >
                        LUNAS
                      </button>
                    </div>
                  </div>

                  {/* Save button visible only when status changes */}
                  {hasStatusChanged && (
                    <button
                      onClick={() => handleSaveStatusChange(pay.id)}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md transition-all animate-pulse"
                      type="button"
                    >
                      Simpan
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {payments.length === 0 && (
          <div className="col-span-2 border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-xs">
            Belum ada tahapan pembayaran yang dibuat. Klik "+ Tambah Tahap Pembayaran" untuk memulainya.
          </div>
        )}
      </div>

      {/* Bottom Info summaries */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-2">TUJUAN TRANSFER BANK</h4>
          <div className="border border-border/60 rounded-lg p-4 bg-white flex justify-between items-center h-[90px]">
            {activeBank ? (
              <>
                <div>
                  <p className="font-bold text-sm">{activeBank.bankName}</p>
                  <p className="font-bold text-sm mb-1">{activeBank.accountNumber}</p>
                  <p className="text-[10px] text-muted-foreground italic">a/n {activeBank.accountName}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeBank.accountNumber)
                    alert('Nomor rekening berhasil disalin!')
                  }}
                  className="text-sm font-bold text-orange-600 hover:underline"
                >
                  Salin
                </button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic">Belum ada rekening aktif. Tambahkan di Settings → Rekening.</p>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-2">RINCIAN FINANSIAL</h4>
          <div className="border border-border/60 rounded-lg p-4 bg-white text-xs font-mono flex flex-col justify-center h-[90px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-muted-foreground font-sans">Total Nilai Kontrak:</span>
              <span className="font-bold">{formatCurrency(totalContractValue)}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-muted-foreground font-sans">Total Rencana Milestone:</span>
              <span className="font-bold text-orange-600">{formatCurrency(totalMilestonePlanned)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-sans">Telah Dibayarkan (Lunas):</span>
              <span className="font-bold text-green-600">{formatCurrency(totalPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cetak Invoice Preview */}
      {printInvoicePayment && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden print:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl border border-stone-200 flex flex-col max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200/80 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-stone-950 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                Pratinjau Invoice Resmi
              </h3>
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold px-4 py-2 border border-stone-250 hover:bg-stone-50 transition-all bg-white"
                  onClick={() => {
                    const url = `${window.location.origin}/public/payment/${printInvoicePayment.id}`;
                    navigator.clipboard.writeText(url);
                    alert('Link invoice publik berhasil disalin!');
                  }}
                >
                  Salin Link Invoice
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2 border-0 shadow-sm transition-all"
                >
                  Cetak / Simpan PDF
                </Button>
                <button
                  onClick={() => setPrintInvoicePayment(null)}
                  className="h-8 w-8 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"
                  type="button"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Invoice sheet for visual preview in modal */}
            <div className="p-6 overflow-y-auto flex-1 bg-stone-100/30">
              <div className="bg-white border border-gray-200 shadow-md rounded-[24px] p-6 sm:p-12 max-w-3xl mx-auto relative overflow-hidden">
                
                {/* Diagonal Stamp */}
                <div className="absolute top-6 right-6 sm:top-12 sm:right-12 z-10">
                  {printInvoicePayment.status === 'LUNAS' ? (
                    <div className="border-[3.5px] border-emerald-500/75 text-emerald-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center font-sans tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply">
                      <div className="flex items-center gap-1 text-[9px] font-extrabold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500/85"><polyline points="20 6 9 17 4 12"/></svg>
                        INVOICE
                      </div>
                      <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
                        LUNAS / PAID
                      </div>
                      <div className="text-[7.5px] font-semibold text-emerald-500/60 uppercase tracking-widest">
                        NANANGMRK
                      </div>
                    </div>
                  ) : (
                    <div className="border-[3.5px] border-rose-500/75 text-rose-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center font-sans tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply">
                      <div className="flex items-center gap-1 text-[9px] font-extrabold">
                        <span className="inline-flex items-center justify-center border border-rose-500/80 text-rose-500/80 rounded-full h-3.5 w-3.5 text-[8.5px] font-extrabold">!</span>
                        INVOICE
                      </div>
                      <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
                        BELUM LUNAS
                      </div>
                      <div className="text-[7.5px] font-semibold text-rose-500/60 uppercase tracking-widest">
                        NANANGMRK
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice Top Details */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  {/* Sender Profile */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 bg-orange-600 text-white rounded-full flex items-center justify-center font-black text-base shadow-sm">
                        {settings.agencyName?.charAt(0) || 'N'}
                      </div>
                      <span className="font-extrabold text-base text-foreground">{settings.agencyName || 'NanangMrk'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5 leading-relaxed">
                      {settings.corporateName && <p className="font-bold text-foreground text-xs">{settings.corporateName}</p>}
                      {settings.building && <p>{settings.building}</p>}
                      <p className="whitespace-pre-line">{settings.address || 'Pondok Indah Office Tower 3\nJakarta Selatan, 12310'}</p>
                      <p>Email: {settings.email || 'finance@bmsc.id'}</p>
                      <p>Telp: {settings.phone || '+62 811 1234 567'}</p>
                    </div>
                  </div>

                  {/* Invoice Meta */}
                  <div className="sm:text-right text-xs text-muted-foreground space-y-1 sm:mt-12">
                    <h2 className="text-2xl font-black text-orange-600 tracking-wider">INVOICE</h2>
                    <p className="font-semibold text-foreground">No. Invoice: <span className="font-mono text-muted-foreground">INV-{project.id.toUpperCase()}-{printInvoicePayment.id.toUpperCase()}</span></p>
                    <p className="font-semibold text-foreground">Tanggal: <span className="text-muted-foreground">{printInvoicePayment.createdAt}</span></p>
                    <p className="font-semibold text-foreground">Tenggat: <span className="text-amber-500 font-bold">{printInvoicePayment.createdAt}</span></p>
                  </div>
                </div>

                <hr className="border-gray-200/80 my-8" />

                {/* Bill To & Project Info */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Bill To */}
                  <div>
                    <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">DITANGGUHKAN KEPADA (BILL TO)</h3>
                    <div className="text-xs space-y-0.5 leading-relaxed">
                      <p className="font-bold text-foreground uppercase">{printInvoicePayment.billTo?.companyName || printInvoicePayment.billTo?.brand?.name || printInvoicePayment.billTo?.name || project.brand?.name || 'Unknown'}</p>
                      <p><span className="text-muted-foreground">Attn:</span> {printInvoicePayment.billTo?.picName || printInvoicePayment.billTo?.name || project.brand?.name || '-'}</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">{printInvoicePayment.billTo?.address || '-'}</p>
                      <p className="text-muted-foreground">{printInvoicePayment.billTo?.phone || '-'}</p>
                      <p className="text-muted-foreground">{printInvoicePayment.billTo?.email || '-'}</p>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div>
                    <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">INFORMASI PROYEK & KAMPANYE</h3>
                    <div className="text-xs space-y-0.5 leading-relaxed">
                      <p className="font-bold text-foreground uppercase">{project.name}</p>
                      <p className="text-muted-foreground">Tagihan termin pembayaran untuk pengerjaan kampanye konten.</p>
                      <p><span className="text-muted-foreground">Termin:</span> {printInvoicePayment.title || (printInvoicePayment.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%')}</p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200/80 my-8" />

                {/* Items Table */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">DESKRIPSI ITEM PEKERJAAN</h3>
                  <div className="border border-gray-250/70 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-200 text-muted-foreground text-left font-semibold">
                          <th className="px-5 py-3.5 font-bold">Deskripsi Pekerjaan / Layanan</th>
                          <th className="px-3 py-3.5 text-center font-bold w-20">Volume</th>
                          <th className="px-3 py-3.5 text-center font-bold w-20">Satuan</th>
                          <th className="px-4 py-3.5 text-right font-bold w-32">Harga Satuan</th>
                          <th className="px-5 py-3.5 text-right font-bold w-36">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-foreground">
                        <tr className="hover:bg-gray-50/30">
                          <td className="px-5 py-4 font-bold text-foreground/80">
                            <p>{project.name}</p>
                            <p className="text-muted-foreground text-[10px] font-normal mt-0.5">{printInvoicePayment.title || (printInvoicePayment.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%')}</p>
                          </td>
                          <td className="px-3 py-4 text-center font-bold">1</td>
                          <td className="px-3 py-4 text-center text-muted-foreground capitalize">Milestone</td>
                          <td className="px-4 py-4 text-right font-semibold">{formatCurrency(printInvoicePayment.amount)}</td>
                          <td className="px-5 py-4 text-right font-bold text-foreground">{formatCurrency(printInvoicePayment.amount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Calculations Summary */}
                <div className="flex flex-col items-end space-y-2 mt-6 font-semibold">
                  <div className="flex justify-between w-full max-w-[280px] text-xs text-muted-foreground border-b border-gray-100 pb-2">
                    <span>Subtotal Pekerjaan:</span>
                    <span className="font-bold text-foreground">{formatCurrency(printInvoicePayment.amount)}</span>
                  </div>
                  <div className="flex justify-between w-full max-w-[280px] text-xs items-baseline">
                    <span className="font-bold text-foreground text-xs uppercase tracking-wide">Total Tagihan (IDR):</span>
                    <span className="font-black text-orange-600 text-base">{formatCurrency(printInvoicePayment.amount)}</span>
                  </div>
                </div>

                {/* Payment Details Box */}
                <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/20 grid md:grid-cols-2 gap-5 mt-8 text-xs leading-relaxed">
                  {/* Payment Instructions */}
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">TATA CARA PEMBAYARAN</h4>
                    <p className="text-muted-foreground font-medium whitespace-pre-line">
                      {settings.invBankInstruction || 'Mohon sertakan berita transfer nomor invoice saat melakukan pembayaran. Kirimkan konfirmasi bukti transfer melalui platform atau kirim ke WhatsApp 085156014905'}
                    </p>
                  </div>

                  {/* Target Bank Account */}
                  <div className="md:border-l border-gray-200 md:pl-5 space-y-0.5">
                    <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px] mb-1.5">REKENING TUJUAN</h4>
                    {activeBank ? (
                      <>
                        <p className="font-extrabold text-foreground">{activeBank.bankName}</p>
                        <p className="font-black text-orange-600 text-base tracking-wider">{activeBank.accountNumber}</p>
                        <p className="text-muted-foreground font-semibold">a.n. {activeBank.accountName}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-extrabold text-foreground">Belum ada Rekening Aktif</p>
                        <p className="text-muted-foreground font-semibold text-[10px] mt-1">Silakan tambahkan di menu Pengaturan.</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Terms & Signature Section */}
                <div className="grid sm:grid-cols-2 gap-8 mt-10 text-xs">
                  {/* Terms and Conditions */}
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">SYARAT & KETENTUAN</h4>
                    <div className="text-[10.5px] text-muted-foreground/80 leading-relaxed font-medium whitespace-pre-line">
                      {settings.invTermsText || '1. Invoice ini adalah sah diterbitkan oleh perusahaan.\n2. Tagihan ini berlaku sebagai kwitansi lunas yang sah apabila status tercantum LUNAS / PAID.'}
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="flex flex-col items-end">
                    <div className="flex flex-col items-center text-center space-y-12 w-48">
                      <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">HORMAT KAMI,</h4>
                      <div className="space-y-1 w-full">
                        <p className="border-b border-dotted border-gray-400 pb-1.5 font-bold text-foreground w-full text-center">{settings.invSignatoryName || 'NanangMrk'}</p>
                        <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-widest text-center w-full">{settings.invSignatoryRole || 'Finance Manager'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print-only sheet container */}
      {printInvoicePayment && (
        <div id="printable-invoice-sheet" className="hidden print:block p-8 bg-white text-stone-955 relative" style={{ fontFamily: 'sans-serif' }}>
          
          {/* Diagonal Stamp */}
          <div className="absolute top-6 right-6 z-10">
            {printInvoicePayment.status === 'LUNAS' ? (
              <div className="border-[3.5px] border-emerald-500/75 text-emerald-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply font-bold">
                <div className="flex items-center gap-1 text-[9px] font-extrabold">
                  INVOICE
                </div>
                <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
                  LUNAS / PAID
                </div>
                <div className="text-[7.5px] font-semibold text-emerald-500/60 uppercase tracking-widest">
                  NANANGMRK
                </div>
              </div>
            ) : (
              <div className="border-[3.5px] border-rose-500/75 text-rose-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply font-bold">
                <div className="flex items-center gap-1 text-[9px] font-extrabold">
                  INVOICE
                </div>
                <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
                  BELUM LUNAS
                </div>
                <div className="text-[7.5px] font-semibold text-rose-500/60 uppercase tracking-widest">
                  NANANGMRK
                </div>
              </div>
            )}
          </div>

          {/* Invoice Top Details */}
          <div className="flex flex-row items-start justify-between gap-6">
            {/* Sender Profile */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 bg-orange-600 text-white rounded-full flex items-center justify-center font-black text-base shadow-sm">
                  {settings.agencyName?.charAt(0) || 'N'}
                </div>
                <span className="font-extrabold text-base text-stone-900">{settings.agencyName || 'NanangMrk'}</span>
              </div>
              <div className="text-xs text-stone-500 space-y-0.5 leading-relaxed">
                {settings.corporateName && <p className="font-bold text-stone-900 text-xs">{settings.corporateName}</p>}
                {settings.building && <p>{settings.building}</p>}
                <p className="whitespace-pre-line">{settings.address || 'Pondok Indah Office Tower 3\nJakarta Selatan, 12310'}</p>
                <p>Email: {settings.email || 'finance@bmsc.id'}</p>
                <p>Telp: {settings.phone || '+62 811 1234 567'}</p>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="text-right text-xs text-stone-500 space-y-1">
              <h2 className="text-2xl font-black text-orange-600 tracking-wider">INVOICE</h2>
              <p className="font-semibold text-stone-900">No. Invoice: <span className="font-mono text-stone-500">INV-{project.id.toUpperCase()}-{printInvoicePayment.id.toUpperCase()}</span></p>
              <p className="font-semibold text-stone-900">Tanggal: <span className="text-stone-500">{printInvoicePayment.createdAt}</span></p>
              <p className="font-semibold text-stone-900">Tenggat: <span className="text-amber-500 font-bold">{printInvoicePayment.createdAt}</span></p>
            </div>
          </div>

          <hr className="border-stone-200 my-8" />

          {/* Bill To & Project Info */}
          <div className="grid grid-cols-2 gap-6">
            {/* Bill To */}
            <div>
              <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-2.5">DITANGGUHKAN KEPADA (BILL TO)</h3>
              <div className="text-xs space-y-0.5 leading-relaxed">
                <p className="font-bold text-stone-900 uppercase">{printInvoicePayment.billTo?.companyName || printInvoicePayment.billTo?.brand?.name || printInvoicePayment.billTo?.name || project.brand?.name || 'Unknown'}</p>
                <p><span className="text-stone-400">Attn:</span> {printInvoicePayment.billTo?.picName || printInvoicePayment.billTo?.name || project.brand?.name || '-'}</p>
                <p className="text-stone-500 whitespace-pre-wrap">{printInvoicePayment.billTo?.address || '-'}</p>
                <p className="text-stone-500">{printInvoicePayment.billTo?.phone || '-'}</p>
                <p className="text-stone-500">{printInvoicePayment.billTo?.email || '-'}</p>
              </div>
            </div>

            {/* Project Info */}
            <div>
              <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-2.5">INFORMASI PROYEK & KAMPANYE</h3>
              <div className="text-xs space-y-0.5 leading-relaxed">
                <p className="font-bold text-stone-900 uppercase">{project.name}</p>
                <p className="text-stone-500">Tagihan termin pembayaran untuk pengerjaan kampanye konten.</p>
                <p><span className="text-stone-400">Termin:</span> {printInvoicePayment.title || (printInvoicePayment.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%')}</p>
              </div>
            </div>
          </div>

          <hr className="border-stone-200 my-8" />

          {/* Items Table */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">DESKRIPSI ITEM PEKERJAAN</h3>
            <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-400 text-left font-semibold">
                    <th className="px-5 py-3.5 font-bold">Deskripsi Pekerjaan / Layanan</th>
                    <th className="px-3 py-3.5 text-center font-bold w-20">Volume</th>
                    <th className="px-3 py-3.5 text-center font-bold w-20">Satuan</th>
                    <th className="px-4 py-3.5 text-right font-bold w-32">Harga Satuan</th>
                    <th className="px-5 py-3.5 text-right font-bold w-36">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-900">
                  <tr className="hover:bg-stone-50/30">
                    <td className="px-5 py-4 font-bold text-stone-900">
                      <p>{project.name}</p>
                      <p className="text-stone-400 text-[10px] font-normal mt-0.5">{printInvoicePayment.title || (printInvoicePayment.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%')}</p>
                    </td>
                    <td className="px-3 py-4 text-center font-bold">1</td>
                    <td className="px-3 py-4 text-center text-stone-400">Milestone</td>
                    <td className="px-4 py-4 text-right font-semibold">{formatCurrency(printInvoicePayment.amount)}</td>
                    <td className="px-5 py-4 text-right font-bold text-stone-900">{formatCurrency(printInvoicePayment.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="flex flex-col items-end space-y-2 mt-6 font-semibold">
            <div className="flex justify-between w-full max-w-[280px] text-xs text-stone-400 border-b border-stone-100 pb-2">
              <span>Subtotal Pekerjaan:</span>
              <span className="font-bold text-stone-900">{formatCurrency(printInvoicePayment.amount)}</span>
            </div>
            <div className="flex justify-between w-full max-w-[280px] text-xs items-baseline">
              <span className="font-bold text-stone-900 text-xs uppercase tracking-wide">Total Tagihan (IDR):</span>
              <span className="font-black text-orange-600 text-sm sm:text-base">{formatCurrency(printInvoicePayment.amount)}</span>
            </div>
          </div>

          {/* Payment Details Box */}
          <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50/20 grid grid-cols-2 gap-5 mt-8 text-xs leading-relaxed">
            {/* Payment Instructions */}
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-stone-400 uppercase tracking-widest text-[9px]">TATA CARA PEMBAYARAN</h4>
              <p className="text-stone-500 font-medium whitespace-pre-line">
                {settings.invBankInstruction || 'Mohon sertakan berita transfer nomor invoice saat melakukan pembayaran. Kirimkan konfirmasi bukti transfer melalui platform atau kirim ke WhatsApp 085156014905'}
              </p>
            </div>

            {/* Target Bank Account */}
            <div className="border-l border-stone-200 pl-5 space-y-0.5">
              <h4 className="font-extrabold text-stone-400 uppercase tracking-widest text-[9px] mb-1.5">REKENING TUJUAN</h4>
              {activeBank ? (
                <>
                  <p className="font-extrabold text-stone-900">{activeBank.bankName}</p>
                  <p className="font-black text-orange-600 text-base tracking-wider">{activeBank.accountNumber}</p>
                  <p className="text-stone-500 font-semibold">a.n. {activeBank.accountName}</p>
                </>
              ) : (
                <>
                  <p className="font-extrabold text-stone-900">Belum ada Rekening Aktif</p>
                  <p className="text-stone-500 font-semibold text-[10px] mt-1">Silakan tambahkan di menu Pengaturan.</p>
                </>
              )}
            </div>
          </div>

          {/* Terms & Signature Section */}
          <div className="grid grid-cols-2 gap-8 mt-10 text-xs">
            {/* Terms and Conditions */}
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-stone-400 uppercase tracking-widest text-[9px]">SYARAT & KETENTUAN</h4>
              <div className="text-[10.5px] text-stone-500 leading-relaxed font-medium whitespace-pre-line">
                {settings.invTermsText || '1. Invoice ini adalah sah diterbitkan oleh perusahaan.\n2. Tagihan ini berlaku sebagai kwitansi lunas yang sah apabila status tercantum LUNAS / PAID.'}
              </div>
            </div>

            {/* Signature */}
            <div className="flex flex-col items-end">
              <div className="flex flex-col items-center text-center space-y-12 w-48">
                <h4 className="font-extrabold text-stone-400 uppercase tracking-widest text-[9px]">HORMAT KAMI,</h4>
                <div className="space-y-1 w-full">
                  <p className="border-b border-dotted border-stone-400 pb-1.5 font-bold text-stone-900 w-full text-center">{settings.invSignatoryName || 'NanangMrk'}</p>
                  <p className="text-stone-500 text-[9px] font-semibold uppercase tracking-widest text-center w-full font-sans">{settings.invSignatoryRole || 'Finance Manager'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Tahap Pembayaran */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                <Plus className="h-4.5 w-4.5 text-orange-500" /> Tambah Tahap Pembayaran
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-7 w-7 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddPaymentSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Judul/Nama Tahap */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Tahap Pembayaran</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Down Payment (DP) 50%, Termin 3"
                    value={newPayType}
                    onChange={(e) => setNewPayType(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Nominal */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nominal (Rupiah)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 4500000"
                    value={newPayAmount}
                    onChange={(e) => setNewPayAmount(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                  {newPayAmount && (
                    <p className="text-[11px] text-orange-600 font-bold font-mono mt-1">
                      Format: {formatCurrency(parseInt(newPayAmount) || 0)}
                    </p>
                  )}
                </div>

                {/* Deskripsi Tambahan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Deskripsi (Opsional)</label>
                  <textarea
                    rows={3}
                    placeholder="Catatan tambahan untuk tahap ini..."
                    value={newPayDescription}
                    onChange={(e) => setNewPayDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                  />
                </div>

                {/* Status Awal */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Status Awal</label>
                  <select
                    value={newPayStatus}
                    onChange={(e) => setNewPayStatus(e.target.value as PaymentStatus)}
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                  >
                    <option value="MENUNGGU">Menunggu Pembayaran</option>
                    <option value="PROSES_VERIFIKASI">Proses Verifikasi</option>
                    <option value="LUNAS">Lunas</option>
                  </select>
                </div>
              </div>

              {/* Footer Action */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 shrink-0">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs">Batal</Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white text-xs">Simpan Tahapan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Tahap Pembayaran */}
      {showEditModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                <Pencil className="h-4.5 w-4.5 text-orange-500" /> Ubah Tahap Pembayaran
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="h-7 w-7 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditPaymentSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Judul/Nama Tahap */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Tahap Pembayaran</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Down Payment (DP) 50%, Termin 3"
                    value={editPayType}
                    onChange={(e) => setEditPayType(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Nominal */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nominal (Rupiah)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 4500000"
                    value={editPayAmount}
                    onChange={(e) => setEditPayAmount(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                  {editPayAmount && (
                    <p className="text-[11px] text-orange-600 font-bold font-mono mt-1">
                      Format: {formatCurrency(parseInt(editPayAmount) || 0)}
                    </p>
                  )}
                </div>

                {/* Deskripsi Tambahan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Deskripsi (Opsional)</label>
                  <textarea
                    rows={3}
                    placeholder="Catatan tambahan untuk tahap ini..."
                    value={editPayDescription}
                    onChange={(e) => setEditPayDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                  />
                </div>
                
                {/* Bill To */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ditangguhkan Kepada (Bill To)</label>
                  <select
                    value={editPayBillTo}
                    onChange={(e) => setEditPayBillTo(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">-- Pilih User / PIC --</option>
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.brand?.name ? `(${u.brand.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer Action */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 shrink-0">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="text-xs">Batal</Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white text-xs">Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}