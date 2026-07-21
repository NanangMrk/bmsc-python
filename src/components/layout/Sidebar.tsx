import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  Layers,
  CreditCard,
  Users,
  ChevronDown,
  ChevronRight,
  Zap,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

interface NavItem {
  label: string
  icon: React.ElementType
  to?: string
  children?: { label: string; to: string }[]
  permission?: string | string[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/dashboard',
    permission: 'dash_view',
  },
  {
    label: 'Project',
    icon: FolderKanban,
    to: '/projects',
    permission: 'proj_view',
  },
  {
    label: 'Invoice & Payment',
    icon: Receipt,
    children: [
      { label: 'Quotation', to: '/invoice/quotation' },
      { label: 'Invoice', to: '/invoice/invoice' },
    ],
    permission: 'quo_inv_view',
  },
  {
    label: 'Keuangan',
    icon: Wallet,
    to: '/finance',
    permission: 'fin_view',
  },
  {
    label: 'Kelola Platform',
    icon: Layers,
    to: '/platform',
    permission: 'plat_view',
  },
  {
    label: 'Rate Card',
    icon: CreditCard,
    to: '/ratecard',
    permission: 'rate_view',
  },
  {
    label: 'User & Role',
    icon: Users,
    children: [
      { label: 'Daftar User', to: '/users' },
      { label: 'Matriks Hak Akses', to: '/roles' },
    ],
    permission: ['usr_view', 'role_view'],
  },
  {
    label: 'Settings (Pengaturan)',
    icon: Settings,
    to: '/settings',
    permission: 'set_general',
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuthStore()
  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Invoice & Payment'])

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    )
  }

  const filteredNav = navItems.filter((item) => {
    if (!user) return false
    if (user.role === 'SUPER_ADMIN') return true
    
    if (item.permission) {
      if (Array.isArray(item.permission)) {
        return item.permission.some(p => user.permissions?.includes(p))
      }
      return user.permissions?.includes(item.permission)
    }
    
    return true
  })

  return (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-300 ease-in-out',
        'border-r',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{
        background: 'hsl(var(--sidebar))',
        borderColor: 'hsl(var(--sidebar-border))',
      }}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-16 px-4 shrink-0 border-b',
          collapsed ? 'justify-center' : 'gap-3'
        )}
        style={{ borderColor: 'hsl(var(--sidebar-border))' }}
      >
        <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
          <Zap className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-white text-lg tracking-tight">BMSC</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 pt-3 space-y-0.5">
        {filteredNav.map((item) => {
          const Icon = item.icon
          const isExpanded = expandedMenus.includes(item.label)
          const hasChildren = !!item.children

          if (hasChildren) {
            const isAnyChildActive = item.children?.some((c) => location.pathname.startsWith(c.to))

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    'sidebar-item w-full',
                    isAnyChildActive && !isExpanded && 'bg-sidebar-accent text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                      )}
                    </>
                  )}
                </button>

                {!collapsed && isExpanded && (
                  <div className="ml-7 mt-0.5 space-y-0.5 border-l pl-3" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
                    {item.children!.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center px-2 py-2 text-sm rounded-md transition-colors duration-150',
                            isActive
                              ? 'text-orange-400 font-medium'
                              : 'text-sidebar-foreground hover:text-white'
                          )
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to!}
              className={({ isActive }) =>
                cn('sidebar-item', isActive && 'active', collapsed && 'justify-center')
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div
        className="p-3 border-t"
        style={{ borderColor: 'hsl(var(--sidebar-border))' }}
      >
        <button
          onClick={onToggle}
          className={cn(
            'sidebar-item w-full',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
