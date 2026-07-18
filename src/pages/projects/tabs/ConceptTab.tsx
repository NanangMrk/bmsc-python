import { useState, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Quote, 
  Image, 
  Minus, 
  Save,
  Undo2,
  Redo2,
  Eraser
} from 'lucide-react'
import type { Project } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface ConceptTabProps {
  project: Project
}

const mockContent = `<h2>Konsep Kampanye Ramadan</h2>
<p>Kampanye ini bertujuan memperkenalkan lini produk kopi spesial edisi Ramadan yang menggabungkan cita rasa traditional dengan kemasan modern.</p>

<h3>Tone of Voice</h3>
<p><strong>Fun</strong> namun tetap <em>informatif</em>. Target audience utama adalah milenial urban (25-35 tahun) yang menyukai kopi berkualitas.</p>

<h3>Poin Utama yang Harus Dikomunikasikan</h3>
<ul>
  <li>Keunikan bahan baku lokal dari berbagai daerah di Indonesia</li>
  <li>Proses roasting premium yang menjaga kualitas</li>
  <li>Nilai spiritual dan kebersamaan di bulan Ramadan</li>
  <li>Kemudahan pembelian melalui berbagai platform</li>
</ul>

<blockquote>
  "Dari Sabang sampai Merauke, nikmati cita rasa nusantara dalam setiap tegukan."
</blockquote>`

