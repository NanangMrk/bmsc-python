import { useParams } from 'react-router-dom'
import { Download, AlertCircle } from 'lucide-react'
// data fetched via API
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export default function PublicPaymentPage() {
  const { id } = useParams()

  const { data: paymentData, isLoading } = useQuery({
    queryKey: ['payment-public', id],
    queryFn: () => api<any>(`/projects/payments/public/${id}`),
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
  const settings = settingsData || {}
  const activeBank = bankAccounts.find((b: any) => b.isActive) || bankAccounts[0]

  const payment = paymentData
  
  if (isLoading) {
    return <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center"><div className="animate-pulse font-bold text-muted-foreground">Loading Invoice...</div></div>
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-8 max-w-sm">
          <AlertCircle className="h-10 w-10 text-orange-500 mx-auto mb-4" />
          <h2 className="font-bold text-stone-900 text-base mb-2">Invoice Tidak Ditemukan</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Link invoice tidak valid atau tahapan pembayaran telah dihapus dari sistem. Mohon hubungi administrator BMSC.
          </p>
        </div>
      </div>
    )
  }

  const title = payment.title || (payment.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%')
  const amount = Number(payment.amount || 0)
  const status = payment.status || 'MENUNGGU'
  const createdAt = payment.createdAt || (payment.project?.startDate) || new Date().toISOString()
  
  const project = payment.project
  const brand = project?.brand
  const billTo = payment.billTo

  // Since payments might not have a dedicated number, we'll construct one
  const invoiceNumber = `INV-${(project?.id || '').slice(0, 8).toUpperCase()}-${(payment.id || '').slice(0, 8).toUpperCase()}`

  // Milestone invoice does not calculate tax explicitly in the items, so we'll just display the total
  const grandTotal = amount

  return (
    <div className="min-h-screen bg-stone-100/50 py-10 print:bg-white print:py-0">
      {/* Dynamic Style Injection to hide screen layout and print ONLY the sheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #public-invoice-sheet, #public-invoice-sheet * {
            visibility: visible !important;
          }
          #public-invoice-sheet {
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

      {/* Action Bar */}
      <div className="max-w-3xl mx-auto mb-6 px-4 flex justify-between items-center print:hidden">
        <div className="text-xs font-semibold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
          <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span> Link Invoice Publik (Tanpa Login)
        </div>
        <Button
          className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm text-xs font-semibold px-5 py-2 flex items-center gap-1.5"
          onClick={() => window.print()}
        >
          <Download className="h-3.5 w-3.5" /> Cetak / Simpan PDF
        </Button>
      </div>

      {/* Invoice Sheet */}
      <div id="public-invoice-sheet" className="max-w-3xl mx-auto px-4 print:px-0">
        <div className="bg-white border border-gray-200 shadow-md rounded-[24px] p-6 sm:p-12 relative overflow-hidden print:border-0 print:shadow-none print:p-10 min-h-[29.7cm] flex flex-col print:block print:min-h-0">

        {/* Diagonal Stamp */}
        <div className="absolute top-6 right-6 sm:top-12 sm:right-12 z-10">
          {status === 'LUNAS' ? (
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
              {settings.corporateName && <p className="font-bold text-foreground">{settings.corporateName}</p>}
              {settings.building && <p>{settings.building}</p>}
              <p className="whitespace-pre-line">{settings.address || 'Pondok Indah Office Tower 3\nJakarta Selatan, 12310'}</p>
              <p>{settings.email || 'finance@bmsc.id'} | {settings.phone || '+62 811 1234 567'}</p>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="sm:text-right text-xs text-muted-foreground space-y-1 sm:mt-12">
            <h2 className="text-2xl font-black text-orange-600 tracking-wider">INVOICE</h2>
            <p className="font-semibold text-foreground">No. Invoice: <span className="font-mono text-muted-foreground">{invoiceNumber}</span></p>
            <p className="font-semibold text-foreground print:text-black">Tanggal: <span className="text-muted-foreground print:text-black/70">{formatDateShort(createdAt)}</span></p>
            <p className="font-semibold text-foreground print:text-black">Tenggat: <span className="text-amber-500 font-bold">{formatDateShort(createdAt)}</span></p>
          </div>
        </div>

        <hr className="border-gray-200/80 my-8" />

        {/* Bill To & Project Info */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Bill To */}
          <div>
            <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">DITANGGUHKAN KEPADA (BILL TO)</h3>
            <div className="text-xs space-y-0.5 leading-relaxed">
              <p className="font-bold text-foreground uppercase">{billTo?.companyName || billTo?.brand?.name || billTo?.name || project?.brand?.name || 'Unknown'}</p>
              <p><span className="text-muted-foreground">Attn:</span> {billTo?.picName || billTo?.name || project?.brand?.name || '—'}</p>
              <p className="text-muted-foreground">{billTo?.email || brand?.email || '—'}</p>
              <p className="text-muted-foreground">{billTo?.phone || '—'}</p>
              <p className="text-muted-foreground whitespace-pre-wrap">{billTo?.address || ''}</p>
            </div>
          </div>

          {/* Project Info */}
          <div>
            <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">INFORMASI PROYEK & KAMPANYE</h3>
            <div className="text-xs space-y-0.5 leading-relaxed">
              <p className="font-bold text-foreground uppercase">{project?.name || 'Proyek'}</p>
              <p className="text-muted-foreground">Tagihan termin pembayaran untuk pengerjaan kampanye konten.</p>
              <p><span className="text-muted-foreground">Termin:</span> {title}</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-200/80 my-8" />

        {/* Items Table */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">DESKRIPSI ITEM PEKERJAAN</h3>
          <div className="border border-gray-255/70 rounded-xl overflow-hidden bg-white">
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
                    <p>{project?.name}</p>
                    <p className="text-muted-foreground text-[10px] font-normal mt-0.5">{title}</p>
                  </td>
                  <td className="px-3 py-4 text-center font-bold">1</td>
                  <td className="px-3 py-4 text-center text-muted-foreground capitalize">Milestone</td>
                  <td className="px-4 py-4 text-right font-semibold">{formatCurrency(amount)}</td>
                  <td className="px-5 py-4 text-right font-bold text-foreground">{formatCurrency(amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculations Summary */}
        <div className="flex flex-col items-end space-y-2 mt-6 font-semibold">
          <div className="flex justify-between w-full max-w-[280px] text-xs text-muted-foreground border-b border-gray-100 pb-2">
            <span>Subtotal Pekerjaan:</span>
            <span className="font-bold text-foreground">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between w-full max-w-[280px] text-xs items-baseline">
            <span className="font-bold text-foreground text-xs uppercase tracking-wide">Total Tagihan (IDR):</span>
            <span className="font-black text-orange-600 text-base">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {settings.invShowBank && (
          <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/20 print:bg-transparent print:border-0 grid md:grid-cols-2 gap-5 mt-8 text-xs leading-relaxed">
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px] print:text-black/70">TATA CARA PEMBAYARAN</h4>
              <p className="text-muted-foreground font-medium whitespace-pre-line print:text-black/70">
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
                  <p className="font-extrabold text-foreground print:text-black">Belum ada Rekening Aktif</p>
                  <p className="text-muted-foreground print:text-black/70 font-semibold text-[10px] mt-1">Hubungi agensi terkait.</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Terms & Signature Section */}
        <div className="grid sm:grid-cols-2 gap-8 mt-auto print:mt-10 pt-10 text-xs">
          {/* Terms and Conditions */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">SYARAT & KETENTUAN</h4>
            <div className="text-[10.5px] text-muted-foreground/80 leading-relaxed font-medium whitespace-pre-line">
              {settings.invTermsText || '1. Invoice ini adalah sah diterbitkan oleh perusahaan.\n2. Tagihan ini berlaku sebagai kwitansi lunas yang sah apabila status tercantum LUNAS / PAID.'}
            </div>
          </div>

          {/* Signature */}
          <div className="flex flex-col items-end">
            <div className="flex flex-col items-center text-center space-y-12 w-48 relative">
              <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">HORMAT KAMI,</h4>
              


              <div className="space-y-1 w-full relative z-10">
                <p className="border-b border-dotted border-gray-400 pb-1.5 font-bold text-foreground w-full text-center">
                  {settings.invSignatoryName || 'NanangMrk'}
                </p>
                <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-widest text-center w-full">
                  {settings.invSignatoryRole || 'NanangMrk Channel'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
