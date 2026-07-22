import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Send, FileText, Download, Share2, CheckCircle2 } from 'lucide-react'
import { mockQuotations, mockProjects, mockInvoices } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDateShort, cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { usePermissions } from '@/hooks/usePermissions'

export default function QuotationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const hasQuoCopyLink = hasPermission('quo_copy_link')
  const hasQuoEditStatus = hasPermission('quo_edit_status')
  const hasQuoPrint = hasPermission('quo_print')
  
  const queryClient = useQueryClient()
  
  const { data: quotationData, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () => api<any>(`/finance/quotations/${id}`),
    enabled: !!id
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api<any>('/settings')
  })

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => api<any[]>('/bank-accounts')
  })

  // Local state for UI only
  const [isCopied, setIsCopied] = useState(false)
  const quotation = quotationData
  const settings = settingsData || {}
  const activeBank = bankAccounts.find((b: any) => b.isActive) || bankAccounts[0]

  const project = null // We can fetch project if needed

  // Update actions (MUST be before early returns)
  const generateInvoiceMutation = useMutation({
    mutationFn: () => api<any>(`/finance/quotations/${id}/invoice`, { method: 'POST' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotation', id] })
      alert(`Quotation disetujui! Invoice otomatis digenerate.`)
      navigate(`/invoice/invoice/${data.invoice.id}`)
    },
    onError: (err: any) => {
      alert('Gagal membuat invoice: ' + err.message)
    }
  })

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading quotation...</div>
  }

  if (!quotation) {
    return <div className="p-8 text-center text-red-500">Quotation tidak ditemukan atau gagal dimuat. Coba refresh halaman.</div>
  }

  const calculateSubtotal = () => {
    return quotation.items.reduce((sum: number, item: any) => sum + ((item.qty || 0) * (item.price || 0)), 0)
  }

  const handleVerify = () => {
    generateInvoiceMutation.mutate()
  }

  const subtotal = calculateSubtotal()
  const taxPercent = settings.quoTaxEnabled ? (settings.quoTaxPercent || 11) : 0
  const tax = subtotal * (taxPercent / 100)
  const grandTotal = subtotal + tax

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
          {hasQuoCopyLink && (
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

          {quotation.status === 'TERKIRIM' && !quotation.invoice && hasQuoEditStatus && (
            <Button 
              size="sm" 
              icon={<FileText className="h-3.5 w-3.5" />}
              onClick={handleVerify}
              className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm text-xs font-semibold px-4 py-2"
            >
              Setujui & Buat Invoice
            </Button>
          )}
          {quotation.invoice && (
            <Button 
              size="sm" 
              icon={<FileText className="h-3.5 w-3.5" />}
              onClick={() => navigate(`/invoice/invoice/${quotation.invoice.id}`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm text-xs font-semibold px-4 py-2"
            >
              Lihat Invoice
            </Button>
          )}
          {hasQuoPrint && (
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
        {/* Quotation Preview Sheet (Looks identical to Invoice Sheet) */}
        <div className="lg:col-span-2 print:w-full">
          <div className="bg-white border border-gray-200 shadow-md rounded-[24px] p-6 sm:p-12 relative overflow-hidden print:border-0 print:shadow-none print:p-10 min-h-[29.7cm] flex flex-col print:block print:min-h-0">
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
                  <p className="font-bold text-foreground print:text-black uppercase">{quotation.userAccess?.[0]?.user?.companyName || quotation.brand?.name || quotation.userAccess?.[0]?.user?.name || '-'}</p>
                  <p><span className="text-muted-foreground print:text-black/70">Attn:</span> {quotation.userAccess?.[0]?.user?.picName || quotation.userAccess?.[0]?.user?.name || quotation.brand?.name || '-'}</p>
                  <p className="text-muted-foreground print:text-black/70">{quotation.brand?.email || quotation.userAccess?.[0]?.user?.email || '-'}</p>
                  <p className="text-muted-foreground print:text-black/70">{quotation.userAccess?.[0]?.user?.phone || '—'}</p>
                  <p className="text-muted-foreground print:text-black/70 whitespace-pre-wrap">{quotation.userAccess?.[0]?.user?.address || ''}</p>
                </div>
              </div>

              {/* Project Info */}
              <div>
                <h3 className="text-[10px] font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest mb-2.5">INFORMASI PROYEK & KAMPANYE</h3>
                <div className="text-xs space-y-0.5 leading-relaxed">
                  <p className="font-bold text-foreground print:text-black uppercase">
                    {quotation.title || `${quotation.brand?.name || quotation.userAccess?.[0]?.user?.name || 'KLIEN'} MARKETING CAMPAIGN`}
                  </p>
                  <p className="text-muted-foreground print:text-black/70">{quotation.description || 'Rencana anggaran & usulan penawaran untuk kampanye influencer.'}</p>
                  <p><span className="text-muted-foreground print:text-black/70">Status Dokumen:</span> {quotation.status}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200/80 my-8" />

            {/* Items Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center print:hidden">
                <h3 className="text-[10px] font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest">DESKRIPSI ITEM PENAWARAN</h3>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-foreground print:text-black">
                    {quotation.items.map((item: any) => (
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
              {settings.quoTaxEnabled !== false && (
                <div className="flex justify-between w-full max-w-[280px] text-xs text-muted-foreground print:text-black/70 border-b border-gray-100 pb-2">
                  <span className="font-medium text-foreground">{settings.quoTaxName || 'PPN'} ({taxPercent}%)</span>
                  <span className="font-bold text-foreground">{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between w-full max-w-[280px] text-xs items-baseline">
                <span className="font-bold text-foreground print:text-black text-xs uppercase tracking-wide">Total Penawaran (IDR):</span>
                <span className="font-black text-orange-600 text-sm sm:text-base">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Payment Details Box */}
            {settings.quoShowBank && (
              <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/20 print:bg-transparent print:border-0 grid md:grid-cols-2 gap-5 mt-8 text-xs leading-relaxed">
                {/* Payment Instructions */}
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest text-[9px]">TATA CARA PEMBAYARAN</h4>
                  <p className="text-muted-foreground print:text-black/70 font-medium whitespace-pre-line">
                    {settings.quoBankInstruction || 'Pembayaran termin mengikuti kesepakatan kontrak. Mohon transfer ke rekening resmi di samping dan sertakan nomor quotation saat konfirmasi.'}
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
                  {settings.quoTermsText || '1. Penawaran harga ini berlaku selama 30 hari sejak tanggal diterbitkan.\n2. Pekerjaan baru akan dimulai setelah disetujui secara tertulis atau dikeluarkannya Invoice uang muka (DP).'}
                </div>
              </div>

              {/* Signature */}
              <div className="flex flex-col items-end">
                <div className="flex flex-col items-center text-center space-y-12 w-48">
                  <h4 className="font-extrabold text-muted-foreground print:text-black/70 uppercase tracking-widest text-[9px]">HORMAT KAMI,</h4>
                  


                  <div className="space-y-1 w-full relative z-10">
                    <p className="border-b border-dotted border-gray-400 pb-1.5 font-bold text-foreground print:text-black w-full text-center">
                      {settings.quoSignatoryName || 'Nanang M.'}
                    </p>
                    <p className="text-muted-foreground print:text-black/70 text-[9px] font-semibold uppercase tracking-widest text-center w-full">
                      {settings.quoSignatoryRole || 'Chief Executive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Sidebar Actions */}
          <div className="space-y-4 print:hidden">
            {/* Note Area */}
            {quotation.note && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Catatan Quotation</h3>
                <div className="text-xs text-muted-foreground">
                  {quotation.note}
                </div>
              </Card>
            )}
          </div>
      </div>

    </div>
  )
}
