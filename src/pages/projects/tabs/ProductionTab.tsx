import { useState, useEffect } from 'react'
import { Plus, LayoutList, LayoutGrid, CheckCircle2, Circle, Trash2, Pencil, X, Save, Loader2 } from 'lucide-react'
import type { Project } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn, formatDateShort } from '@/lib/utils'
import { api } from '@/lib/api'
import { usePermissions } from '@/hooks/usePermissions'

interface ProductionTabProps {
  project: Project
}

interface ProductionTask {
  id: string
  projectId: string
  platformId: string
  title: string
  assigneeId: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  deadline: string | null
}

interface DBUser {
  id: string
  name: string
  email: string
  role: { name: string }
}

type View = 'list' | 'kanban'

const STATUSES: ProductionTask['status'][] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']

const kanbanColumns: { id: ProductionTask['status']; label: string; color: string; dot: string }[] = [
  { id: 'TODO',        label: 'To Do',       color: 'bg-gray-50 border border-gray-200',     dot: 'bg-gray-400' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-orange-50 border border-orange-200', dot: 'bg-orange-400' },
  { id: 'REVIEW',      label: 'Review',      color: 'bg-purple-50 border border-purple-200', dot: 'bg-purple-400' },
  { id: 'DONE',        label: 'Done',        color: 'bg-green-50 border border-green-200',   dot: 'bg-green-400' },
]

const statusLabel: Record<ProductionTask['status'], string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
}

