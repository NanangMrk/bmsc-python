import { useState, useEffect } from 'react'
import { Link2, Plus, Trash2, ExternalLink, Youtube, Instagram, Loader2, Globe } from 'lucide-react'
import type { Project } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { cn, formatDateShort } from '@/lib/utils'
import { api } from '@/lib/api'
import { usePermissions } from '@/hooks/usePermissions'

interface UploadTabProps {
  project: Project
}

interface UploadedLink {
  id: string
  projectId: string
  platformId: string
  url: string
  title: string | null
  thumbnail: string | null
  createdAt: string
}

// ─── Helpers untuk thumbnail & judul dari URL ─────────────────────────────────

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function detectPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
  if (url.includes('instagram.com')) return 'Instagram'
  if (url.includes('tiktok.com')) return 'TikTok'
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook'
  if (url.includes('twitter.com') || url.includes('x.com')) return 'X (Twitter)'
  return 'Lainnya'
}

async function fetchLinkMeta(url: string): Promise<{ title: string; thumbnail: string | null }> {
  const ytId = getYouTubeId(url)

  // YouTube: thumbnail langsung dari CDN (tidak perlu CORS), judul via proxy
  if (ytId) {
    const thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `http://localhost:3000/api/projects/oembed-proxy?url=${encodeURIComponent(url)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) {
        const data = await res.json()
        return { title: data.title || `YouTube — ${ytId}`, thumbnail }
      }
    } catch {}
    return { title: `YouTube — ${ytId}`, thumbnail }
  }

  // TikTok, Instagram, atau lainnya — semua via backend proxy (tidak ada CORS)
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(
      `http://localhost:3000/api/projects/oembed-proxy?url=${encodeURIComponent(url)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (res.ok) {
      const data = await res.json()
      const title = data.title || data.author_name || url.split('/').pop() || url
      const thumbnail = data.thumbnail_url || null
      return { title, thumbnail }
    }
  } catch {}

  // Fallback: gunakan slug URL sebagai judul
  try {
    const slug = new URL(url).pathname.split('/').filter(Boolean).pop() || url
    return { title: slug, thumbnail: null }
  } catch {
    return { title: url, thumbnail: null }
  }
}

// ─── Platform icon & color ────────────────────────────────────────────────────

const platformConfig: Record<string, { icon: any; color: string; bg: string }> = {
  YouTube:    { icon: Youtube,   color: 'text-red-500',    bg: 'bg-red-50' },
  Instagram:  { icon: Instagram, color: 'text-pink-500',   bg: 'bg-pink-50' },
  TikTok:     { icon: Link2,     color: 'text-gray-800',   bg: 'bg-gray-100' },
  Facebook:   { icon: Globe,     color: 'text-blue-600',   bg: 'bg-blue-50' },
  'X (Twitter)': { icon: Globe,  color: 'text-sky-500',    bg: 'bg-sky-50' },
  Lainnya:    { icon: Globe,     color: 'text-orange-500', bg: 'bg-orange-50' },
}

function getPlatformConfig(url: string) {
  const name = detectPlatform(url)
  return { name, ...(platformConfig[name] ?? platformConfig['Lainnya']) }
}


// ─── Main component ───────────────────────────────────────────────────────────

