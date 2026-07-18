import re

with open('src/pages/invoice/invoice/InvoiceDetailPage.tsx', 'r') as f:
    text = f.read()

# 1. Add isDirty state
text = text.replace(
    "const [editBrandName, setEditBrandName] = useState(invoice.brand.name)",
    "const [editBrandName, setEditBrandName] = useState(invoice.brand.name)\n  const [isDirty, setIsDirty] = useState(false)"
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
    "const handleVerify = () => {",
    "const handleSimpanItem = () => {\n    setIsDirty(false)\n  }\n\n  const handleVerify = () => {"
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

# Need to replace the first <Button that isn't the share button if it exists, but the share button is first.
# Wait, let's replace `<Button \n            className="bg-white` with the button html + `<Button \n            className="bg-white`
text = text.replace(
    """<Button 
            className="bg-white hover:bg-muted text-foreground""",
    button_html + """ 
            className="bg-white hover:bg-muted text-foreground"""
)

with open('src/pages/invoice/invoice/InvoiceDetailPage.tsx', 'w') as f:
    f.write(text)
