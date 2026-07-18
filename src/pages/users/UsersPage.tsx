import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, FolderKanban, X, Check } from 'lucide-react'
import { mockUsers, mockProjects, mockQuotations } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Card } from '@/components/ui/Card'
import { formatDateShort } from '@/lib/utils'

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  BRAND: 'Brand',
  KREATOR: 'Kreator',
  EDITOR: 'Editor',
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [mappingUser, setMappingUser] = useState<any>(null)
  const [mappingTab, setMappingTab] = useState<'project' | 'quotation'>('project')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([])
  
  const toggleProject = (id: string) => {
    setSelectedProjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleQuotation = (id: string) => {
    setSelectedQuotations(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const filtered = mockUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'ALL' || u.role === filterRole
    return matchSearch && matchRole
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola User</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} dari {mockUsers.length} user</p>
        </div>
        <Button id="add-user-btn" icon={<Plus className="h-4 w-4" />}>Tambah User</Button>
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
                <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDateShort(user.createdAt)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setMappingUser(user)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-orange-50 hover:text-orange-500 transition-colors"
                      title="Mapping Project"
                    >
                      <FolderKanban className="h-3.5 w-3.5" />
                    </button>
                    <button className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Edit User">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors" title="Hapus User">
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
                  {mockProjects.map(proj => {
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
                            {proj.brand.name} • {proj.status}
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
                  {mockQuotations.map(quo => {
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
                            {quo.brand.name} • {quo.status}
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
              <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => {
                alert('Mapping akses berhasil disimpan!')
                setMappingUser(null)
              }}>Simpan Akses</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
