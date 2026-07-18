import re

def remove_edit_button(filepath):
    with open(filepath, 'r') as f:
        text = f.read()
    
    # 1. Remove states
    text = re.sub(r'  const \[showEditModal, setShowEditModal\] = useState\(false\)\n', '', text)
    text = re.sub(r'  const \[editBrandName, setEditBrandName\] = useState\([^)]+\)\n', '', text)
    text = re.sub(r'  const \[editNumber, setEditNumber\] = useState\([^)]+\)\n', '', text)
    text = re.sub(r'  const \[editDueDate, setEditDueDate\] = useState\([^)]+\)\n', '', text)

    # 2. Remove state syncing in useEffect
    text = re.sub(r'    setEditBrandName\([^)]+\)\n', '', text)
    text = re.sub(r'    setEditNumber\([^)]+\)\n', '', text)
    text = re.sub(r'    setEditDueDate\([^)]+\)\n', '', text)

    # 3. Remove handleSaveHeader function
    text = re.sub(r'  const handleSaveHeader = \(e: React\.FormEvent\) => \{[\s\S]*?setShowEditModal\(false\)\n  \}\n', '', text)
    # Also handle alternate cases if it was named slightly different or has different body
    text = re.sub(r'  // Edit Header Modal Handler\n  const handleSaveHeader = \(e: React\.FormEvent\) => \{[\s\S]*?setShowEditModal\(false\)\n  \}\n', '', text)

    # 4. Remove Edit Data Utama button
    text = re.sub(r'\s*<Button \n\s*className="bg-white hover:bg-muted text-foreground border border-border shadow-sm text-xs font-semibold px-4 py-2"\n\s*onClick=\{.*?setShowEditModal\(true\)\}\n\s*>\n\s*Edit Data Utama\n\s*</Button>', '', text)
    text = re.sub(r'\s*<Button\s+className="bg-white hover:bg-muted text-foreground border border-border shadow-sm text-xs font-semibold px-4 py-2"\s+onClick=\{.*?setShowEditModal\(true\)\}\s*>\s*Edit Data Utama\s*</Button>', '', text)

    # 5. Remove Modal JSX
    text = re.sub(r'\s*\{\/\* Modal Edit Data Utama \*\/\}[\s\S]*?\}\)', '', text)

    with open(filepath, 'w') as f:
        f.write(text)

remove_edit_button('src/pages/invoice/quotation/QuotationDetailPage.tsx')
remove_edit_button('src/pages/invoice/invoice/InvoiceDetailPage.tsx')
