import { useState } from 'react'
import { Plus, LayoutList, LayoutGrid, CheckCircle2, Circle } from 'lucide-react'
import type { Project } from '@/lib/mock-data'
import { mockTasks } from '@/lib/mock-data'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { mockUsers } from '@/lib/mock-data'
import { cn, formatDateShort } from '@/lib/utils'

interface ProductionTabProps {
  project: Project
}

type View = 'list' | 'kanban'

const kanbanColumns = [
  { id: 'TODO', label: 'To Do', color: 'bg-gray-100' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-orange-50' },
  { id: 'REVIEW', label: 'Review', color: 'bg-purple-50' },
  { id: 'DONE', label: 'Done', color: 'bg-green-50' },
]

export function ProductionTab({ project }: ProductionTabProps) {
  const [activePlatform, setActivePlatform] = useState(project.platforms[0]?.id ?? '')
  const [viewMode, setViewMode] = useState<View>('list')

  const platformTasks = mockTasks.filter(
    (t) => t.projectId === project.id && t.platformId === activePlatform
  )

  const completedCount = platformTasks.filter((t) => t.completed).length
  const progress = platformTasks.length > 0 ? (completedCount / platformTasks.length) * 100 : 0

  const getUserName = (id?: string) => mockUsers.find((u) => u.id === id)?.name ?? 'Unassigned'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {project.platforms.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setActivePlatform(pl.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activePlatform === pl.id ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {pl.name}
            </button>
          ))}
        </div>
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
          <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
            Tambah Task
          </Button>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar value={progress} showLabel label={`Progress ${activePlatform === project.platforms[0]?.id ? project.platforms[0]?.name : project.platforms[1]?.name}`} color={progress === 100 ? 'green' : 'orange'} />

      {/* List view */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {platformTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border hover:bg-muted/20 transition-colors group">
              <button className="shrink-0 text-muted-foreground hover:text-orange-500 transition-colors">
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', task.completed && 'line-through text-muted-foreground')}>
                  {task.name}
                </p>
                {task.deadline && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Deadline: {formatDateShort(task.deadline)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {task.picId && (
                  <div className="flex items-center gap-1.5">
                    <Avatar name={getUserName(task.picId)} size="xs" />
                    <span className="text-xs text-muted-foreground hidden sm:block">{getUserName(task.picId).split(' ')[0]}</span>
                  </div>
                )}
                <StatusBadge status={task.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kanban view */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = platformTasks.filter((t) => t.status === col.id)
            return (
              <div key={col.id} className={`rounded-xl p-3 ${col.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col.label}</h4>
                  <span className="h-5 w-5 bg-background rounded-full text-xs flex items-center justify-center font-bold text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg p-3 border border-border shadow-sm hover:shadow-md transition-shadow cursor-grab"
                    >
                      <p className="text-sm font-medium">{task.name}</p>
                      {task.deadline && (
                        <p className="text-xs text-muted-foreground mt-1">{formatDateShort(task.deadline)}</p>
                      )}
                      {task.picId && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Avatar name={getUserName(task.picId)} size="xs" />
                          <span className="text-xs text-muted-foreground">{getUserName(task.picId).split(' ')[0]}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <button className="w-full text-xs text-muted-foreground flex items-center gap-1 py-2 hover:text-foreground transition-colors">
                    <Plus className="h-3 w-3" /> Tambah task
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
