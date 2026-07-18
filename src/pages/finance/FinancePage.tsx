import { useState, useMemo } from 'react'
import {
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Calendar,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingUp,
  Tag,
  DollarSign,
  Printer
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, cn } from '@/lib/utils'
import { mockInvoices } from '@/lib/mock-data'

interface Transaction {
  id: string
  name: string
  category: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  date: string
  status: 'SUCCESS' | 'PENDING'
}

const INITIAL_EXPENSES_AND_OTHER_INCOME: Transaction[] = [
  {
    id: 't-2',
    name: 'Sewa Domain & Server Hosting bmsc.id',
    category: 'Server & Domain',
    type: 'EXPENSE',
    amount: 850000,
    date: '2025-01-18',
    status: 'SUCCESS'
  },
  {
    id: 't-3',
    name: 'Gaji Kontrak Editor Video (Nadia Rahman)',
    category: 'Operasional/Gaji',
    type: 'EXPENSE',
    amount: 4500000,
    date: '2025-01-28',
    status: 'SUCCESS'
  },
  {
    id: 't-6',
    name: 'Pembelian Microphone Wireless DJI Mic 2',
    category: 'Peralatan',
    type: 'EXPENSE',
    amount: 5200000,
    date: '2025-02-20',
    status: 'SUCCESS'
  },
  {
    id: 't-7',
    name: 'Transportasi Liputan Event TechVision',
    category: 'Transportasi',
    type: 'EXPENSE',
    amount: 450000,
    date: '2025-02-22',
    status: 'SUCCESS'
  },
  {
    id: 't-8',
    name: 'AdSense YouTube Bulanan - Januari',
    category: 'Platform Adsense',
    type: 'INCOME',
    amount: 8200000,
    date: '2025-02-25',
    status: 'SUCCESS'
  },
  {
    id: 't-9',
    name: 'Biaya Iklan Facebook Ads - Campaign Kopi',
    category: 'Marketing',
    type: 'EXPENSE',
    amount: 2000000,
    date: '2025-02-26',
    status: 'SUCCESS'
  }
]

