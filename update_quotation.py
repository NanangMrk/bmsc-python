import re

with open('src/pages/invoice/quotation/QuotationDetailPage.tsx', 'r') as f:
    text = f.read()

# 1. Add Edit button and modal states
text = text.replace(
    "const [quotation, setQuotation] = useState(initialQuo)",
    "const [quotation, setQuotation] = useState(initialQuo)\n  const [showEditModal, setShowEditModal] = useState(false)\n  const [editBrandName, setEditBrandName] = useState(quotation.brand.name)\n  const [editNumber, setEditNumber] = useState(quotation.number)"
)

# Sync modal states when quotation changes
text = text.replace(
    "setQuotation(found)",
    "setQuotation(found)\n    setEditBrandName(found.brand.name)\n    setEditNumber(found.number)"
)

# 2. Update functions to remove status === DRAFT restrictions
text = text.replace("if (quotation.status !== 'DRAFT') return\n", "")

# 3. Add Edit Modal submit handler
text = text.replace(
    "const updateItem =",
    """const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault()
    setQuotation({
      ...quotation,
      number: editNumber,
      brand: { ...quotation.brand, name: editBrandName }
    })
    setShowEditModal(false)
  }

  const updateItem ="""
)

# 4. Add "Edit Data Utama" button
text = text.replace(
    "<Button \n            className=\"bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm text-xs font-semibold px-5 py-2\"\n            icon={<Download className=\"h-3.5 w-3.5\" />}\n            onClick={() => window.print()}\n          >\n            Cetak / Simpan PDF\n          </Button>",
    """<Button 
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
)

# 5. Remove status === DRAFT conditionals around inputs
text = re.sub(r'\{quotation\.status === \'DRAFT\' \? \(\s*([\s\S]*?)\s*\) : \(\s*[\s\S]*?\s*\)\}', r'\1', text)
text = text.replace("{quotation.status === 'DRAFT' && (", "{true && (")
text = text.replace("colSpan={quotation.status === 'DRAFT' ? 6 : 5}", "colSpan={6}")

# 6. Add the Edit Header Modal at the end of the file
modal_html = """
      {/* Modal Edit Data Utama */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wide text-foreground">Edit Data Utama Quotation</h3>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveHeader} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Nomor Quotation</label>
                <input type="text" required value={editNumber} onChange={(e) => setEditNumber(e.target.value)} className="w-full h-9 px-3 rounded-lg border text-sm focus:ring-1 focus:ring-orange-500" />
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

# Fix lucide import
text = text.replace("import { ArrowLeft, Trash2, Send, FileText, Download } from 'lucide-react'", "import { ArrowLeft, Trash2, Send, FileText, Download, X } from 'lucide-react'")

with open('src/pages/invoice/quotation/QuotationDetailPage.tsx', 'w') as f:
    f.write(text)
