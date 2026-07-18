import { useState } from 'react'
import { Plus, Users, ShieldCheck, Folder, Check, X, Save, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const roles = [
  { id: 'admin', name: 'Admin' },
  { id: 'brand', name: 'Brand' },
  { id: 'brand-', name: 'BRAND-' },
  { id: 'editor', name: 'Editor' },
  { id: 'finance', name: 'Finance' },
]

// Granular permissions structure based on Sidebar Menus
const permissionGroups = [
  {
    id: 'dashboard',
    name: 'DASHBOARD',
    permissions: [
      { id: 'dash_view', title: 'Melihat Dashboard', desc: 'Akses halaman utama dashboard.' },
      { id: 'dash_total_income', title: 'Melihat Total Pemasukan', desc: 'Melihat metrik ringkasan total pemasukan finansial.' },
      { id: 'dash_active_projects', title: 'Melihat Project Aktif', desc: 'Melihat metrik jumlah project yang sedang berjalan.' },
      { id: 'dash_wait_verification', title: 'Menunggu Verifikasi', desc: 'Melihat metrik status invoice atau project yang harus diverifikasi.' },
      { id: 'dash_late_projects', title: 'Melihat Project Terlambat', desc: 'Melihat metrik project yang sudah melewati batas deadline.' },
      { id: 'dash_monthly_income', title: 'Melihat Pemasukan per Bulan', desc: 'Melihat grafik visual / chart rekapitulasi pemasukan bulanan.' },
      { id: 'dash_platform_stats', title: 'Melihat Per Platform', desc: 'Melihat visualisasi distribusi project per platform media sosial.' },
      { id: 'dash_recent_projects', title: 'Melihat Project Terbaru', desc: 'Melihat widget tabel rincian daftar project terbaru.' },
      { id: 'dash_urgent_invoices', title: 'Melihat Invoice Perlu Perhatian', desc: 'Melihat widget daftar invoice overdue yang perlu segera ditindaklanjuti.' },
      { id: 'dash_team', title: 'Melihat Tim', desc: 'Melihat widget aktivitas daftar pengguna / tim dalam agensi.' },
    ]
  },
  {
    id: 'project',
    name: 'PROJECT (CAMPAIGN)',
    permissions: [
      { id: 'proj_view', title: 'Melihat Daftar Project', desc: 'Mengakses dan melihat daftar semua project.' },
      { id: 'proj_create', title: 'Membuat Project Baru', desc: 'Menambahkan project baru atau request campaign.' },
      { id: 'proj_edit_status', title: 'Ubah Status Project', desc: 'Mengubah status project (Berjalan, Selesai, dll).' },
      { id: 'proj_delete', title: 'Menghapus Project', desc: 'Menghapus project secara permanen dari sistem.' },
      
      // Pembayaran (Payment Tab)
      { id: 'proj_pay_add', title: 'Menambahkan Tahap Pembayaran', desc: 'Membuat termin pembayaran baru di tab Payment.' },
      { id: 'proj_pay_delete', title: 'Hapus Tahap Pembayaran', desc: 'Menghapus termin pembayaran yang sudah dibuat.' },
      { id: 'proj_pay_print', title: 'Cetak Invoice Tahapan Pembayaran', desc: 'Mencetak invoice spesifik untuk satu tahapan pembayaran.' },
      
      // Fase Proyek & Dokumen
      { id: 'proj_phase_status', title: 'Merubah Status Fase', desc: 'Mengubah status/progres tiap fase (Payment, Konsep, Naskah, dll).' },
      { id: 'proj_concept_edit', title: 'Mengedit Fase Ide & Konsep', desc: 'Menambahkan atau mengubah detail di tab Ide & Konsep.' },
      { id: 'proj_doc_print', title: 'Melakukan Cetak PDF / Cetak Halaman', desc: 'Mencetak halaman project atau tab spesifik (Konsep/Naskah) sebagai PDF.' },
      
      // Naskah (Script & Brief)
      { id: 'proj_script_add_segment', title: 'Menambahkan Segment', desc: 'Menambahkan segmen baru pada Script & Brief.' },
      { id: 'proj_script_del_segment', title: 'Menghapus Segment', desc: 'Menghapus segmen beserta barisnya.' },
      { id: 'proj_script_add_row', title: 'Menambahkan Row (Baris)', desc: 'Menambahkan baris detail (Visual, Audio, dll) di dalam segmen.' },
      { id: 'proj_script_del_row', title: 'Menghapus Row (Baris)', desc: 'Menghapus baris detail yang ada.' },
      { id: 'proj_script_comment', title: 'Menambahkan Comment', desc: 'Memberikan komentar / catatan revisi pada baris naskah.' },
      
      // Produksi & Upload
      { id: 'proj_prod_add_task', title: 'Menambahkan Task Produksi', desc: 'Membuat daftar checklist tugas baru di tab Produksi.' },
      { id: 'proj_prod_check_task', title: 'Melakukan Checklist Task Produksi', desc: 'Mencentang (menyelesaikan) tugas produksi yang ada.' },
      { id: 'proj_upload_add', title: 'Menambahkan Upload & Report', desc: 'Mengunggah aset draft video, link final, atau report insight.' },
      
      // Chat
      { id: 'proj_chat_view', title: 'Melihat Chat', desc: 'Membaca riwayat diskusi di tab Chat.' },
      { id: 'proj_chat_send', title: 'Melakukan Chat', desc: 'Mengirim pesan atau komentar di tab Chat.' },
    ]
  },
  {
    id: 'invoice_quotation',
    name: 'INVOICE & QUOTATION',
    permissions: [
      { id: 'quo_inv_view', title: 'Melihat Invoice & Quotation', desc: 'Mengakses daftar dan detail Quotation serta Invoice.' },
      
      // Quotation
      { id: 'quo_create', title: 'Buat Quotation', desc: 'Menerbitkan Quotation penawaran harga baru.' },
      { id: 'quo_edit', title: 'Edit Quotation', desc: 'Mengubah isi, item, dan harga pada Quotation.' },
      { id: 'quo_delete', title: 'Hapus Quotation', desc: 'Menghapus dokumen Quotation dari sistem.' },
      { id: 'quo_print', title: 'Cetak Quotation', desc: 'Mencetak Quotation dalam format PDF/Printer.' },
      { id: 'quo_copy_link', title: 'Salin Link Quotation', desc: 'Menyalin tautan publik Quotation untuk dikirim ke klien.' },
      { id: 'quo_edit_status', title: 'Mengedit Status Quotation', desc: 'Mengubah status Quotation secara manual (Draft, Terkirim, dll).' },
      
      // Invoice
      { id: 'inv_edit_status', title: 'Mengedit Status Invoice', desc: 'Mengubah status Invoice secara manual (Belum Dibayar, Termin, Lunas, dll).' },
      { id: 'inv_delete', title: 'Menghapus Invoice', desc: 'Menghapus dokumen Invoice dari sistem.' },
      { id: 'inv_upload', title: 'Mengupload Bukti Pembayaran', desc: 'Melampirkan file bukti transfer pada Invoice.' },
      { id: 'inv_copy_link', title: 'Menyalin Link Invoice', desc: 'Menyalin tautan publik Invoice untuk dikirim ke klien.' },
      { id: 'inv_print', title: 'Mencetak Invoice', desc: 'Mencetak dokumen Invoice dalam format PDF/Printer.' },
    ]
  },
  {
    id: 'finance',
    name: 'KEUANGAN (CASH FLOW)',
    permissions: [
      { id: 'fin_view', title: 'Melihat Arus Kas (Keuangan)', desc: 'Mengakses halaman daftar transaksi pemasukan & pengeluaran.' },
      { id: 'fin_add_income', title: 'Mencatat Pemasukan', desc: 'Bisa menambahkan pencatatan uang masuk secara manual.' },
      { id: 'fin_add_expense', title: 'Mencatat Pengeluaran', desc: 'Bisa menambahkan pencatatan uang keluar / biaya operasional.' },
    ]
  },
  {
    id: 'platform_ratecard',
    name: 'PLATFORM & RATE CARD',
    permissions: [
      { id: 'plat_view', title: 'Melihat Daftar Platform', desc: 'Akses ke menu Kelola Platform.' },
      { id: 'plat_manage', title: 'Mengelola Data Platform', desc: 'Menambah, mengedit, dan menghapus platform campaign.' },
      { id: 'rate_view', title: 'Melihat Daftar Rate Card', desc: 'Akses ke menu Rate Card paket / layanan.' },
      { id: 'rate_manage', title: 'Mengelola Rate Card', desc: 'Menambah, mengedit harga, dan menghapus Rate Card.' },
    ]
  },
  {
    id: 'user_role',
    name: 'USER & ROLE (AKSES)',
    permissions: [
      { id: 'usr_view', title: 'Melihat Daftar User', desc: 'Melihat daftar seluruh pengguna (kreator, klien, tim).' },
      { id: 'usr_manage', title: 'Mengelola Akun User', desc: 'Menambah user baru, mereset password, atau memblokir user.' },
      { id: 'role_view', title: 'Melihat Matriks Hak Akses', desc: 'Bisa melihat pembagian Role & Permissions.' },
      { id: 'role_manage', title: 'Mengelola Role & Akses', desc: 'Bisa membuat role baru dan mengubah centang hak akses.' },
    ]
  },
  {
    id: 'settings',
    name: 'SETTINGS (PENGATURAN)',
    permissions: [
      { id: 'set_general', title: 'Pengaturan Profil & Branding', desc: 'Mengubah nama agensi, logo, dan profil perusahaan.' },
      { id: 'set_bank', title: 'Pengaturan Rekening Bank', desc: 'Mengubah nomor rekening tujuan yang muncul di Invoice.' },
    ]
  }
]

// Mock initial state for BRAND role
const initialBrandPermissions = ['dash_overview', 'dash_calendar', 'proj_view', 'proj_add']

export default function RolesPage() {
  const [activeRole, setActiveRole] = useState('brand')
  const [rolesList, setRolesList] = useState(roles)
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [newRoleName, setNewRoleName] = useState('')

  const [permissions, setPermissions] = useState<string[]>(initialBrandPermissions)
  const [isDirty, setIsDirty] = useState(false)

  const togglePermission = (id: string) => {
    setPermissions(prev => {
      const newPerms = prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
      setIsDirty(true)
      return newPerms
    })
  }

  const openAddRoleModal = () => {
    setEditingRoleId(null)
    setNewRoleName('')
    setShowAddRoleModal(true)
  }

  const openEditRoleModal = (role: {id: string, name: string}) => {
    setEditingRoleId(role.id)
    setNewRoleName(role.name)
    setShowAddRoleModal(true)
  }

  const handleDeleteRole = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus role ini?')) {
      const updated = rolesList.filter(r => r.id !== id)
      setRolesList(updated)
      if (activeRole === id && updated.length > 0) {
        setActiveRole(updated[0].id)
      }
    }
  }

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleName.trim()) return
    const newId = newRoleName.toLowerCase().replace(/\s+/g, '-')
    
    if (editingRoleId) {
      setRolesList(prev => prev.map(r => r.id === editingRoleId ? { ...r, name: newRoleName } : r))
    } else {
      setRolesList([...rolesList, { id: newId, name: newRoleName }])
      setActiveRole(newId)
      setPermissions([])
    }
    
    setNewRoleName('')
    setShowAddRoleModal(false)
  }

  const activeRoleName = rolesList.find(r => r.id === activeRole)?.name || ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Users className="h-6 w-6 text-orange-600" />
            Kelola User & Hak Akses Role
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Daftarkan akun administrator / brand, batasi akses ke project tertentu, dan atur matriks izin tindakan secara mendalam.
          </p>
        </div>
        
        {/* Toggle Tabs */}
        <div className="flex items-center bg-gray-100/80 p-1 rounded-lg border border-border/50">
          <button className="px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground rounded-md transition-colors">
            Daftar User
          </button>
          <button className="px-4 py-1.5 text-sm font-bold text-orange-600 bg-white rounded-md shadow-sm border border-border/40">
            Matriks Hak Akses (Permissions)
          </button>
        </div>
      </div>

      {/* Role Selection Card */}
      <div className="bg-white border border-border/60 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Matriks Hak Akses Tindakan (Action-level Permissions)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Sesuaikan secara presisi setiap aksi detail di Dashboard, Project, Draf Konsep, Naskah, Produksi, hingga Uploading untuk tiap-tiap role.
            </p>
          </div>
          <Button 
            onClick={openAddRoleModal}
            variant="outline" size="sm" className="bg-gray-50 border-border/60 font-semibold" icon={<Plus className="h-3.5 w-3.5" />}
          >
            {editingRoleId ? "Edit Role" : "Buat Role Baru"}
          </Button>
        </div>

        {/* Role Pills */}
        <div className="flex flex-wrap gap-3">
          {rolesList.map(role => {
            const isActive = activeRole === role.id
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-colors",
                  isActive 
                    ? "bg-orange-500 border-orange-500 text-white shadow-sm" 
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                )}
              >
                <div className={cn(
                  "h-3 w-3 rounded-full border-[1.5px] flex items-center justify-center",
                  isActive ? "border-white" : "border-gray-400"
                )}>
                  {/* Inner circle or icon for active state can be simulated */}
                </div>
                Role: {role.name}
                {isActive ? (
                  <div className="flex items-center gap-1 ml-1">
                    <div onClick={(e) => { e.stopPropagation(); openEditRoleModal(role); }} className="hover:bg-white/20 p-1 rounded transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </div>
                    <div onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }} className="hover:bg-white/20 p-1 rounded transition-colors text-red-100 hover:text-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* Permissions Matrix Card */}
      <div className="bg-white border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              MATRIX GRANULAR PERMISSION: {activeRoleName.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground">
              Centang daftar tindakan/fitur detail yang boleh diakses oleh role ini.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={!isDirty}
            className={cn(
              "font-semibold flex items-center gap-2",
              !isDirty && "bg-gray-100/50 text-muted-foreground border-transparent opacity-60"
            )}
            icon={<Save className="h-3.5 w-3.5" />}
          >
            Simpan Perubahan Hak Akses
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {permissionGroups.map(group => (
            <div key={group.id}>
              {/* Group Header */}
              <div className="flex items-center gap-2 mb-4 bg-gray-50/80 p-2 rounded-lg">
                <Folder className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                <h3 className="font-bold text-sm tracking-wide">{group.name}</h3>
              </div>

              {/* Group Permissions List */}
              <div className="space-y-1">
                {group.permissions.map(perm => {
                  const isChecked = permissions.includes(perm.id)
                  return (
                    <div 
                      key={perm.id} 
                      className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-border/60 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      onClick={() => togglePermission(perm.id)}
                    >
                      <div>
                        <h4 className="font-bold text-sm text-foreground mb-0.5">{perm.title}</h4>
                        <p className="text-xs text-muted-foreground">{perm.desc}</p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <div className={cn(
                          "h-5 w-5 rounded-[4px] flex items-center justify-center transition-colors border",
                          isChecked 
                            ? "bg-orange-500 border-orange-500 text-white" 
                            : "bg-white border-gray-300 text-transparent group-hover:border-gray-400"
                        )}>
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
              <h3 className="font-bold text-stone-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                Buat Role Baru
              </h3>
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="h-7 w-7 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveRole} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nama Role (Akses)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Manajer Kampanye"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddRoleModal(false)}>Batal</Button>
                <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-bold">{editingRoleId ? "Simpan Perubahan" : "Simpan Role"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}