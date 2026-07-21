import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  Calendar,
  Pencil,
  Trash2,
  ArrowRight
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { mockPlatforms, mockBrands, mockUsers } from '@/lib/mock-data'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { X, AlertCircle } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatDateShort, cn } from '@/lib/utils'

type ViewMode = 'table' | 'grid'

const phaseLabels = ['', 'Payment', 'Pengiriman', 'Ide & Konsep', 'Script', 'Produksi', 'Upload']

export default function ProjectsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterPlatform, setFilterPlatform] = useState('ALL')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  
  // Custom Delete Modal State
  const [projectToDelete, setProjectToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: rawProjects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api<any[]>('/projects'),
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const { data: platforms = [] } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => api<any[]>('/platforms')
  })

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api<any[]>('/brands')
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api<any[]>('/users')
  })

  // Form states for new project
  const [newProjName, setNewProjName] = useState('')
  const [newProjBrandId, setNewProjBrandId] = useState('')
  const [newProjPlatforms, setNewProjPlatforms] = useState<string[]>([])
  const [newProjStartDate, setNewProjStartDate] = useState(new Date().toISOString().split('T')[0])
  const [newProjDeadline, setNewProjDeadline] = useState('')
  const [newProjValue, setNewProjValue] = useState('')
  const [newProjPicIds, setNewProjPicIds] = useState<string[]>([])
  const [newProjStatus, setNewProjStatus] = useState<'DRAFT' | 'BERJALAN' | 'PROSES_VERIFIKASI' | 'SELESAI'>('BERJALAN')

  // Form states for editing project
  const [editProjName, setEditProjName] = useState('')
  const [editProjPlatforms, setEditProjPlatforms] = useState<string[]>([])
  const [editProjStartDate, setEditProjStartDate] = useState('')
  const [editProjDeadline, setEditProjDeadline] = useState('')
  const [editProjValue, setEditProjValue] = useState('')
  const [editProjPicIds, setEditProjPicIds] = useState<string[]>([])
  const [editProjStatus, setEditProjStatus] = useState<'DRAFT' | 'BERJALAN' | 'PROSES_VERIFIKASI' | 'SELESAI'>('BERJALAN')

  const filtered = rawProjects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus
    const matchPlatform = filterPlatform === 'ALL' || p.platforms.some((pl) => pl.id === filterPlatform)
    return matchSearch && matchStatus && matchPlatform
  })

  const createProjectMutation = useMutation({
    mutationFn: (data: any) => api('/projects', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowAddModal(false)
      // Reset form
      setNewProjName('')
      setNewProjBrandId('')
      setNewProjPlatforms([])
      setNewProjDeadline('')
      setNewProjValue('')
      setNewProjPicIds([])
    },
    onError: (err: any) => {
      alert('Gagal membuat project: ' + err.message)
    }
  })

  const handleDeleteProject = (proj: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setProjectToDelete(proj)
  }

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return
    setIsDeleting(true)
    try {
      await api(`/projects/${projectToDelete.id}`, { method: 'DELETE' })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setProjectToDelete(null)
    } catch (err: any) {
      alert('Gagal menghapus project: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const updateProjectMutation = useMutation({
    mutationFn: (data: any) => api(`/projects/${editingProjectId}`, { method: 'PUT', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowEditModal(false)
    },
    onError: (err: any) => {
      alert('Gagal mengupdate project: ' + err.message)
    }
  })

  const handleOpenEditModal = (proj: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingProjectId(proj.id)
    setEditProjName(proj.name)
    setEditProjPlatforms(proj.platforms.map((pl: any) => pl.platformId || pl.platform?.id))
    // Format dates to YYYY-MM-DD for input[type=date]
    setEditProjStartDate(new Date(proj.startDate).toISOString().split('T')[0])
    setEditProjDeadline(proj.deadline ? new Date(proj.deadline).toISOString().split('T')[0] : '')
    setEditProjValue(proj.totalValue.toString())
    setEditProjPicIds(proj.userAccess?.map((ua: any) => ua.userId) || [])
    setEditProjStatus(proj.status)
    setShowEditModal(true)
  }

  const handleSaveEditProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProjName.trim() || !editProjDeadline || !editProjValue) {
      alert('Nama project, deadline, dan nilai wajib diisi')
      return
    }
    if (editProjPlatforms.length === 0) {
      alert('Silakan pilih minimal satu platform')
      return
    }
    updateProjectMutation.mutate({
      name: editProjName,
      platformIds: editProjPlatforms,
      startDate: new Date(editProjStartDate).toISOString(),
      deadline: new Date(editProjDeadline).toISOString(),
      totalValue: parseFloat(editProjValue),
      picIds: editProjPicIds,
      status: editProjStatus
    })
  }

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjName.trim() || !newProjDeadline || !newProjValue) {
      alert('Nama project, deadline, dan nilai wajib diisi')
      return
    }
    if (newProjPlatforms.length === 0) {
      alert('Silakan pilih minimal satu platform')
      return
    }

    createProjectMutation.mutate({
      name: newProjName,
      brandId: newProjBrandId,
      platformIds: newProjPlatforms,
      startDate: new Date(newProjStartDate).toISOString(),
      deadline: new Date(newProjDeadline).toISOString(),
      totalValue: parseFloat(newProjValue),
      picIds: newProjPicIds
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-orange-600 uppercase mb-2">
              <span>WORKSPACE</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Daftar Induk Kontrak</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Kelola Projects & Campaign</h1>
            <p className="text-muted-foreground text-sm mt-1">Pantau status, timeline produksi, budget, dan kelola dokumen campaign Anda di sini.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setView('grid')}
                className={cn(
                  'h-8 w-8 rounded-md flex items-center justify-center transition-all',
                  view === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={cn(
                  'h-8 w-8 rounded-md flex items-center justify-center transition-all',
                  view === 'table' ? 'bg-white shadow-sm text-orange-600' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>

            <Button className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm rounded-lg px-4" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddModal(true)}>
              Project Baru
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters Card */}
      <Card className="p-2.5">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full border-r border-border/50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama project, brand, atau PIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-md border-0 bg-transparent text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto px-2">
            <div className="relative border border-border rounded-lg overflow-hidden bg-white hover:border-gray-300 transition-colors">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 pl-8 pr-8 appearance-none bg-transparent text-sm focus:outline-none w-40 cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="DRAFT">Draft</option>
                <option value="BERJALAN">Berjalan</option>
                <option value="PROSES_VERIFIKASI">Proses Verifikasi</option>
                <option value="SELESAI">Selesai</option>
              </select>
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative border border-border rounded-lg overflow-hidden bg-white hover:border-gray-300 transition-colors">
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="h-9 pl-8 pr-8 appearance-none bg-transparent text-sm focus:outline-none w-44 cursor-pointer"
              >
                <option value="ALL">Semua Platform</option>
                {mockPlatforms.map((pl) => (
                  <option key={pl.id} value={pl.id}>{pl.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((proj) => {
            const percent = Math.round((proj.progress / 6) * 100);
            return (
              <Card key={proj.id} className="group flex flex-col bg-white border border-border/60 hover:shadow-md transition-all rounded-xl overflow-hidden">
                <div 
                  className="p-5 flex-1 cursor-pointer hover:bg-stone-50/50 transition-colors"
                  onClick={() => navigate(`/projects/${proj.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                      {proj.brand?.name || (proj.userAccess?.[0]?.user?.name) || 'BELUM DIHUBUNGKAN'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2 group-hover:text-orange-600 transition-colors">{proj.name}</h3>
                  {proj.platforms && proj.platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {proj.platforms.map((p: any) => (
                        <span key={p.platform.id} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md text-[10px] font-medium border border-stone-200">
                          {p.platform.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-semibold mb-1.5">
                      <span className="text-muted-foreground">Milestone Progress</span>
                      <span className="text-orange-600">{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-600 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-border/50 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" /><span>{formatDateShort(proj.deadline)}</span></div>
                  <div className="flex items-center gap-2">
                    <button className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-orange-650 transition-colors" onClick={(e) => handleOpenEditModal(proj, e)} title="Edit Project"><Pencil className="h-3.5 w-3.5" /></button>
                    <button className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors" onClick={(e) => handleDeleteProject(proj, e)} title="Hapus Project"><Trash2 className="h-3.5 w-3.5" /></button>
                    <button className="h-6 w-6 flex items-center justify-center bg-orange-50 text-orange-600 hover:bg-orange-100 rounded transition-colors ml-1" onClick={() => navigate(`/projects/${proj.id}`)}><ArrowRight className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Nama Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Brand</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Platform</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nilai</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((proj) => (
                  <tr key={proj.id} className="hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => navigate(`/projects/${proj.id}`)}>
                    <td className="px-5 py-3.5 font-medium">{proj.name}</td>
                    <td className="px-4 py-3.5 text-xs">{(proj.brand?.name || proj.userAccess?.[0]?.user?.name) ? <span className="font-medium text-foreground">{proj.brand?.name || proj.userAccess?.[0]?.user?.name}</span> : <span className="text-muted-foreground italic">-</span>}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{proj.platforms.map((pl: any) => pl.platform.name).join(', ')}</td>
                    <td className="px-4 py-3.5">{formatCurrency(proj.totalValue)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={proj.status} size="sm" /></td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <button className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-orange-600 rounded hover:bg-stone-100 transition-colors" onClick={(e) => handleOpenEditModal(proj, e)} title="Edit Project"><Pencil className="h-4 w-4" /></button>
                        <button onClick={(e) => handleDeleteProject(proj, e)} className="text-muted-foreground hover:text-red-600 transition-colors" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                        <button className="h-7 w-7 flex items-center justify-center bg-orange-50 text-orange-600 hover:bg-orange-100 rounded transition-colors" onClick={() => navigate(`/projects/${proj.id}`)} title="Detail Project"><ArrowRight className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Tambah Project Baru */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm uppercase tracking-wide"><Plus className="h-4.5 w-4.5 text-orange-500" /> Tambah Project Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="h-7 w-7 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleAddProject} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[calc(90vh-140px)]">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Project</label>
                  <input type="text" required placeholder="Contoh: Campaign Ramadhan 2025" value={newProjName} onChange={(e) => setNewProjName(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Platform yang Digunakan (Pilih Minimal 1)</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {platforms.map((pl: any) => (
                      <label key={pl.id} className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs cursor-pointer hover:bg-stone-100">
                        <input type="checkbox" checked={newProjPlatforms.includes(pl.id)} onChange={(e) => e.target.checked ? setNewProjPlatforms([...newProjPlatforms, pl.id]) : setNewProjPlatforms(newProjPlatforms.filter(i => i !== pl.id))} className="h-3.5 w-3.5 rounded border-stone-300 text-orange-500" />
                        <span>{pl.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tanggal Mulai</label>
                    <input type="date" required value={newProjStartDate} onChange={(e) => setNewProjStartDate(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Deadline</label>
                    <input type="date" required value={newProjDeadline} onChange={(e) => setNewProjDeadline(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nilai Project (IDR)</label>
                  <input type="number" required value={newProjValue} onChange={(e) => setNewProjValue(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  {newProjValue && !isNaN(Number(newProjValue)) && (
                    <p className="text-[10px] font-medium text-orange-600 mt-1">{formatCurrency(Number(newProjValue))}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Assign PIC / Team</label>
                  <div className="grid grid-cols-2 gap-2 mt-1 max-h-32 overflow-y-auto border border-stone-100 p-2 rounded-lg bg-stone-50/30">
                    {users.map((u: any) => (
                      <label key={u.id} className="flex items-center gap-2 p-1.5 bg-white border border-stone-200 rounded-md text-[11px] cursor-pointer hover:bg-stone-50">
                        <input
                          type="checkbox"
                          checked={newProjPicIds.includes(u.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewProjPicIds((prev) => [...prev, u.id])
                            } else {
                              setNewProjPicIds((prev) => prev.filter((id) => id !== u.id))
                            }
                          }}
                          className="h-3 w-3 rounded border-stone-300 text-orange-500"
                        />
                        <div className="leading-tight">
                          <p className="font-bold text-stone-800">{u.name}</p>
                          <p className="text-[7px] text-stone-400 font-extrabold uppercase">{u.role?.name || 'USER'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>Batal</Button>
                <Button type="submit" size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">Simpan Project</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-gray-50/50 shrink-0">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Pencil className="h-5 w-5 text-orange-600" />
                Edit Project
              </h2>
              <button onClick={() => setShowEditModal(false)} className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-black/5 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEditProject} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[calc(90vh-140px)]">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Project</label>
                  <input type="text" required value={editProjName} onChange={(e) => setEditProjName(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Platform yang Digunakan (Pilih Minimal 1)</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {platforms.map((pl: any) => (
                      <label key={pl.id} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${editProjPlatforms.includes(pl.id) ? 'border-orange-500 bg-orange-50/30' : 'border-stone-200 hover:bg-stone-50'}`}>
                        <input type="checkbox" checked={editProjPlatforms.includes(pl.id)} onChange={(e) => {
                          if (e.target.checked) setEditProjPlatforms(prev => [...prev, pl.id])
                          else setEditProjPlatforms(prev => prev.filter(id => id !== pl.id))
                        }} className="h-3.5 w-3.5 rounded border-stone-300 text-orange-500 focus:ring-orange-500" />
                        <span className="text-xs font-medium text-stone-700">{pl.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tanggal Mulai</label>
                    <input type="date" required value={editProjStartDate} onChange={(e) => setEditProjStartDate(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Deadline</label>
                    <input type="date" required value={editProjDeadline} onChange={(e) => setEditProjDeadline(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nilai Project (IDR)</label>
                    <input type="number" required value={editProjValue} onChange={(e) => setEditProjValue(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                    {editProjValue && !isNaN(Number(editProjValue)) && (
                      <p className="text-[10px] font-medium text-orange-600 mt-1">{formatCurrency(Number(editProjValue))}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Status</label>
                    <select value={editProjStatus} onChange={(e) => setEditProjStatus(e.target.value as any)} className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500">
                      <option value="DRAFT">Draft</option>
                      <option value="BERJALAN">Berjalan</option>
                      <option value="PROSES_VERIFIKASI">Proses Verifikasi</option>
                      <option value="SELESAI">Selesai</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Assign PIC / Team</label>
                  <div className="grid grid-cols-2 gap-2 mt-1 max-h-32 overflow-y-auto border border-stone-100 p-2 rounded-lg bg-stone-50/30">
                    {users.map((u: any) => (
                      <label key={u.id} className="flex items-center gap-2 p-1.5 bg-white border border-stone-200 rounded-md text-[11px] cursor-pointer hover:bg-stone-50">
                        <input
                          type="checkbox"
                          checked={editProjPicIds.includes(u.id)}
                          onChange={(e) => {
                            if (e.target.checked) setEditProjPicIds(prev => [...prev, u.id])
                            else setEditProjPicIds(prev => prev.filter(id => id !== u.id))
                          }}
                          className="h-3 w-3 rounded border-stone-300 text-orange-500"
                        />
                        <div className="leading-tight">
                          <p className="font-bold text-stone-800">{u.name}</p>
                          <p className="text-[7px] text-stone-400 font-extrabold uppercase">{u.role?.name || 'USER'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowEditModal(false)}>Batal</Button>
                <Button type="submit" size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-bold" loading={updateProjectMutation.isPending}>Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Hapus Project?</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Anda yakin ingin menghapus <strong>{projectToDelete.name}</strong>? Seluruh data terkait seperti task, script, dan file upload akan ikut terhapus secara permanen.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setProjectToDelete(null)} disabled={isDeleting}>Batal</Button>
              <Button className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 border-0" onClick={confirmDeleteProject} disabled={isDeleting}>Ya, Hapus Project</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
