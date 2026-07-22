import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CreditCard,
  Lightbulb,
  FileText,
  Clapperboard,
  Upload,
  RefreshCw,
  MessageCircle,
  X,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
// auth handled via usePermissions
import { usePermissions } from '@/hooks/usePermissions'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Tab components
import { PaymentTab } from './tabs/PaymentTab'
import { ShipmentTab } from './tabs/ShipmentTab'
import { ConceptTab } from './tabs/ConceptTab'
import { ScriptTab } from './tabs/ScriptTab'
import { ProductionTab } from './tabs/ProductionTab'
import { UploadTab } from './tabs/UploadTab'
import { ChatTab } from './tabs/ChatTab'

// Match screenshot phases
const phases = [
  { id: 'payment', label: '1. PAYMENT & DP', icon: CreditCard, status: 'SELESAI' },
  { id: 'concept', label: '2. IDE & KONSEP', icon: Lightbulb, status: 'MENUNGGU' },
  { id: 'script', label: '3. SCRIPT & BRIEF', icon: FileText, status: 'MENUNGGU' },
  { id: 'production', label: '4. PRODUKSI (KTS)', icon: Clapperboard, status: 'MENUNGGU' },
  { id: 'upload', label: '5. UPLOAD & REPORT', icon: Upload, status: 'MENUNGGU' },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const hasPhaseStatusPerm = hasPermission('proj_phase_status')
  const hasChatViewPerm = hasPermission('proj_chat_view')

  const [activeTab, setActiveTab] = useState('payment')
  const [isChatOpen, setIsChatOpen] = useState(false)

  const { data: rawProject, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api<any>(`/projects/${id}`)
  })

  // Format the raw backend project to the expected frontend structure
  const project = rawProject ? {
    id: rawProject.id,
    name: rawProject.name,
    brandId: rawProject.brandId,
    brand: rawProject.brand || { name: 'Unknown Brand' },
    startDate: rawProject.startDate,
    deadline: rawProject.deadline,
    value: parseFloat(rawProject.totalValue || '0'),
    status: rawProject.status,
    platforms: rawProject.platforms?.map((pl: any) => pl.platform) || [],
    picIds: [],
    progress: rawProject.progress || 1,
    phaseStatuses: rawProject.phaseStatuses || null,
    createdAt: rawProject.createdAt,
    // Add phase data explicitly for tabs to consume if they need it
    payments: rawProject.payments || [],
    shipments: rawProject.shipments || [],
    conceptPages: rawProject.conceptPages || [],
    scripts: rawProject.scripts || [],
    productionTasks: rawProject.productionTasks || [],
    uploads: rawProject.uploads || [],
    chatMessages: rawProject.chatMessages || []
  } : null;

  // Track phase completion statuses dynamically
  const [phaseStatuses, setPhaseStatuses] = useState<Record<string, 'MENUNGGU' | 'SELESAI'>>(() => {
    if (project?.phaseStatuses) {
      return typeof project.phaseStatuses === 'string' ? JSON.parse(project.phaseStatuses) : project.phaseStatuses
    }
    return {
      payment: 'MENUNGGU',
      concept: 'MENUNGGU',
      script: 'MENUNGGU',
      production: 'MENUNGGU',
      upload: 'MENUNGGU',
    }
  })

  useEffect(() => {
    if (project) {
      if (project.phaseStatuses) {
        setPhaseStatuses(typeof project.phaseStatuses === 'string' ? JSON.parse(project.phaseStatuses) : project.phaseStatuses)
      } else {
        setPhaseStatuses({
          payment: 'MENUNGGU',
          concept: 'MENUNGGU',
          script: 'MENUNGGU',
          production: 'MENUNGGU',
          upload: 'MENUNGGU',
        })
      }
    }
  }, [project?.phaseStatuses])

  // Track unsaved modifications per phase
  const [tempStatuses, setTempStatuses] = useState<Record<string, 'MENUNGGU' | 'SELESAI'>>({})

  const handleSelectStatus = (phaseId: string, status: 'MENUNGGU' | 'SELESAI') => {
    setTempStatuses(prev => ({
      ...prev,
      [phaseId]: status
    }))
  }

  const queryClient = useQueryClient();

  const handleSaveStatus = async (phaseId: string) => {
    const newStatus = tempStatuses[phaseId]
    if (!newStatus) return

    const updated = {
      ...phaseStatuses,
      [phaseId]: newStatus
    }
    setPhaseStatuses(updated)

    // Calculate progress (number of completed phases)
    const completedCount = Object.values(updated).filter(s => s === 'SELESAI').length

    try {
      await api(`/projects/${id}/progress`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          progress: completedCount,
          phaseStatuses: updated
        })
      })

      // Invalidate the project query to refetch the latest from DB
      queryClient.invalidateQueries({ queryKey: ['project', id] })

      setTempStatuses(prev => {
        const copy = { ...prev }
        delete copy[phaseId]
        return copy
      })

      alert(`Status fase berhasil disimpan! Progress proyek sekarang ${completedCount}/5 fase.`)
    } catch (err: any) {
      alert(`Gagal menyimpan progress fase: ${err.message}`)
    }
  }

  const handleDeleteProject = () => {
    if (confirm('Apakah Anda yakin ingin menghapus project ini secara permanen?')) {
      alert('Fitur hapus belum tersedia di API.')
    }
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading project data...</div>
  if (!project) return <div className="p-8 text-center text-red-500">Project not found.</div>

  const renderTab = () => {
    switch (activeTab) {
      case 'payment': return <PaymentTab project={project} />
      case 'shipment': return <ShipmentTab project={project} />
      case 'concept': return <ConceptTab project={project} />
      case 'script': return <ScriptTab project={project} />
      case 'production': return <ProductionTab project={project} />
      case 'upload': return <UploadTab project={project} />
      case 'chat': return <ChatTab project={project} />
      default: return null
    }
  }

  // Find active phase label
  const activePhaseLabel = phases.find(p => p.id === activeTab)?.label || 'Chat'

  const isProductionPhase = phases.some(p => p.id === activeTab)
  const currentPhaseStatus = tempStatuses[activeTab] ?? phaseStatuses[activeTab]
  const hasStatusChanged = tempStatuses[activeTab] !== undefined && tempStatuses[activeTab] !== phaseStatuses[activeTab]

  return (
    <div className="space-y-6">
      {/* Project Header Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white p-6 rounded-xl border border-border/60 print:hidden">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate('/projects'); }}
            className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border border-border/80 hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold tracking-widest uppercase">
              <span className="text-orange-600">{project.brand.name}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">ID: camp-new-{Date.now()}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {project.status === 'DRAFT' && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase">
              <div className="h-1.5 w-1.5 bg-gray-500 rounded-full"></div>
              DRAFT
            </div>
          )}
          {project.status === 'BERJALAN' && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase">
              <div className="h-1.5 w-1.5 bg-amber-500 rounded-full"></div>
              PROYEK BERJALAN
              <RefreshCw className="h-3 w-3 ml-1" />
            </div>
          )}
          {project.status === 'PROSES_VERIFIKASI' && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase">
              <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
              VERIFIKASI
            </div>
          )}
          {project.status === 'SELESAI' && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
              SELESAI
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 ml-1"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          )}
          
          {hasPermission('proj_delete') && (
            <button
              onClick={handleDeleteProject}
              className="ml-2 h-9 w-9 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Hapus Project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="bg-white rounded-xl border border-border/60 p-6 print:hidden">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-orange-600/80 uppercase tracking-widest">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h6v6H3z"/><path d="M15 3h6v6h-6z"/><path d="M9 21H3v-6h6z"/><path d="M21 21h-6v-6h6z"/></svg>
          ROADMAP ALUR PRODUKSI KONTEN
        </div>

        {/* Phase Cards */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {phases.map((phase) => {
            const isActive = activeTab === phase.id;
            const isDone = (tempStatuses[phase.id] ?? phaseStatuses[phase.id]) === 'SELESAI';
            return (
              <button
                key={phase.id}
                onClick={() => setActiveTab(phase.id)}
                className={cn(
                  "flex-shrink-0 w-56 p-4 rounded-xl border text-left transition-all",
                  isActive ? "border-orange-500 shadow-sm bg-white" : "border-border/60 hover:border-gray-300 bg-white"
                )}
              >
                <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-3">
                  {phase.label}
                </div>
                {isDone ? (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase tracking-wider">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    SELESAI
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-wider">
                    MENUNGGU
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content Section */}
      <div className="bg-white rounded-xl border border-border/60 p-6 animate-in print:border-none print:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/40 print:hidden">
          <div>
            <div className="text-[10px] font-bold text-orange-600/80 uppercase tracking-widest mb-1">
              WORKSPACE FASE TERPILIH
            </div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Fase: {activePhaseLabel.split('.')[1]?.trim() || activePhaseLabel}
            </h2>
          </div>
          {isProductionPhase && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">STATUS FASE:</span>
              <div className="flex items-center gap-2.5">
                <select
                  value={currentPhaseStatus}
                  onChange={(e) => handleSelectStatus(activeTab, e.target.value as any)}
                  disabled={!hasPhaseStatusPerm}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white transition-colors",
                    hasPhaseStatusPerm ? "cursor-pointer" : "cursor-not-allowed opacity-90",
                    currentPhaseStatus === 'SELESAI'
                      ? "border-green-200 text-green-700 bg-green-50/20"
                      : "border-amber-200 text-amber-700 bg-amber-50/20"
                  )}
                >
                  <option value="MENUNGGU">MENUNGGU</option>
                  <option value="SELESAI">SELESAI</option>
                </select>

                {hasPhaseStatusPerm && hasStatusChanged && (
                  <button
                    onClick={() => handleSaveStatus(activeTab)}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md transition-all animate-pulse uppercase tracking-wider animate-in fade-in duration-200"
                    type="button"
                  >
                    Simpan
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {renderTab()}
      </div>

      {/* Floating Chat */}
      {activeTab !== 'chat' && hasChatViewPerm && (
        <div className="print:hidden">
          {/* Chat Button */}
          <button
            onClick={() => setIsChatOpen(true)}
            className={cn(
              "fixed bottom-6 right-6 h-14 w-14 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-700 transition-all hover:scale-105 z-40",
              isChatOpen && "scale-0 opacity-0"
            )}
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 border-2 border-white rounded-full"></span>
          </button>

          {/* Chat Popup */}
          <div
            className={cn(
              "fixed bottom-6 right-6 w-[400px] bg-white rounded-2xl shadow-2xl border border-border/60 z-50 transition-all origin-bottom-right duration-200 flex flex-col",
              isChatOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/60 bg-orange-50/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Diskusi: {activePhaseLabel.split('.')[1]?.trim() || activePhaseLabel}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Tim Internal & Brand</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-black/5 hover:text-foreground rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Content */}
            <div className="p-4 bg-white rounded-b-2xl">
              <ChatTab project={project} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
