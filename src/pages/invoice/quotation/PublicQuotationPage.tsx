import { useParams } from 'react-router-dom'
import { Download, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export default function PublicQuotationPage() {
  const { id } = useParams()

  const { data: quotation, isLoading, error } = useQuery({
    queryKey: ['public-quotation', id],
    queryFn: () => api<any>(`/finance/quotations/public/${id}`),
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

  if (isLoading) {
    return <div className="min-h-screen bg-stone-100 flex items-center justify-center">Loading quotation...</div>
  }

  if (!quotation || error) {
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

  const subtotal = quotation.items.reduce((sum: number, item: any) => sum + ((item.qty || 0) * (item.price || 0)), 0)
  const taxPercent = settings.quoTaxEnabled ? (settings.quoTaxPercent || 11) : 0
  const tax = subtotal * (taxPercent / 100)
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
          <p className="text-sm text-stone-500">{settings.corporateName || 'PT. Bintang Media Solusi Creativ'}</p>
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
        <div className="bg-white border border-gray-200 shadow-md rounded-[24px] p-6 sm:p-12 relative overflow-hidden print:border-0 print:shadow-none print:p-10 print:bg-white print:overflow-visible min-h-[29.7cm] flex flex-col">
          
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
              <h2 className="text-xl font-black text-stone-900 tracking-tight mb-1 whitespace-pre-line">{settings.corporateName?.replace(' ', '\n') || 'PT. Bintang Media\nSolusi Creativ'}</h2>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {settings.building && <>{settings.building}<br/></>}
                <span className="whitespace-pre-line">{settings.address || 'Pondok Indah Office Tower 3\nJakarta Selatan, 12310'}</span>
                <br />
                {settings.email || 'finance@bmsc.id'} | {settings.phone || '+62 811 1234 567'}
              </p>
            </div>
          </div>

          <hr className="border-gray-200/80 my-8" />

          <div className="grid sm:grid-cols-2 gap-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">PENERIMA PENAWARAN</h3>
              <div className="text-xs space-y-0.5 leading-relaxed">
                <p className="font-bold text-foreground text-sm mb-1">{quotation.userAccess?.[0]?.user?.companyName || quotation.brand?.name || quotation.userAccess?.[0]?.user?.name || '-'}</p>
                <p><span className="text-muted-foreground">Attn:</span> {quotation.userAccess?.[0]?.user?.picName || quotation.userAccess?.[0]?.user?.name || quotation.brand?.name || '-'}</p>
                <p className="text-muted-foreground">{quotation.brand?.email || quotation.userAccess?.[0]?.user?.email || '-'}</p>
                <p className="text-muted-foreground">{quotation.userAccess?.[0]?.user?.phone || '—'}</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{quotation.userAccess?.[0]?.user?.address || ''}</p>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">INFORMASI PROYEK & KAMPANYE</h3>
              <div className="text-xs space-y-0.5 leading-relaxed">
                <p className="font-bold text-foreground uppercase">
                  {quotation.title || `${quotation.brand?.name || quotation.userAccess?.[0]?.user?.name || 'KLIEN'} MARKETING CAMPAIGN`}
                </p>
                <p className="text-muted-foreground">{quotation.description || 'Rencana anggaran & usulan penawaran untuk kampanye influencer.'}</p>
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
                  {quotation.items.map((item: any) => (
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
            {settings.quoTaxEnabled !== false && (
              <div className="flex justify-between w-full max-w-[280px] text-xs text-muted-foreground border-b border-gray-100 pb-2 print:text-black/70">
                <span>{settings.quoTaxName || 'PPN'} ({taxPercent}%):</span>
                <span className="font-bold text-foreground print:text-black">{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="flex justify-between w-full max-w-[280px] text-xs items-baseline">
              <span className="font-bold text-foreground text-xs uppercase tracking-wide print:text-black">Total Penawaran (IDR):</span>
              <span className="font-black text-orange-600 text-sm sm:text-base print:text-black">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Payment Details Box */}
          {settings.quoShowBank && (
            <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/20 print:bg-transparent print:border-0 grid md:grid-cols-2 gap-5 mt-8 text-xs leading-relaxed">
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px] print:text-black/70">TATA CARA PEMBAYARAN</h4>
                <div className="text-[10.5px] text-muted-foreground/80 leading-relaxed font-medium whitespace-pre-line">
                  {settings.quoBankInstruction || 'Pembayaran termin mengikuti kesepakatan kontrak. Mohon transfer ke rekening resmi di samping dan sertakan nomor quotation saat konfirmasi.'}
                </div>
              </div>
              <div className="md:border-l border-gray-200 md:pl-5 space-y-0.5">
                <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px] mb-1.5 print:text-black/70">REKENING TUJUAN</h4>
                {activeBank ? (
                  <>
                    <p className="font-extrabold text-foreground print:text-black">{activeBank.bankName}</p>
                    <p className="font-black text-orange-600 text-base tracking-wider">{activeBank.accountNumber}</p>
                    <p className="text-muted-foreground font-semibold print:text-black/70">a.n. {activeBank.accountName}</p>
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

          <div className="grid sm:grid-cols-2 gap-8 mt-auto pt-10 text-xs">
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px] print:text-black/70">SYARAT & KETENTUAN</h4>
              <div className="text-[10.5px] text-muted-foreground/80 leading-relaxed font-medium whitespace-pre-line print:text-black/70">
                {settings.quoTermsText || '1. Penawaran harga ini berlaku selama 30 hari sejak tanggal diterbitkan.\n2. Pekerjaan baru akan dimulai setelah disetujui secara tertulis atau dikeluarkannya Invoice uang muka (DP).'}
                {quotation.note && `\n\nCatatan Tambahan:\n${quotation.note}`}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex flex-col items-center text-center space-y-12 w-48 relative">
                <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px] print:text-black/70">HORMAT KAMI,</h4>
                


                <div className="space-y-1 w-full relative z-10">
                  <p className="border-b border-dotted border-gray-400 pb-1.5 font-bold text-foreground w-full text-center print:text-black">
                    {settings.quoSignatoryName || 'Nanang M.'}
                  </p>
                  <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-widest text-center w-full print:text-black/70">
                    {settings.quoSignatoryRole || 'Chief Executive'}
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
