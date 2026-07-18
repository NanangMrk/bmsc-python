import { useParams } from 'react-router-dom'
import { Download, AlertCircle } from 'lucide-react'
import { mockInvoices, mockProjects, mockPayments } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function PublicInvoicePage() {
  const { id } = useParams()

  // Try to find in mockInvoices first
  const invData = mockInvoices.find((i) => i.id === id || i.number === id)

  // Try to find in mockPayments
  const payData = mockPayments.find((p) => p.id === id)

  if (!invData && !payData) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-8 max-w-sm">
          <AlertCircle className="h-10 w-10 text-orange-500 mx-auto mb-4" />
          <h2 className="font-bold text-stone-900 text-base mb-2">Invoice Tidak Ditemukan</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Link invoice tidak valid atau tagihan telah dihapus dari sistem. Mohon hubungi administrator BMSC.
          </p>
        </div>
      </div>
    )
  }

  // Resolve details depending on type
  const title = payData
    ? (payData.title || (payData.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%'))
    : 'Jasa Pemasaran Influencer / Konten Digital'

  const amount = payData ? payData.amount : (invData?.total || 0)
  const status = payData ? payData.status : (invData?.status || 'BELUM_DIBAYAR')
  const invoiceNumber = payData ? `INV-PAY-${payData.id.toUpperCase()}` : (invData?.number || 'INV-2025-XXX')
  const createdAt = payData ? payData.createdAt : (invData?.createdAt || '')

  // Find project
  const projectId = payData ? payData.projectId : (invData?.projectId || '')
  const project = mockProjects.find((p) => p.id === projectId)
  const brand = project?.brand || invData?.brand

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
      <div id="public-invoice-sheet" className="bg-white border border-gray-250/70 shadow-md rounded-[24px] p-6 sm:p-12 max-w-3xl mx-auto relative overflow-hidden print:border-0 print:shadow-none print:p-0">

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
                N
              </div>
              <span className="font-extrabold text-base text-foreground">NanangMrk</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5 leading-relaxed">
              <p className="font-bold text-foreground text-xs">NanangMrk Channel</p>
              <p>Jl. Pangeran Syarief</p>
              <p>RT 03 RW 01 Saripan Jepara 59414</p>
              <p>Email: nanangmrkchannel@gmail.com</p>
              <p>Telp: 085156014905</p>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="sm:text-right text-xs text-muted-foreground space-y-1 sm:mt-12">
            <h2 className="text-2xl font-black text-orange-600 tracking-wider">INVOICE</h2>
            <p className="font-semibold text-foreground">No. Invoice: <span className="font-mono text-muted-foreground">{invoiceNumber}</span></p>
            <p className="font-semibold text-foreground">Tanggal: <span className="text-muted-foreground">{createdAt}</span></p>
            <p className="font-semibold text-foreground">Tenggat: <span className="text-amber-500 font-bold">{createdAt}</span></p>
          </div>
        </div>

        <hr className="border-gray-200/80 my-8" />

        {/* Bill To & Project Info */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Bill To */}
          <div>
            <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">DITANGGUHKAN KEPADA (BILL TO)</h3>
            <div className="text-xs space-y-0.5 leading-relaxed">
              <p className="font-bold text-foreground uppercase">{brand?.name || '—'}</p>
              <p><span className="text-muted-foreground">Attn:</span> {brand?.name || '—'}</p>
              <p className="text-muted-foreground">{brand?.email || '—'}</p>
              <p className="text-muted-foreground">—</p>
            </div>
          </div>

          {/* Project Info */}
          <div>
            <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">INFORMASI PROYEK & KAMPANYE</h3>
            <div className="text-xs space-y-0.5 leading-relaxed">
              <p className="font-bold text-foreground uppercase">{project?.name || 'KAMPANYE MARKETING'}</p>
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
                    <p>{project?.name || 'Jasa Kampanye Pemasaran Digital'}</p>
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
            <span className="font-black text-orange-600 text-base">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* Payment Details Box */}
        <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/20 grid md:grid-cols-2 gap-5 mt-8 text-xs leading-relaxed">
          {/* Payment Instructions */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">TATA CARA PEMBAYARAN</h4>
            <p className="text-muted-foreground font-medium">
              Mohon sertakan berita transfer nomor invoice saat melakukan pembayaran. Kirimkan konfirmasi bukti transfer melalui platform atau kirim ke WhatsApp 085156014905
            </p>
          </div>

          {/* Target Bank Account */}
          <div className="md:border-l border-gray-200 md:pl-5 space-y-0.5">
            <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px] mb-1.5">REKENING TUJUAN</h4>
            <p className="font-extrabold text-foreground">DIGIBANK by DBS</p>
            <p className="font-black text-orange-600 text-base tracking-wider">1702945239</p>
            <p className="text-muted-foreground font-semibold">a.n. Muhammad Nanang Rizaldi</p>
          </div>
        </div>

        {/* Terms & Signature Section */}
        <div className="grid sm:grid-cols-2 gap-8 mt-10 text-xs">
          {/* Terms and Conditions */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">SYARAT & KETENTUAN</h4>
            <ol className="list-decimal pl-4 text-muted-foreground space-y-0.5 font-medium leading-relaxed">
              <li>Invoice ini adalah sah diterbitkan oleh perusahaan.</li>
              <li>Tagihan ini berlaku sebagai kwitansi lunas yang sah apabila status tercantum LUNAS / PAID.</li>
            </ol>
          </div>

          {/* Signature */}
          <div className="flex flex-col items-end">
            <div className="flex flex-col items-center text-center space-y-12 w-48">
              <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">HORMAT KAMI,</h4>
              <div className="space-y-1 w-full">
                <p className="border-b border-dotted border-gray-400 pb-1.5 font-bold text-foreground w-full text-center">NanangMrk</p>
                <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-widest text-center w-full">NanangMrk Channel</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
