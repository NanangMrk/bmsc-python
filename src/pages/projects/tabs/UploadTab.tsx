import { useState } from 'react'
import { Link2, Plus, Trash2, ExternalLink, Youtube, Instagram } from 'lucide-react'
import type { Project } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { cn, formatDateShort } from '@/lib/utils'

interface UploadTabProps {
  project: Project
}

interface UploadedLink {
  id: string
  url: string
  title: string
  thumbnail: string
  platform: string
  uploadedAt: string
}

const mockLinks: UploadedLink[] = [
  {
    id: 'l1',
    url: 'https://www.instagram.com/reel/abc123',
    title: 'Kopi Nusantara Ramadan Edition 🌙 #KopiIndonesia #Ramadan',
    thumbnail: 'https://picsum.photos/seed/ig1/320/180',
    platform: 'Instagram',
    uploadedAt: '2025-02-28',
  },
  {
    id: 'l2',
    url: 'https://www.tiktok.com/@kopinusantara/video/123456',
    title: 'POV: Sahur bareng Kopi Nusantara ☕ | Ramadan Edition',
    thumbnail: 'https://picsum.photos/seed/tt1/320/180',
    platform: 'TikTok',
    uploadedAt: '2025-03-01',
  },
]

const platformIcon = {
  Instagram: Instagram,
  TikTok: Link2,
  YouTube: Youtube,
}

export function UploadTab({ project }: UploadTabProps) {
  const [activePlatform, setActivePlatform] = useState(project.platforms[0]?.id ?? '')
  const [platformLinks, setPlatformLinks] = useState<Record<string, UploadedLink[]>>(() => {
    const initial: Record<string, UploadedLink[]> = {}
    project.platforms.forEach((pl) => {
      initial[pl.id] = mockLinks.filter(l => l.platform.toLowerCase() === pl.name.toLowerCase())
    })
    return initial
  })
  const links = platformLinks[activePlatform] || []
  const [linkInput, setLinkInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddLink = () => {
    if (!linkInput.trim()) return
    setLoading(true)
    setTimeout(() => {
      const newLink: UploadedLink = {
        id: `l${Date.now()}`,
        url: linkInput,
        title: 'Konten Baru — ' + linkInput.split('/').pop(),
        thumbnail: `https://picsum.photos/seed/${Date.now()}/320/180`,
        platform: project.platforms.find((p) => p.id === activePlatform)?.name ?? 'Unknown',
        uploadedAt: new Date().toISOString().split('T')[0],
      }
      setPlatformLinks((prev) => ({
        ...prev,
        [activePlatform]: [newLink, ...(prev[activePlatform] || [])]
      }))
      setLinkInput('')
      setLoading(false)
    }, 1200)
  }

  const removeLink = (id: string) => {
    setPlatformLinks((prev) => ({
      ...prev,
      [activePlatform]: (prev[activePlatform] || []).filter((l) => l.id !== id)
    }))
  }

  return (
    <div className="space-y-5">
      {/* Platform tabs */}
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

      {/* Link input */}
      <div className="p-4 border border-border rounded-xl">
        <label className="block text-sm font-medium mb-2">Paste Link Konten</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-muted-foreground"
            />
          </div>
          <Button icon={<Plus className="h-4 w-4" />} loading={loading} onClick={handleAddLink}>
            Tambah
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Sistem akan otomatis mengambil thumbnail & judul dari link YouTube, TikTok, Instagram.
        </p>
      </div>

      {/* Uploaded links */}
      {links.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <Link2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          Belum ada konten yang diupload untuk platform ini.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {links.map((link) => {
            const Icon = platformIcon[link.platform as keyof typeof platformIcon] ?? Link2
            return (
              <div key={link.id} className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted">
                  <img
                    src={link.thumbnail}
                    alt={link.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="h-4 w-4 text-foreground" />
                    </a>
                  </div>
                </div>
                {/* Info */}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{link.platform}</span>
                  </div>
                  <p className="text-sm font-medium line-clamp-2 leading-snug">{link.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{formatDateShort(link.uploadedAt)}</span>
                    <button
                      onClick={() => removeLink(link.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
