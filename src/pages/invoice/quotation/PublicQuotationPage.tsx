import { useParams } from 'react-router-dom'
import { Download, AlertCircle } from 'lucide-react'
import { mockQuotations, mockProjects } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function PublicQuotationPage() {
  const { id } = useParams()

  const quotation = mockQuotations.find((q) => q.id === id || q.number === id)

  if (!quotation) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-8 max-w-sm">
          <AlertCircle className="h-10 w-10 text-orange-500 mx-auto mb-4" />
          <h2 className="font-bold text-stone-900 text-base mb-2">Quotation Tidak Ditemukan</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Link quotation tidak valid atau dokumen telah dihapus dari sistem. Mohon hubungi administrator BMSC.
          </p>
        </div>
      </div>
    )
  }

  const project = mockProjects.find((p) => p.brandId === quotation.brandId)
  
  const subtotal = quotation.items.reduce((sum, item) => sum + (item.qty * item.price), 0)
  const tax = subtotal * 0.11
  const grandTotal = subtotal + tax

  return (
    <div className="min-h-screen bg-stone-100/50 py-10 print:bg-white print:py-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          #public-quotation-sheet, #public-quotation-sheet * { visibility: visible !important; }
          #public-quotation-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
          .print\\\\:hidden { display: none !important; }
        }
      `}} />

      <div className="max-w-3xl mx-auto mb-6 px-4 flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Quotation #{quotation.number}</h1>
          <p className="text-sm text-stone-500">PT. Bintang Media Solusi Creativ</p>
        </div>
        <Button 
          className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm font-semibold"
          icon={<Download className="h-4 w-4" />}
          onClick={() => window.print()}
        >
          Download PDF
        </Button>
      </div>

      <div id="public-quotation-sheet" className="max-w-3xl mx-auto px-4 print:px-0">
        <div className="bg-white border border-gray-200 shadow-md rounded-[24px] p-6 sm:p-12 relative overflow-hidden print:border-0 print:shadow-none print:p-10 print:bg-white print:overflow-visible">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
            <div>
              <div className="bg-orange-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 uppercase tracking-wider mb-4 shadow-sm shadow-orange-600/20">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Penawaran Harga Resmi
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-none mb-2">QUOTATION</h1>
              <p className="text-sm text-muted-foreground font-semibold">#{quotation.number}</p>
            </div>
            
            <div className="text-left sm:text-right">
              <h2 className="text-xl font-black text-stone-900 tracking-tight mb-1">PT. Bintang Media<br />Solusi Creativ</h2>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Pondok Indah Office Tower 3<br />
                Jakarta Selatan, 12310<br />
                finance@bmsc.id | +62 811 1234 567
              </p>
            </div>
          </div>

          <hr className="border-gray-200/80 my-8" />

          <div className="grid sm:grid-cols-2 gap-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">PENERIMA PENAWARAN</h3>
              <div className="text-xs space-y-0.5 leading-relaxed">
                <p className="font-bold text-foreground text-sm mb-1">{quotation.brand.name}</p>
                <p className="text-muted-foreground">{quotation.brand.email}</p>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">INFORMASI PROYEK & KAMPANYE</h3>
              <div className="text-xs space-y-0.5 leading-relaxed">
                <p className="font-bold text-foreground uppercase">
                  {project ? project.name : `${quotation.brand.name} MARKETING CAMPAIGN`}
                </p>
                <p className="text-muted-foreground">Rencana anggaran & usulan penawaran untuk kampanye influencer.</p>
                <p><span className="text-muted-foreground">Status Dokumen:</span> {quotation.status}</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-200/80 my-8" />

          <div className="space-y-3">
            <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">DESKRIPSI ITEM PENAWARAN</h3>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50/50 print:bg-transparent border-b border-gray-200 text-muted-foreground text-left font-semibold">
                    <th className="px-5 py-3.5 font-bold">Deskripsi Pekerjaan / Layanan</th>
                    <th className="px-3 py-3.5 text-center font-bold w-20">Volume</th>
                    <th className="px-3 py-3.5 text-center font-bold w-20">Satuan</th>
                    <th className="px-4 py-3.5 text-right font-bold w-32">Harga Satuan</th>
                    <th className="px-5 py-3.5 text-right font-bold w-36">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-foreground">
                  {quotation.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/30 print:bg-transparent">
                      <td className="px-5 py-3 font-bold text-foreground/80 print:text-black">
                        {item.name}
                      </td>
                      <td className="px-3 py-3 text-center font-bold">
                        {item.qty}
                      </td>
                      <td className="px-3 py-3 text-center text-muted-foreground capitalize print:text-black/70">
                        {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground print:text-black/70">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-foreground print:text-black">{formatCurrency(item.qty * item.price)}</td>
                    </tr>
                  ))}
                  {quotation.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground italic print:text-black/70">
                        Belum ada item penawaran.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2 mt-6 font-semibold">
            <div className="flex justify-between w-full max-w-[280px] text-xs text-muted-foreground border-b border-gray-100 pb-2 print:text-black/70">
              <span>Subtotal Pekerjaan:</span>
              <span className="font-bold text-foreground print:text-black">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between w-full max-w-[280px] text-xs text-muted-foreground border-b border-gray-100 pb-2 print:text-black/70">
              <span>PPN (11%):</span>
              <span className="font-bold text-foreground print:text-black">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between w-full max-w-[280px] text-xs items-baseline">
              <span className="font-bold text-foreground text-xs uppercase tracking-wide print:text-black">Total Penawaran (IDR):</span>
              <span className="font-black text-orange-600 text-sm sm:text-base print:text-black">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/20 print:bg-transparent print:border-0 grid md:grid-cols-2 gap-5 mt-8 text-xs leading-relaxed">
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px] print:text-black/70">TATA CARA PEMBAYARAN</h4>
              <p className="text-muted-foreground font-medium print:text-black/70">
                Pembayaran termin mengikuti kesepakatan kontrak. Mohon transfer ke rekening resmi di samping dan sertakan nomor quotation saat konfirmasi.
              </p>
            </div>
            <div className="md:border-l border-gray-200 md:pl-5 space-y-0.5">
              <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px] mb-1.5 print:text-black/70">REKENING TUJUAN</h4>
              <p className="font-extrabold text-foreground print:text-black">DIGIBANK by DBS</p>
              <p className="font-black text-orange-600 text-base tracking-wider print:text-black">1702945239</p>
              <p className="text-muted-foreground font-semibold print:text-black/70">a.n. Muhammad Nanang Rizaldi</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 mt-10 text-xs">
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px] print:text-black/70">SYARAT & KETENTUAN</h4>
              <ol className="list-decimal pl-4 text-muted-foreground space-y-0.5 font-medium leading-relaxed print:text-black/70">
                <li>Penawaran harga ini berlaku selama 30 hari sejak tanggal diterbitkan.</li>
                <li>Pekerjaan baru akan dimulai setelah disetujui secara tertulis atau dikeluarkannya Invoice uang muka (DP).</li>
                {quotation.note && <li>{quotation.note}</li>}
              </ol>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex flex-col items-center text-center space-y-12 w-48">
                <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px] print:text-black/70">HORMAT KAMI,</h4>
                <div className="space-y-1 w-full">
                  <p className="border-b border-dotted border-gray-400 pb-1.5 font-bold text-foreground w-full text-center print:text-black">NanangMrk</p>
                  <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-widest text-center w-full print:text-black/70">NanangMrk Channel</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
