import re

with open('src/pages/invoice/quotation/QuotationListPage.tsx', 'r') as f:
    text = f.read()

# Add editingId state and functions
states = """  const [isOpen, setIsOpen] = useState(false)
  const [brandId, setBrandId] = useState(mockBrands[0].id)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'TERKIRIM'>('DRAFT')
  const [items, setItems] = useState<Array<{
    id: string
    name: string
    qty: number
    unit: string
    price: number
  }>>([
    { id: '1', name: 'Instagram Reels', qty: 1, unit: 'video', price: 1500000 }
  ])"""

new_states = """  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [brandId, setBrandId] = useState(mockBrands[0].id)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'TERKIRIM'>('DRAFT')
  const [items, setItems] = useState<Array<{
    id: string
    name: string
    qty: number
    unit: string
    price: number
  }>>([
    { id: '1', name: 'Instagram Reels', qty: 1, unit: 'video', price: 1500000 }
  ])

  const openCreateDrawer = () => {
    setEditingId(null)
    setBrandId(mockBrands[0].id)
    setStatus('DRAFT')
    setItems([{ id: '1', name: 'Instagram Reels', qty: 1, unit: 'video', price: 1500000 }])
    setNote('')
    setIsOpen(true)
  }

  const openEditDrawer = (q: typeof quotations[0]) => {
    setEditingId(q.id)
    setBrandId(q.brandId)
    setStatus(q.status as any)
    setItems([...q.items])
    setNote(q.note || '')
    setIsOpen(true)
  }"""

text = text.replace(states, new_states)
text = text.replace("import { MoreHorizontal } from 'lucide-react'", "") # cleanup unused

with open('src/pages/invoice/quotation/QuotationListPage.tsx', 'w') as f:
    f.write(text)
