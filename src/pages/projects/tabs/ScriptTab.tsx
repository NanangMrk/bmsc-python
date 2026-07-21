import { useState, useRef, useCallback, useEffect } from 'react'
import { Plus, Trash2, Save, MessageSquare, Image as ImageIcon, X, Download, Send, Printer } from 'lucide-react'
import type { Project } from '@/lib/mock-data'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { usePermissions } from '@/hooks/usePermissions'

interface ScriptTabProps {
  project: Project
}

interface RowComment {
  id: string
  userId: string
  userName: string
  text: string
  createdAt: string
}

interface ScriptRow {
  id: string
  type: 'row' | 'banner'
  row: string
  audio: string
  visual: string
  image: string
  duration: number
  comments?: RowComment[]
}

interface ScriptSegment {
  id: string
  name: string
  desc: string
  rows: ScriptRow[]
}

let _rowCounter = 10
let _segCounter = 2
function genRowId() { return `r${++_rowCounter}` }
function genSegId() { return `s${++_segCounter}` }

const initialSegments: ScriptSegment[] = [
  {
    id: 's1',
    name: 'OPENING / HOOK',
    desc: 'Konsep & naskah pembuka untuk media',
    rows: [
      { id: 'r1', type: 'row', row: '1.1', audio: 'Audio opening...', visual: 'Visual opening...', image: '', duration: 5 },
      { id: 'r2', type: 'row', row: '1.2', audio: 'Audio (VO / Percakapan / Suara)...', visual: 'Visual deskripsi shot (pemandangan, ekspresi)...', image: '', duration: 0 },
    ],
  },
]

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Parse MM:SS or plain seconds string to total seconds
function parseTime(val: string): number {
  if (val.includes(':')) {
    const [m, s] = val.split(':').map(Number)
    return (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s)
  }
  return parseInt(val) || 0
}



