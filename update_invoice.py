import re

with open('src/pages/invoice/invoice/InvoiceDetailPage.tsx', 'r') as f:
    text = f.read()

# 1. Update imports
text = text.replace(
    "import { ArrowLeft, Upload, CheckCircle2, Download, Share2 } from 'lucide-react'",
    "import { ArrowLeft, Upload, CheckCircle2, Download, Share2, X, Trash2 } from 'lucide-react'"
)

# 2. Add Edit modal states and handle items
init_state = """  const initialInv = mockInvoices.find((i) => i.id === id) ?? mockInvoices[0]
  const [invoice, setInvoice] = useState(initialInv)"""

new_init_state = """  const initialInv = mockInvoices.find((i) => i.id === id) ?? mockInvoices[0]
  const initialQuo = mockQuotations.find((q) => q.id === initialInv.quotationId)
  
  // Make sure invoice has items (either from mock or fallback to quotation items)
  const initialItems = initialInv.items || (initialQuo ? initialQuo.items : [])
  const [invoice, setInvoice] = useState({ ...initialInv, items: initialItems })

  const [showEditModal, setShowEditModal] = useState(false)
  const [editBrandName, setEditBrandName] = useState(invoice.brand.name)
  const [editNumber, setEditNumber] = useState(invoice.number)
  const [editDueDate, setEditDueDate] = useState(invoice.dueDate)"""

text = text.replace(init_state, new_init_state)

sync_state = """  useEffect(() => {
    const found = mockInvoices.find((i) => i.id === id) ?? mockInvoices[0]
    setInvoice(found)
  }, [id])"""

new_sync_state = """  useEffect(() => {
    const found = mockInvoices.find((i) => i.id === id) ?? mockInvoices[0]
    const quo = mockQuotations.find((q) => q.id === found.quotationId)
    const items = found.items || (quo ? quo.items : [])
    setInvoice({ ...found, items })
    setEditBrandName(found.brand.name)
    setEditNumber(found.number)
    setEditDueDate(found.dueDate)
  }, [id])"""

text = text.replace(sync_state, new_sync_state)

# 3. Add Item Editing Functions and Modal Submit
edit_funcs = """  // Fetch associated project and quotation details based on stateful invoice
  const project = mockProjects.find((p) => p.id === invoice.projectId)
  const quotation = mockQuotations.find((q) => q.id === invoice.quotationId)

  // Edit Header Modal Handler
  const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault()
    setInvoice({
      ...invoice,
      number: editNumber,
      dueDate: editDueDate,
      brand: { ...invoice.brand, name: editBrandName }
    })
    setShowEditModal(false)
  }

  // Item Editing Functions
  const updateItem = (itemId: string, field: 'name' | 'qty' | 'price' | 'unit', value: string | number) => {
    const items = invoice.items || []
    const updatedItems = items.map(item => {
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
      total: updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
    })
  }

  const addBlankItem = () => {
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
      total: updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
    })
  }

  const removeItem = (itemId: string) => {
    const items = invoice.items || []
    const updatedItems = items.filter(item => item.id !== itemId)
    setInvoice({
      ...invoice,
      items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
    })
  }
"""

text = text.replace(
    "  // Fetch associated project and quotation details based on stateful invoice\n  const project = mockProjects.find((p) => p.id === invoice.projectId)\n  const quotation = mockQuotations.find((q) => q.id === invoice.quotationId)\n",
    edit_funcs
)

# 4. Add "Edit Data Utama" button
buttons = """          {invoice.shareToken && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs font-semibold px-4 py-2"
              icon={<Share2 className="h-3.5 w-3.5" />}
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/invoice/invoice/${invoice.id}`)
                alert('Link invoice berhasil disalin!')
              }}
            >
              Salin Link Invoice
            </Button>
          )}
          <Button 
            className="bg-white hover:bg-muted text-foreground border border-border shadow-sm text-xs font-semibold px-4 py-2"
            onClick={() => setShowEditModal(true)}
          >
            Edit Data Utama
          </Button>
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm text-xs font-semibold px-5 py-2"
            icon={<Download className="h-3.5 w-3.5" />}
            onClick={() => window.print()}
          >
            Cetak / Simpan PDF
          </Button>"""

