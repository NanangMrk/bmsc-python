import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Send, FileText, Download, Share2, CheckCircle2 } from 'lucide-react'
import { mockQuotations, mockProjects, mockInvoices } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDateShort, cn } from '@/lib/utils'

export default function QuotationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const initialQuo = mockQuotations.find((q) => q.id === id) ?? mockQuotations[0]
  const [quotation, setQuotation] = useState(initialQuo)
  const [isDirty, setIsDirty] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Sync state if id in URL changes
  useEffect(() => {
    const found = mockQuotations.find((q) => q.id === id) ?? mockQuotations[0]
    setQuotation(found)
  }, [id])

  // Fetch associated project details (if match brand or similar, or find matching project)
  const project = mockProjects.find((p) => p.brandId === quotation.brandId)

  // Helpers to calculate subtotal & totals
  const handleSimpanItem = () => {
    setIsDirty(false)
  }

  const calculateSubtotal = () => {
    return quotation.items.reduce((sum, item) => sum + (item.qty * item.price), 0)
  }

  // Update actions
  const handleVerify = () => {
    setQuotation({
      ...quotation,
      status: 'DIPROSES'
    })
    
    // Generate Invoice Number
    const now = new Date()
    const d = String(now.getDate()).padStart(2, '0')
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const y = now.getFullYear()
    const todayStr = now.toISOString().split('T')[0]
    
    const countToday = mockInvoices.filter(i => i.createdAt === todayStr).length + 1
    const seq = String(countToday).padStart(4, '0')
    const invoiceNumber = `INV-${d}-${m}-${y}-${seq}`

    const newInvoice = {
      id: `i${Date.now()}`,
      number: invoiceNumber,
      quotationId: quotation.id,
      projectId: '',
      brandId: quotation.brandId,
      brand: quotation.brand,
      items: [...quotation.items],
      total: quotation.total,
      status: 'BELUM_DIBAYAR' as any,
      createdAt: todayStr,
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 7 days
    }

    mockInvoices.unshift(newInvoice)
    alert(`Quotation disetujui! Invoice ${invoiceNumber} otomatis digenerate.`)
    navigate(`/invoice/invoice/${newInvoice.id}`)
  }

  const handleSend = () => {
    setQuotation({
      ...quotation,
      status: 'TERKIRIM',
      sentAt: new Date().toISOString().split('T')[0]
    })
  }

  const handleStatusChange = (newStatus: typeof quotation.status) => {
    setQuotation({
      ...quotation,
      status: newStatus,
      sentAt: newStatus === 'TERKIRIM' || newStatus === 'DIPROSES' ? new Date().toISOString().split('T')[0] : undefined
    })
    setIsDirty(true)
  }

  // Edit item fields (only allowed when in DRAFT state)

  const updateItem = (itemId: string, field: 'name' | 'qty' | 'price' | 'unit', value: string | number) => {
    setIsDirty(true)
        const updatedItems = quotation.items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value }
        if (field === 'qty' || field === 'price') {
          updated.subtotal = (updated.qty || 0) * (updated.price || 0)
        }
        return updated
      }
      return item
    })
    setQuotation({
      ...quotation,
      items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
    })
  }

  // Add Item dynamically
  const addBlankItem = () => {
    setIsDirty(true)
        const newItem = {
      id: `qi-${Date.now()}`,
      name: '',
      qty: 1,
      unit: 'video',
      price: 0,
      subtotal: 0
    }
    const updatedItems = [...quotation.items, newItem]
    setQuotation({
      ...quotation,
      items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
    })
  }



  // Delete item
  const removeItem = (itemId: string) => {
    setIsDirty(true)
        const updatedItems = quotation.items.filter(item => item.id !== itemId)
    setQuotation({
      ...quotation,
      items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
    })
  }

  const subtotal = calculateSubtotal()
  const tax = subtotal * 0.11
  const grandTotal = subtotal * 1.11

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border/80 shadow-sm print:hidden">
        <button 
          onClick={() => navigate('/invoice/quotation')} 
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground print:text-black/70 hover:text-foreground print:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Aplikasi
        </button>
        <div className="flex items-center gap-2.5">
          {quotation.status !== 'DRAFT' && (
            <Button
              variant="outline"
              size="sm"
              icon={isCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
              onClick={() => {
                const url = `${window.location.origin}/public/quotation/${quotation.id}`
                navigator.clipboard.writeText(url)
                setIsCopied(true)
                setTimeout(() => setIsCopied(false), 2000)
              }}
            >
              Salin Link Quotation
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
          {quotation.status === 'DRAFT' && (
            <Button 
              size="sm" 
              icon={<Send className="h-3.5 w-3.5" />}
              onClick={handleSend}
              className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm text-xs font-semibold px-4 py-2"
            >
              Kirim ke Brand
            </Button>
          )}
          {quotation.status === 'TERKIRIM' && (
            <Button 
              size="sm" 
              icon={<FileText className="h-3.5 w-3.5" />}
              onClick={handleVerify}
              className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm text-xs font-semibold px-4 py-2"
            >
              Setujui & Buat Invoice
            </Button>
          )}
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm text-xs font-semibold px-5 py-2"
            icon={<Download className="h-3.5 w-3.5" />}
            onClick={() => window.print()}
          >
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start print:flex print:flex-col print:gap-0">
        {/* Quotation Preview Sheet (Looks identical to Invoice Sheet) */}
        <div className="lg:col-span-2 print:w-full">
          <div className="bg-white border border-gray-200 shadow-md rounded-[24px] p-6 sm:p-12 relative overflow-hidden print:border-0 print:shadow-none print:p-10">
            {/* Diagonal Stamp */}
            <div className="absolute top-6 right-6 sm:top-12 sm:right-12 z-10 print:opacity-100">
              {quotation.status === 'DIPROSES' ? (
                <div className="border-[3.5px] border-emerald-500/75 text-emerald-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center font-sans tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply">
                  <div className="flex items-center gap-1 text-[9px] font-extrabold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500/85"><polyline points="20 6 9 17 4 12"/></svg>
                    QUOTATION
                  </div>
                  <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
                    APPROVED / PROSES
                  </div>
                  <div className="text-[7.5px] font-semibold text-emerald-500/60 uppercase tracking-widest">
                    NANANGMRK
                  </div>
                </div>
              ) : quotation.status === 'DITOLAK' ? (
                <div className="border-[3.5px] border-rose-500/75 text-rose-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center font-sans tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply">
                  <div className="flex items-center gap-1 text-[9px] font-extrabold">
                    <span className="inline-flex items-center justify-center border border-rose-500/80 text-rose-500/80 rounded-full h-3.5 w-3.5 text-[8.5px] font-extrabold">!</span>
                    QUOTATION
                  </div>
                  <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
                    REJECTED / DITOLAK
                  </div>
                  <div className="text-[7.5px] font-semibold text-rose-500/60 uppercase tracking-widest">
                    NANANGMRK
                  </div>
                </div>
              ) : quotation.status === 'TERKIRIM' ? (
                <div className="border-[3.5px] border-orange-500/75 text-orange-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center font-sans tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply">
                  <div className="flex items-center gap-1 text-[9px] font-extrabold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500/85"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    QUOTATION
                  </div>
                  <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
                    SENT / TERKIRIM
                  </div>
                  <div className="text-[7.5px] font-semibold text-orange-500/60 uppercase tracking-widest">
                    NANANGMRK
                  </div>
                </div>
              ) : (
                <div className="border-[3.5px] border-gray-400/75 text-gray-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center font-sans tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply">
                  <div className="flex items-center gap-1 text-[9px] font-extrabold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500/85"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    QUOTATION
                  </div>
                  <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
                    DRAFT / USULAN
                  </div>
                  <div className="text-[7.5px] font-semibold text-gray-400/60 uppercase tracking-widest">
                    NANANGMRK
                  </div>
                </div>
              )}
            </div>

            {/* Quotation Top Details */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              {/* Sender Profile */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 bg-orange-600 text-white rounded-full flex items-center justify-center font-black text-base shadow-sm">
                    N
                  </div>
                  <span className="font-extrabold text-base text-foreground print:text-black">NanangMrk</span>
                </div>
                <div className="text-xs text-muted-foreground print:text-black/70 space-y-0.5 leading-relaxed">
                  <p className="font-bold text-foreground print:text-black text-xs">NanangMrk Channel</p>
                  <p>Jl. Pangeran Syarief</p>
                  <p>RT 03 RW 01 Saripan Jepara 59414</p>
                  <p>Email: nanangmrkchannel@gmail.com</p>
                  <p>Telp: 085156014905</p>
                </div>
              </div>

              {/* Quotation Meta */}
              <div className="sm:text-right text-xs text-muted-foreground print:text-black/70 space-y-1 sm:mt-12">
                <h2 className="text-2xl font-black text-orange-600 tracking-wider">QUOTATION</h2>
                <p className="font-semibold text-foreground print:text-black">No. Quotation: <span className="font-mono text-muted-foreground print:text-black/70">{quotation.number}</span></p>
                <p className="font-semibold text-foreground print:text-black">Tanggal: <span className="text-muted-foreground print:text-black/70">{formatDateShort(quotation.createdAt)}</span></p>
                {quotation.sentAt && (
                  <p className="font-semibold text-foreground print:text-black">Dikirim: <span className="text-muted-foreground print:text-black/70">{formatDateShort(quotation.sentAt)}</span></p>
                )}
              </div>
            </div>

            <hr className="border-gray-200/80 my-8" />

            {/* Bill To & Project Info */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Bill To */}
              <div>
                <h3 className="text-[10px] font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest mb-2.5">DITANGGUHKAN KEPADA (BILL TO)</h3>
                <div className="text-xs space-y-0.5 leading-relaxed">
                  <p className="font-bold text-foreground print:text-black uppercase">{quotation.brand.name}</p>
                  <p><span className="text-muted-foreground print:text-black/70">Attn:</span> {quotation.brand.name}</p>
                  <p className="text-muted-foreground print:text-black/70">{quotation.brand.email}</p>
                  <p className="text-muted-foreground print:text-black/70">—</p>
                </div>
              </div>

              {/* Project Info */}
              <div>
                <h3 className="text-[10px] font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest mb-2.5">INFORMASI PROYEK & KAMPANYE</h3>
                <div className="text-xs space-y-0.5 leading-relaxed">
                  <p className="font-bold text-foreground print:text-black uppercase">
                    {project ? project.name : `${quotation.brand.name} MARKETING CAMPAIGN`}
                  </p>
                  <p className="text-muted-foreground print:text-black/70">Rencana anggaran & usulan penawaran untuk kampanye influencer.</p>
                  <p><span className="text-muted-foreground print:text-black/70">Status Dokumen:</span> {quotation.status}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200/80 my-8" />

            {/* Items Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center print:hidden">
                <h3 className="text-[10px] font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest">DESKRIPSI ITEM PENAWARAN</h3>
                {true && (
                  <button 
                    onClick={addBlankItem}
                    className="text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
                  >
                    + Tambah Item Manual
                  </button>
                )}
              </div>
              <h3 className="text-[10px] font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest hidden print:block">DESKRIPSI ITEM PENAWARAN</h3>

              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50/50 print:bg-transparent border-b border-gray-200 text-muted-foreground print:text-black/70 text-left font-semibold">
                      <th className="px-5 py-3.5 font-bold">Deskripsi Pekerjaan / Layanan</th>
                      <th className="px-3 py-3.5 text-center font-bold w-20">Volume</th>
                      <th className="px-3 py-3.5 text-center font-bold w-20">Satuan</th>
                      <th className="px-4 py-3.5 text-right font-bold w-32">Harga Satuan</th>
                      <th className="px-5 py-3.5 text-right font-bold w-36">Total</th>
                      {quotation.status === 'DRAFT' && <th className="px-3 py-3.5 w-10 print:hidden" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-foreground print:text-black">
                    {quotation.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/30 print:bg-transparent">
                        <td className="px-5 py-3 font-bold text-foreground print:text-black/80 print:text-black">
                          <input
                              type="text"
                              value={item.name}
                              placeholder="Masukkan Deskripsi Pekerjaan"
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                              className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-400 print:border-0 print:p-0 print:bg-transparent print:text-black print:w-full print:shadow-none"
                            />
                        </td>
                        <td className="px-3 py-3 text-center font-bold">
                          <input
                              type="number"
                              value={item.qty}
                              min="1"
                              onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                              className="w-full h-8 text-center rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-400 print:border-0 print:p-0 print:bg-transparent print:text-black print:w-full print:shadow-none"
                            />
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground print:text-black/70 capitalize">
                          <input
                              type="text"
                              value={item.unit}
                              placeholder="video"
                              onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                              className="w-full h-8 text-center rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-400 print:border-0 print:p-0 print:bg-transparent print:text-black print:w-full print:shadow-none"
                            />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <input
                              type="number"
                              value={item.price}
                              min="0"
                              onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                              className="w-full h-8 text-right px-2 rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-400 font-mono print:border-0 print:p-0 print:bg-transparent print:text-black print:w-full print:shadow-none"
                            />
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-foreground print:text-black">{formatCurrency(item.subtotal)}</td>
                        {true && (
                          <td className="px-3 py-3 text-center print:hidden">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-muted-foreground print:text-black/70 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {quotation.items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground print:text-black/70 italic">
                          Belum ada item penawaran. Klik "Tambah Item Manual" atau pilih Rate Card di samping.
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
              <div className="flex justify-between w-full max-w-[280px] text-xs text-muted-foreground print:text-black/70 border-b border-gray-100 pb-2">
                <span>PPN (11%):</span>
                <span className="font-bold text-foreground print:text-black">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between w-full max-w-[280px] text-xs items-baseline">
                <span className="font-bold text-foreground print:text-black text-xs uppercase tracking-wide">Total Penawaran (IDR):</span>
                <span className="font-black text-orange-600 text-sm sm:text-base">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Payment Details Box */}
            <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/20 print:bg-transparent print:border-0 grid md:grid-cols-2 gap-5 mt-8 text-xs leading-relaxed">
              {/* Payment Instructions */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest text-[9px]">TATA CARA PEMBAYARAN</h4>
                <p className="text-muted-foreground print:text-black/70 font-medium">
                  Pembayaran termin mengikuti kesepakatan kontrak. Mohon transfer ke rekening resmi di samping dan sertakan nomor quotation saat konfirmasi.
                </p>
              </div>

              {/* Target Bank Account */}
              <div className="md:border-l border-gray-200 md:pl-5 space-y-0.5">
                <h4 className="font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest text-[9px] mb-1.5">REKENING TUJUAN</h4>
                <p className="font-extrabold text-foreground print:text-black">DIGIBANK by DBS</p>
                <p className="font-black text-orange-600 text-base tracking-wider">1702945239</p>
                <p className="text-muted-foreground print:text-black/70 font-semibold">a.n. Muhammad Nanang Rizaldi</p>
              </div>
            </div>

            {/* Terms & Signature Section */}
            <div className="grid sm:grid-cols-2 gap-8 mt-10 text-xs">
              {/* Terms and Conditions */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest text-[9px]">SYARAT & KETENTUAN</h4>
                <ol className="list-decimal pl-4 text-muted-foreground print:text-black/70 space-y-0.5 font-medium leading-relaxed">
                  <li>Penawaran harga ini berlaku selama 30 hari sejak tanggal diterbitkan.</li>
                  <li>Pekerjaan baru akan dimulai setelah disetujui secara tertulis atau dikeluarkannya Invoice uang muka (DP).</li>
                </ol>
              </div>

              {/* Signature */}
              <div className="flex flex-col items-end">
                <div className="flex flex-col items-center text-center space-y-12 w-48">
                  <h4 className="font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest text-[9px]">HORMAT KAMI,</h4>
                  <div className="space-y-1 w-full">
                    <p className="border-b border-dotted border-gray-400 pb-1.5 font-bold text-foreground print:text-black w-full text-center">NanangMrk</p>
                    <p className="text-muted-foreground print:text-black/70 text-[9px] font-semibold uppercase tracking-widest text-center w-full">NanangMrk Channel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions & Rate Card Autofill */}
        <div className="space-y-4 print:hidden">
          {/* Note Area */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Catatan Quotation</h3>
            <textarea
                value={quotation.note || ''}
                onChange={(e) => setQuotation({ ...quotation, note: e.target.value })}
                placeholder="Masukkan catatan khusus (misal: syarat revisi)..."
                className="w-full min-h-[100px] p-2 text-xs rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-orange-400 placeholder:text-muted-foreground print:text-black/70/60 resize-y print:border-0 print:p-0 print:bg-transparent print:text-black print:w-full print:shadow-none"
              />
          </Card>

          {/* Quick Status Control for Admin / Testing */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Kelola Status Dokumen</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { value: 'DRAFT', label: 'Draft' },
                { value: 'TERKIRIM', label: 'Terkirim' },
                { value: 'DIPROSES', label: 'Diproses' },
                { value: 'DITOLAK', label: 'Ditolak' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value as any)}
                  className={cn(
                    "py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all text-center uppercase tracking-wide",
                    quotation.status === opt.value
                      ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                      : "bg-white text-muted-foreground print:text-black/70 border-border hover:bg-muted/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Card>


        </div>
      </div>

    </div>
  )
}
