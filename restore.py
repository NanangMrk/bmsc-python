import re

text = """
1: import { useState } from 'react'
2: import { Plus, Trash2, X, Pencil } from 'lucide-react'
3: import { mockPayments } from '@/lib/mock-data'
4: import type { Project, Payment, PaymentStatus } from '@/lib/mock-data'
5: import { formatCurrency, cn } from '@/lib/utils'
6: import { Button } from '@/components/ui/Button'
7: 
8: interface PaymentTabProps {
9:   project: Project
10: }
11: 
12: export function PaymentTab({ project }: PaymentTabProps) {
13:   // Load payments dynamically
14:   const [payments, setPayments] = useState<Payment[]>(() =>
15:     mockPayments.filter((p) => p.projectId === project.id)
16:   )
17: 
18:   // Add milestone form states
19:   const [showAddModal, setShowAddModal] = useState(false)
20:   const [newPayType, setNewPayType] = useState('')
21:   const [newPayAmount, setNewPayAmount] = useState('')
22:   const [newPayDescription, setNewPayDescription] = useState('')
23:   const [newPayStatus, setNewPayStatus] = useState<PaymentStatus>('MENUNGGU')
24: 
25:   // Edit milestone form states
26:   const [showEditModal, setShowEditModal] = useState(false)
27:   const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)
28:   const [editPayType, setEditPayType] = useState('')
29:   const [editPayAmount, setEditPayAmount] = useState('')
30:   const [editPayDescription, setEditPayDescription] = useState('')
31: 
32:   // State to track temporary status changes before save is clicked
33:   const [modifiedStatuses, setModifiedStatuses] = useState<Record<string, PaymentStatus>>({})
34: 
35:   // State to track which milestone invoice is being previewed for print
36:   const [printInvoicePayment, setPrintInvoicePayment] = useState<Payment | null>(null)
37: 
38:   const handleDeletePayment = (paymentId: string) => {
39:     if (confirm('Apakah Anda yakin ingin menghapus tahap pembayaran ini?')) {
40:       const idx = mockPayments.findIndex((p) => p.id === paymentId)
41:       if (idx !== -1) {
42:         mockPayments.splice(idx, 1)
43:       }
44:       setPayments((prev) => prev.filter((p) => p.id !== paymentId))
45:       // Remove any pending modified status
46:       setModifiedStatuses((prev) => {
47:         const copy = { ...prev }
48:         delete copy[paymentId]
49:         return copy
50:       })
51:     }
52:   }
53: 
54:   // Handle temporary select of status
55:   const handleSelectStatus = (paymentId: string, selectedStatus: PaymentStatus) => {
56:     setModifiedStatuses((prev) => ({
57:       ...prev,
58:       [paymentId]: selectedStatus,
59:     }))
60:   }
61: 
62:   // Commit status change to database & local state
63:   const handleSaveStatusChange = (paymentId: string) => {
64:     const newStatus = modifiedStatuses[paymentId]
65:     if (!newStatus) return
66: 
67:     const idx = mockPayments.findIndex((p) => p.id === paymentId)
68:     if (idx !== -1) {
69:       mockPayments[idx].status = newStatus
70:     }
71:     setPayments((prev) =>
72:       prev.map((p) => (p.id === paymentId ? { ...p, status: newStatus } : p))
73:     )
74: 
75:     // Clear tracking for this payment
76:     setModifiedStatuses((prev) => {
77:       const copy = { ...prev }
78:       delete copy[paymentId]
79:       return copy
80:     })
81:   }
82: 
83:   const handleOpenEditModal = (pay: Payment) => {
84:     setEditingPaymentId(pay.id)
85:     setEditPayType(pay.title || (pay.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%'))
86:     setEditPayAmount(pay.amount.toString())
87:     setEditPayDescription(pay.description || '')
88:     setShowEditModal(true)
89:   }
90: 
91:   const handleEditPaymentSubmit = (e: React.FormEvent) => {
92:     e.preventDefault()
93:     if (!editPayType.trim() || !editPayAmount) {
94:       alert('Nama tahap dan nominal wajib diisi')
95:       return
96:     }
97: 
98:     const idx = mockPayments.findIndex((p) => p.id === editingPaymentId)
99:     if (idx !== -1) {
100:       mockPayments[idx].title = editPayType
101:       mockPayments[idx].amount = parseInt(editPayAmount) || 0
102:       mockPayments[idx].description = editPayDescription
103:     }
104: 
105:     setPayments((prev) =>
106:       prev.map((p) =>
107:         p.id === editingPaymentId
108:           ? {
109:               ...p,
110:               title: editPayType,
111:               amount: parseInt(editPayAmount) || 0,
112:               description: editPayDescription,
113:             }
114:           : p
115:       )
116:     )
117:     setShowEditModal(false)
118:   }
119: 
120:   const handleAddPaymentSubmit = (e: React.FormEvent) => {
121:     e.preventDefault()
122:     if (!newPayType.trim() || !newPayAmount) {
123:       alert('Nama tahap dan nominal wajib diisi')
124:       return
125:     }
126: 
127:     const newPayment: Payment = {
128:       id: `pay-${Date.now()}`,
129:       projectId: project.id,
130:       type: 'DP',
131:       amount: parseInt(newPayAmount) || 0,
132:       status: newPayStatus,
133:       createdAt: new Date().toISOString().split('T')[0],
134:       title: newPayType,
135:       description: newPayDescription,
136:     }
137: 
138:     mockPayments.push(newPayment)
139:     setPayments((prev) => [...prev, newPayment])
140:     setShowAddModal(false)
141: 
142:     // Reset Form
143:     setNewPayType('')
144:     setNewPayAmount('')
145:     setNewPayDescription('')
146:     setNewPayStatus('MENUNGGU')
147:   }
148: 
149:   // Calculate dynamic summaries
150:   const totalContractValue = project.value
151:   const totalMilestonePlanned = payments.reduce((sum, p) => sum + p.amount, 0)
152:   const totalPaid = payments.filter((p) => p.status === 'LUNAS').reduce((sum, p) => sum + p.amount, 0)
153: 
154:   return (
155:     <div className="space-y-6">
156:       {/* Dynamic Style Injection for printing a specific DOM node without portal */}
157:       {printInvoicePayment && (
158:         <style dangerouslySetInnerHTML={{ __html: `
159:           @media print {
160:             body * {
161:               visibility: hidden !important;
162:             }
163:             #printable-invoice-sheet, #printable-invoice-sheet * {
164:               visibility: visible !important;
165:             }
166:             #printable-invoice-sheet {
167:               position: absolute !important;
168:               left: 0 !important;
169:               top: 0 !important;
170:               width: 100% !important;
171:               background: white !important;
172:               padding: 15mm !important;
173:               margin: 0 !important;
174:               box-shadow: none !important;
175:               border: none !important;
176:             }
177:           }
178:         `}} />
179:       )}
180: 
181:       {/* Header */}
182:       <div className="flex items-start justify-between">
183:         <div>
184:           <h3 className="text-base font-bold flex items-center gap-2">
185:             <span className="text-orange-600 font-serif text-lg">$</span> Milestone & Tahapan Pembayaran
186:           </h3>
187:           <p className="text-xs text-muted-foreground mt-1">
188:             Kelola termin pembayaran proyek, sesuaikan rincian, dan perbarui status pembayarannya secara manual.
189:           </p>
190:         </div>
191:         <button
192:           onClick={() => setShowAddModal(true)}
193:           className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
194:         >
195:           <span>+</span> Tambah Tahap Pembayaran
196:         </button>
197:       </div>
198: 
199:       {/* Cards Grid */}
200:       <div className="grid md:grid-cols-2 gap-4">
201:         {payments.map((pay, idx) => {
202:           const cardTitle = pay.title || (pay.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%')
203:           const cardDesc = pay.description || (pay.type === 'DP' ? 'DP 50% diperlukan sebagai komitmen awal pengerjaan konsep.' : 'Pelunasan diselesaikan saat deliverables disetujui untuk ditayangkan live.')
204: 
205:           const displayStatus = modifiedStatuses[pay.id] ?? pay.status
206:           const hasStatusChanged = modifiedStatuses[pay.id] && modifiedStatuses[pay.id] !== pay.status
207: 
208:           let cardBorder = "border-border/60 bg-white"
209:           let badgeClass = "bg-gray-100 text-gray-750"
210: 
211:           if (displayStatus === 'LUNAS') {
212:             cardBorder = "border-green-200 bg-green-50/10"
213:             badgeClass = "bg-green-100 text-green-700 font-semibold"
214:           } else if (displayStatus === 'PROSES_VERIFIKASI') {
215:             cardBorder = "border-blue-200 bg-blue-50/10"
216:             badgeClass = "bg-blue-100 text-blue-700 font-semibold"
217:           } else if (displayStatus === 'MENUNGGU') {
218:             cardBorder = "border-amber-200 bg-amber-50/10"
219:             badgeClass = "bg-amber-100 text-amber-700 font-semibold"
220:           }
221: 
222:           return (
223:             <div key={pay.id} className={cn("border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between transition-all min-h-[230px]", cardBorder)}>
224:               <div>
225:                 <div className="flex justify-between items-start mb-4">
226:                   <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">TAHAP {idx + 1}</span>
227:                   <div className="flex items-center gap-2">
228:                     <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase", badgeClass)}>
229:                       {displayStatus === 'PROSES_VERIFIKASI' ? 'PROSES' : displayStatus}
230:                     </span>
231:                     <button
232:                       onClick={() => handleOpenEditModal(pay)}
233:                       className="text-muted-foreground hover:text-orange-600 transition-colors"
234:                       title="Ubah Tahap"
235:                     >
236:                       <Pencil className="h-3.5 w-3.5" />
237:                     </button>
238:                     <button
239:                       onClick={() => handleDeletePayment(pay.id)}
240:                       className="text-muted-foreground hover:text-red-500 transition-colors"
241:                       title="Hapus Tahap Pembayaran"
242:                     >
243:                       <Trash2 className="h-3.5 w-3.5" />
244:                     </button>
245:                   </div>
246:                 </div>
247: 
248:                 <h4 className="font-bold text-sm mb-1">{cardTitle}</h4>
249:                 <p className="font-bold text-base mb-2">{formatCurrency(pay.amount)}</p>
250:                 
251:                 <div className="flex items-end justify-between gap-4">
252:                   <p className="text-xs text-muted-foreground flex-1">{cardDesc}</p>
253:                   <button
254:                     onClick={() => setPrintInvoicePayment(pay)}
255:                     className="text-[10px] font-bold text-orange-600 hover:underline flex items-center gap-1 uppercase tracking-wider shrink-0"
256:                     type="button"
257:                   >
258:                     CETAK INVOICE <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
259:                   </button>
260:                 </div>
261:               </div>
262: 
263:               <div className="mt-auto pt-4 border-t border-border/50 text-[10px]">
264:                 <div className="flex items-center justify-between gap-2">
265:                   <div className="flex items-center gap-2">
266:                     <span className="font-bold text-muted-foreground tracking-wider uppercase">UBAH STATUS:</span>
267:                     <div className="flex items-center bg-gray-100 rounded p-0.5 font-bold">
268:                       <button
269:                         onClick={() => handleSelectStatus(pay.id, 'MENUNGGU')}
270:                         className={cn("px-2 py-0.5 rounded transition-all", displayStatus === 'MENUNGGU' ? "bg-amber-500 text-white shadow-sm" : "text-muted-foreground hover:bg-white")}
271:                         type="button"
272:                       >
273:                         MENUNGGU
274:                       </button>
275:                       <button
276:                         onClick={() => handleSelectStatus(pay.id, 'PROSES_VERIFIKASI')}
277:                         className={cn("px-2 py-0.5 rounded transition-all", displayStatus === 'PROSES_VERIFIKASI' ? "bg-blue-500 text-white shadow-sm" : "text-muted-foreground hover:bg-white")}
278:                         type="button"
279:                       >
280:                         PROSES
281:                       </button>
282:                       <button
283:                         onClick={() => handleSelectStatus(pay.id, 'LUNAS')}
284:                         className={cn("px-2 py-0.5 rounded transition-all", displayStatus === 'LUNAS' ? "bg-green-500 text-white shadow-sm" : "text-muted-foreground hover:bg-white")}
285:                         type="button"
286:                       >
287:                         LUNAS
288:                       </button>
289:                     </div>
290:                   </div>
291: 
292:                   {/* Save button visible only when status changes */}
293:                   {hasStatusChanged && (
294:                     <button
295:                       onClick={() => handleSaveStatusChange(pay.id)}
296:                       className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md transition-all animate-pulse"
297:                       type="button"
298:                     >
299:                       Simpan
300:                     </button>
301:                   )}
302:                 </div>
303:               </div>
304:             </div>
305:           )
306:         })}
307: 
308:         {payments.length === 0 && (
309:           <div className="col-span-2 border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-xs">
310:             Belum ada tahapan pembayaran yang dibuat. Klik "+ Tambah Tahap Pembayaran" untuk memulainya.
311:           </div>
312:         )}
313:       </div>
314: 
315:       {/* Bottom Info summaries */}
316:       <div className="grid md:grid-cols-2 gap-4">
317:         <div>
318:           <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-2">TUJUAN TRANSFER BANK</h4>
319:           <div className="border border-border/60 rounded-lg p-4 bg-white flex justify-between items-center h-[90px]">
320:             <div>
321:               <p className="font-bold text-sm">DIGIBANK by DBS</p>
322:               <p className="font-bold text-sm mb-1">1702945239</p>
323:               <p className="text-[10px] text-muted-foreground italic">a/n Muhammad Nanang Rizaldi</p>
324:             </div>
325:             <button
326:               onClick={() => {
327:                 navigator.clipboard.writeText('1702945239')
328:                 alert('Nomor rekening berhasil disalin!')
329:               }}
330:               className="text-sm font-bold text-orange-600 hover:underline"
331:             >
332:               Salin
333:             </button>
334:           </div>
335:         </div>
336:         <div>
337:           <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-2">RINCIAN FINANSIAL</h4>
338:           <div className="border border-border/60 rounded-lg p-4 bg-white text-xs font-mono flex flex-col justify-center h-[90px]">
339:             <div className="flex justify-between items-center mb-1">
340:               <span className="text-muted-foreground font-sans">Total Nilai Kontrak:</span>
341:               <span className="font-bold">{formatCurrency(totalContractValue)}</span>
342:             </div>
343:             <div className="flex justify-between items-center mb-1">
344:               <span className="text-muted-foreground font-sans">Total Rencana Milestone:</span>
345:               <span className="font-bold text-orange-600">{formatCurrency(totalMilestonePlanned)}</span>
346:             </div>
347:             <div className="flex justify-between items-center">
348:               <span className="text-muted-foreground font-sans">Telah Dibayarkan (Lunas):</span>
349:               <span className="font-bold text-green-600">{formatCurrency(totalPaid)}</span>
350:             </div>
351:           </div>
352:         </div>
353:       </div>
354: 
355:       {/* Modal Cetak Invoice Preview */}
356:       {printInvoicePayment && (
357:         <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden print:hidden animate-in fade-in duration-200">
358:           <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl border border-stone-200 flex flex-col max-h-[95vh] overflow-hidden">
359:             {/* Header */}
360:             <div className="px-6 py-4 bg-stone-50 border-b border-stone-200/80 flex justify-between items-center shrink-0">
361:               <h3 className="font-bold text-stone-950 flex items-center gap-1.5 text-xs uppercase tracking-wider">
362:                 Pratinjau Invoice Resmi
363:               </h3>
364:               <div className="flex items-center gap-2.5">
365:                 <Button
366:                   variant="outline"
367:                   size="sm"
368:                   className="text-xs font-semibold px-4 py-2 border border-stone-250 hover:bg-stone-50 transition-all bg-white"
369:                   onClick={() => {
370:                     const url = `${window.location.origin}/public/invoice/${printInvoicePayment.id}`;
371:                     navigator.clipboard.writeText(url);
372:                     alert('Link invoice publik berhasil disalin!');
373:                   }}
374:                 >
375:                   Salin Link Invoice
376:                 </Button>
377:                 <Button
378:                   size="sm"
379:                   onClick={() => window.print()}
380:                   className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2 border-0 shadow-sm transition-all"
381:                 >
382:                   Cetak / Simpan PDF
383:                 </Button>
384:                 <button
385:                   onClick={() => setPrintInvoicePayment(null)}
386:                   className="h-8 w-8 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"
387:                   type="button"
388:                 >
389:                   <X className="h-4.5 w-4.5" />
390:                 </button>
391:               </div>
392:             </div>
393: 
394:             {/* Invoice sheet for visual preview in modal */}
395:             <div className="p-6 overflow-y-auto flex-1 bg-stone-100/30">
396:               <div className="bg-white border border-gray-200 shadow-md rounded-[24px] p-6 sm:p-12 max-w-3xl mx-auto relative overflow-hidden">
397:                 
398:                 {/* Diagonal Stamp */}
399:                 <div className="absolute top-6 right-6 sm:top-12 sm:right-12 z-10">
400:                   {printInvoicePayment.status === 'LUNAS' ? (
401:                     <div className="border-[3.5px] border-emerald-500/75 text-emerald-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center font-sans tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply">
402:                       <div className="flex items-center gap-1 text-[9px] font-extrabold">
403:                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500/85"><polyline points="20 6 9 17 4 12"/></svg>
404:                         INVOICE
405:                       </div>
406:                       <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
407:                         LUNAS / PAID
408:                       </div>
409:                       <div className="text-[7.5px] font-semibold text-emerald-500/60 uppercase tracking-widest">
410:                         NANANGMRK
411:                       </div>
412:                     </div>
413:                   ) : (
414:                     <div className="border-[3.5px] border-rose-500/75 text-rose-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center font-sans tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply">
415:                       <div className="flex items-center gap-1 text-[9px] font-extrabold">
416:                         <span className="inline-flex items-center justify-center border border-rose-500/80 text-rose-500/80 rounded-full h-3.5 w-3.5 text-[8.5px] font-extrabold">!</span>
417:                         INVOICE
418:                       </div>
419:                       <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
420:                         BELUM LUNAS
421:                       </div>
422:                       <div className="text-[7.5px] font-semibold text-rose-500/60 uppercase tracking-widest">
423:                         NANANGMRK
424:                       </div>
425:                     </div>
426:                   )}
427:                 </div>
428: 
429:                 {/* Invoice Top Details */}
430:                 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
431:                   {/* Sender Profile */}
432:                   <div>
433:                     <div className="flex items-center gap-3 mb-3">
434:                       <div className="h-9 w-9 bg-orange-600 text-white rounded-full flex items-center justify-center font-black text-base shadow-sm">
435:                         N
436:                       </div>
437:                       <span className="font-extrabold text-base text-foreground">NanangMrk</span>
438:                     </div>
439:                     <div className="text-xs text-muted-foreground space-y-0.5 leading-relaxed">
440:                       <p className="font-bold text-foreground text-xs">NanangMrk Channel</p>
441:                       <p>Jl. Pangeran Syarief</p>
442:                       <p>RT 03 RW 01 Saripan Jepara 59414</p>
443:                       <p>Email: nanangmrkchannel@gmail.com</p>
444:                       <p>Telp: 085156014905</p>
445:                     </div>
446:                   </div>
447: 
448:                   {/* Invoice Meta */}
449:                   <div className="sm:text-right text-xs text-muted-foreground space-y-1 sm:mt-12">
450:                     <h2 className="text-2xl font-black text-orange-600 tracking-wider">INVOICE</h2>
451:                     <p className="font-semibold text-foreground">No. Invoice: <span className="font-mono text-muted-foreground">INV-{project.id.toUpperCase()}-{printInvoicePayment.id.toUpperCase()}</span></p>
452:                     <p className="font-semibold text-foreground">Tanggal: <span className="text-muted-foreground">{printInvoicePayment.createdAt}</span></p>
453:                     <p className="font-semibold text-foreground">Tenggat: <span className="text-amber-500 font-bold">{printInvoicePayment.createdAt}</span></p>
454:                   </div>
455:                 </div>
456: 
457:                 <hr className="border-gray-200/80 my-8" />
458: 
459:                 {/* Bill To & Project Info */}
460:                 <div className="grid sm:grid-cols-2 gap-6">
461:                   {/* Bill To */}
462:                   <div>
463:                     <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">DITANGGUHKAN KEPADA (BILL TO)</h3>
464:                     <div className="text-xs space-y-0.5 leading-relaxed">
465:                       <p className="font-bold text-foreground uppercase">{project.brand.name}</p>
466:                       <p><span className="text-muted-foreground">Attn:</span> {project.brand.name}</p>
467:                       <p className="text-muted-foreground">{project.brand.email || '—'}</p>
468:                       <p className="text-muted-foreground">—</p>
469:                     </div>
470:                   </div>
471: 
472:                   {/* Project Info */}
473:                   <div>
474:                     <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">INFORMASI PROYEK & KAMPANYE</h3>
475:                     <div className="text-xs space-y-0.5 leading-relaxed">
476:                       <p className="font-bold text-foreground uppercase">{project.name}</p>
477:                       <p className="text-muted-foreground">Tagihan termin pembayaran untuk pengerjaan kampanye konten.</p>
478:                       <p><span className="text-muted-foreground">Termin:</span> {printInvoicePayment.title || (printInvoicePayment.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%')}</p>
479:                     </div>
480:                   </div>
481:                 </div>
482: 
483:                 <hr className="border-gray-200/80 my-8" />
484: 
485:                 {/* Items Table */}
486:                 <div className="space-y-3">
487:                   <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">DESKRIPSI ITEM PEKERJAAN</h3>
488:                   <div className="border border-gray-250/70 rounded-xl overflow-hidden bg-white">
489:                     <table className="w-full text-xs">
490:                       <thead>
491:                         <tr className="bg-gray-50/50 border-b border-gray-200 text-muted-foreground text-left font-semibold">
492:                           <th className="px-5 py-3.5 font-bold">Deskripsi Pekerjaan / Layanan</th>
493:                           <th className="px-3 py-3.5 text-center font-bold w-20">Volume</th>
494:                           <th className="px-3 py-3.5 text-center font-bold w-20">Satuan</th>
495:                           <th className="px-4 py-3.5 text-right font-bold w-32">Harga Satuan</th>
496:                           <th className="px-5 py-3.5 text-right font-bold w-36">Total</th>
497:                         </tr>
498:                       </thead>
499:                       <tbody className="divide-y divide-gray-100 font-medium text-foreground">
500:                         <tr className="hover:bg-gray-50/30">
501:                           <td className="px-5 py-4 font-bold text-foreground/80">
502:                             <p>{project.name}</p>
503:                             <p className="text-muted-foreground text-[10px] font-normal mt-0.5">{printInvoicePayment.title || (printInvoicePayment.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%')}</p>
504:                           </td>
505:                           <td className="px-3 py-4 text-center font-bold">1</td>
506:                           <td className="px-3 py-4 text-center text-muted-foreground capitalize">Milestone</td>
507:                           <td className="px-4 py-4 text-right font-semibold">{formatCurrency(printInvoicePayment.amount)}</td>
508:                           <td className="px-5 py-4 text-right font-bold text-foreground">{formatCurrency(printInvoicePayment.amount)}</td>
509:                         </tr>
510:                       </tbody>
511:                     </table>
512:                   </div>
513:                 </div>
514: 
515:                 {/* Calculations Summary */}
516:                 <div className="flex flex-col items-end space-y-2 mt-6 font-semibold">
517:                   <div className="flex justify-between w-full max-w-[280px] text-xs text-muted-foreground border-b border-gray-100 pb-2">
518:                     <span>Subtotal Pekerjaan:</span>
519:                     <span className="font-bold text-foreground">{formatCurrency(printInvoicePayment.amount)}</span>
520:                   </div>
521:                   <div className="flex justify-between w-full max-w-[280px] text-xs items-baseline">
522:                     <span className="font-bold text-foreground text-xs uppercase tracking-wide">Total Tagihan (IDR):</span>
523:                     <span className="font-black text-orange-600 text-base">{formatCurrency(printInvoicePayment.amount)}</span>
524:                   </div>
525:                 </div>
526: 
527:                 {/* Payment Details Box */}
528:                 <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/20 grid md:grid-cols-2 gap-5 mt-8 text-xs leading-relaxed">
529:                   {/* Payment Instructions */}
530:                   <div className="space-y-1.5">
531:                     <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">TATA CARA PEMBAYARAN</h4>
532:                     <p className="text-muted-foreground font-medium">
533:                       Mohon sertakan berita transfer nomor invoice saat melakukan pembayaran. Kirimkan konfirmasi bukti transfer melalui platform atau kirim ke WhatsApp 085156014905
534:                     </p>
535:                   </div>
536: 
537:                   {/* Target Bank Account */}
538:                   <div className="md:border-l border-gray-200 md:pl-5 space-y-0.5">
539:                     <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px] mb-1.5">REKENING TUJUAN</h4>
540:                     <p className="font-extrabold text-foreground">DIGIBANK by DBS</p>
541:                     <p className="font-black text-orange-600 text-base tracking-wider">1702945239</p>
542:                     <p className="text-muted-foreground font-semibold">a.n. Muhammad Nanang Rizaldi</p>
543:                   </div>
544:                 </div>
545: 
546:                 {/* Terms & Signature Section */}
547:                 <div className="grid sm:grid-cols-2 gap-8 mt-10 text-xs">
548:                   {/* Terms and Conditions */}
549:                   <div className="space-y-1.5">
550:                     <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">SYARAT & KETENTUAN</h4>
551:                     <ol className="list-decimal pl-4 text-muted-foreground space-y-0.5 font-medium leading-relaxed">
552:                       <li>Invoice ini adalah sah diterbitkan oleh perusahaan.</li>
553:                       <li>Tagihan ini berlaku sebagai kwitansi lunas yang sah apabila status tercantum LUNAS / PAID.</li>
554:                     </ol>
555:                   </div>
556: 
557:                   {/* Signature */}
558:                   <div className="flex flex-col items-end">
559:                     <div className="flex flex-col items-center text-center space-y-12 w-48">
560:                       <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[9px]">HORMAT KAMI,</h4>
561:                       <div className="space-y-1 w-full">
562:                         <p className="border-b border-dotted border-gray-400 pb-1.5 font-bold text-foreground w-full text-center">NanangMrk</p>
563:                         <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-widest text-center w-full">NanangMrk Channel</p>
564:                       </div>
565:                     </div>
566:                   </div>
567:                 </div>
568:               </div>
569:             </div>
570:           </div>
571:         </div>
572:       )}
573: 
574:       {/* Hidden print-only sheet container */}
575:       {printInvoicePayment && (
576:         <div id="printable-invoice-sheet" className="hidden print:block p-8 bg-white text-stone-955 relative" style={{ fontFamily: 'sans-serif' }}>
577:           
578:           {/* Diagonal Stamp */}
579:           <div className="absolute top-6 right-6 z-10">
580:             {printInvoicePayment.status === 'LUNAS' ? (
581:               <div className="border-[3.5px] border-emerald-500/75 text-emerald-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply font-bold">
582:                 <div className="flex items-center gap-1 text-[9px] font-extrabold">
583:                   INVOICE
584:                 </div>
585:                 <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
586:                   LUNAS / PAID
587:                 </div>
588:                 <div className="text-[7.5px] font-semibold text-emerald-500/60 uppercase tracking-widest">
589:                   NANANGMRK
590:                 </div>
591:               </div>
592:             ) : (
593:               <div className="border-[3.5px] border-rose-500/75 text-rose-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply font-bold">
594:                 <div className="flex items-center gap-1 text-[9px] font-extrabold">
595:                   INVOICE
596:                 </div>
597:                 <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
598:                   BELUM LUNAS
599:                 </div>
600:                 <div className="text-[7.5px] font-semibold text-rose-500/60 uppercase tracking-widest">
601:                   NANANGMRK
602:                 </div>
603:               </div>
604:             )}
605:           </div>
606: 
607:           {/* Invoice Top Details */}
608:           <div className="flex flex-row items-start justify-between gap-6">
609:             {/* Sender Profile */}
610:             <div>
611:               <div className="flex items-center gap-3 mb-3">
612:                 <div className="h-9 w-9 bg-orange-600 text-white rounded-full flex items-center justify-center font-black text-base shadow-sm">
613:                   N
614:                 </div>
615:                 <span className="font-extrabold text-base text-stone-900">NanangMrk</span>
616:               </div>
617:               <div className="text-xs text-stone-500 space-y-0.5 leading-relaxed">
618:                 <p className="font-bold text-stone-900 text-xs">NanangMrk Channel</p>
619:                 <p>Jl. Pangeran Syarief</p>
620:                 <p>RT 03 RW 01 Saripan Jepara 59414</p>
621:                 <p>Email: nanangmrkchannel@gmail.com</p>
622:                 <p>Telp: 085156014905</p>
623:               </div>
624:             </div>
625: 
626:             {/* Invoice Meta */}
627:             <div className="text-right text-xs text-stone-500 space-y-1">
628:               <h2 className="text-2xl font-black text-orange-600 tracking-wider">INVOICE</h2>
629:               <p className="font-semibold text-stone-900">No. Invoice: <span className="font-mono text-stone-500">INV-{project.id.toUpperCase()}-{printInvoicePayment.id.toUpperCase()}</span></p>
630:               <p className="font-semibold text-stone-900">Tanggal: <span className="text-stone-500">{printInvoicePayment.createdAt}</span></p>
631:               <p className="font-semibold text-stone-900">Tenggat: <span className="text-amber-500 font-bold">{printInvoicePayment.createdAt}</span></p>
632:             </div>
633:           </div>
634: 
635:           <hr className="border-stone-200 my-8" />
636: 
637:           {/* Bill To & Project Info */}
638:           <div className="grid grid-cols-2 gap-6">
639:             {/* Bill To */}
640:             <div>
641:               <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-2.5">DITANGGUHKAN KEPADA (BILL TO)</h3>
642:               <div className="text-xs space-y-0.5 leading-relaxed">
643:                 <p className="font-bold text-stone-900 uppercase">{project.brand.name}</p>
644:                 <p><span className="text-stone-400">Attn:</span> {project.brand.name}</p>
645:                 <p className="text-stone-500">{project.brand.email || '—'}</p>
646:                 <p className="text-stone-500">—</p>
647:               </div>
648:             </div>
649: 
650:             {/* Project Info */}
651:             <div>
652:               <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-2.5">INFORMASI PROYEK & KAMPANYE</h3>
653:               <div className="text-xs space-y-0.5 leading-relaxed">
654:                 <p className="font-bold text-stone-900 uppercase">{project.name}</p>
655:                 <p className="text-stone-500">Tagihan termin pembayaran untuk pengerjaan kampanye konten.</p>
656:                 <p><span className="text-stone-400">Termin:</span> {printInvoicePayment.title || (printInvoicePayment.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%')}</p>
657:               </div>
658:             </div>
659:           </div>
660: 
661:           <hr className="border-stone-200 my-8" />
662: 
663:           {/* Items Table */}
664:           <div className="space-y-3">
665:             <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">DESKRIPSI ITEM PEKERJAAN</h3>
666:             <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
667:               <table className="w-full text-xs">
668:                 <thead>
669:                   <tr className="bg-stone-50 border-b border-stone-200 text-stone-400 text-left font-semibold">
670:                     <th className="px-5 py-3.5 font-bold">Deskripsi Pekerjaan / Layanan</th>
671:                     <th className="px-3 py-3.5 text-center font-bold w-20">Volume</th>
672:                     <th className="px-3 py-3.5 text-center font-bold w-20">Satuan</th>
673:                     <th className="px-4 py-3.5 text-right font-bold w-32">Harga Satuan</th>
674:                     <th className="px-5 py-3.5 text-right font-bold w-36">Total</th>
675:                   </tr>
676:                 </thead>
677:                 <tbody className="divide-y divide-stone-100 font-medium text-stone-900">
678:                   <tr className="hover:bg-stone-50/30">
679:                     <td className="px-5 py-4 font-bold text-stone-900">
680:                       <p>{project.name}</p>
681:                       <p className="text-stone-400 text-[10px] font-normal mt-0.5">{printInvoicePayment.title || (printInvoicePayment.type === 'DP' ? 'Down Payment (DP) 50%' : 'Pelunasan Akhir 50%')}</p>
682:                     </td>
683:                     <td className="px-3 py-4 text-center font-bold">1</td>
684:                     <td className="px-3 py-4 text-center text-stone-400">Milestone</td>
685:                     <td className="px-4 py-4 text-right font-semibold">{formatCurrency(printInvoicePayment.amount)}</td>
686:                     <td className="px-5 py-4 text-right font-bold text-stone-900">{formatCurrency(printInvoicePayment.amount)}</td>
687:                   </tr>
688:                 </tbody>
689:               </table>
690:             </div>
691:           </div>
692: 
693:           {/* Calculations Summary */}
694:           <div className="flex flex-col items-end space-y-2 mt-6 font-semibold">
695:             <div className="flex justify-between w-full max-w-[280px] text-xs text-stone-400 border-b border-stone-100 pb-2">
696:               <span>Subtotal Pekerjaan:</span>
697:               <span className="font-bold text-stone-900">{formatCurrency(printInvoicePayment.amount)}</span>
698:             </div>
699:             <div className="flex justify-between w-full max-w-[280px] text-xs items-baseline">
700:               <span className="font-bold text-stone-900 text-xs uppercase tracking-wide">Total Tagihan (IDR):</span>
701:               <span className="font-black text-orange-600 text-sm sm:text-base">{formatCurrency(printInvoicePayment.amount)}</span>
702:             </div>
703:           </div>
704: 
705:           {/* Payment Details Box */}
706:           <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50/20 grid grid-cols-2 gap-5 mt-8 text-xs leading-relaxed">
707:             {/* Payment Instructions */}
708:             <div className="space-y-1.5">
709:               <h4 className="font-extrabold text-stone-400 uppercase tracking-widest text-[9px]">TATA CARA PEMBAYARAN</h4>
710:               <p className="text-stone-500 font-medium">
711:                 Mohon sertakan berita transfer nomor invoice saat melakukan pembayaran. Kirimkan konfirmasi bukti transfer melalui platform atau kirim ke WhatsApp 085156014905
712:               </p>
713:             </div>
714: 
715:             {/* Target Bank Account */}
716:             <div className="border-l border-stone-200 pl-5 space-y-0.5">
717:               <h4 className="font-extrabold text-stone-400 uppercase tracking-widest text-[9px] mb-1.5">REKENING TUJUAN</h4>
718:               <p className="font-extrabold text-stone-900">DIGIBANK by DBS</p>
719:               <p className="font-black text-orange-600 text-base tracking-wider">1702945239</p>
720:               <p className="text-stone-500 font-semibold">a.n. Muhammad Nanang Rizaldi</p>
721:             </div>
722:           </div>
723: 
724:           {/* Terms & Signature Section */}
725:           <div className="grid grid-cols-2 gap-8 mt-10 text-xs">
726:             {/* Terms and Conditions */}
727:             <div className="space-y-1.5">
728:               <h4 className="font-extrabold text-stone-400 uppercase tracking-widest text-[9px]">SYARAT & KETENTUAN</h4>
729:               <ol className="list-decimal pl-4 text-stone-500 space-y-0.5 font-medium leading-relaxed">
730:                 <li>Invoice ini adalah sah diterbitkan oleh perusahaan.</li>
731:                 <li>Tagihan ini berlaku sebagai kwitansi lunas yang sah apabila status tercantum LUNAS / PAID.</li>
732:               </ol>
733:             </div>
734: 
735:             {/* Signature */}
736:             <div className="flex flex-col items-end">
737:               <div className="flex flex-col items-center text-center space-y-12 w-48">
738:                 <h4 className="font-extrabold text-stone-400 uppercase tracking-widest text-[9px]">HORMAT KAMI,</h4>
739:                 <div className="space-y-1 w-full">
740:                   <p className="border-b border-dotted border-stone-400 pb-1.5 font-bold text-stone-900 w-full text-center">NanangMrk</p>
741:                   <p className="text-stone-500 text-[9px] font-semibold uppercase tracking-widest text-center w-full font-sans">NanangMrk Channel</p>
742:                 </div>
743:               </div>
744:             </div>
745:           </div>
746:         </div>
747:       )}
748: 
749:       {/* Modal Tambah Tahap Pembayaran */}
750:       {showAddModal && (
751:         <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
752:           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] overflow-hidden">
753:             {/* Header */}
754:             <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center shrink-0">
755:               <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
756:                 <Plus className="h-4.5 w-4.5 text-orange-500" /> Tambah Tahap Pembayaran
757:               </h3>
758:               <button
759:                 onClick={() => setShowAddModal(false)}
760:                 className="h-7 w-7 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"
761:                 type="button"
762:               >
763:                 <X className="h-4 w-4" />
764:               </button>
765:             </div>
766: 
767:             {/* Form */}
768:             <form onSubmit={handleAddPaymentSubmit} className="flex flex-col flex-1 overflow-hidden">
769:               <div className="p-6 space-y-4 overflow-y-auto flex-1">
770:                 {/* Judul/Nama Tahap */}
771:                 <div className="space-y-1">
772:                   <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Tahap Pembayaran</label>
773:                   <input
774:                     type="text"
775:                     required
776:                     placeholder="Contoh: Down Payment (DP) 50%, Termin 3"
777:                     value={newPayType}
778:                     onChange={(e) => setNewPayType(e.target.value)}
779:                     className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
780:                   />
781:                 </div>
782: 
783:                 {/* Nominal */}
784:                 <div className="space-y-1">
785:                   <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nominal (Rupiah)</label>
786:                   <input
787:                     type="number"
788:                     required
789:                     placeholder="Contoh: 4500000"
790:                     value={newPayAmount}
791:                     onChange={(e) => setNewPayAmount(e.target.value)}
792:                     className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
793:                   />
794:                   {newPayAmount && (
795:                     <p className="text-[11px] text-orange-600 font-bold font-mono mt-1">
796:                       Format: {formatCurrency(parseInt(newPayAmount) || 0)}
797:                     </p>
798:                   )}
799:                 </div>
800: 
801:                 {/* Deskripsi Tambahan */}
802:                 <div className="space-y-1">
803:                   <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Deskripsi (Opsional)</label>
804:                   <textarea
805:                     rows={3}
806:                     placeholder="Catatan tambahan untuk tahap ini..."
807:                     value={newPayDescription}
808:                     onChange={(e) => setNewPayDescription(e.target.value)}
809:                     className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
810:                   />
811:                 </div>
812: 
813:                 {/* Status Awal */}
814:                 <div className="space-y-1">
815:                   <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Status Awal</label>
816:                   <select
817:                     value={newPayStatus}
818:                     onChange={(e) => setNewPayStatus(e.target.value as PaymentStatus)}
819:                     className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
820:                   >
821:                     <option value="MENUNGGU">Menunggu Pembayaran</option>
822:                     <option value="PROSES_VERIFIKASI">Proses Verifikasi</option>
823:                     <option value="LUNAS">Lunas</option>
824:                   </select>
825:                 </div>
826:               </div>
827: 
828:               {/* Footer Action */}
829:               <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 shrink-0">
830:                 <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs">Batal</Button>
831:                 <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white text-xs">Simpan Tahapan</Button>
832:               </div>
833:             </form>
834:           </div>
835:         </div>
836:       )}
837: 
838:       {/* Modal Edit Tahap Pembayaran */}
839:       {showEditModal && (
840:         <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
841:           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] overflow-hidden">
842:             {/* Header */}
843:             <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center shrink-0">
844:               <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
845:                 <Pencil className="h-4.5 w-4.5 text-orange-500" /> Ubah Tahap Pembayaran
846:               </h3>
847:               <button
848:                 onClick={() => setShowEditModal(false)}
849:                 className="h-7 w-7 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"
850:                 type="button"
851:               >
852:                 <X className="h-4 w-4" />
853:               </button>
854:             </div>
855: 
856:             {/* Form */}
857:             <form onSubmit={handleEditPaymentSubmit} className="flex flex-col flex-1 overflow-hidden">
858:               <div className="p-6 space-y-4 overflow-y-auto flex-1">
859:                 {/* Judul/Nama Tahap */}
860:                 <div className="space-y-1">
861:                   <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Tahap Pembayaran</label>
862:                   <input
863:                     type="text"
864:                     required
865:                     placeholder="Contoh: Down Payment (DP) 50%, Termin 3"
866:                     value={editPayType}
867:                     onChange={(e) => setEditPayType(e.target.value)}
868:                     className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
869:                   />
870:                 </div>
871: 
872:                 {/* Nominal */}
873:                 <div className="space-y-1">
874:                   <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nominal (Rupiah)</label>
875:                   <input
876:                     type="number"
877:                     required
878:                     placeholder="Contoh: 4500000"
879:                     value={editPayAmount}
880:                     onChange={(e) => setEditPayAmount(e.target.value)}
881:                     className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
882:                   />
883:                   {editPayAmount && (
884:                     <p className="text-[11px] text-orange-600 font-bold font-mono mt-1">
885:                       Format: {formatCurrency(parseInt(editPayAmount) || 0)}
886:                     </p>
887:                   )}
888:                 </div>
889: 
890:                 {/* Deskripsi Tambahan */}
891:                 <div className="space-y-1">
892:                   <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Deskripsi (Opsional)</label>
893:                   <textarea
894:                     rows={3}
895:                     placeholder="Catatan tambahan untuk tahap ini..."
896:                     value={editPayDescription}
897:                     onChange={(e) => setEditPayDescription(e.target.value)}
898:                     className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
899:                   />
900:                 </div>
901:               </div>
902: 
903:               {/* Footer Action */}
904:               <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 shrink-0">
905:                 <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="text-xs">Batal</Button>
906:                 <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white text-xs">Simpan Perubahan</Button>
907:               </div>
908:             </form>
909:           </div>
910:         </div>
911:       )}
912:     </div>
913:   )
914: }
"""

with open('src/pages/projects/tabs/PaymentTab.tsx', 'w') as f:
    f.write(text.strip() + '\n')
