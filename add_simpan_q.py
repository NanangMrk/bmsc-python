import re

with open('src/pages/invoice/quotation/QuotationDetailPage.tsx', 'r') as f:
    text = f.read()

# 1. Add isDirty state
text = text.replace(
    "const [editBrandName, setEditBrandName] = useState(quotation.brand.name)",
    "const [editBrandName, setEditBrandName] = useState(quotation.brand.name)\n  const [isDirty, setIsDirty] = useState(false)"
)

# 2. Add setIsDirty(true) to update functions
text = text.replace(
    "const updateItem = (itemId: string, field: 'name' | 'qty' | 'price' | 'unit', value: string | number) => {",
    "const updateItem = (itemId: string, field: 'name' | 'qty' | 'price' | 'unit', value: string | number) => {\n    setIsDirty(true)"
)
text = text.replace(
    "const addBlankItem = () => {",
    "const addBlankItem = () => {\n    setIsDirty(true)"
)
text = text.replace(
    "const removeItem = (itemId: string) => {",
    "const removeItem = (itemId: string) => {\n    setIsDirty(true)"
)

# 3. Add handleSave action
text = text.replace(
    "const calculateSubtotal = () => {",
    "const handleSimpanItem = () => {\n    setIsDirty(false)\n  }\n\n  const calculateSubtotal = () => {"
)

# 4. Add Button to UI
button_html = """{isDirty && (
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm text-xs font-semibold px-4 py-2 animate-in fade-in zoom-in duration-300"
              onClick={handleSimpanItem}
            >
              Simpan Perubahan
            </Button>
          )}
          <Button"""

text = text.replace("<Button", button_html, 1)

with open('src/pages/invoice/quotation/QuotationDetailPage.tsx', 'w') as f:
    f.write(text)