export function ScriptTab({ project }: ScriptTabProps) {
  const { user } = useAuthStore()
  const { hasPermission } = usePermissions()
  const hasAddSeg = hasPermission('proj_script_add_segment')
  const hasDelSeg = hasPermission('proj_script_del_segment')
  const hasAddRow = hasPermission('proj_script_add_row')
  const hasDelRow = hasPermission('proj_script_del_row')
  const hasComment = hasPermission('proj_script_comment')

  const [activePlatform, setActivePlatform] = useState(project.platforms[0]?.id ?? '')
  const [platformSegments, setPlatformSegments] = useState<Record<string, ScriptSegment[]>>(() => {
    const initial: Record<string, ScriptSegment[]> = {}
    project.platforms.forEach((pl) => {
      // Load from project.scripts if available
      const dbSegs = (project as any).scripts?.filter((s: any) => s.platformId === pl.id) || []
      if (dbSegs.length > 0) {
        initial[pl.id] = dbSegs.map((seg: any) => ({
          id: seg.id,
          name: seg.title,
          desc: seg.subtitle || '',
          rows: (seg.rows || []).map((r: any) => ({
            id: r.id,
            type: 'row' as const,
            row: r.rowNumber,
            audio: r.audioText || '',
            visual: r.visualText || '',
            image: r.imageUrl || '',
            duration: r.duration || 0,
            comments: (r.comments || []).map((c: any) => ({
              id: c.id,
              userId: c.userId,
              userName: c.userName,
              text: c.text,
              createdAt: c.createdAt,
            }))
          }))
        }))
      } else {
        initial[pl.id] = []
      }
    })
    return initial
  })

  // Reload from DB when project.scripts changes (e.g. after refetch)
  useEffect(() => {
    if (!(project as any).scripts?.length) return
    setPlatformSegments(prev => {
      const updated = { ...prev }
      project.platforms.forEach((pl) => {
        const dbSegs = (project as any).scripts?.filter((s: any) => s.platformId === pl.id) || []
        if (dbSegs.length > 0) {
          updated[pl.id] = dbSegs.map((seg: any) => ({
            id: seg.id,
            name: seg.title,
            desc: seg.subtitle || '',
            rows: (seg.rows || []).map((r: any) => ({
              id: r.id,
              type: 'row' as const,
              row: r.rowNumber,
              audio: r.audioText || '',
              visual: r.visualText || '',
              image: r.imageUrl || '',
              duration: r.duration || 0,
              comments: (r.comments || []).map((c: any) => ({
                id: c.id,
                userId: c.userId,
                userName: c.userName,
                text: c.text,
                createdAt: c.createdAt,
              }))
            }))
          }))
        }
      })
      return updated
    })
  }, [(project as any).scripts])

  // Sync imageUrls when scripts reload from DB
  useEffect(() => {
    const urls: Record<string, string> = {}
    project.platforms.forEach((pl) => {
      const dbSegs = (project as any).scripts?.filter((s: any) => s.platformId === pl.id) || []
      dbSegs.forEach((seg: any) => {
        (seg.rows || []).forEach((r: any) => {
          if (r.imageUrl) urls[r.id] = r.imageUrl
        })
      })
    })
    if (Object.keys(urls).length > 0) setImageUrls(prev => ({ ...urls, ...prev }))
  }, [(project as any).scripts])
  const segments = platformSegments[activePlatform] || []
  const [isDirty, setIsDirty] = useState(false)

  // Initialize imageUrls from DB data
  const [imageUrls, setImageUrls] = useState<Record<string, string>>(() => {
    const urls: Record<string, string> = {}
    project.platforms.forEach((pl) => {
      const dbSegs = (project as any).scripts?.filter((s: any) => s.platformId === pl.id) || []
      dbSegs.forEach((seg: any) => {
        (seg.rows || []).forEach((r: any) => {
          if (r.imageUrl) urls[r.id] = r.imageUrl
        })
      })
    })
    return urls
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Comment state
  const [commentRowId, setCommentRowId] = useState<{segId: string, rowId: string, segName: string, rowName: string} | null>(null)
  const [commentText, setCommentText] = useState('')

  // Refs map: audioRefs[rowId], visualRefs[rowId], durationRefs[rowId]
  const audioRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const visualRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const durationRefs = useRef<Record<string, HTMLInputElement | null>>({})
  // Segment name & desc refs
  const segNameRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const segDescRefs = useRef<Record<string, HTMLInputElement | null>>({})
  // Single hidden file input + active row tracker for image upload
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const activeImageRowId = useRef<string>('')

  const handleImagePick = (rowId: string) => {
    activeImageRowId.current = rowId
    imageInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const rowId = activeImageRowId.current

    // Upload file to server
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('http://localhost:3000/api/upload/single', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (data.url) {
        setImageUrls(prev => ({ ...prev, [rowId]: `http://localhost:3000${data.url}` }))
      }
    } catch {
      // fallback to local preview if upload fails
      const reader = new FileReader()
      reader.onload = (ev) => {
        const url = ev.target?.result as string
        if (url) setImageUrls(prev => ({ ...prev, [rowId]: url }))
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  // Platform Switcher that commits current DOM to state first
  const handlePlatformSwitch = (newPlId: string) => {
    if (newPlId === activePlatform) return
    setPlatformSegments(prev => ({
      ...prev,
      [activePlatform]: prev[activePlatform].map(seg => ({
        ...seg,
        name: segNameRefs.current[seg.id]?.value ?? seg.name,
        desc: segDescRefs.current[seg.id]?.value ?? seg.desc,
        rows: seg.rows.map(r => {
          if (r.type === 'banner') return r
          return {
            ...r,
            audio: audioRefs.current[r.id]?.value ?? r.audio,
            visual: visualRefs.current[r.id]?.value ?? r.visual,
            duration: parseTime(durationRefs.current[r.id]?.value ?? String(r.duration)),
          }
        })
      }))
    }))
    setActivePlatform(newPlId)
  }

  // Collect all live DOM values, commit to state, then save to API
  const handleSave = useCallback(async () => {
    // Build updated segments synchronously from refs + current imageUrls
    const currentPlatformSegs = platformSegments[activePlatform] || []
    const updatedSegs: ScriptSegment[] = currentPlatformSegs.map(seg => ({
      ...seg,
      name: segNameRefs.current[seg.id]?.value ?? seg.name,
      desc: segDescRefs.current[seg.id]?.value ?? seg.desc,
      rows: seg.rows.map(r => {
        if (r.type === 'banner') return r
        return {
          ...r,
          audio: audioRefs.current[r.id]?.value ?? r.audio,
          visual: visualRefs.current[r.id]?.value ?? r.visual,
          duration: parseTime(durationRefs.current[r.id]?.value ?? String(r.duration)),
          image: imageUrls[r.id] ?? r.image, // include uploaded image URL
        }
      })
    }))

    // Update local state
    setPlatformSegments(prev => ({ ...prev, [activePlatform]: updatedSegs }))

    // Save to API
    try {
      const result: any = await api(`/projects/${project.id}/scripts/save`, {
        method: 'POST',
        data: { platformId: activePlatform, segments: updatedSegs }
      })

      // Update local state with real DB IDs returned from server
      if (result?.segments && Array.isArray(result.segments)) {
        const serverSegs: ScriptSegment[] = result.segments.map((seg: any, segIdx: number) => {
          const localSeg = updatedSegs[segIdx]
          return {
            id: seg.id,
            name: seg.title || localSeg?.name || '',
            desc: seg.subtitle || localSeg?.desc || '',
            rows: (seg.rows || []).map((r: any, rIdx: number) => {
              const localRow = localSeg?.rows[rIdx]
              return {
                id: r.id,
                type: 'row' as const,
                row: r.rowNumber || localRow?.row || '',
                audio: r.audioText || localRow?.audio || '',
                visual: r.visualText || localRow?.visual || '',
                image: r.imageUrl || imageUrls[localRow?.id ?? ''] || localRow?.image || '',
                duration: r.duration || localRow?.duration || 0,
                comments: localRow?.comments || [],
              }
            })
          }
        })
        setPlatformSegments(prev => ({ ...prev, [activePlatform]: serverSegs }))
      }

      setIsDirty(false)
      alert('Skrip berhasil disimpan!')
    } catch (err: any) {
      alert(`Gagal menyimpan skrip: ${err.message}`)
    }
  }, [activePlatform, project.id, platformSegments, imageUrls])

  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !commentRowId) return
    if (!user) {
      alert('Anda harus login untuk menambahkan komentar.')
      return
    }
    // If rowId is not a valid UUID, it means the script hasn't been saved to DB yet
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(commentRowId.rowId)
    if (!isUUID) {
      alert('Simpan skrip terlebih dahulu sebelum menambahkan komentar.')
      return
    }
    setIsSubmittingComment(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3000/api/projects/${project.id}/scripts/rows/${commentRowId.rowId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText.trim() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Gagal mengirim komentar')
      }

      const savedComment: RowComment = await res.json()

      // Update local state with saved comment from DB
      setPlatformSegments(prev => ({
        ...prev,
        [activePlatform]: prev[activePlatform].map(seg => {
          if (seg.id !== commentRowId.segId) return seg
          return {
            ...seg,
            rows: seg.rows.map(r => {
              if (r.id !== commentRowId.rowId) return r
              return { ...r, comments: [...(r.comments || []), savedComment] }
            })
          }
        })
      }))

      setCommentText('')
      // Keep modal open so user can see the new comment
    } catch (err: any) {
      alert(`Gagal menambahkan komentar: ${err.message}`)
    } finally {
      setIsSubmittingComment(false)
    }
  }


  const addRow = (segId: string) => {
    setPlatformSegments(prev => ({
      ...prev,
      [activePlatform]: prev[activePlatform].map(seg => {
        if (seg.id !== segId) return seg
        const segIdx = prev[activePlatform].findIndex(s => s.id === segId) + 1
        const rowIdx = seg.rows.filter(r => r.type === 'row').length + 1
        return {
          ...seg,
          rows: [...seg.rows, {
            id: genRowId(), type: 'row',
            row: `${segIdx}.${rowIdx}`,
            audio: '', visual: '', image: '', duration: 0,
          }]
        }
      })
    }))
    setIsDirty(true)
  }

  const addSegment = () => {
    setPlatformSegments(prev => {
      const segNum = prev[activePlatform].length + 1
      return {
        ...prev,
        [activePlatform]: [...prev[activePlatform], {
          id: genSegId(),
          name: `SEGMENT ${segNum}`,
          desc: 'Deskripsi segment baru',
          rows: [{
            id: genRowId(), type: 'row',
            row: `${segNum}.1`,
            audio: '', visual: '', image: '', duration: 0,
          }]
        }]
      }
    })
    setIsDirty(true)
  }

  const deleteRow = (segId: string, rowId: string) => {
    setPlatformSegments(prev => ({
      ...prev,
      [activePlatform]: prev[activePlatform].map(seg =>
        seg.id !== segId ? seg : { ...seg, rows: seg.rows.filter(r => r.id !== rowId) }
      )
    }))
    setIsDirty(true)
  }

  const deleteSegment = (segId: string) => {
    setPlatformSegments(prev => ({
      ...prev,
      [activePlatform]: prev[activePlatform].filter(s => s.id !== segId)
    }))
    setIsDirty(true)
  }

  return (
    <div className="space-y-6">
      <style>
        {`
          @media print {
            aside, header, nav, button, .no-print, .fixed {
              display: none !important;
            }
            body, main, .bg-background {
              background: white !important;
            }
            textarea, input {
              border: none !important;
              background: transparent !important;
              resize: none !important;
              color: black !important;
            }
            .shadow-sm, .shadow-2xl {
              box-shadow: none !important;
            }
            /* Hide the hidden file input fully just in case */
            input[type="file"] {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Hidden file input for row image upload */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Platform tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 print:hidden">
        {project.platforms.map((pl) => (
          <button
            key={pl.id}
            onClick={() => handlePlatformSwitch(pl.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activePlatform === pl.id
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {pl.name}
          </button>
        ))}
      </div>

      <div key={activePlatform} className="space-y-6">
        {/* Segment Blocks */}
        {segments.map((seg) => {

        return (
          <div key={seg.id} className="bg-white border border-border/80 rounded-[20px] shadow-sm p-8">
            {/* Header — inline editable */}
            <div className="text-center mb-10 relative">
              <input
                ref={(el) => { segNameRefs.current[seg.id] = el }}
                defaultValue={seg.name}
                onInput={() => setIsDirty(true)}
                className="w-full text-center text-2xl md:text-3xl font-black uppercase tracking-wider mb-2 bg-transparent focus:outline-none border-b-2 border-transparent focus:border-orange-300 transition-colors placeholder:text-muted-foreground/30 text-foreground"
                placeholder="NAMA SEGMENT"
              />
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <input
                  ref={(el) => { segDescRefs.current[seg.id] = el }}
                  defaultValue={seg.desc}
                  onInput={() => setIsDirty(true)}
                  className="text-center text-sm text-muted-foreground italic font-medium bg-transparent focus:outline-none border-b border-transparent focus:border-orange-200 transition-colors placeholder:text-muted-foreground/30 w-80"
                  placeholder="Deskripsi segment..."
                />
              </div>
              {segments.length > 1 && hasDelSeg && (
                <button
                  onClick={() => deleteSegment(seg.id)}
                  className="absolute top-0 right-0 h-7 w-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus Segment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Table */}
            <div className="w-full">
              {/* Header */}
              <div className="flex border-b-[1.5px] border-foreground pb-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                <div className="w-[9%]">ROW</div>
                <div className="w-[34%]">AUDIO</div>
                <div className="w-[34%]">VISUAL</div>
                <div className="w-[11%] text-center">IMAGE</div>
                <div className="w-[8%] text-right">DURATION</div>
                <div className="w-[4%]"></div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border/40">
                {seg.rows.map((row) => (
                  <div key={row.id} className="flex py-5 group">
                    {/* Row number */}
                    <div className="w-[9%] pr-3 flex-shrink-0 pt-1">
                      <div className="font-bold text-sm">{row.row}</div>
                    </div>

                    {/* Audio — UNCONTROLLED textarea, no onChange */}
                    <div className="w-[34%] pr-6">
                      <textarea
                        ref={(el) => { audioRefs.current[row.id] = el }}
                        className="w-full min-h-[80px] text-sm font-medium text-foreground bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/40 leading-relaxed border-b border-transparent focus:border-orange-200 transition-colors"
                        defaultValue={row.audio}
                        placeholder="Tulis naskah audio / VO di sini..."
                        onInput={() => setIsDirty(true)}
                      />
                    </div>

                    {/* Visual — UNCONTROLLED textarea, no onChange */}
                    <div className="w-[34%] pr-6">
                      <textarea
                        ref={(el) => { visualRefs.current[row.id] = el }}
                        className="w-full min-h-[80px] text-sm font-medium text-foreground bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/40 leading-relaxed border-b border-transparent focus:border-orange-200 transition-colors"
                        defaultValue={row.visual}
                        placeholder="Deskripsi visual / shot..."
                        onInput={() => setIsDirty(true)}
                      />
                    </div>

                    {/* Image slot */}
                    <div className="w-[11%] pr-4 flex justify-center flex-shrink-0">
                      {imageUrls[row.id] ? (
                        <div className="relative w-full h-[70px] group/img">
                          <img
                            src={imageUrls[row.id]}
                            alt="scene"
                            className="w-full h-full object-cover rounded-xl border border-border/60 cursor-pointer"
                            onClick={() => setPreviewImage(imageUrls[row.id])}
                          />
                          <button
                            onClick={() => setImageUrls(prev => { const n = {...prev}; delete n[row.id]; return n })}
                            className="absolute top-1 right-1 h-5 w-5 bg-black/50 hover:bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                            title="Hapus gambar"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleImagePick(row.id)}
                          className="w-full h-[70px] rounded-xl border border-dashed border-border/80 bg-gray-50/50 hover:bg-orange-50 hover:border-orange-300 flex flex-col items-center justify-center text-muted-foreground transition-colors group/pick"
                        >
                          <ImageIcon className="h-4 w-4 mb-1.5 opacity-40 group-hover/pick:opacity-70 group-hover/pick:text-orange-500" />
                          <span className="text-[8px] font-bold tracking-widest uppercase opacity-40 group-hover/pick:opacity-70 group-hover/pick:text-orange-500">PILIH</span>
                        </button>
                      )}
                    </div>

                    {/* Duration — UNCONTROLLED input, MM:SS format */}
                    <div className="w-[8%] text-right pl-2 flex-shrink-0">
                      <input
                        type="text"
                        ref={(el) => { durationRefs.current[row.id] = el }}
                        defaultValue={formatTime(row.duration)}
                        placeholder="00:00"
                        maxLength={5}
                        className="w-full text-sm font-bold text-right font-mono tracking-widest bg-transparent focus:outline-none mb-1 border-b border-transparent focus:border-orange-200 transition-colors placeholder:text-muted-foreground/30"
                        title="Durasi (MM:SS)"
                        onInput={() => setIsDirty(true)}
                      />
                      <div className="text-[9px] text-muted-foreground font-semibold uppercase mb-3">MM:SS</div>
                      <button
                        onClick={() => setCommentRowId({ segId: seg.id, rowId: row.id, segName: seg.name, rowName: row.row })}
                        className="flex items-center justify-end gap-1 text-xs text-muted-foreground hover:text-orange-500 transition-colors w-full cursor-pointer group/cmt"
                        title="Lihat / Tambahkan Komentar"
                      >
                        <MessageSquare className={cn("h-3 w-3 transition-opacity", (row.comments?.length || 0) > 0 ? "opacity-100 text-orange-500" : "opacity-50 group-hover/cmt:opacity-100")} />
                        <span className={cn("font-medium text-[10px] transition-opacity", (row.comments?.length || 0) > 0 ? "opacity-100 text-orange-500" : "opacity-50 group-hover/cmt:opacity-100")}>{row.comments?.length || 0}</span>
                      </button>
                    </div>

                    {/* Delete row */}
                    {hasDelRow && (
                    <div className="w-[4%] flex items-start justify-end pl-1 pt-1">
                      <button
                        onClick={() => deleteRow(seg.id, row.id)}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Hapus Row"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Per-segment action buttons */}
            <div className="flex items-center gap-4 mt-6 pt-5 border-t border-dashed border-border/50">
              {hasAddRow && (
              <button
                onClick={() => addRow(seg.id)}
                className="text-orange-600 hover:text-orange-700 font-bold text-xs flex items-center gap-1.5 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Row
              </button>
              )}
              {hasAddSeg && (
              <button
                onClick={addSegment}
                className="text-indigo-500 hover:text-indigo-700 font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Segment
              </button>
              )}
            </div>
          </div>
        )
      })}
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-50/50 border border-border/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between mt-4 gap-3 no-print">
        <div className="flex items-center gap-3">
          {hasAddSeg && (
          <button
            onClick={addSegment}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-orange-200 text-orange-600 rounded-full text-sm font-bold hover:bg-orange-50 transition-colors"
          >
            <Plus className="h-4 w-4" /> Tambah Segment
          </button>
          )}
          {/* Simpan button */}
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm",
              isDirty
                ? "bg-orange-600 hover:bg-orange-700 text-white animate-pulse"
                : "bg-orange-600 hover:bg-orange-700 text-white"
            )}
          >
            <Save className="h-4 w-4" /> Simpan Skrip
          </button>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border text-foreground rounded-full text-sm font-bold hover:bg-muted transition-colors shadow-sm"
        >
          <Printer className="h-4 w-4" /> Cetak Halaman
        </button>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            {/* Toolbar */}
            <div className="absolute top-0 right-0 -translate-y-full pb-4 flex gap-3">
              <a
                href={previewImage}
                download="preview-image.png"
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                title="Unduh Gambar"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                title="Tutup Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Image */}
            <img 
              src={previewImage} 
              alt="Preview Full" 
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/20"
            />
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentRowId && (() => {
        const activeRow = segments.find(s => s.id === commentRowId.segId)?.rows.find(r => r.id === commentRowId.rowId)
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-bold text-lg">Komentar Row {commentRowId.rowName}</h3>
                <button onClick={() => setCommentRowId(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4 shrink-0">
                Komentar dapat dilihat oleh tim project.
              </p>

              {/* Warning if script not yet saved */}
              {!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(commentRowId.rowId) && (
                <div className="mb-4 shrink-0 bg-orange-50 border border-orange-200 text-orange-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                  <span className="text-lg leading-none">⚠️</span>
                  <span><strong>Simpan skrip terlebih dahulu</strong> sebelum menambahkan komentar. Klik tombol "Simpan Skrip" di bawah halaman.</span>
                </div>
              )}

              {/* Existing Comments List */}
              <div className="flex-1 overflow-y-auto min-h-[100px] max-h-[300px] mb-4 space-y-3 pr-2 scrollbar-thin">
                {(!activeRow?.comments || activeRow.comments.length === 0) ? (
                  <div className="text-center text-sm text-muted-foreground py-8">Belum ada komentar di row ini.</div>
                ) : (
                  activeRow.comments.map(c => (
                    <div key={c.id} className="bg-muted/30 p-3 rounded-xl border border-border/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold">{c.userName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(c.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <div className="shrink-0 pt-2 border-t border-border/50">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault()
                      handleCommentSubmit()
                    }
                  }}
                  placeholder={hasComment ? "Tulis komentar... (Ctrl+Enter untuk kirim)" : "Anda tidak memiliki akses untuk memberikan komentar."}
                  className="w-full min-h-[80px] p-3 rounded-xl border border-border bg-muted/50 text-sm resize-none focus:outline-none focus:border-orange-300 transition-colors mb-4 disabled:opacity-60"
                  autoFocus
                  disabled={isSubmittingComment || !hasComment}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!commentText.trim() || isSubmittingComment || !hasComment}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmittingComment ? 'Mengirim...' : 'Kirim Komentar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