function TaskFormModal({
  open,
  onClose,
  onSave,
  users,
  projectId,
  platformId,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSave: (task: ProductionTask) => void
  users: DBUser[]
  projectId: string
  platformId: string
  initial?: ProductionTask | null
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId ?? '')
  const [status, setStatus] = useState<ProductionTask['status']>(initial?.status ?? 'TODO')
  const [deadline, setDeadline] = useState(
    initial?.deadline ? initial.deadline.split('T')[0] : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '')
      setAssigneeId(initial?.assigneeId ?? '')
      setStatus(initial?.status ?? 'TODO')
      setDeadline(initial?.deadline ? initial.deadline.split('T')[0] : '')
      setError('')
    }
  }, [open, initial])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Judul task tidak boleh kosong.'); return }
    setLoading(true)
    setError('')
    try {
      let saved: ProductionTask
      if (initial) {
        saved = await api<ProductionTask>(`/projects/${projectId}/tasks/${initial.id}`, {
          method: 'PATCH',
          data: { title: title.trim(), assigneeId: assigneeId || null, status, deadline: deadline || null },
        })
      } else {
        saved = await api<ProductionTask>(`/projects/${projectId}/tasks`, {
          method: 'POST',
          data: { platformId, title: title.trim(), assigneeId: assigneeId || null, status, deadline: deadline || null },
        })
      }
      onSave(saved)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg">{initial ? 'Edit Task' : 'Tambah Task'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Judul Task <span className="text-red-500">*</span></label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Syuting opening video..."
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left',
                    status === s
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-border bg-muted/30 text-muted-foreground hover:border-orange-300'
                  )}
                >
                  <span className={cn('inline-block h-2 w-2 rounded-full mr-1.5', {
                    'bg-gray-400': s === 'TODO',
                    'bg-orange-400': s === 'IN_PROGRESS',
                    'bg-purple-400': s === 'REVIEW',
                    'bg-green-400': s === 'DONE',
                  })} />
                  {statusLabel[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Assignee</label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            >
              <option value="">— Tidak ditugaskan —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role?.name})</option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {initial ? 'Simpan' : 'Tambah Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ProductionTab({ project }: ProductionTabProps) {
  const { hasPermission } = usePermissions()
  const hasAddTask = hasPermission('proj_prod_add_task')
  const hasCheckTask = hasPermission('proj_prod_check_task')

  const [activePlatform, setActivePlatform] = useState(project.platforms[0]?.id ?? '')
  const [viewMode, setViewMode] = useState<View>('kanban')
  const [tasks, setTasks] = useState<ProductionTask[]>([])
  const [users, setUsers] = useState<DBUser[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<ProductionTask | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch users for assignee dropdown
  useEffect(() => {
    api<DBUser[]>('/users').then(setUsers).catch(() => {})
  }, [])

  // Fetch tasks when project/platform changes
  useEffect(() => {
    setIsLoadingTasks(true)
    api<ProductionTask[]>(`/projects/${project.id}/tasks?platformId=${activePlatform}`)
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setIsLoadingTasks(false))
  }, [project.id, activePlatform])

  const platformTasks = tasks.filter(t => t.platformId === activePlatform)
  const completedCount = platformTasks.filter(t => t.status === 'DONE').length
  const progress = platformTasks.length > 0 ? (completedCount / platformTasks.length) * 100 : 0

  const getUserName = (id?: string | null) => users.find(u => u.id === id)?.name ?? 'Unassigned'

  const handleSaveTask = (saved: ProductionTask) => {
    setTasks(prev => {
      const exists = prev.find(t => t.id === saved.id)
      if (exists) return prev.map(t => t.id === saved.id ? saved : t)
      return [...prev, saved]
    })
  }

  const handleToggleStatus = async (task: ProductionTask) => {
    const nextStatus: ProductionTask['status'] = task.status === 'DONE' ? 'TODO' : 'DONE'
    try {
      const updated = await api<ProductionTask>(`/projects/${project.id}/tasks/${task.id}`, {
        method: 'PATCH',
        data: { status: nextStatus },
      })
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
    } catch {}
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Hapus task ini?')) return
    setDeletingId(taskId)
    try {
      await api(`/projects/${project.id}/tasks/${taskId}`, { method: 'DELETE' })
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const handleKanbanStatusChange = async (task: ProductionTask, newStatus: ProductionTask['status']) => {
    if (task.status === newStatus) return
    try {
      const updated = await api<ProductionTask>(`/projects/${project.id}/tasks/${task.id}`, {
        method: 'PATCH',
        data: { status: newStatus },
      })
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
    } catch {}
  }

  const activePlatformName = project.platforms.find(p => p.id === activePlatform)?.name ?? activePlatform

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Platform tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {project.platforms.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setActivePlatform(pl.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activePlatform === pl.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {pl.name}
            </button>
          ))}
        </div>

        {/* View toggle + Add button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={cn('h-8 px-3 flex items-center text-sm transition-colors', viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-muted-foreground hover:bg-muted')}
            >
              <LayoutList className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn('h-8 px-3 flex items-center text-sm transition-colors', viewMode === 'kanban' ? 'bg-orange-500 text-white' : 'text-muted-foreground hover:bg-muted')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
          {hasAddTask && (
          <Button
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => { setEditingTask(null); setModalOpen(true) }}
          >
            Tambah Task
          </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <ProgressBar
        value={progress}
        showLabel
        label={`Progress ${activePlatformName}`}
        color={progress === 100 ? 'green' : 'orange'}
      />

      {/* Loading */}
      {isLoadingTasks && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
        </div>
      )}

      {/* Empty state */}
      {!isLoadingTasks && platformTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-2xl">
          <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-3">
            <LayoutList className="h-7 w-7 text-orange-300" />
          </div>
          <p className="text-sm font-semibold text-foreground">Belum ada task</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Tambah task produksi untuk platform ini</p>
          {hasAddTask && (
          <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => { setEditingTask(null); setModalOpen(true) }}>
            Tambah Task Pertama
          </Button>
          )}
        </div>
      )}

      {/* List view */}
      {!isLoadingTasks && viewMode === 'list' && platformTasks.length > 0 && (
        <div className="space-y-2">
          {platformTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border hover:bg-muted/20 transition-colors group"
            >
              {/* Toggle done */}
              <button
                onClick={() => hasCheckTask && handleToggleStatus(task)}
                className={cn("shrink-0 transition-colors", hasCheckTask ? "text-muted-foreground hover:text-orange-500 cursor-pointer" : "text-muted-foreground/50 cursor-not-allowed")}
                title="Toggle selesai"
                disabled={!hasCheckTask}
              >
                {task.status === 'DONE' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>

              {/* Title + deadline */}
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium truncate', task.status === 'DONE' && 'line-through text-muted-foreground')}>
                  {task.title}
                </p>
                {task.deadline && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Deadline: {formatDateShort(task.deadline)}
                  </p>
                )}
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2 shrink-0">
                {task.assigneeId && (
                  <div className="flex items-center gap-1.5">
                    <Avatar name={getUserName(task.assigneeId)} size="xs" />
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {getUserName(task.assigneeId).split(' ')[0]}
                    </span>
                  </div>
                )}
                <StatusBadge status={task.status} size="sm" />

                {/* Actions (appear on hover) */}
                {hasAddTask && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingTask(task); setModalOpen(true) }}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-orange-500 hover:bg-orange-50 transition-colors"
                    title="Edit task"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={deletingId === task.id}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Hapus task"
                  >
                    {deletingId === task.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kanban view */}
      {!isLoadingTasks && viewMode === 'kanban' && platformTasks.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = platformTasks.filter(t => t.status === col.id)
            return (
              <div key={col.id} className={`rounded-xl p-3 ${col.color}`}>
                {/* Column header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                    <h4 className="text-xs font-semibold text-foreground">{col.label}</h4>
                  </div>
                  <span className="h-5 min-w-5 px-1 bg-white border border-border rounded-full text-xs flex items-center justify-center font-bold text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl p-3 border border-border shadow-sm hover:shadow-md transition-shadow group/card"
                    >
                      <p className="text-sm font-medium text-foreground leading-tight mb-1">{task.title}</p>
                      {task.deadline && (
                        <p className="text-[11px] text-muted-foreground">{formatDateShort(task.deadline)}</p>
                      )}
                      {task.assigneeId && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Avatar name={getUserName(task.assigneeId)} size="xs" />
                          <span className="text-xs text-muted-foreground">{getUserName(task.assigneeId).split(' ')[0]}</span>
                        </div>
                      )}
                      {/* Status change buttons */}
                      {hasCheckTask && (
                      <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-border/60 flex-wrap">
                        {STATUSES.filter(s => s !== task.status).map(s => (
                          <button
                            key={s}
                            onClick={() => handleKanbanStatusChange(task, s)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-muted hover:bg-orange-100 hover:text-orange-600 text-muted-foreground font-medium transition-colors"
                          >
                            → {statusLabel[s]}
                          </button>
                        ))}
                        <div className="ml-auto flex gap-1">
                          {hasAddTask && (
                            <>
                              <button
                                onClick={() => { setEditingTask(task); setModalOpen(true) }}
                                className="opacity-0 group-hover/card:opacity-100 h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-orange-500 transition-all"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="opacity-0 group-hover/card:opacity-100 h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-red-500 transition-all"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      )}
                    </div>
                  ))}

                  {/* Quick add in column */}
                  {hasAddTask && (
                  <button
                    onClick={() => { setEditingTask(null); setModalOpen(true) }}
                    className="w-full text-xs text-muted-foreground flex items-center gap-1 py-2 px-1 hover:text-orange-500 transition-colors rounded-lg hover:bg-white/60"
                  >
                    <Plus className="h-3 w-3" /> Tambah task
                  </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <TaskFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        users={users}
        projectId={project.id}
        platformId={activePlatform}
        initial={editingTask}
      />
    </div>
  )
}