export function UploadTab({ project }: UploadTabProps) {
  const { hasPermission } = usePermissions()
  const hasUploadAdd = hasPermission('proj_upload_add')

  const [activePlatform, setActivePlatform] = useState(project.platforms[0]?.id ?? '')
  const [links, setLinks] = useState<UploadedLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [linkInput, setLinkInput] = useState('')
  const [thumbInput, setThumbInput] = useState('') // thumbnail URL manual
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState('')

  // Fetch links dari backend
  useEffect(() => {
    setIsLoading(true)
    api<UploadedLink[]>(`/projects/${project.id}/uploads?platformId=${activePlatform}`)
      .then(setLinks)
      .catch(() => setLinks([]))
      .finally(() => setIsLoading(false))
  }, [project.id, activePlatform])

  const platformLinks = links.filter(l => l.platformId === activePlatform)

  const handleAddLink = async () => {
    const url = linkInput.trim()
    if (!url) return
    try { new URL(url) } catch { setFetchError('URL tidak valid. Pastikan URL dimulai dengan https://'); return }

    setAdding(true)
    setFetchError('')
    try {
      // Ambil metadata dari URL
      const meta = await fetchLinkMeta(url)

      // Thumbnail manual override
      const finalThumb = thumbInput.trim() || meta.thumbnail

      // Simpan ke backend
      const saved = await api<UploadedLink>(`/projects/${project.id}/uploads`, {
        method: 'POST',
        data: {
          platformId: activePlatform,
          url,
          title: meta.title,
          thumbnail: finalThumb,
        }
      })
      setLinks(prev => [saved, ...prev])
      setLinkInput('')
      setThumbInput('')
    } catch (err: any) {
      setFetchError(err.message || 'Gagal menambahkan link')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await api(`/projects/${project.id}/uploads/${id}`, { method: 'DELETE' })
      setLinks(prev => prev.filter(l => l.id !== id))
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Platform tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {project.platforms.map((pl) => (
          <button
            key={pl.id}
            onClick={() => setActivePlatform(pl.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activePlatform === pl.id ? 'bg-orange-500 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {pl.name}
          </button>
        ))}
      </div>

      {/* Link input */}
      {hasUploadAdd && (
      <div className="p-4 border border-border rounded-xl bg-muted/20">
        <label className="block text-sm font-semibold mb-2">Paste Link Konten</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              value={linkInput}
              onChange={(e) => { setLinkInput(e.target.value); setFetchError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 placeholder:text-muted-foreground"
            />
          </div>
          <Button icon={adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} loading={adding} onClick={handleAddLink}>
            Tambah
          </Button>
        </div>
      {/* Thumbnail manual (opsional) */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              value={thumbInput}
              onChange={(e) => setThumbInput(e.target.value)}
              placeholder="URL thumbnail (opsional, untuk TikTok/Instagram)"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 placeholder:text-muted-foreground/60"
            />
          </div>
          {thumbInput && (
            <img src={thumbInput} alt="preview" className="h-9 w-16 object-cover rounded-lg border border-border" onError={e => e.currentTarget.style.opacity = '0.3'} />
          )}
        </div>
        {fetchError ? (
          <p className="text-xs text-red-500 mt-1.5">{fetchError}</p>
        ) : (
          <p className="text-xs text-muted-foreground mt-1.5">
            YouTube: thumbnail otomatis. TikTok/Instagram: paste URL screenshot sebagai thumbnail.
          </p>
        )}
      </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && platformLinks.length === 0 && (
        <div className="text-center py-14 border-2 border-dashed border-border rounded-2xl">
          <Link2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-semibold text-foreground">Belum ada konten</p>
          <p className="text-xs text-muted-foreground mt-1">Paste link konten yang sudah diupload ke platform ini</p>
        </div>
      )}

      {/* Links grid */}
      {!isLoading && platformLinks.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {platformLinks.map((link) => {
            const { name: platformName, icon: Icon, color, bg } = getPlatformConfig(link.url)
            return (
              <div key={link.id} className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group bg-white">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {link.thumbnail ? (
                    <img
                      src={link.thumbnail}
                      alt={link.title || link.url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback ke placeholder jika gambar gagal dimuat
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  {/* Placeholder (ditampilkan jika tidak ada thumbnail atau image error) */}
                  <div className={cn('w-full h-full flex flex-col items-center justify-center gap-2', bg, link.thumbnail ? 'hidden' : '')}>
                    <Icon className={cn('h-10 w-10 opacity-50', color)} />
                    <span className="text-xs text-muted-foreground font-medium">{platformName}</span>
                  </div>

                  {/* Hover overlay dengan tombol buka */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 w-11 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                    >
                      <ExternalLink className="h-5 w-5 text-foreground" />
                    </a>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={cn('h-4 w-4 rounded flex items-center justify-center', bg)}>
                      <Icon className={cn('h-2.5 w-2.5', color)} />
                    </div>
                    <span className={cn('text-xs font-medium', color)}>{platformName}</span>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium line-clamp-2 leading-snug hover:text-orange-600 transition-colors block"
                  >
                    {link.title || link.url}
                  </a>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
                    <span className="text-xs text-muted-foreground">{formatDateShort(link.createdAt)}</span>
                    {hasUploadAdd && (
                    <button
                      onClick={() => handleDelete(link.id)}
                      disabled={deletingId === link.id}
                      className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Hapus link"
                    >
                      {deletingId === link.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />
                      }
                    </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
