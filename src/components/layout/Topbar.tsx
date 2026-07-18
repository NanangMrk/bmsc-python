import { Search, Bell, ChevronDown, LogOut, User, Settings, Shield } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { mockNotifications } from '@/lib/mock-data'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Project',
  '/invoice/quotation': 'Quotation',
  '/invoice/invoice': 'Invoice',
  '/platform': 'Kelola Platform',
  '/ratecard': 'Rate Card',
  '/users': 'Kelola User',
  '/roles': 'Kelola Role',
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  BRAND: 'Brand',
  KREATOR: 'Konten Kreator',
  EDITOR: 'Editor',
}

export function Topbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState(mockNotifications)

  useEffect(() => {
    // Polling interval to auto-refresh notifications if we simulate a global state update
    const interval = setInterval(() => {
      setNotifs([...mockNotifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifs.filter((n) => !n.read).length

  const getTimeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000)
    if (diff < 1) return 'Baru saja'
    if (diff < 60) return `${diff} mnt`
    const hrs = Math.floor(diff / 60)
    if (hrs < 24) return `${hrs} jam`
    return `${Math.floor(hrs / 24)} hr`
  }

  const currentLabel = Object.entries(routeLabels).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'BMSC'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 border-b border-border bg-background flex items-center px-6 gap-4 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-muted-foreground text-sm">BMSC</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">{currentLabel}</span>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari project, invoice..."
          className="h-9 pl-9 pr-4 rounded-lg border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-64 placeholder:text-muted-foreground"
        />
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          id="topbar-notif-btn"
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-11 z-20 w-80 bg-white rounded-xl border border-border shadow-xl overflow-hidden animate-in">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-sm">Notifikasi</h3>
              </div>
              <div className="divide-y divide-border">
                {notifs.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground">Tidak ada notifikasi</div>
                )}
                {notifs.map((n) => (
                  <div key={n.id} className={cn("flex gap-3 p-4 hover:bg-muted/50 cursor-pointer", !n.read && "bg-orange-50/50")}>
                    <span className="text-lg">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.desc}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{getTimeAgo(n.createdAt)}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <button className="text-xs text-orange-500 font-medium w-full text-center hover:underline">
                  Lihat semua notifikasi
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          id="topbar-profile-btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 hover:bg-muted rounded-lg p-1.5 pr-2 transition-colors"
        >
          <Avatar name={user?.name ?? 'U'} size="sm" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{roleLabels[user?.role ?? ''] ?? user?.role}</p>
          </div>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', dropdownOpen && 'rotate-180')} />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-12 z-20 w-56 bg-white rounded-xl border border-border shadow-xl overflow-hidden animate-in">
              <div className="p-4 border-b border-border">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="p-1.5">
                {[
                  { icon: User, label: 'Profil Saya', path: '/profile' },
                  { icon: Settings, label: 'Pengaturan', path: '/settings' },
                  { icon: Shield, label: 'Keamanan', path: '/security' },
                ].map(({ icon: Icon, label, path }) => (
                  <button
                    key={label}
                    onClick={() => {
                      if (path) {
                        navigate(path);
                        setDropdownOpen(false);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {label}
                  </button>
                ))}
              </div>
              <div className="p-1.5 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
