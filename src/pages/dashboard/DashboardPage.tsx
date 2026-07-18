import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  FolderKanban,
  Clock,
  AlertTriangle,
  CreditCard,
  ArrowUpRight,
  Users,
  MoreHorizontal,
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
  Cell,
} from 'recharts'
import { useAuthStore } from '@/stores/auth.store'
import { mockProjects, mockInvoices, mockMonthlyRevenue, mockPlatformStats, mockUsers } from '@/lib/mock-data'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Avatar } from '@/components/ui/Avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { formatCurrency, formatDateShort } from '@/lib/utils'

const phaseLabels = ['', 'Payment', 'Pengiriman', 'Ide & Konsep', 'Script', 'Produksi', 'Upload']

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  sub?: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────

function AdminDashboard() {
  const navigate = useNavigate()

  const totalRevenue = mockInvoices
    .filter((i) => i.status === 'LUNAS')
    .reduce((acc, i) => acc + i.total, 0)

  const activeProjects = mockProjects.filter((p) => p.status === 'BERJALAN').length
  const lateProjects = mockProjects.filter((p) => p.status === 'PROSES_VERIFIKASI').length
  const pendingPayments = mockInvoices.filter((i) => i.status === 'MENUNGGU_VERIFIKASI').length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Ringkasan performa keseluruhan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Pemasukan"
          value={formatCurrency(totalRevenue)}
          icon={TrendingUp}
          color="bg-green-50 text-green-600"
          sub="Semua invoice lunas"
        />
        <StatCard
          label="Project Aktif"
          value={activeProjects}
          icon={FolderKanban}
          color="bg-orange-50 text-orange-600"
          sub={`${mockProjects.length} total project`}
        />
        <StatCard
          label="Menunggu Verifikasi"
          value={pendingPayments}
          icon={CreditCard}
          color="bg-yellow-50 text-yellow-600"
          sub="Pembayaran masuk"
        />
        <StatCard
          label="Project Terlambat"
          value={lateProjects}
          icon={AlertTriangle}
          color="bg-red-50 text-red-600"
          sub="Perlu perhatian"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Pemasukan per Bulan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">vs Target 2025</p>
              </div>
              <select className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-muted-foreground">
                <option>2025</option>
                <option>2024</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mockMonthlyRevenue} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorTarget)" name="Target" />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#colorRevenue)" name="Pemasukan" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform stats */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Per Platform</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Distribusi project</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <PieChart width={140} height={140}>
                <Pie
                  data={mockPlatformStats}
                  cx={65}
                  cy={65}
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="projects"
                >
                  {mockPlatformStats.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="space-y-2">
              {mockPlatformStats.map((stat) => (
                <div key={stat.platform} className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: stat.fill }} />
                  <span className="text-xs text-muted-foreground flex-1">{stat.platform}</span>
                  <span className="text-xs font-medium">{stat.projects} project</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Project Terbaru</h3>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs text-orange-500 hover:underline flex items-center gap-1"
            >
              Lihat semua <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Brand</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Fase</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockProjects.slice(0, 5).map((proj) => (
                  <tr
                    key={proj.id}
                    className="hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => navigate(`/projects/${proj.id}`)}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium truncate max-w-48">{proj.name}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-muted-foreground text-xs">{proj.brand.name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-muted-foreground">
                        {phaseLabels[proj.progress] || 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 w-32">
                      <ProgressBar value={proj.progress} max={6} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={proj.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-muted-foreground">{formatDateShort(proj.deadline)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Pending invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Invoice Perlu Perhatian</h3>
              <button onClick={() => navigate('/invoice/invoice')} className="text-xs text-orange-500 hover:underline flex items-center gap-1">
                Lihat semua <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockInvoices.filter((i) => i.status !== 'LUNAS').map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => navigate(`/invoice/invoice/${inv.id}`)}
              >
                <div className="h-8 w-8 bg-orange-50 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{inv.number}</p>
                  <p className="text-xs text-muted-foreground">{inv.brand.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(inv.total)}</p>
                  <StatusBadge status={inv.status} size="sm" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tim</h3>
              <button onClick={() => navigate('/users')} className="text-xs text-orange-500 hover:underline flex items-center gap-1">
                <Users className="h-3 w-3" /> Kelola
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockUsers.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <Avatar name={user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <StatusBadge
                  status={user.role.replace('_', ' ') as string}
                  size="sm"
                  className="bg-muted text-muted-foreground border-transparent"
                />
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Brand Dashboard ──────────────────────────────────────────────────────────

function BrandDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // For brand, filter only their projects
  const brandProjects = mockProjects.filter((p) => p.brandId === 'b1')
  const brandInvoices = mockInvoices.filter((i) => i.brandId === 'b1')

  const totalPaid = brandInvoices.filter((i) => i.status === 'LUNAS').reduce((acc, i) => acc + i.total, 0)
  const totalDue = brandInvoices.filter((i) => i.status !== 'LUNAS').reduce((acc, i) => acc + i.total, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Halo, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Ringkasan project & pembayaran Anda</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Sudah Dibayar" value={formatCurrency(totalPaid)} icon={TrendingUp} color="bg-green-50 text-green-600" />
        <StatCard label="Sisa Tagihan" value={formatCurrency(totalDue)} icon={CreditCard} color="bg-orange-50 text-orange-600" />
        <StatCard label="Project Aktif" value={brandProjects.filter((p) => p.status === 'BERJALAN').length} icon={FolderKanban} color="bg-orange-50 text-orange-600" sub={`${brandProjects.length} total`} />
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Project Saya</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {brandProjects.map((proj) => (
            <div
              key={proj.id}
              className="p-4 rounded-xl border border-border hover:border-orange-200 hover:shadow-sm cursor-pointer transition-all"
              onClick={() => navigate(`/projects/${proj.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{proj.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {proj.platforms.map((pl) => (
                      <span key={pl.id} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        {pl.name}
                      </span>
                    ))}
                  </div>
                </div>
                <StatusBadge status={proj.status} />
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progress Fase</span>
                  <span>{proj.progress}/6 fase — {phaseLabels[proj.progress] || 'Draft'}</span>
                </div>
                <ProgressBar value={proj.progress} max={6} color="orange" />
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Deadline: {formatDateShort(proj.deadline)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Brand invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Invoice Saya</h3>
            <button onClick={() => navigate('/invoice/invoice')} className="text-xs text-orange-500 hover:underline flex items-center gap-1">
              Lihat semua <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {brandInvoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => navigate(`/invoice/invoice/${inv.id}`)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{inv.number}</p>
                <p className="text-xs text-muted-foreground">Jatuh tempo: {formatDateShort(inv.dueDate)}</p>
              </div>
              <p className="font-semibold text-sm">{formatCurrency(inv.total)}</p>
              <StatusBadge status={inv.status} size="sm" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore()
  return user?.role === 'BRAND' ? <BrandDashboard /> : <AdminDashboard />
}