export function ConceptTab({ project }: ConceptTabProps) {
  const [activePlatform, setActivePlatform] = useState(project.platforms[0]?.id ?? '')
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Track content per platform to prevent loss during switching
  const [platformContents, setPlatformContents] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    project.platforms.forEach((pl) => {
      initial[pl.id] = mockContent
    })
    return initial
  })



  // Track active style states for toolbar buttons highlighting
  const [activeStyles, setActiveStyles] = useState<Record<string, boolean>>({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  })

  const [currentFont, setCurrentFont] = useState('Inter, sans-serif')
  const [currentSize, setCurrentSize] = useState('3')

  // Detect active formatting at current cursor position
  const updateActiveStyles = () => {
    setActiveStyles({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      justifyFull: document.queryCommandState('justifyFull'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    })
  }

  // Load content of active platform only when platform changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = platformContents[activePlatform] || ''
      updateActiveStyles()
    }
  }, [activePlatform])

  const toolbarGroups = [
    // History
    [
      { icon: Undo2, label: 'Undo', command: 'undo' },
      { icon: Redo2, label: 'Redo', command: 'redo' },
    ],
    // Inline styling
    [
      { icon: Bold, label: 'Tebal (Bold)', command: 'bold' },
      { icon: Italic, label: 'Miring (Italic)', command: 'italic' },
      { icon: Underline, label: 'Garis Bawah (Underline)', command: 'underline' },
      { icon: Strikethrough, label: 'Coret (Strikethrough)', command: 'strikeThrough' },
    ],
    // Alignment
    [
      { icon: AlignLeft, label: 'Rata Kiri', command: 'justifyLeft' },
      { icon: AlignCenter, label: 'Rata Tengah', command: 'justifyCenter' },
      { icon: AlignRight, label: 'Rata Kanan', command: 'justifyRight' },
      { icon: AlignJustify, label: 'Rata Kiri-Kanan', command: 'justifyFull' },
    ],
    // Lists & Blocks
    [
      { icon: List, label: 'Bullet List', command: 'insertUnorderedList' },
      { icon: ListOrdered, label: 'Numbered List', command: 'insertOrderedList' },
      { icon: Quote, label: 'Kutipan (Blockquote)', command: 'formatBlock', value: 'blockquote' },
      { icon: Minus, label: 'Garis Pemisah', command: 'insertHorizontalRule' },
    ],
    // Insert & Actions
    [
      { icon: Image, label: 'Sisipkan Gambar', command: 'insertImage' },
      { icon: Eraser, label: 'Hapus Format', command: 'removeFormat' },
    ]
  ]

  const executeCommand = (command: string, value: string = '') => {
    if (editorRef.current) {
      editorRef.current.focus()
      if (command === 'insertImage') {
        const choice = confirm('Klik "OK" untuk memilih file gambar dari komputer Anda, atau klik "Batal" untuk memasukkan URL Gambar.')
        if (choice) {
          fileInputRef.current?.click()
        } else {
          const url = prompt('Masukkan URL Gambar (Contoh: https://picsum.photos/400/300):')
          if (url) {
            document.execCommand(command, false, url)
            updateActiveStyles()
          }
        }
      } else {
        document.execCommand(command, false, value)
        updateActiveStyles()
      }
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result
        if (base64 && typeof base64 === 'string') {
          executeCommand('insertImage', base64)
        }
      }
      reader.readAsDataURL(file)
    }
    e.target.value = '' // Reset
  }

  const handleSave = () => {
    if (editorRef.current) {
      const htmlValue = editorRef.current.innerHTML
      setPlatformContents((prev) => ({
        ...prev,
        [activePlatform]: htmlValue,
      }))

      alert('Konsep kampanye berhasil disimpan!')
    }
  }

  return (
    <div className="space-y-4">
      {/* Dynamic Style Injection for concept print */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-concept-sheet, #printable-concept-sheet * {
            visibility: visible !important;
          }
          #printable-concept-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 15mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}} />

      {/* Hidden local image file uploader input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Platform tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {project.platforms.map((pl) => (
          <button
            key={pl.id}
            onClick={() => setActivePlatform(pl.id)}
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

      {/* Editor */}
      <div className="border border-border rounded-xl overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/30 flex-wrap">
          {toolbarGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex items-center gap-0.5">
              {group.map(({ icon: Icon, label, command, value }) => {
                const isActive = command ? activeStyles[command] : false
                return (
                  <button
                    key={label}
                    title={label}
                    onMouseDown={(e) => e.preventDefault()} // Prevents loss of text selection
                    onClick={() => executeCommand(command, value)}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-md transition-all border",
                      isActive 
                        ? "bg-orange-100 text-orange-600 border-orange-200 shadow-sm font-bold scale-102" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
                    )}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
              {gIdx < toolbarGroups.length - 1 && (
                <div className="h-5 w-px bg-border mx-1.5" />
              )}
            </div>
          ))}

          <div className="h-5 w-px bg-border mx-1" />

          {/* 11 Font Family Selection Options */}
          <select 
            value={currentFont}
            onChange={(e) => {
              setCurrentFont(e.target.value)
              executeCommand('fontName', e.target.value)
            }}
            className="h-7 text-xs border border-border rounded px-1.5 bg-background text-muted-foreground focus:outline-none cursor-pointer font-semibold"
          >
            <option value="Inter, sans-serif">Inter (Sans)</option>
            <option value="Outfit, sans-serif">Outfit (Clean)</option>
            <option value="Playfair Display, serif">Playfair (Elegant)</option>
            <option value="Georgia, serif">Georgia (Classic)</option>
            <option value="Times New Roman, serif">Times New Roman</option>
            <option value="Courier New, monospace">Courier New</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
            <option value="Comic Sans MS, cursive">Comic Sans</option>
          </select>

          {/* Font Size Selection Options */}
          <select 
            value={currentSize}
            onChange={(e) => {
              setCurrentSize(e.target.value)
              executeCommand('fontSize', e.target.value)
            }}
            className="h-7 text-xs border border-border rounded px-1.5 bg-background text-muted-foreground focus:outline-none cursor-pointer font-semibold"
          >
            <option value="3">Ukuran Normal</option>
            <option value="5">Ukuran Besar</option>
            <option value="6">Ukuran Sangat Besar</option>
            <option value="2">Ukuran Kecil</option>
          </select>

          {/* Text Color Picker */}
          <select 
            value=""
            onChange={(e) => {
              executeCommand('foreColor', e.target.value)
            }}
            className="h-7 text-xs border border-border rounded px-1.5 bg-background text-muted-foreground focus:outline-none cursor-pointer font-semibold"
          >
            <option value="" disabled>Warna Teks</option>
            <option value="#000000">Teks Hitam</option>
            <option value="#ea580c">Teks Orange</option>
            <option value="#2563eb">Teks Biru</option>
            <option value="#16a34a">Teks Hijau</option>
            <option value="#dc2626">Teks Merah</option>
            <option value="#7c3aed">Teks Ungu</option>
            <option value="#eab308">Teks Kuning</option>
          </select>

          {/* Highlight Color Picker */}
          <select 
            value=""
            onChange={(e) => {
              executeCommand('backColor', e.target.value)
            }}
            className="h-7 text-xs border border-border rounded px-1.5 bg-background text-muted-foreground focus:outline-none cursor-pointer font-semibold"
          >
            <option value="" disabled>Stabilo</option>
            <option value="transparent">Tanpa Latar</option>
            <option value="#fef08a">Kuning</option>
            <option value="#bbf7d0">Hijau Muda</option>
            <option value="#bfdbfe">Biru Muda</option>
            <option value="#fed7aa">Orange Muda</option>
            <option value="#fbcfe8">Pink Muda</option>
          </select>
        </div>

        {/* Editor area — rich text simulation with direct native editing and status updates */}
        <div
          ref={editorRef}
          className="min-h-96 p-6 focus:outline-none text-sm leading-relaxed prose prose-sm max-w-none scrollbar-thin overflow-y-auto bg-white"
          contentEditable
          suppressContentEditableWarning
          onKeyUp={updateActiveStyles}
          onMouseUp={updateActiveStyles}
          onClick={updateActiveStyles}
          onFocus={updateActiveStyles}
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      {/* Footer bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-stone-50 p-4 rounded-xl border border-border/60">
        <span className="text-muted-foreground">
          Platform Aktif: <strong className="text-foreground uppercase">{project.platforms.find((p) => p.id === activePlatform)?.name}</strong>
        </span>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => {
              // Commit editor's live HTML to state before firing window.print()
              if (editorRef.current) {
                const htmlValue = editorRef.current.innerHTML
                setPlatformContents((prev) => ({
                  ...prev,
                  [activePlatform]: htmlValue,
                }))
              }
              setTimeout(() => {
                window.print()
              }, 150)
            }}
            className="bg-white hover:bg-stone-100 border border-stone-250 text-stone-700 font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm text-xs cursor-pointer"
            type="button"
          >
            Cetak PDF
          </button>
          <button
            onClick={handleSave}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm text-xs cursor-pointer"
            type="button"
          >
            <Save className="h-3.5 w-3.5" />
            Simpan Konsep
          </button>
        </div>
      </div>

      {/* Hidden print-only concept sheet container */}
      <div id="printable-concept-sheet" className="hidden print:block p-10 bg-white text-stone-900" style={{ fontFamily: 'sans-serif' }}>
        {/* Header Block */}
        <div className="flex justify-between items-start border-b-2 border-stone-800 pb-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-black text-sm">
                N
              </div>
              <span className="font-extrabold text-sm text-stone-900">NanangMrk Channel</span>
            </div>
            <h1 className="text-xl font-black text-stone-900 tracking-wide uppercase">DOKUMEN KONSEP & IDE KAMPANYE</h1>
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Platform: {project.platforms.find((p) => p.id === activePlatform)?.name || '—'}</p>
          </div>
          <div className="text-right text-[10.5px] text-stone-500 space-y-0.5 font-semibold">
            <p className="font-bold text-stone-900 uppercase">BMSC PLATFORM</p>
            <p>Proyek: <span className="text-stone-700 font-extrabold">{project.name}</span></p>
            <p>Brand: <span className="text-stone-750 font-extrabold">{project.brand.name}</span></p>
            <p>Tanggal Cetak: <span className="text-stone-700 font-mono font-bold">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
          </div>
        </div>

        {/* Content Area */}
        <div 
          className="prose prose-sm max-w-none text-stone-900 leading-relaxed text-sm"
          style={{ fontFamily: 'sans-serif' }}
          dangerouslySetInnerHTML={{ __html: platformContents[activePlatform] || '' }}
        />

        {/* Signatures Footer */}
        <div className="grid grid-cols-2 gap-12 mt-16 pt-8 border-t border-dotted border-stone-300 text-xs">
          <div>
            <p className="font-extrabold text-stone-400 uppercase tracking-widest text-[9px] mb-12">DISIAPKAN OLEH,</p>
            <div className="space-y-1">
              <p className="font-bold text-stone-900 border-b border-stone-300 pb-1 w-48 font-sans">NanangMrk</p>
              <p className="text-stone-500 text-[9px] font-semibold uppercase tracking-widest font-sans">Kreator & Platform Specialist</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="w-48">
              <p className="font-extrabold text-stone-400 uppercase tracking-widest text-[9px] mb-12">DISETUJUI OLEH BRAND,</p>
              <div className="space-y-1">
                <p className="font-bold text-stone-900 border-b border-stone-300 pb-1 w-48 text-left">&nbsp;</p>
                <p className="text-stone-500 text-[9px] font-semibold uppercase tracking-widest font-sans">{project.brand.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