const INCOME_CATEGORIES = ['Project', 'Platform Adsense', 'Afiliasi', 'Sponsor Video', 'Lainnya']
const EXPENSE_CATEGORIES = ['Operasional/Gaji', 'Server & Domain', 'Peralatan', 'Transportasi', 'Marketing', 'Lainnya']

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#64748b', '#ec4899']
const EXPENSE_COLORS = ['#f43f5e', '#ec4899', '#f472b6', '#fb7185', '#be123c', '#9f1239']

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const mappedInvoices: Transaction[] = mockInvoices.map((inv) => ({
      id: inv.id,
      name: `Invoice ${inv.number} - ${inv.brand.name}`,
      category: 'Project',
      type: 'INCOME',
      amount: inv.total,
      date: inv.createdAt,
      status: inv.status === 'LUNAS' ? 'SUCCESS' : 'PENDING'
    }))
    return [...mappedInvoices, ...INITIAL_EXPENSES_AND_OTHER_INCOME]
  })
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Period filter states
  const [periodType, setPeriodType] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30_DAYS' | 'THIS_YEAR' | 'CUSTOM'>('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Print options states
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [printKPI, setPrintKPI] = useState(true)
  const [printAreaChart, setPrintAreaChart] = useState(true)
  const [printPieChart, setPrintPieChart] = useState(true)
  const [printExpenseChart, setPrintExpenseChart] = useState(true)
  const [printTable, setPrintTable] = useState(true)

  // Dynamically filter transactions by period
  const periodFilteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (periodType === 'ALL') return true
      
      const txDate = new Date(tx.date)
      const now = new Date()
      
      if (periodType === 'THIS_MONTH') {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
      }
      if (periodType === 'LAST_30_DAYS') {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(now.getDate() - 30)
        return txDate >= thirtyDaysAgo && txDate <= now
      }
      if (periodType === 'THIS_YEAR') {
        return txDate.getFullYear() === 2025 // Mock data is in 2025
      }
      if (periodType === 'CUSTOM') {
        if (!startDate && !endDate) return true
        const start = startDate ? new Date(startDate) : new Date('1970-01-01')
        const end = endDate ? new Date(endDate) : new Date('2099-12-31')
        end.setHours(23, 59, 59, 999)
        return txDate >= start && txDate <= end
      }
      
      return true
    })
  }, [transactions, periodType, startDate, endDate])

  // Form states
  const [incomeCategories, setIncomeCategories] = useState(INCOME_CATEGORIES)
  const [expenseCategories, setExpenseCategories] = useState(EXPENSE_CATEGORIES)
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [customCategoryName, setCustomCategoryName] = useState('')

  const [newTxName, setNewTxName] = useState('')
  const [newTxType, setNewTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [newTxCategory, setNewTxCategory] = useState(INCOME_CATEGORIES[0])
  const [newTxAmount, setNewTxAmount] = useState('')
  const [newTxDate, setNewTxDate] = useState(new Date().toISOString().split('T')[0])
  const [newTxStatus, setNewTxStatus] = useState<'SUCCESS' | 'PENDING'>('SUCCESS')

  // Calculate dynamic stats
  const stats = useMemo(() => {
    let totalIncome = 0
    let totalExpense = 0
    let activeInvoices = 0 // Pending income invoices

    periodFilteredTransactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        if (tx.status === 'SUCCESS') {
          totalIncome += tx.amount
        } else {
          activeInvoices += tx.amount
        }
      } else if (tx.type === 'EXPENSE' && tx.status === 'SUCCESS') {
        totalExpense += tx.amount
      }
    })

    const netProfit = totalIncome - totalExpense

    return {
      netProfit,
      totalIncome,
      totalExpense,
      activeInvoices
    }
  }, [periodFilteredTransactions])

  // Process data for AreaChart (Revenue vs Expenses by Month)
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun']
    const dataMap: Record<string, { income: number; expense: number }> = {}
    
    months.forEach((m) => {
      dataMap[m] = { income: 0, expense: 0 }
    })

    periodFilteredTransactions.forEach((tx) => {
      if (tx.status !== 'SUCCESS') return // Only success transactions in chart
      const txMonthIndex = new Date(tx.date).getMonth()
      const mLabel = months[txMonthIndex]
      if (mLabel && dataMap[mLabel]) {
        if (tx.type === 'INCOME') {
          dataMap[mLabel].income += tx.amount
        } else {
          dataMap[mLabel].expense += tx.amount
        }
      }
    })

    return months.map((m) => ({
      month: m,
      Pemasukan: dataMap[m].income,
      Pengeluaran: dataMap[m].expense
    }))
  }, [periodFilteredTransactions])

  // Process data for PieChart (Income source categories)
  const incomeCategoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {}

    periodFilteredTransactions.forEach((tx) => {
      if (tx.type === 'INCOME' && tx.status === 'SUCCESS') {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount
      }
    })

    return Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat]
    }))
  }, [periodFilteredTransactions])

  // Process data for PieChart (Expense source categories)
  const expenseCategoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {}

    periodFilteredTransactions.forEach((tx) => {
      if (tx.type === 'EXPENSE' && tx.status === 'SUCCESS') {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount
      }
    })

    return Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat]
    }))
  }, [periodFilteredTransactions])

  // Filtered Transactions list
  const filteredTransactions = useMemo(() => {
    return periodFilteredTransactions.filter((tx) => {
      const matchesType = filterType === 'ALL' || tx.type === filterType
      const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tx.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [periodFilteredTransactions, filterType, searchQuery])

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTxName.trim() || !newTxAmount) {
      alert('Nama transaksi dan nominal wajib diisi')
      return
    }

    let finalCategory = newTxCategory
    if (isCustomCategory) {
      const name = customCategoryName.trim()
      if (!name) {
        alert('Silakan isi nama kategori baru')
        return
      }
      if (newTxType === 'INCOME') {
        if (!incomeCategories.includes(name)) {
          setIncomeCategories((prev) => [...prev, name])
        }
      } else {
        if (!expenseCategories.includes(name)) {
          setExpenseCategories((prev) => [...prev, name])
        }
      }
      finalCategory = name
      setIsCustomCategory(false)
      setCustomCategoryName('')
    }

    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      name: newTxName,
      type: newTxType,
      category: finalCategory,
      amount: parseInt(newTxAmount) || 0,
      date: newTxDate,
      status: newTxStatus
    }

    setTransactions((prev) => [newTx, ...prev])
    setShowAddModal(false)

    // Reset Form
    setNewTxName('')
    setNewTxAmount('')
    setNewTxDate(new Date().toISOString().split('T')[0])
    setNewTxStatus('SUCCESS')

    triggerNotification('Transaksi berhasil dicatat!')
  }

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      triggerNotification('Transaksi berhasil dihapus.')
    }
  }

  const handleExport = (format: 'CSV' | 'PDF') => {
    triggerNotification(`Laporan berhasil diekspor ke ${format}! Mengunduh file...`)
  }

  const handlePrintPDF = () => {
    setShowPrintModal(true)
  }

  const triggerNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleTypeChange = (type: 'INCOME' | 'EXPENSE') => {
    setNewTxType(type)
    setIsCustomCategory(false)
    setNewTxCategory(type === 'INCOME' ? incomeCategories[0] : expenseCategories[0])
  }

  return (
    <div className="space-y-6 print-container">
      {/* Print specific CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          aside, header, nav, button, .no-print, .toast-notif, select, input, .fixed {
            display: none !important;
          }
          body, main, .print-container {
            background: white !important;
            color: #1c1917 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .print-layout {
            display: block !important;
            width: 100% !important;
            font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
            color: #1c1917 !important;
          }
          .print-card {
            border: 1px solid #e5e7eb !important;
            border-radius: 12px !important;
            padding: 16px !important;
            background: #ffffff !important;
            break-inside: avoid !important;
          }
          .print-grid-4 {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 12px !important;
            width: 100% !important;
          }
          .print-grid-4 > div {
            flex: 1 1 25% !important;
            width: 25% !important;
          }
          .print-grid-2 {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 16px !important;
            width: 100% !important;
          }
          .print-grid-2 > div {
            flex: 1 1 50% !important;
            width: 50% !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          table th {
            background-color: #f9fafb !important;
            color: #374151 !important;
            border-bottom: 2px solid #e5e7eb !important;
            padding: 8px !important;
          }
          table td {
            border-bottom: 1px solid #f3f4f6 !important;
            padding: 8px !important;
          }
        }
      `}} />

      {/* Screen Only Content Wrapper */}
      <div className="no-print space-y-6">

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 bg-stone-950 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 z-50 toast-notif no-print">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-orange-500" /> Laporan Keuangan
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola arus kas, pemasukan dari platform, dan pengeluaran operasional</p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrintPDF} 
            className="flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4 text-blue-600" /> Cetak PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport('CSV')} 
            className="flex items-center gap-1.5"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Ekspor CSV
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)} 
            className="bg-orange-500 hover:bg-orange-650 text-white flex items-center gap-1.5"
            size="sm"
          >
            <Plus className="h-4 w-4" /> Catat Transaksi
          </Button>
        </div>
      </div>

      {/* Global Period Filter Card */}
      <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">Filter Periode:</span>
          <select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value as any)}
            className="h-8 px-2.5 rounded-lg border border-stone-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
          >
            <option value="ALL">Semua Periode</option>
            <option value="THIS_MONTH">Bulan Ini</option>
            <option value="LAST_30_DAYS">30 Hari Terakhir</option>
            <option value="THIS_YEAR">Tahun Ini (2025)</option>
            <option value="CUSTOM">Rentang Tanggal Kustom...</option>
          </select>
        </div>

        {periodType === 'CUSTOM' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150 w-full sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 px-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
            />
            <span className="text-xs text-stone-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 px-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
            />
          </div>
        )}
      </Card>

      {/* KPI Cards Grid */}
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 grid-print", !printKPI && "no-print")}>
        <Card className="p-5 border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/20 to-transparent">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Laba Bersih</p>
              <p className="text-2xl font-black mt-1.5 text-emerald-600">{formatCurrency(stats.netProfit)}</p>
              <p className="text-xs text-muted-foreground mt-1">Selisih pemasukan - pengeluaran</p>
            </div>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/20 to-transparent">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pemasukan</p>
              <p className="text-2xl font-black mt-1.5 text-blue-600">{formatCurrency(stats.totalIncome)}</p>
              <p className="text-xs text-muted-foreground mt-1">Invoice lunas & adsense masuk</p>
            </div>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50/20 to-transparent">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pengeluaran</p>
              <p className="text-2xl font-black mt-1.5 text-rose-600">{formatCurrency(stats.totalExpense)}</p>
              <p className="text-xs text-muted-foreground mt-1">Operasional & peralatan lunas</p>
            </div>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/20 to-transparent">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tagihan Aktif</p>
              <p className="text-2xl font-black mt-1.5 text-amber-600">{formatCurrency(stats.activeInvoices)}</p>
              <p className="text-xs text-muted-foreground mt-1">Invoice pending / belum dibayar</p>
            </div>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Analytics */}
      <div className="space-y-6">
        {/* Cashflow trends chart */}
        <Card className={cn("w-full", !printAreaChart && "no-print")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900">Arus Kas Bulanan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Perbandingan pemasukan vs pengeluaran lunas</p>
              </div>
              <span className="text-[10px] font-extrabold text-orange-500 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-md">
                Tahun 2025
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Pemasukan" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Pengeluaran" stroke="#f43f5e" strokeWidth={2.5} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Row 2: Distribution Charts */}
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-5 grid-print-charts", (!printPieChart && !printExpenseChart) && "no-print")}>
          {/* Income distribution chart */}
          <Card className={cn(!printPieChart && "no-print")}>
            <CardHeader>
              <h3 className="font-bold text-stone-900">Alokasi Pemasukan</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Persentase sumber pemasukan lunas</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {incomeCategoryData.length > 0 ? (
                <>
                  <div className="h-48 w-full flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {incomeCategoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full space-y-2 mt-2">
                    {incomeCategoryData.map((data, idx) => (
                      <div key={data.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="text-stone-600 font-medium">{data.name}</span>
                        </div>
                        <span className="font-bold text-stone-900">{formatCurrency(data.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-stone-500">
                  Tidak ada data pemasukan
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense distribution chart */}
          <Card className={cn(!printExpenseChart && "no-print")}>
            <CardHeader>
              <h3 className="font-bold text-stone-900">Rincian Pengeluaran</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Persentase pengeluaran per kategori</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {expenseCategoryData.length > 0 ? (
                <>
                  <div className="h-48 w-full flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {expenseCategoryData.map((_, index) => (
                            <Cell key={`cell-exp-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full space-y-2 mt-2">
                    {expenseCategoryData.map((data, idx) => (
                      <div key={data.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_COLORS[idx % EXPENSE_COLORS.length] }} />
                          <span className="text-stone-600 font-medium">{data.name}</span>
                        </div>
                        <span className="font-bold text-stone-900">{formatCurrency(data.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-stone-500">
                  Tidak ada data pengeluaran
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Log Table */}
      <Card className={cn("no-print", !printTable && "no-print")}>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-stone-900">Log Arus Kas & Transaksi</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Riwayat lengkap mutasi kas keuangan</p>
            </div>

            {/* Filter & Search actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Type filter toggles */}
              <div className="flex bg-stone-100 p-0.5 rounded-xl border border-stone-200">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'ALL'
                      ? 'bg-white text-stone-800 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterType('INCOME')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'INCOME'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  onClick={() => setFilterType('EXPENSE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'EXPENSE'
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Pengeluaran
                </button>
              </div>

              {/* Search text input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-stone-50/50">
                  <th className="px-5 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Transaksi</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Tipe</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Nominal</th>
                  <th className="px-5 py-3 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-stone-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-stone-400" /> {tx.date}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-stone-800 text-xs sm:text-sm line-clamp-1">{tx.name}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 bg-stone-100/80 px-2 py-0.5 rounded-md border border-stone-200/50">
                          <Tag className="h-3 w-3 text-stone-400" /> {tx.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {tx.type === 'INCOME' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                            <ArrowUpRight className="h-3 w-3" /> Pemasukan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                            <ArrowDownRight className="h-3 w-3" /> Pengeluaran
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={tx.status} size="sm" />
                      </td>
                      <td className={`px-4 py-4 text-right font-mono font-bold text-xs whitespace-nowrap ${
                        tx.type === 'INCOME' ? 'text-blue-600' : 'text-rose-600'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="h-8 w-8 text-stone-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg flex items-center justify-center mx-auto transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-xs text-muted-foreground">
                      Tidak ada transaksi yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* ------------------ PRINT-ONLY DEDICATED REPORT TEMPLATE ------------------ */}
    <div className="hidden print:block print-layout space-y-6">
      
      {/* Document Header */}
      <div className="border-b-4 border-orange-500 pb-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest">Laporan Resmi</p>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight mt-1">LAPORAN KEUANGAN BMSC</h1>
            <p className="text-xs text-stone-500 mt-1">Sistem Manajemen Bisnis & Kreator (BMSC)</p>
          </div>
          <div className="text-right text-xs text-stone-500 space-y-1">
            <p><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><strong>Periode:</strong> {
              periodType === 'ALL' ? 'Semua Periode' :
              periodType === 'THIS_MONTH' ? 'Bulan Ini' :
              periodType === 'LAST_30_DAYS' ? '30 Hari Terakhir' :
              periodType === 'THIS_YEAR' ? 'Tahun Ini (2025)' :
              `${startDate || 'Awal'} s/d ${endDate || 'Akhir'}`
            }</p>
          </div>
        </div>
      </div>

      {/* 1. Ringkasan Finansial (KPI Grid) */}
      {printKPI && (
        <div className="print-grid-4">
          <div className="print-card border border-stone-200 p-4 rounded-xl bg-stone-50/50">
            <p className="text-[9px] font-bold uppercase tracking-wider text-stone-500">Laba Bersih</p>
            <p className="text-lg font-black mt-1 text-emerald-600 font-mono">{formatCurrency(stats.netProfit)}</p>
          </div>
          <div className="print-card border border-stone-200 p-4 rounded-xl bg-stone-50/50">
            <p className="text-[9px] font-bold uppercase tracking-wider text-stone-500">Total Pemasukan</p>
            <p className="text-lg font-black mt-1 text-blue-600 font-mono">{formatCurrency(stats.totalIncome)}</p>
          </div>
          <div className="print-card border border-stone-200 p-4 rounded-xl bg-stone-50/50">
            <p className="text-[9px] font-bold uppercase tracking-wider text-stone-500">Total Pengeluaran</p>
            <p className="text-lg font-black mt-1 text-rose-600 font-mono">{formatCurrency(stats.totalExpense)}</p>
          </div>
          <div className="print-card border border-stone-200 p-4 rounded-xl bg-stone-50/50">
            <p className="text-[9px] font-bold uppercase tracking-wider text-stone-500">Tagihan Aktif</p>
            <p className="text-lg font-black mt-1 text-amber-600 font-mono">{formatCurrency(stats.activeInvoices)}</p>
          </div>
        </div>
      )}

      {/* 2. Tren Arus Kas (Area Chart) */}
      {printAreaChart && (
        <div className="print-card border border-stone-200 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Grafik Tren Bulanan (Pemasukan vs Pengeluaran)</h3>
          <div className="flex justify-center py-2">
            <AreaChart width={650} height={180} data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
              <defs>
                <linearGradient id="printColorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="printColorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
              />
              <Area type="monotone" dataKey="Pemasukan" stroke="#3b82f6" strokeWidth={2} fill="url(#printColorIncome)" />
              <Area type="monotone" dataKey="Pengeluaran" stroke="#f43f5e" strokeWidth={2} fill="url(#printColorExpense)" />
            </AreaChart>
          </div>
        </div>
      )}

      {/* 3. Distribution Tables (Income vs Expense breakdown side by side) */}
      <div className={cn("print-grid-2", (!printPieChart && !printExpenseChart) && "no-print")}>
        {/* Income Breakdown */}
        <div className={cn("print-card border border-stone-200 p-4 rounded-xl space-y-3", !printPieChart && "no-print")}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Rincian Sumber Pemasukan</h3>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                <th className="px-2 py-1.5 text-left font-bold">Kategori</th>
                <th className="px-2 py-1.5 text-right font-bold">Nominal</th>
                <th className="px-2 py-1.5 text-right font-bold">Porsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {incomeCategoryData.map((data, idx) => {
                const totalIncomeVal = incomeCategoryData.reduce((sum, d) => sum + d.value, 0)
                const pct = totalIncomeVal > 0 ? ((data.value / totalIncomeVal) * 100).toFixed(1) : '0.0'
                return (
                  <tr key={`print-inc-item-${idx}`}>
                    <td className="px-2 py-1.5 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="font-medium text-stone-850">{data.name}</span>
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono font-semibold">{formatCurrency(data.value)}</td>
                    <td className="px-2 py-1.5 text-right text-stone-500 font-bold">{pct}%</td>
                  </tr>
                )
              })}
              {incomeCategoryData.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-2 py-4 text-center text-stone-400">Tidak ada data pemasukan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Expense Breakdown */}
        <div className={cn("print-card border border-stone-200 p-4 rounded-xl space-y-3", !printExpenseChart && "no-print")}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Rincian Alokasi Pengeluaran</h3>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                <th className="px-2 py-1.5 text-left font-bold">Kategori</th>
                <th className="px-2 py-1.5 text-right font-bold">Nominal</th>
                <th className="px-2 py-1.5 text-right font-bold">Porsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {expenseCategoryData.map((data, idx) => {
                const totalExpenseVal = expenseCategoryData.reduce((sum, d) => sum + d.value, 0)
                const pct = totalExpenseVal > 0 ? ((data.value / totalExpenseVal) * 100).toFixed(1) : '0.0'
                return (
                  <tr key={`print-exp-item-${idx}`}>
                    <td className="px-2 py-1.5 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_COLORS[idx % EXPENSE_COLORS.length] }} />
                      <span className="font-medium text-stone-850">{data.name}</span>
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono font-semibold">{formatCurrency(data.value)}</td>
                    <td className="px-2 py-1.5 text-right text-stone-500 font-bold">{pct}%</td>
                  </tr>
                )
              })}
              {expenseCategoryData.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-2 py-4 text-center text-stone-400">Tidak ada data pengeluaran</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Complete Ledger Table */}
      {printTable && (
        <div className="print-card border border-stone-200 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Daftar Rincian Mutasi Arus Kas</h3>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b-2 border-stone-300 bg-stone-50 text-stone-600 text-left font-bold">
                <th className="px-3 py-2">Tanggal</th>
                <th className="px-3 py-2">Transaksi</th>
                <th className="px-3 py-2">Kategori</th>
                <th className="px-3 py-2">Tipe</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150">
              {periodFilteredTransactions.map((tx, idx) => (
                <tr key={`print-ledger-item-${tx.id}`} className={cn("break-inside-avoid", idx % 2 === 1 && "bg-stone-50/30")}>
                  <td className="px-3 py-2 text-stone-500 font-medium whitespace-nowrap">{tx.date}</td>
                  <td className="px-3 py-2 font-semibold text-stone-800">{tx.name}</td>
                  <td className="px-3 py-2 text-stone-600 font-medium">{tx.category}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {tx.type === 'INCOME' ? (
                      <span className="text-blue-700 font-bold text-[9px]">Pemasukan</span>
                    ) : (
                      <span className="text-rose-700 font-bold text-[9px]">Pengeluaran</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-stone-600 whitespace-nowrap">
                    {tx.status === 'SUCCESS' ? 'Berhasil' : 'Pending'}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono font-bold whitespace-nowrap ${
                    tx.type === 'INCOME' ? 'text-blue-600' : 'text-rose-600'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer info */}
      <div className="text-center pt-8 text-[9px] text-stone-400 border-t border-stone-200">
        <p>Laporan Keuangan ini dihasilkan secara otomatis oleh sistem BMSC.</p>
        <p className="mt-0.5">© 2026 BMSC. All Rights Reserved.</p>
      </div>
    </div>

      {/* Add Transaction Dialog/Modal Backdrop */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
              <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                <Wallet className="h-4.5 w-4.5 text-orange-500" /> Catat Transaksi Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-7 w-7 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              {/* Type Switcher */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tipe Transaksi</label>
                <div className="flex bg-stone-100 rounded-xl p-0.5 border border-stone-200">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('INCOME')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all ${
                      newTxType === 'INCOME'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Pemasukan (Kas Masuk)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('EXPENSE')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all ${
                      newTxType === 'EXPENSE'
                        ? 'bg-white text-rose-600 shadow-sm'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Pengeluaran (Kas Keluar)
                  </button>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Transaksi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian Laptop Baru, Adsense YouTube"
                  value={newTxName}
                  onChange={(e) => setNewTxName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Grid (Category & Amount) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Kategori</label>
                  <select
                    value={isCustomCategory ? '__ADD_NEW__' : newTxCategory}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '__ADD_NEW__') {
                        setIsCustomCategory(true)
                        setNewTxCategory('')
                      } else {
                        setIsCustomCategory(false)
                        setNewTxCategory(val)
                      }
                    }}
                    className="w-full h-9 px-2 rounded-lg border border-stone-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    {(newTxType === 'INCOME' ? incomeCategories : expenseCategories).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__ADD_NEW__">+ Tambah Kategori Baru...</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nominal (IDR)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 1500000"
                    value={newTxAmount}
                    onChange={(e) => setNewTxAmount(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                </div>

                {isCustomCategory && (
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Kategori Baru</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Pajak, Konsumsi, Transport, dll"
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        className="flex-1 h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const name = customCategoryName.trim()
                          if (name) {
                            if (newTxType === 'INCOME') {
                              if (!incomeCategories.includes(name)) {
                                setIncomeCategories((prev) => [...prev, name])
                              }
                            } else {
                              if (!expenseCategories.includes(name)) {
                                setExpenseCategories((prev) => [...prev, name])
                              }
                            }
                            setNewTxCategory(name)
                            setIsCustomCategory(false)
                            setCustomCategoryName('')
                          }
                        }}
                        className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold px-3 shrink-0"
                      >
                        Tambah
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsCustomCategory(false)
                          setNewTxCategory(newTxType === 'INCOME' ? incomeCategories[0] : expenseCategories[0])
                          setCustomCategoryName('')
                        }}
                        className="px-2 font-bold shrink-0"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid (Date & Status) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newTxDate}
                    onChange={(e) => setNewTxDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Status</label>
                  <select
                    value={newTxStatus}
                    onChange={(e) => setNewTxStatus(e.target.value as any)}
                    className="w-full h-9 px-2 rounded-lg border border-stone-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="SUCCESS">Berhasil / Lunas</option>
                    <option value="PENDING">Menunggu / Pending</option>
                  </select>
                </div>
              </div>

              {/* Notice */}
              <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl flex items-start gap-2 text-[10px] text-stone-500">
                <AlertCircle className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                <p className="leading-normal">
                  Mencatat transaksi akan secara langsung mempengaruhi Laba Bersih dan charts di halaman ini secara real-time.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Simpan Transaksi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Options Dialog/Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150 no-print">
            {/* Header */}
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
              <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                <Printer className="h-4.5 w-4.5 text-orange-500" /> Opsi Cetak PDF
              </h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="h-7 w-7 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Checklist Form */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-500 leading-normal mb-2">
                Pilih komponen laporan yang ingin dicetak dalam file PDF:
              </p>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200/50 hover:border-orange-200 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={printKPI}
                    onChange={(e) => setPrintKPI(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-850">Ringkasan Finansial (KPI)</p>
                    <p className="text-[10px] text-stone-400 font-medium">Laba bersih, pemasukan, pengeluaran, tagihan aktif</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200/50 hover:border-orange-200 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={printAreaChart}
                    onChange={(e) => setPrintAreaChart(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-850">Grafik Arus Kas Bulanan</p>
                    <p className="text-[10px] text-stone-400 font-medium">Area chart perbandingan pemasukan vs pengeluaran</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200/50 hover:border-orange-200 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={printPieChart}
                    onChange={(e) => setPrintPieChart(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-850">Diagram Alokasi Pemasukan</p>
                    <p className="text-[10px] text-stone-400 font-medium">Pie chart sumber pendapatan per kategori</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200/50 hover:border-orange-200 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={printExpenseChart}
                    onChange={(e) => setPrintExpenseChart(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-850">Diagram Rincian Pengeluaran</p>
                    <p className="text-[10px] text-stone-400 font-medium">Pie chart rincian pengeluaran per kategori</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-200/50 hover:border-orange-200 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={printTable}
                    onChange={(e) => setPrintTable(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-850">Tabel Riwayat Transaksi</p>
                    <p className="text-[10px] text-stone-400 font-medium">Log lengkap mutasi arus kas finansial</p>
                  </div>
                </label>
              </div>

              {/* Print Tip Notice */}
              <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl flex items-start gap-2 text-[10px] text-stone-500 leading-relaxed">
                <AlertCircle className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Tip Cetak:</strong> Pada jendela cetak browser Anda, aktifkan opsi <em>"Background graphics"</em> agar warna kartu dan grafik tercetak dengan sempurna.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrintModal(false)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setShowPrintModal(false)
                    setTimeout(() => {
                      window.print()
                    }, 200)
                  }}
                  className="bg-orange-500 hover:bg-orange-655 text-white font-bold"
                >
                  Cetak Sekarang
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
