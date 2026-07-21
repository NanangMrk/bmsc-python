import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, FolderKanban, X, Check, Users } from 'lucide-react'
import { mockProjects, mockQuotations } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Card } from '@/components/ui/Card'
import { formatDateShort } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  BRAND: 'Brand',
  KREATOR: 'Kreator',
  EDITOR: 'Editor',
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [mappingUser, setMappingUser] = useState<any>(null)
  const [mappingTab, setMappingTab] = useState<'project' | 'quotation'>('project')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([])
  
  // Add User State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUserCompanyName, setNewUserCompanyName] = useState('')
  const [newUserUsername, setNewUserUsername] = useState('')
  const [newUserPicName, setNewUserPicName] = useState('')
  const [newUserPhone, setNewUserPhone] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserAddress, setNewUserAddress] = useState('')
  const [newUserRoleId, setNewUserRoleId] = useState('')
  const [newUserBrandId, setNewUserBrandId] = useState('')

  // Edit User State
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editUserName, setEditUserName] = useState('')
  const [editUserEmail, setEditUserEmail] = useState('')
  const [editUserPhone, setEditUserPhone] = useState('')
  const [editUserPassword, setEditUserPassword] = useState('')
  const [editUserRoleId, setEditUserRoleId] = useState('')

  const { data: rawUsers = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api<any[]>('/users')
  })

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api<any[]>('/roles')
  })

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api<any[]>('/brands')
  })

  const { data: realProjects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api<any[]>('/projects')
  })

  const { data: realQuotations = [] } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => api<any[]>('/finance/quotations')
  })

  // Format backend user to match UI
  const mockUsers = rawUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role?.name?.toUpperCase().replace(' ', '_') || 'BRAND',
    brandName: u.brand?.name,
    createdAt: u.createdAt,
    isActive: u.isActive,
    projectAccess: u.projectAccess?.map((p: any) => p.projectId) || [],
    quotationAccess: u.quotationAccess?.map((q: any) => q.quotationId) || [],
    invoiceAccess: u.invoiceAccess?.map((i: any) => i.invoiceId) || []
  }))

  const createUserMutation = useMutation({
    mutationFn: (data: any) => api('/users', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowAddModal(false)
      setNewUserCompanyName('')
      setNewUserUsername('')
      setNewUserPicName('')
      setNewUserPhone('')
      setNewUserEmail('')
      setNewUserPassword('')
      setNewUserAddress('')
      setNewUserRoleId('')
      setNewUserBrandId('')
    },
    onError: (err: any) => {
      alert('Gagal membuat user: ' + err.message)
    }
  })

  const updateAccessMutation = useMutation({
    mutationFn: (data: { userId: string, projectIds: string[], quotationIds: string[], invoiceIds: string[] }) => 
      api(`/users/${data.userId}/access`, { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      alert('Mapping akses berhasil disimpan!')
      setMappingUser(null)
    },
    onError: (err: any) => {
      alert('Gagal menyimpan akses: ' + err.message)
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: (data: any) => api(`/users/${data.id}`, { method: 'PUT', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditingUser(null)
    },
    onError: (err: any) => {
      alert('Gagal mengupdate user: ' + err.message)
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err: any) => {
      alert('Gagal menghapus user: ' + err.message)
    }
  })

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserCompanyName || !newUserUsername || !newUserPassword || !newUserRoleId) {
      alert('Mohon lengkapi data wajib (Perusahaan, Username, Password, Role)')
      return
    }
    
    // Check if role is brand
    const selectedRole = roles.find((r: any) => r.id === newUserRoleId)
    if (selectedRole?.name === 'Brand' && !newUserBrandId) {
      alert('Untuk Role Brand, silakan pilih brand yang akan direlasikan')
      return
    }

    createUserMutation.mutate({
      companyName: newUserCompanyName,
      username: newUserUsername,
      picName: newUserPicName,
      phone: newUserPhone,
      address: newUserAddress,
      email: newUserEmail,
      password: newUserPassword,
      roleId: newUserRoleId,
      brandId: newUserBrandId || undefined
    })
  }

  const toggleProject = (id: string) => {
    setSelectedProjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleQuotation = (id: string) => {
    setSelectedQuotations(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleOpenEditUser = (user: any) => {
    // Find the raw user to get roleId
    const rawUser = rawUsers.find((u: any) => u.id === user.id)
    setEditingUser(user)
    setEditUserName(rawUser?.name || '')
    setEditUserEmail(rawUser?.email || '')
    setEditUserPhone(rawUser?.phone || '')
    setEditUserPassword('')
    setEditUserRoleId(rawUser?.roleId || '')
  }

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUserName.trim() || !editUserRoleId) {
      alert('Nama dan role wajib diisi')
      return
    }
    updateUserMutation.mutate({
      id: editingUser.id,
      name: editUserName,
      email: editUserEmail,
      phone: editUserPhone,
      roleId: editUserRoleId,
      ...(editUserPassword ? { password: editUserPassword } : {})
    })
  }

  const handleDeleteUser = (user: any) => {
    if (confirm(`Yakin ingin menghapus user "${user.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteUserMutation.mutate(user.id)
    }
  }

  const filtered = mockUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'ALL' || u.role === filterRole
    return matchSearch && matchRole
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Users className="h-6 w-6 text-orange-600" />
            Kelola User & Hak Akses Role
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Daftarkan akun administrator / brand, batasi akses ke project tertentu, dan atur matriks izin tindakan secara mendalam.
          </p>
        </div>
        
        {/* Toggle Tabs */}
        <div className="flex items-center bg-gray-100/80 p-1 rounded-lg border border-border/50">
          <button className="px-4 py-1.5 text-sm font-bold text-orange-600 bg-white rounded-md shadow-sm border border-border/40">
            Daftar User
          </button>
          <Link to="/roles" className="px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground rounded-md transition-colors inline-block">
            Matriks Hak Akses (Permissions)
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>
          <h2 className="text-lg font-bold">Daftar User</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} dari {mockUsers.length} user</p>
        </div>
        <Button id="add-user-btn" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddModal(true)}>Tambah User</Button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(roleLabels).map(([key, label]) => {
          const count = mockUsers.filter((u) => u.role === key).length
          return (
            <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-bold text-foreground">{count}</span>
            </div>
          )
        })}
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Cari nama atau email..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-muted-foreground" />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
            <option value="ALL">Semua Role</option>
            {Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Brand Terkait</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Bergabung</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="sm" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground text-xs">{user.email}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={user.role as string} size="sm" className="bg-muted text-muted-foreground border-transparent" />
                </td>
                <td className="px-4 py-3.5 text-xs">
                  {user.brandName ? <span className="font-bold text-orange-600">{user.brandName}</span> : <span className="text-muted-foreground italic">-</span>}
                </td>
                <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDateShort(user.createdAt)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setMappingUser(user)
                        setSelectedProjects(user.projectAccess)
                        setSelectedQuotations(user.quotationAccess)
                      }}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-orange-50 hover:text-orange-500 transition-colors"
                      title="Mapping Project"
                    >
                      <FolderKanban className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleOpenEditUser(user)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Edit User"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors" title="Hapus User"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal Mapping Akses */}
      {mappingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-border/60">
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-gray-50/50">
              <div>
                <h3 className="font-bold text-foreground">Mapping Akses Data</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">User: {mappingUser.name}</p>
              </div>
              <button 
                onClick={() => setMappingUser(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex border-b border-border/60">
              <button 
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${mappingTab === 'project' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/30' : 'text-muted-foreground hover:bg-muted/50'}`}
                onClick={() => setMappingTab('project')}
              >
                Project
              </button>
              <button 
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${mappingTab === 'quotation' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/30' : 'text-muted-foreground hover:bg-muted/50'}`}
                onClick={() => setMappingTab('quotation')}
              >
                Quotation & Invoice
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto max-h-[60vh] space-y-3">
              {mappingTab === 'project' ? (
                <>
                  <div className="text-xs font-medium text-muted-foreground mb-4">
                    Pilih project yang diizinkan untuk diakses oleh <span className="font-bold text-foreground">{mappingUser.name}</span>.
                  </div>
                  {realProjects.map(proj => {
                    const isSelected = selectedProjects.includes(proj.id)
                    return (
                      <label 
                        key={proj.id} 
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer group ${isSelected ? 'bg-orange-50/50 border-orange-400' : 'border-border/60 hover:bg-gray-50 hover:border-orange-200'}`}
                        onClick={(e) => { e.preventDefault(); toggleProject(proj.id); }}
                      >
                        <div className={`mt-0.5 h-5 w-5 rounded-[4px] border flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300 text-transparent group-hover:border-orange-400'}`}>
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground mb-1">{proj.name}</div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {proj.brand?.name || '-'} • {proj.status}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </>
              ) : (
                <>
                  <div className="text-xs font-medium text-muted-foreground mb-4">
                    Pilih Quotation yang dapat diakses oleh <span className="font-bold text-foreground">{mappingUser.name}</span>. 
                    <br/><span className="text-orange-600 font-bold">*Jika User dapat melihat Quotation, ia otomatis dapat melihat Invoice yang terkait dengan Quotation tersebut.</span>
                  </div>
                  {realQuotations.map(quo => {
                    const isSelected = selectedQuotations.includes(quo.id)
                    return (
                      <label 
                        key={quo.id} 
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer group ${isSelected ? 'bg-orange-50/50 border-orange-400' : 'border-border/60 hover:bg-gray-50 hover:border-orange-200'}`}
                        onClick={(e) => { e.preventDefault(); toggleQuotation(quo.id); }}
                      >
                        <div className={`mt-0.5 h-5 w-5 rounded-[4px] border flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300 text-transparent group-hover:border-orange-400'}`}>
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground mb-1">{quo.number}</div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {quo.brand?.name || '-'} • {quo.status} • Total: {formatCurrency(quo.total)}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </>
              )}
            </div>

            <div className="p-4 border-t border-border/60 bg-gray-50/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setMappingUser(null)}>Batal</Button>
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white" 
                loading={updateAccessMutation.isPending}
                onClick={() => {
                  updateAccessMutation.mutate({
                    userId: mappingUser.id,
                    projectIds: selectedProjects,
                    quotationIds: selectedQuotations,
                    invoiceIds: [] // Currently not mapping invoices directly
                  })
                }}
              >Simpan Akses</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tambah User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-border/60">
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-gray-50/50">
              <h3 className="font-bold text-foreground">Tambah User Baru</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="flex flex-col">
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama Perusahaan <span className="text-red-500">*</span></label>
                  <input type="text" required value={newUserCompanyName} onChange={(e) => setNewUserCompanyName(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Username <span className="text-red-500">*</span></label>
                  <input type="text" required value={newUserUsername} onChange={(e) => setNewUserUsername(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
                  <input type="password" required minLength={6} value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Role User <span className="text-red-500">*</span></label>
                  <select required value={newUserRoleId} onChange={(e) => setNewUserRoleId(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400">
                    <option value="" disabled>Pilih Role</option>
                    {roles.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {roles.find((r: any) => r.id === newUserRoleId)?.name === 'Brand' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama Brand (Relasi)</label>
                    <select required value={newUserBrandId} onChange={(e) => setNewUserBrandId(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-orange-200 bg-orange-50/30 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400">
                      <option value="" disabled>Pilih Brand yang diwakili</option>
                      {brands.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-1">User ini hanya dapat mengakses data terkait brand yang dipilih.</p>
                  </div>
                )}

                <div className="border-t border-border/60 my-4 pt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Informasi Tambahan (Opsional)</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama PIC</label>
                      <input type="text" value={newUserPicName} onChange={(e) => setNewUserPicName(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                      <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nomor Telepon</label>
                      <input type="tel" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Alamat</label>
                      <textarea value={newUserAddress} onChange={(e) => setNewUserAddress(e.target.value)} className="w-full p-3 rounded-lg border border-border text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 min-h-[80px] resize-none" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-border/60 bg-gray-50/50 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Batal</Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" loading={createUserMutation.isPending}>
                  Simpan User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-border/60">
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-gray-50/50">
              <div>
                <h3 className="font-bold text-foreground">Edit User</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{editingUser.name}</p>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEditUser} className="flex flex-col">
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama <span className="text-red-500">*</span></label>
                  <input type="text" required value={editUserName} onChange={(e) => setEditUserName(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                  <input type="email" value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nomor Telepon</label>
                  <input type="tel" value={editUserPhone} onChange={(e) => setEditUserPhone(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Role <span className="text-red-500">*</span></label>
                  <select required value={editUserRoleId} onChange={(e) => setEditUserRoleId(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400">
                    <option value="" disabled>Pilih Role</option>
                    {roles.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password Baru <span className="text-muted-foreground font-normal">(opsional)</span></label>
                  <input type="password" minLength={6} placeholder="Kosongkan jika tidak ingin mengganti" value={editUserPassword} onChange={(e) => setEditUserPassword(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400" />
                </div>
              </div>
              
              <div className="p-4 border-t border-border/60 bg-gray-50/50 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>Batal</Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" loading={updateUserMutation.isPending}>
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