text = re.sub(r'\{invoice\.shareToken && \(\s*<Button[\s\S]*?Cetak / Simpan PDF\n\s*</Button>', buttons, text)


# 5. Update Items Table rendering
table_header = """                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-muted-foreground text-left font-semibold">
                      <th className="px-5 py-3.5 font-bold">Deskripsi Pekerjaan / Layanan</th>
                      <th className="px-3 py-3.5 text-center font-bold w-20">Volume</th>
                      <th className="px-3 py-3.5 text-center font-bold w-20">Satuan</th>
                      <th className="px-4 py-3.5 text-right font-bold w-32">Harga Satuan</th>
                      <th className="px-5 py-3.5 text-right font-bold w-36">Total</th>
                      <th className="px-3 py-3.5 w-10 print:hidden" />
                    </tr>
                  </thead>"""

text = re.sub(r'<thead>[\s\S]*?</thead>', table_header, text)


table_body = """                  <tbody className="divide-y divide-gray-100 font-medium text-foreground">
                    {(invoice.items && invoice.items.length > 0) ? (
                      invoice.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/30">
                          <td className="px-5 py-3 font-bold text-foreground/80">
                            <input
                              type="text"
                              value={item.name}
                              placeholder="Masukkan Deskripsi Pekerjaan"
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                              className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </td>
                          <td className="px-3 py-3 text-center font-bold">
                            <input
                              type="number"
                              value={item.qty}
                              min="1"
                              onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                              className="w-full h-8 text-center rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </td>
                          <td className="px-3 py-3 text-center text-muted-foreground capitalize">
                            <input
                              type="text"
                              value={item.unit}
                              placeholder="video"
                              onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                              className="w-full h-8 text-center rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            <input
                              type="number"
                              value={item.price}
                              min="0"
                              onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                              className="w-full h-8 text-right px-2 rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-400 font-mono"
                            />
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-foreground">{formatCurrency(item.subtotal)}</td>
                          <td className="px-3 py-3 text-center print:hidden">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground italic">
                          Belum ada item tagihan. Klik "Tambah Item Manual".
                        </td>
                      </tr>
                    )}
                  </tbody>"""

text = re.sub(r'<tbody className="divide-y divide-gray-100 font-medium text-foreground">[\s\S]*?</tbody>', table_body, text)

# Add button "Tambah Item Manual"
item_desc = """              <div className="flex justify-between items-center print:hidden">
                <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">DESKRIPSI ITEM PEKERJAAN</h3>
                <button 
                  onClick={addBlankItem}
                  className="text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
                >
                  + Tambah Item Manual
                </button>
              </div>
              <h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest hidden print:block">DESKRIPSI ITEM PEKERJAAN</h3>"""

text = text.replace('<h3 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">DESKRIPSI ITEM PEKERJAAN</h3>', item_desc)

# 6. Add the Edit Header Modal at the end of the file
modal_html = """
      {/* Modal Edit Data Utama */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wide text-foreground">Edit Data Utama Invoice</h3>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveHeader} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Nomor Invoice</label>
                <input type="text" required value={editNumber} onChange={(e) => setEditNumber(e.target.value)} className="w-full h-9 px-3 rounded-lg border text-sm focus:ring-1 focus:ring-orange-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Tenggat Waktu (Jatuh Tempo)</label>
                <input type="date" required value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="w-full h-9 px-3 rounded-lg border text-sm focus:ring-1 focus:ring-orange-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Nama Brand / Client</label>
                <input type="text" required value={editBrandName} onChange={(e) => setEditBrandName(e.target.value)} className="w-full h-9 px-3 rounded-lg border text-sm focus:ring-1 focus:ring-orange-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Batal</Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
"""
text = text.replace("    </div>\n  )\n}", modal_html + "    </div>\n  )\n}")

with open('src/pages/invoice/invoice/InvoiceDetailPage.tsx', 'w') as f:
    f.write(text)
