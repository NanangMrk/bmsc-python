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
import { mockProjects, mockPlatforms, mockBrands, mockUsers } from '@/lib/mock-data'
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
  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterPlatform, setFilterPlatform] = useState('ALL')

  const [projects, setProjects] = useState(mockProjects)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)

  // Form states for new project
  const [newProjName, setNewProjName] = useState('')
  const [newProjBrandId, setNewProjBrandId] = useState(mockBrands[0]?.id || '')
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

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus
    const matchPlatform = filterPlatform === 'ALL' || p.platforms.some((pl) => pl.id === filterPlatform)
    return matchSearch && matchStatus && matchPlatform
  })

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Apakah Anda yakin ingin menghapus project ini?')) {
      const idx = mockProjects.findIndex((p) => p.id === id)
      if (idx !== -1) {
        mockProjects.splice(idx, 1)
      }
      setProjects((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleOpenEditModal = (proj: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingProjectId(proj.id)
    setEditProjName(proj.name)
    setEditProjPlatforms(proj.platforms.map((pl: any) => pl.id))
    setEditProjStartDate(proj.startDate)
    setEditProjDeadline(proj.deadline)
    setEditProjValue(proj.value.toString())
    setEditProjPicIds(proj.picIds || [])
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

    const selectedPlatforms = mockPlatforms.filter((pl) => editProjPlatforms.includes(pl.id))

    const idx = mockProjects.findIndex((p) => p.id === editingProjectId)
    if (idx !== -1) {
      mockProjects[idx] = {
        ...mockProjects[idx],
        name: editProjName,
        platforms: selectedPlatforms,
        startDate: editProjStartDate,
        deadline: editProjDeadline,
        value: parseInt(editProjValue) || 0,
        status: editProjStatus,
        picIds: editProjPicIds
      }
    }

    setProjects(projects.map((p) => {
      if (p.id === editingProjectId) {
        return {
          ...p,
          name: editProjName,
          platforms: selectedPlatforms,
          startDate: editProjStartDate,
          deadline: editProjDeadline,
          value: parseInt(editProjValue) || 0,
          status: editProjStatus,
          picIds: editProjPicIds
        }
      }
      return p
    }))

    setShowEditModal(false)
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

    const selectedBrand = mockBrands.find((b) => b.id === newProjBrandId) || mockBrands[0]
    const selectedPlatforms = mockPlatforms.filter((pl) => newProjPlatforms.includes(pl.id))

    const newProj = {
      id: `proj-${Date.now()}`,
      name: newProjName,
      brandId: newProjBrandId,
      brand: selectedBrand,
      platforms: selectedPlatforms,
      startDate: newProjStartDate,
      deadline: newProjDeadline,
      value: parseInt(newProjValue) || 0,
      status: newProjStatus,
      picIds: newProjPicIds,
      progress: 1, // Start at phase 1 (Payment)
      createdAt: new Date().toISOString().split('T')[0]
    }

    mockProjects.push(newProj)
    setProjects((prev) => [newProj, ...prev])
    setShowAddModal(false)

    // Reset Form
    setNewProjName('')
    setNewProjBrandId(mockBrands[0]?.id || '')
    setNewProjPlatforms([])
    setNewProjStartDate(new Date().toISOString().split('T')[0])
    setNewProjDeadline('')
    setNewProjValue('')
    setNewProjPicIds([])
    setNewProjStatus('BERJALAN')
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
            {/* View toggle */}
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
          {/* Search */}
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
            {/* Status filter */}
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
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>

            {/* Platform filter */}
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
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((proj) => {
            const percent = Math.round((proj.progress / 6) * 100);

            // Map status to badge style based on screenshot
            let badgeStyle = "bg-muted text-muted-foreground";
            let statusText: string = proj.status;

            if (proj.status === 'BERJALAN') {
              badgeStyle = "bg-amber-50 text-amber-600 font-semibold";
              statusText = "BERJALAN";
            } else if (proj.status === 'DRAFT') {
              badgeStyle = "bg-gray-100 text-gray-500 font-semibold";
              statusText = "DRAFT";
            } else if (proj.status === 'PROSES_VERIFIKASI') {
              badgeStyle = "bg-blue-50 text-blue-600 font-semibold";
              statusText = "PROSES VERIFIKASI";
            } else if (proj.status === 'SELESAI') {
              badgeStyle = "bg-green-50 text-green-600 font-semibold";
              statusText = "SELESAI";
            }

            return (
              <Card
                key={proj.id}
                className="flex flex-col bg-white border border-border/60 hover:shadow-md transition-all rounded-xl overflow-hidden"
              >
                <div className="p-5 flex-1">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                      {proj.brand.name}
                    </span>
                    <span className={cn("text-[9px] px-2.5 py-1 rounded-sm tracking-wider", badgeStyle)}>
                      {statusText}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 
                    className="font-bold text-base text-foreground mb-1 cursor-pointer hover:text-orange-600 transition-colors"
                    onClick={() => navigate(`/projects/${proj.id}`)}
                  >
                    {proj.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-6">Brief kampanye endorsement kustom.</p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-semibold mb-1.5">
                      <span className="text-muted-foreground">Milestone Progress</span>
                      <span className="text-orange-600">{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Platforms & Value */}
                  <div className="flex items-end justify-between gap-2 mt-6">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {proj.platforms.map((pl) => (
                        <span key={pl.id} className="text-[8px] font-bold bg-muted/60 text-foreground px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {pl.name === 'Instagram' ? 'INSTAGRAM-REELS' : pl.name === 'TikTok' ? 'TIKTOK-VIDEO-(VT-)' : 'YOUTUBE-REGULAR-VIDIO'}
                        </span>
                      ))}
                    </div>
                    <div className="font-bold text-sm whitespace-nowrap">
                      {formatCurrency(proj.value)}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 border-t border-border/50 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDateShort(proj.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-orange-650 transition-colors"
                      onClick={(e) => handleOpenEditModal(proj, e)}
                      title="Edit Project"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
                      onClick={(e) => handleDeleteProject(proj.id, e)}
                      title="Hapus Project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="h-6 w-6 flex items-center justify-center bg-orange-50 text-orange-600 hover:bg-orange-100 rounded transition-colors ml-1"
                      onClick={() => navigate(`/projects/${proj.id}`)}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Fase</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-36">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nilai</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Deadline</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground text-sm">
                      Tidak ada project yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((proj) => (
                    <tr
                      key={proj.id}
                      className="hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => navigate(`/projects/${proj.id}`)}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium max-w-52 truncate">{proj.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{proj.brand.name}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-muted-foreground">{proj.brand.name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {proj.platforms.map((pl) => (
                            <span key={pl.id} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                              {pl.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-muted-foreground">
                          {proj.progress}/6 — {phaseLabels[proj.progress] || 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <ProgressBar value={proj.progress} max={6} size="sm" />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-medium">{formatCurrency(proj.value)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={proj.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateShort(proj.deadline)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-orange-600 rounded hover:bg-stone-100 transition-colors"
                            onClick={(e) => handleOpenEditModal(proj, e)}
                            title="Edit Project"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-red-500 rounded hover:bg-stone-100 transition-colors"
                            onClick={(e) => handleDeleteProject(proj.id, e)}
                            title="Hapus Project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            className="h-7 w-7 flex items-center justify-center bg-orange-50 text-orange-600 hover:bg-orange-100 rounded transition-colors"
                            onClick={() => navigate(`/projects/${proj.id}`)}
                            title="Detail Project"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Tambah Project Baru */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header (fixed) */}
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                <Plus className="h-4.5 w-4.5 text-orange-500" /> Tambah Project Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-7 w-7 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddProject} className="flex flex-col flex-1 overflow-hidden">
              {/* Body (scrollable) */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[calc(90vh-140px)]">
                {/* Nama Project */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Project</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Campaign Ramadhan 2025"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Platform Checkboxes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Platform yang Digunakan (Pilih Minimal 1)</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {mockPlatforms.map((pl) => (
                      <label key={pl.id} className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs cursor-pointer hover:bg-stone-100">
                        <input
                          type="checkbox"
                          checked={newProjPlatforms.includes(pl.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewProjPlatforms((prev) => [...prev, pl.id])
                            } else {
                              setNewProjPlatforms((prev) => prev.filter((id) => id !== pl.id))
                            }
                          }}
                          className="h-3.5 w-3.5 rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span>{pl.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Grid: Start Date & Deadline */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tanggal Mulai</label>
                    <input
                      type="date"
                      required
                      value={newProjStartDate}
                      onChange={(e) => setNewProjStartDate(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Deadline</label>
                    <input
                      type="date"
                      required
                      value={newProjDeadline}
                      onChange={(e) => setNewProjDeadline(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Grid: Value & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nilai Project (IDR)</label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 15000000"
                      value={newProjValue}
                      onChange={(e) => setNewProjValue(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                    />
                    {newProjValue && (
                      <p className="text-[11px] text-orange-600 font-bold font-mono mt-1">
                        Format: {formatCurrency(parseInt(newProjValue) || 0)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Status</label>
                    <select
                      value={newProjStatus}
                      onChange={(e) => setNewProjStatus(e.target.value as any)}
                      className="w-full h-9 px-2 rounded-lg border border-stone-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="BERJALAN">Berjalan</option>
                      <option value="DRAFT">Draft</option>
                      <option value="PROSES_VERIFIKASI">Proses Verifikasi</option>
                      <option value="SELESAI">Selesai</option>
                    </select>
                  </div>
                </div>

                {/* PIC Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Assign PIC / Team</label>
                  <div className="grid grid-cols-2 gap-2 mt-1 max-h-32 overflow-y-auto border border-stone-100 p-2 rounded-lg bg-stone-50/30">
                    {mockUsers.map((u) => (
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
                          className="h-3 w-3 rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="leading-tight">
                          <p className="font-bold text-stone-800">{u.name}</p>
                          <p className="text-[7px] text-stone-400 font-extrabold uppercase">{u.role}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notice */}
                <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl flex items-start gap-2 text-[10px] text-stone-500 leading-normal">
                  <AlertCircle className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                  <p>
                    Membuat project baru akan otomatis meng-generate 6 fase pengerjaan (Ide, Script, Produksi, dll) serta termin invoice terkait.
                  </p>
                </div>
              </div>

              {/* Footer (fixed) */}
              <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 shrink-0">
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
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  Simpan Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Edit Project */}
      {showEditModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header (fixed) */}
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                <Pencil className="h-4 w-4 text-orange-500" /> Edit Project
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="h-7 w-7 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditProject} className="flex flex-col flex-1 overflow-hidden">
              {/* Body (scrollable) */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[calc(90vh-140px)]">
                {/* Nama Project */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Project</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Campaign Ramadhan 2025"
                    value={editProjName}
                    onChange={(e) => setEditProjName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Platform Checkboxes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Platform yang Digunakan (Pilih Minimal 1)</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {mockPlatforms.map((pl) => (
                      <label key={pl.id} className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs cursor-pointer hover:bg-stone-100">
                        <input
                          type="checkbox"
                          checked={editProjPlatforms.includes(pl.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditProjPlatforms((prev) => [...prev, pl.id])
                            } else {
                              setEditProjPlatforms((prev) => prev.filter((id) => id !== pl.id))
                            }
                          }}
                          className="h-3.5 w-3.5 rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span>{pl.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Grid: Start Date & Deadline */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tanggal Mulai</label>
                    <input
                      type="date"
                      required
                      value={editProjStartDate}
                      onChange={(e) => setEditProjStartDate(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Deadline</label>
                    <input
                      type="date"
                      required
                      value={editProjDeadline}
                      onChange={(e) => setEditProjDeadline(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Grid: Value & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nilai Project (IDR)</label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 15000000"
                      value={editProjValue}
                      onChange={(e) => setEditProjValue(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                    />
                    {editProjValue && (
                      <p className="text-[11px] text-orange-600 font-bold font-mono mt-1">
                        Format: {formatCurrency(parseInt(editProjValue) || 0)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Status</label>
                    <select
                      value={editProjStatus}
                      onChange={(e) => setEditProjStatus(e.target.value as any)}
                      className="w-full h-9 px-2 rounded-lg border border-stone-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="BERJALAN">Berjalan</option>
                      <option value="DRAFT">Draft</option>
                      <option value="PROSES_VERIFIKASI">Proses Verifikasi</option>
                      <option value="SELESAI">Selesai</option>
                    </select>
                  </div>
                </div>

                {/* PIC Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Assign PIC / Team</label>
                  <div className="grid grid-cols-2 gap-2 mt-1 max-h-32 overflow-y-auto border border-stone-100 p-2 rounded-lg bg-stone-50/30">
                    {mockUsers.map((u) => (
                      <label key={u.id} className="flex items-center gap-2 p-1.5 bg-white border border-stone-200 rounded-md text-[11px] cursor-pointer hover:bg-stone-50">
                        <input
                          type="checkbox"
                          checked={editProjPicIds.includes(u.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditProjPicIds((prev) => [...prev, u.id])
                            } else {
                              setEditProjPicIds((prev) => prev.filter((id) => id !== u.id))
                            }
                          }}
                          className="h-3 w-3 rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="leading-tight">
                          <p className="font-bold text-stone-800">{u.name}</p>
                          <p className="text-[7px] text-stone-400 font-extrabold uppercase">{u.role}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer (fixed) */}
              <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
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
