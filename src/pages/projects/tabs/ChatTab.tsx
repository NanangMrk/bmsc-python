import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, AtSign, Download, X } from 'lucide-react'
import type { Project } from '@/lib/mock-data'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, BACKEND_URL, API_URL } from '@/lib/api'
import { usePermissions } from '@/hooks/usePermissions'

interface ChatTabProps {
  project: Project
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatChatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ChatTab({ project }: ChatTabProps) {
  const { user } = useAuthStore()
  const { hasPermission } = usePermissions()
  const hasChatSend = hasPermission('proj_chat_send')

  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<any[]>(() => (project as any).chatMessages || [])
  const [input, setInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync messages when project data updates (e.g., after sending a message)
  // Use project.id + length as stable dependency to avoid infinite loop
  const incomingMessages: any[] = (project as any).chatMessages || []
  useEffect(() => {
    setMessages(incomingMessages)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id, incomingMessages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessageMutation = useMutation({
    mutationFn: (data: { message: string, attachment?: string }) => api(`/chats/${project.id}`, { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] })
    }
  })

  const sendMessage = () => {
    if (!input.trim() || !user) return
    sendMessageMutation.mutate({ message: input.trim() })
    setInput('')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_URL}/upload/single`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (data.url) {
        // Send a message with the attachment immediately
        sendMessageMutation.mutate({ message: 'Mengirim file lampiran', attachment: `${BACKEND_URL}${data.url}` })
      }
    } catch (err) {
      console.error(err)
      alert('Gagal mengupload file.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Group messages by date
  const grouped: Record<string, typeof messages> = {}
  messages.forEach((m) => {
    const date = m.createdAt.split('T')[0]
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(m)
  })

  return (
    <div className="flex flex-col" style={{ height: '520px' }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-6 pr-2 pb-2">
        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground bg-background px-2">{formatChatDate(date)}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Messages */}
            <div className="space-y-3">
              {msgs.map((msg) => {
                const isOwn = msg.userId === user?.id
                return (
                  <div
                    key={msg.id}
                    className={cn('flex items-end gap-2.5', isOwn && 'flex-row-reverse')}
                  >
                    {!isOwn && <Avatar name={msg.user.name} size="sm" className="shrink-0 mb-0.5" />}
                    <div className={cn('max-w-sm lg:max-w-md', isOwn ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                      {!isOwn && (
                        <span className="text-xs font-medium text-muted-foreground ml-1">{msg.user.name}</span>
                      )}
                      <div
                        className={cn(
                          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                          isOwn
                            ? 'bg-orange-500 text-white rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        )}
                      >
                        {msg.attachment && (
                          <div className="mb-2">
                            {msg.attachment.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                              <img 
                                src={msg.attachment} 
                                alt="attachment" 
                                className="max-w-[200px] rounded-lg border border-white/20 cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => setPreviewImage(msg.attachment)}
                              />
                            ) : (
                              <a href={msg.attachment} target="_blank" rel="noreferrer" className="underline font-bold text-xs flex items-center gap-1">
                                <Paperclip className="h-3 w-3" /> Lihat Lampiran
                              </a>
                            )}
                          </div>
                        )}
                        {msg.message || msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground mx-1">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {hasChatSend ? (
      <div className="pt-3 border-t border-border mt-3">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,application/pdf"
        />
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="Kirim Gambar / Lampiran"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <AtSign className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 relative">
            <textarea
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Tulis pesan... (Enter untuk kirim, Shift+Enter baris baru)"
              rows={1}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-muted-foreground max-h-32 overflow-y-auto scrollbar-thin"
            />
          </div>
          <button
            id="chat-send-btn"
            onClick={sendMessage}
            disabled={!input.trim()}
            className="h-9 w-9 bg-orange-500 rounded-xl flex items-center justify-center text-white hover:bg-orange-600 transition-colors disabled:opacity-40 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 ml-20">
          {messages.length} pesan · {project.brand.name}, Admin, dan tim project dapat melihat chat ini
        </p>
      </div>
      ) : (
      <div className="pt-3 border-t border-border mt-3 text-center">
        <p className="text-xs text-muted-foreground py-2 italic bg-muted/30 rounded-xl">
          Anda tidak memiliki izin untuk mengirim pesan.
        </p>
      </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            {/* Toolbar */}
            <div className="absolute top-0 right-0 -translate-y-full pb-4 flex gap-3">
              <a
                href={previewImage}
                download="preview-image.png"
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                title="Unduh Gambar"
                target="_blank"
                rel="noreferrer"
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
    </div>
  )
}
