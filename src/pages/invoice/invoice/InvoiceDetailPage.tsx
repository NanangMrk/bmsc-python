import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, CheckCircle2, Download, Share2, Trash2 } from 'lucide-react'
// data fetched via API
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDate, formatDateShort, cn } from '@/lib/utils'
import { api, BACKEND_URL, API_URL } from '@/lib/api'
import { usePermissions } from '@/hooks/usePermissions'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { hasPermission } = usePermissions()
  const hasInvEditStatus = hasPermission('inv_edit_status')
  const hasInvUpload = hasPermission('inv_upload')
  const hasInvCopyLink = hasPermission('inv_copy_link')
  const hasInvPrint = hasPermission('inv_print')
  
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api<any>(`/finance/invoices/${id}`),
    enabled: !!id
  })

  const [invoice, setInvoice] = useState<any>(null)

  useEffect(() => {
    if (invoiceData) setInvoice(invoiceData)
  }, [invoiceData])

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api<any>('/settings')
  })

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => api<any[]>('/bank-accounts')
  })

  const settings = settingsData || {}
  const activeBank = bankAccounts.find((b: any) => b.isActive) || bankAccounts[0]

  const [isDirty, setIsDirty] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const statusMutation = useMutation({
    mutationFn: (data: { status: string, paymentProof?: string }) => 
      api<any>(`/finance/invoices/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
    },
    onError: (err: any) => {
      alert('Gagal mengupdate status: ' + err.message)
    }
  })

  const project: any = null // project data from invoice if needed

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading invoice...</div>
  }

  if (!invoice) {
    return <div className="p-8 text-center text-red-500">Invoice tidak ditemukan atau gagal dimuat. Coba refresh halaman.</div>
  }

  const taxPercent = settings.invTaxEnabled ? (settings.invTaxPercent || 11) : 0

  const subtotal = Number(invoice.total || 0)
  const tax = subtotal * (taxPercent / 100)
  const grandTotal = subtotal + tax

  // Edit Header Modal Handler

  // Item Editing Functions
  const updateItem = (itemId: string, field: 'name' | 'qty' | 'price' | 'unit', value: string | number) => {
    setIsDirty(true)
    const items = invoice.items || []
    const updatedItems = items.map((item: any) => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value }
        if (field === 'qty' || field === 'price') {
          updated.subtotal = (updated.qty || 0) * (updated.price || 0)
        }
        return updated
      }
      return item
    })
    setInvoice({
      ...invoice,
      items: updatedItems,
      total: updatedItems.reduce((sum: number, item: any) => sum + item.subtotal, 0)
    })
  }

  const addBlankItem = () => {
    setIsDirty(true)
    const items = invoice.items || []
    const newItem = {
      id: `ii-${Date.now()}`,
      name: '',
      qty: 1,
      unit: 'video',
      price: 0,
      subtotal: 0
    }
    const updatedItems = [...items, newItem]
    setInvoice({
      ...invoice,
      items: updatedItems,
      total: updatedItems.reduce((sum: number, item: any) => sum + item.subtotal, 0)
    })
  }

  const removeItem = (itemId: string) => {
    setIsDirty(true)
    const items = invoice.items || []
    const updatedItems = items.filter((item: any) => item.id !== itemId)
    setInvoice({
      ...invoice,
      items: updatedItems,
      total: updatedItems.reduce((sum: number, item: any) => sum + item.subtotal, 0)
    })
  }

  // Handlers for status updates
  const handleSimpanItem = () => {
    setIsDirty(false)
  }



  const handleVerify = () => {
    statusMutation.mutate({ status: 'LUNAS' })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      // NOTE: api helper might try to stringify if not careful, but it supports FormData natively if we don't pass headers
      // Let's use standard fetch to be safe with FormData headers (boundary)
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/upload/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      if (!res.ok) throw new Error('Upload failed')
      
      const data = await res.json()
      statusMutation.mutate({ status: 'MENUNGGU_VERIFIKASI', paymentProof: data.url })
    } catch (err: any) {
      alert("Gagal upload: " + err.message)
    }
  }

  const handleUploadProof = () => {
    fileInputRef.current?.click()
  }

  const handleStatusChange = (newStatus: typeof invoice.status) => {
    statusMutation.mutate({ status: newStatus })
  }

  const handleDeleteProof = () => {
    statusMutation.mutate({ status: invoice.status, paymentProof: '' })
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border/80 shadow-sm print:hidden">
        <button 
          onClick={() => navigate('/invoice/invoice')} 
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground print:text-black/70 hover:text-foreground print:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Aplikasi
        </button>
        <div className="flex items-center gap-2.5">
          {hasInvCopyLink && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs font-semibold px-4 py-2"
              icon={isCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/public/invoice/${invoice.id}`)
                setIsCopied(true)
                setTimeout(() => setIsCopied(false), 2000)
              }}
            >
              Salin Link Invoice
            </Button>
          )}
          {isDirty && (
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm text-xs font-semibold px-4 py-2 animate-in fade-in zoom-in duration-300"
              onClick={handleSimpanItem}
            >
              Simpan Perubahan
            </Button>
          )}
          {hasInvPrint && (
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm text-xs font-semibold px-5 py-2"
              icon={<Download className="h-3.5 w-3.5" />}
              onClick={() => window.print()}
            >
              Cetak / Simpan PDF
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start print:flex print:flex-col print:gap-0">
        {/* Invoice Preview Sheet */}
        <div className="lg:col-span-2 print:w-full">
          <div className="bg-white border border-gray-200 shadow-md rounded-[24px] p-6 sm:p-12 relative overflow-hidden print:border-0 print:shadow-none print:p-10 min-h-[29.7cm] flex flex-col print:block print:min-h-0">
            {/* Diagonal Stamp */}
            <div className="absolute top-6 right-6 sm:top-12 sm:right-12 z-10 print:opacity-100">
              {invoice.status === 'LUNAS' ? (
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
                    BELUM LUNAS / UNPAID
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
                  <span className="font-extrabold text-base text-foreground print:text-black">{settings.agencyName || 'NanangMrk'}</span>
                </div>
                <div className="text-xs text-muted-foreground print:text-black/70 space-y-0.5 leading-relaxed">
                  {settings.corporateName && <p className="font-bold text-foreground print:text-black">{settings.corporateName}</p>}
                  {settings.building && <p>{settings.building}</p>}
                  <p className="whitespace-pre-line">{settings.address || 'Pondok Indah Office Tower 3\nJakarta Selatan, 12310'}</p>
                  <p>{settings.email || 'finance@bmsc.id'} | {settings.phone || '+62 811 1234 567'}</p>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="sm:text-right text-xs text-muted-foreground print:text-black/70 space-y-1 sm:mt-12">
                <h2 className="text-2xl font-black text-orange-600 tracking-wider">INVOICE</h2>
                <p className="font-semibold text-foreground print:text-black">No. Invoice: <span className="font-mono text-muted-foreground print:text-black/70">{invoice.number}</span></p>
                <p className="font-semibold text-foreground print:text-black">Tanggal: <span className="text-muted-foreground print:text-black/70">{formatDateShort(invoice.createdAt)}</span></p>
                <p className="font-semibold text-foreground print:text-black">Tenggat: <span className="text-amber-500 font-bold">{invoice.dueDate ? formatDateShort(invoice.dueDate) : '-'}</span></p>
              </div>
            </div>

            <hr className="border-gray-200/80 my-8" />

            {/* Bill To & Project Info */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Bill To */}
              <div>
                <h3 className="text-[10px] font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest mb-2.5">DITANGGUHKAN KEPADA (BILL TO)</h3>
                <div className="text-xs space-y-0.5 leading-relaxed">
                  <p className="font-bold text-foreground print:text-black uppercase">{invoice.userAccess?.[0]?.user?.companyName || invoice.brand?.name || invoice.userAccess?.[0]?.user?.name || '-'}</p>
                  <p><span className="text-muted-foreground print:text-black/70">Attn:</span> {invoice.userAccess?.[0]?.user?.picName || invoice.userAccess?.[0]?.user?.name || invoice.brand?.name || '-'}</p>
                  <p className="text-muted-foreground print:text-black/70">{invoice.brand?.email || invoice.userAccess?.[0]?.user?.email || '-'}</p>
                  <p className="text-muted-foreground print:text-black/70">{invoice.userAccess?.[0]?.user?.phone || '—'}</p>
                  <p className="text-muted-foreground print:text-black/70 whitespace-pre-wrap">{invoice.userAccess?.[0]?.user?.address || ''}</p>
                </div>
              </div>

              {/* Project Info */}
              <div>
                <h3 className="text-[10px] font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest mb-2.5">INFORMASI PROYEK & KAMPANYE</h3>
                <div className="text-xs space-y-0.5 leading-relaxed">
                  <p className="font-bold text-foreground print:text-black uppercase">
                    {invoice.quotation?.title || project?.name || `${invoice.brand?.name || invoice.userAccess?.[0]?.user?.name || 'KLIEN'} MARKETING CAMPAIGN`}
                  </p>
                  <p className="text-muted-foreground print:text-black/70">{invoice.quotation?.description || 'Tagihan komersial untuk kampanye pemasaran influencer.'}</p>
                  <p><span className="text-muted-foreground print:text-black/70">Selesai Sebelum:</span> {invoice.dueDate ? formatDateShort(invoice.dueDate) : '-'}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200/80 my-8" />

            {/* Items Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center print:hidden">
                <h3 className="text-[10px] font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest">DESKRIPSI ITEM PEKERJAAN</h3>
              </div>
              <h3 className="text-[10px] font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest hidden print:block">DESKRIPSI ITEM PEKERJAAN</h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-xs">
                                    <thead>
                    <tr className="bg-gray-50/50 print:bg-transparent border-b border-gray-200 text-muted-foreground print:text-black/70 text-left font-semibold">
                      <th className="px-5 py-3.5 font-bold">Deskripsi Pekerjaan / Layanan</th>
                      <th className="px-3 py-3.5 text-center font-bold w-20">Volume</th>
                      <th className="px-3 py-3.5 text-center font-bold w-20">Satuan</th>
                      <th className="px-4 py-3.5 text-right font-bold w-32">Harga Satuan</th>
                      <th className="px-5 py-3.5 text-right font-bold w-36">Total</th>
                    </tr>
                  </thead>
                                    <tbody className="divide-y divide-gray-100 font-medium text-foreground print:text-black">
                    {(invoice.items && invoice.items.length > 0) ? (
                      invoice.items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50/30 print:bg-transparent">
                          <td className="px-5 py-3 font-bold text-foreground print:text-black/80 print:text-black">
                            {item.name}
                          </td>
                          <td className="px-3 py-3 text-center font-bold">
                            {item.qty}
                          </td>
                          <td className="px-3 py-3 text-center text-muted-foreground print:text-black/70 capitalize">
                            {item.unit}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold font-mono">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-foreground print:text-black">
                            {formatCurrency((item.qty || 0) * (item.price || 0))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground print:text-black/70 italic">
                          Belum ada item tagihan. Klik "Tambah Item Manual".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="flex flex-col items-end space-y-2 mt-6 font-semibold">
              <div className="flex justify-between w-full max-w-[280px] text-xs text-muted-foreground print:text-black/70 border-b border-gray-100 pb-2">
                <span>Subtotal Pekerjaan:</span>
                <span className="font-bold text-foreground print:text-black">{formatCurrency(subtotal)}</span>
              </div>
              {settings.invTaxEnabled !== false && (
                <div className="flex justify-between w-full max-w-[280px] text-xs text-muted-foreground print:text-black/70 border-b border-gray-100 pb-2">
                  <span>{settings.invTaxName || 'PPN'} ({taxPercent}%):</span>
                  <span className="font-bold text-foreground print:text-black">{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between w-full max-w-[280px] text-xs items-baseline">
                <span className="font-bold text-foreground print:text-black text-xs uppercase tracking-wide">Total Tagihan (IDR):</span>
                <span className="font-black text-orange-600 text-sm sm:text-base">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Payment Details Box */}
            {settings.invShowBank && (
              <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/20 print:bg-transparent print:border-0 grid md:grid-cols-2 gap-5 mt-8 text-xs leading-relaxed">
                {/* Payment Instructions */}
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest text-[9px]">TATA CARA PEMBAYARAN</h4>
                  <p className="text-muted-foreground print:text-black/70 font-medium whitespace-pre-line">
                    {settings.invBankInstruction || 'Mohon sertakan berita transfer nomor invoice saat melakukan pembayaran. Kirimkan konfirmasi bukti transfer melalui platform atau kirim ke WhatsApp 085156014905'}
                  </p>
                </div>

                {/* Target Bank Account */}
                <div className="md:border-l border-gray-200 md:pl-5 space-y-0.5">
                  <h4 className="font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest text-[9px] mb-1.5">REKENING TUJUAN</h4>
                  {activeBank ? (
                    <>
                      <p className="font-extrabold text-foreground print:text-black">{activeBank.bankName}</p>
                      <p className="font-black text-orange-600 text-base tracking-wider">{activeBank.accountNumber}</p>
                      <p className="text-muted-foreground print:text-black/70 font-semibold">a.n. {activeBank.accountName}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-extrabold text-foreground print:text-black">Belum ada Rekening Aktif</p>
                      <p className="text-muted-foreground print:text-black/70 font-semibold text-[10px] mt-1">Silakan tambahkan di menu Pengaturan.</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Terms & Signature Section */}
            <div className="grid sm:grid-cols-2 gap-8 mt-auto print:mt-10 pt-10 text-xs">
              {/* Terms and Conditions */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest text-[9px]">SYARAT & KETENTUAN</h4>
                <div className="text-[10.5px] text-muted-foreground/80 leading-relaxed font-medium whitespace-pre-line">
                  {settings.invTermsText || '1. Invoice ini adalah sah diterbitkan oleh perusahaan.\n2. Tagihan ini berlaku sebagai kwitansi lunas yang sah apabila status tercantum LUNAS / PAID.'}
                </div>
              </div>

              {/* Signature */}
              <div className="flex flex-col items-end">
                <div className="flex flex-col items-center text-center space-y-12 w-48 relative">
                  <h4 className="font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest text-[9px]">HORMAT KAMI,</h4>
                  


                  <div className="space-y-1 w-full relative z-10">
                    <p className="border-b border-dotted border-gray-400 pb-1.5 font-bold text-foreground print:text-black w-full text-center">
                      {settings.invSignatoryName || 'NanangMrk'}
                    </p>
                    <p className="text-muted-foreground print:text-black/70 text-[9px] font-semibold uppercase tracking-widest text-center w-full">
                      {settings.invSignatoryRole || 'NanangMrk Channel'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions & Proof of Payment */}
        <div className="space-y-4 print:hidden">
          {/* Upload/Verify payment proof */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Bukti Pembayaran</h3>
            {invoice.paymentProof ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted/30 print:bg-transparent rounded-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <a href={`${BACKEND_URL}${invoice.paymentProof}`} target="_blank" rel="noopener noreferrer" className="block h-10 w-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
                      {invoice.paymentProof.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <img src={`${BACKEND_URL}${invoice.paymentProof}`} alt="Bukti Transfer" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-orange-600 font-bold text-xs">FILE</div>
                      )}
                    </a>
                    <div className="min-w-0 flex flex-col items-start">
                      <p className="text-sm font-medium truncate max-w-[120px]">Bukti Pembayaran</p>
                      <a href={`${BACKEND_URL}${invoice.paymentProof}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-orange-600 hover:underline">
                        Lihat / Download
                      </a>
                    </div>
                  </div>
                  {hasInvUpload && (
                  <button 
                    onClick={handleDeleteProof} 
                    className="text-muted-foreground print:text-black/70 hover:text-red-500 transition-colors text-xs font-semibold flex-shrink-0"
                  >
                    Hapus
                  </button>
                  )}
                </div>
                {invoice.status === 'MENUNGGU_VERIFIKASI' && hasInvEditStatus && (
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm" 
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    onClick={handleVerify}
                  >
                    Verifikasi Lunas
                  </Button>
                )}
              </div>
            ) : hasInvUpload ? (
              <div className="space-y-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg, image/png, application/pdf"
                  onChange={handleFileChange}
                />
                <div 
                  onClick={handleUploadProof}
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-orange-300 transition-colors cursor-pointer"
                >
                  <Upload className="h-6 w-6 text-muted-foreground print:text-black/70 mx-auto mb-2" />
                  <p className="text-sm font-medium mb-1">Upload Bukti Transfer</p>
                  <p className="text-xs text-muted-foreground print:text-black/70">JPG, PNG, PDF · Max 5MB</p>
                  <Button size="sm" className="mt-3" onClick={(e) => { e.stopPropagation(); handleUploadProof(); }}>Pilih File</Button>
                </div>
              </div>
            ) : null}

            {/* Quick Status Control */}
            {hasInvEditStatus && (
            <div className="mt-4 pt-4 border-t border-border/80 space-y-2">
              <label className="block text-[10px] font-bold text-muted-foreground print:text-black/70 uppercase tracking-widest">Ubah Status Manual</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: 'BELUM_DIBAYAR', label: 'Belum Bayar' },
                  { value: 'TERMIN', label: 'Termin' },
                  { value: 'MENUNGGU_VERIFIKASI', label: 'Verifikasi' },
                  { value: 'LUNAS', label: 'Lunas' },
                  { value: 'OVERDUE', label: 'Overdue' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value as any)}
                    className={cn(
                      "py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center uppercase tracking-wide",
                      invoice.status === opt.value
                        ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                        : "bg-white text-muted-foreground print:text-black/70 border-border hover:bg-muted/40"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            )}
          </Card>

          {/* Status History */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Riwayat Status</h3>
            <div className="space-y-3">
              {[
                { label: 'Invoice dibuat', time: formatDate(invoice.createdAt), color: 'bg-gray-400' },
                ...(invoice.status !== 'BELUM_DIBAYAR' ? [{ label: 'Bukti pembayaran diunggah', time: 'Brand', color: 'bg-orange-400' }] : []),
                ...(invoice.status === 'LUNAS' ? [{ label: 'Pembayaran diverifikasi', time: 'Admin', color: 'bg-emerald-500' }] : []),
              ].map((log, i, arr) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className={`h-2 w-2 rounded-full mt-1.5 ${log.color}`} />
                    {i < arr.length - 1 && <div className="w-px h-5 bg-border mt-1" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{log.label}</p>
                    <p className="text-[10px] text-muted-foreground print:text-black/70">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

    </div>
  )
}
