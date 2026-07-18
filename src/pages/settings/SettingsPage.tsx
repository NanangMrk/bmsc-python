import { useState } from 'react'
import { 
  Settings, 
  
  Building2, 
  CreditCard, 
  FileText, 
  Receipt,
  UploadCloud,
  MapPin,
  Mail,
  Phone,
  Image as ImageIcon,
  Trash2,
  Plus,
  Landmark,
  Pencil
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('identitas')

  const [formData, setFormData] = useState({
    agencyName: 'NanangMrk',
    corporateName: 'NanangMrk Channel',
    tagline: 'NETWORK CONTENT CREATOR',
    email: 'nanangmrkchannel@gmail.com',
    phone: '085156014905',
    building: 'Jl. Pangeran Syarief',
    address: 'RT 03 RW 01 Saripan Jepara\n59414'
  })

  const [bankAccounts, setBankAccounts] = useState([
    { id: '1', bankName: 'BCA', accountNumber: '1234567890', accountName: 'Nanang Mrk' }
  ])
  const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', accountName: '' })
  const [editingBankId, setEditingBankId] = useState<string | null>(null)

  const [quoSettings, setQuoSettings] = useState({
    accentColor: '#ea580c',
    showSignature: true,
    useStamp: true,
    signatoryName: 'Nanang M.',
    signatoryRole: 'Chief Executive',
    termsText: '1. Pembayaran DP minimal 50% sebelum project dimulai.\n2. Revisi maksimal 2 kali pada tahap offline editing.',
    taxEnabled: true,
    taxName: 'PPN',
    taxPercent: 11,
    showBank: false,
    selectedBankId: 'b1'
  })

  const [invSettings, setInvSettings] = useState({
    accentColor: '#ea580c',
    showSignature: true,
    useStamp: true,
    showBank: true,
    selectedBankId: 'b1',
    signatoryName: 'Finance Dept',
    signatoryRole: 'Finance & Accounting',
    termsText: '1. Pembayaran harap dilakukan selambatnya 14 hari setelah invoice diterbitkan.\n2. Mohon sertakan Nomor Invoice pada berita transfer.\n3. Kirimkan bukti transfer ke finance@nanangmrk.com.',
    taxEnabled: true,
    taxName: 'PPN',
    taxPercent: 11
  })

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBank.bankName || !newBank.accountNumber || !newBank.accountName) return
    
    if (editingBankId) {
      setBankAccounts(bankAccounts.map(b => b.id === editingBankId ? { ...newBank, id: editingBankId } : b))
      setEditingBankId(null)
    } else {
      setBankAccounts([...bankAccounts, { ...newBank, id: Date.now().toString() }])
    }
    setNewBank({ bankName: '', accountNumber: '', accountName: '' })
  }

  const handleEditClick = (bank: any) => {
    setEditingBankId(bank.id)
    setNewBank({ bankName: bank.bankName, accountNumber: bank.accountNumber, accountName: bank.accountName })
  }

  const handleCancelEdit = () => {
    setEditingBankId(null)
    setNewBank({ bankName: '', accountNumber: '', accountName: '' })
  }
  
  const handleDeleteBank = (id: string) => {
    setBankAccounts(bankAccounts.filter(b => b.id !== id))
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Sistem Pengaturan Hub (Settings)</h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Pusat konfigurasi legal corporate. Atur profil representasi agensi, kelola banyak rekening bank tujuan, serta kustomisasi kop dan layout cetak Quotation penawaran harga.
            </p>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1 overflow-x-auto scrollbar-none">
        <TabButton 
          icon={<Building2 className="h-4 w-4" />} 
          label="Identitas & Profil Agensi" 
          isActive={activeTab === 'identitas'} 
          onClick={() => setActiveTab('identitas')} 
        />
        <TabButton 
          icon={<CreditCard className="h-4 w-4" />} 
          label="Rekening Bank Penerimaan" 
          badge="2"
          isActive={activeTab === 'rekening'} 
          onClick={() => setActiveTab('rekening')} 
        />
        <TabButton 
          icon={<FileText className="h-4 w-4" />} 
          label="Kustomisasi Cetak Quotation" 
          isActive={activeTab === 'quotation'} 
          onClick={() => setActiveTab('quotation')} 
        />
        <TabButton 
          icon={<Receipt className="h-4 w-4" />} 
          label="Kustomisasi Cetak Invoice" 
          isActive={activeTab === 'invoice'} 
          onClick={() => setActiveTab('invoice')} 
        />
      </div>

      {/* Main Content */}
      {activeTab === 'identitas' && (
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Panel: Form */}
        <div className="flex-1 bg-white border border-border/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/40 text-xs font-bold text-orange-600 uppercase tracking-widest">
            <Building2 className="h-4 w-4" />
            IDENTITAS & ALAMAT KOMERSIAL AGENCY
          </div>

          <div className="space-y-6">
            {/* Logo Section */}
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                LOGO PERUSAHAAN (COMPANY LOGO)
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-24 w-24 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white shrink-0">
                  <ImageIcon className="h-6 w-6 mb-1 opacity-80" />
                  <span className="text-[9px] font-bold tracking-widest opacity-80">HQ LOGO</span>
                </div>
                <div className="flex-1 border-2 border-dashed border-border/80 bg-gray-50/50 rounded-xl flex flex-col items-center justify-center p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                  <UploadCloud className="h-5 w-5 text-orange-500 mb-2" />
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Seret & Letakkan file logo Anda disini, atau <span className="text-orange-600 hover:underline">Pilih file</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Mendukung PNG, JPG, JPEG, SVG (Maks. 1.5MB). Dimensi persegi (1:1) direkomendasikan.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="NAMA GROUP / BRAND DAGANG (AGENCY NAME)"
                value={formData.agencyName}
                onChange={(v) => setFormData({...formData, agencyName: v})}
              />
              <FormField 
                label="NAMA BADAN HUKUM RESMI (CORPORATE NAME)"
                value={formData.corporateName}
                onChange={(v) => setFormData({...formData, corporateName: v})}
              />
            </div>

            <FormField 
              label="TAGLINE JASA / JENIS BISNIS (TAGLINE / TYPE)"
              value={formData.tagline}
              onChange={(v) => setFormData({...formData, tagline: v})}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="EMAIL BISNIS RESMI"
                icon={<Mail className="h-3.5 w-3.5 text-muted-foreground" />}
                value={formData.email}
                onChange={(v) => setFormData({...formData, email: v})}
              />
              <FormField 
                label="NOMOR TELEPON KANTOR"
                icon={<Phone className="h-3.5 w-3.5 text-muted-foreground" />}
                value={formData.phone}
                onChange={(v) => setFormData({...formData, phone: v})}
              />
            </div>

            <FormField 
              label="GEDUNG & LANTAI (BUILDING / FLOOR / UNIT)"
              value={formData.building}
              onChange={(v) => setFormData({...formData, building: v})}
            />

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                ALAMAT JALAN & WILAYAH (STREET ADDRESS)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <textarea 
                  rows={3}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-border/80 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors">
                Simpan Profil Kantor
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="w-full xl:w-[400px] space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M2 12h4l2-9 5 18 2-9h5"/></svg>
              REAL-TIME LIVE MOCKUP PREVIEW
            </div>
            
            {/* ID Card Mockup */}
            <div className="bg-[#1a1f36] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden h-[240px] flex flex-col justify-between">
              {/* Background abstract shape */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
                    {formData.agencyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg tracking-tight leading-none">{formData.agencyName}</h3>
                    <p className="text-[9px] text-white/60 font-medium tracking-widest uppercase mt-1">{formData.tagline}</p>
                  </div>
                </div>
                <div className="text-[9px] font-bold text-white/40 tracking-widest uppercase">HQ CARD</div>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="flex items-start gap-2.5 text-xs text-white/80">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-70" />
                  <div className="leading-relaxed font-medium">
                    {formData.building}<br/>
                    {formData.address}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/80 font-medium">
                  <Mail className="h-3.5 w-3.5 opacity-70" />
                  {formData.email}
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/80 font-medium">
                  <Phone className="h-3.5 w-3.5 opacity-70" />
                  {formData.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white border border-border/60 rounded-xl p-5 shadow-sm">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              INFORMASI IDENTITAS
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Informasi di atas digunakan sebagai kop resmi pada seluruh halaman komersial legal corporate seperti Quotation, Invoice, dan Tanda Terima transfer dana.
            </p>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'rekening' && (
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Form Input */}
          <div className="flex-1 bg-white border border-border/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest">
                <Landmark className="h-4 w-4" />
                {editingBankId ? 'EDIT DATA REKENING' : 'TAMBAH REKENING BANK BARU'}
              </div>
              {editingBankId && (
                <button onClick={handleCancelEdit} className="text-xs font-bold text-muted-foreground hover:text-foreground">
                  Batal Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleSaveBank} className="space-y-4">
              <FormField 
                label="NAMA BANK (Misal: BCA, Mandiri)"
                value={newBank.bankName}
                onChange={(v) => setNewBank({...newBank, bankName: v})}
              />
              <FormField 
                label="NOMOR REKENING"
                value={newBank.accountNumber}
                onChange={(v) => setNewBank({...newBank, accountNumber: v})}
              />
              <FormField 
                label="NAMA PEMILIK REKENING (A.N)"
                value={newBank.accountName}
                onChange={(v) => setNewBank({...newBank, accountName: v})}
              />
              <div className="pt-2">
                <button type="submit" className="flex items-center justify-center w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-3 rounded-lg shadow-sm transition-colors">
                  {editingBankId ? 'Simpan Perubahan' : <><Plus className="h-4 w-4" /> Tambah Rekening</>}
                </button>
              </div>
            </form>
          </div>

          {/* List Rekening */}
          <div className="w-full xl:w-[500px] space-y-4">
            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <CreditCard className="h-4 w-4 text-orange-500" />
              DAFTAR REKENING AKTIF ({bankAccounts.length})
            </div>

            {bankAccounts.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                Belum ada rekening bank yang ditambahkan.
              </div>
            ) : (
              bankAccounts.map((bank) => (
                <div key={bank.id} className="bg-white border border-border/60 rounded-xl p-5 shadow-sm flex items-center justify-between hover:border-orange-200 transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center font-bold text-sm">
                      {bank.bankName.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground font-mono">{bank.accountNumber}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">a.n. <span className="font-semibold text-foreground">{bank.accountName}</span></p>
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-1">{bank.bankName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEditClick(bank)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-orange-50 hover:text-orange-500 transition-colors"
                      title="Edit Rekening"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBank(bank.id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Hapus Rekening"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* QUOTATION TAB */}
      {activeTab === 'quotation' && (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 bg-white border border-border/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/40 text-xs font-bold text-orange-600 uppercase tracking-widest">
              <FileText className="h-4 w-4" />
              KUSTOMISASI TAMPILAN CETAK QUOTATION
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Warna Aksen Utama</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={quoSettings.accentColor} 
                      onChange={(e) => setQuoSettings({...quoSettings, accentColor: e.target.value})}
                      className="h-10 w-16 p-1 rounded-lg border border-border/80 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-muted-foreground uppercase">{quoSettings.accentColor}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Tampilkan Tanda Tangan</label>
                  <select 
                    value={quoSettings.showSignature ? 'yes' : 'no'}
                    onChange={(e) => setQuoSettings({...quoSettings, showSignature: e.target.value === 'yes'})}
                    className="w-full h-10 px-3 rounded-lg border border-border/80 bg-gray-50/50 text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="yes">Ya, Tampilkan Kotak TTD</option>
                    <option value="no">Sembunyikan Kotak TTD</option>
                  </select>
                </div>
              </div>

              {quoSettings.showSignature && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50/30 p-4 rounded-xl border border-orange-100">
                  <FormField 
                    label="Nama Penandatangan (Signatory Name)"
                    value={quoSettings.signatoryName}
                    onChange={(v) => setQuoSettings({...quoSettings, signatoryName: v})}
                  />
                  <FormField 
                    label="Jabatan (Role/Title)"
                    value={quoSettings.signatoryRole}
                    onChange={(v) => setQuoSettings({...quoSettings, signatoryRole: v})}
                  />
                  
                  <div className="col-span-full pt-2">
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={quoSettings.useStamp} 
                        onChange={(e) => setQuoSettings({...quoSettings, useStamp: e.target.checked})}
                        className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                      />
                      Tampilkan Stempel Status Dokumen (Watermark / Rubber Stamp)
                    </label>
                  </div>
                </div>
              )}

              {/* Pajak Section */}
              <div className="bg-gray-50/50 p-4 rounded-xl border border-border/80">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={quoSettings.taxEnabled} 
                    onChange={(e) => setQuoSettings({...quoSettings, taxEnabled: e.target.checked})}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  Terapkan Pajak Tambahan pada Penawaran
                </label>
                {quoSettings.taxEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField 
                      label="Nama Pajak (Contoh: PPN, VAT)"
                      value={quoSettings.taxName}
                      onChange={(v) => setQuoSettings({...quoSettings, taxName: v})}
                    />
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Besaran (%)</label>
                      <input 
                        type="number"
                        value={quoSettings.taxPercent}
                        onChange={(e) => setQuoSettings({...quoSettings, taxPercent: Number(e.target.value)})}
                        className="w-full h-10 px-3 rounded-lg border border-border/80 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Rekening Section */}
              <div className="bg-gray-50/50 p-4 rounded-xl border border-border/80">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={quoSettings.showBank} 
                    onChange={(e) => setQuoSettings({...quoSettings, showBank: e.target.checked})}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  Tampilkan Kotak Informasi Rekening Pembayaran
                </label>
                {quoSettings.showBank && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Pilih Rekening Bank Aktif</label>
                    <select
                      value={quoSettings.selectedBankId}
                      onChange={(e) => setQuoSettings({...quoSettings, selectedBankId: e.target.value})}
                      className="w-full h-10 px-3 rounded-lg border border-border/80 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      {bankAccounts.map(bank => (
                        <option key={bank.id} value={bank.id}>
                          {bank.bankName} - {bank.accountNumber} (a.n. {bank.accountName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Syarat & Ketentuan Default (Terms & Conditions)
                </label>
                <textarea 
                  rows={4}
                  className="w-full p-3 bg-gray-50/50 border border-border/80 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                  value={quoSettings.termsText}
                  onChange={(e) => setQuoSettings({...quoSettings, termsText: e.target.value})}
                />
                <p className="text-[10px] text-muted-foreground mt-1.5">Teks ini akan otomatis disematkan di bagian bawah dokumen Quotation.</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/40">
                <button className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors">
                  Simpan Format Quotation
                </button>
              </div>
            </div>
          </div>
          
          {/* Preview Panel for Quotation */}
          <div className="w-full xl:w-[600px] bg-slate-50 border border-border/60 rounded-xl p-4 shadow-inner overflow-hidden flex flex-col items-center">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 w-full text-left">Live Preview (Skala Mini 50%)</h4>
            
            {/* Aspect Ratio Container for A4 Miniature */}
            <div className="relative w-[397px] h-[561px] bg-white border border-gray-300 shadow-md overflow-hidden rounded-md flex-shrink-0">
              
              <div className="absolute top-0 left-0 w-[794px] h-[1122px] bg-white p-12 origin-top-left" style={{ transform: 'scale(0.5)', borderColor: quoSettings.accentColor }}>
                
                {quoSettings.useStamp && (
                  <div className="absolute top-12 right-12 z-10 opacity-100">
                    <div className="border-[3.5px] border-orange-500/75 text-orange-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center font-sans tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply">
                      <div className="flex items-center gap-1 text-[9px] font-extrabold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500/85"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        QUOTATION
                      </div>
                      <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
                        SENT / TERKIRIM
                      </div>
                      <div className="text-[7.5px] font-semibold text-orange-500/60 uppercase tracking-widest">
                        NANANGMRK
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Details */}
                <div className="flex items-start justify-between gap-6 mb-12">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 text-white rounded-full flex items-center justify-center font-black text-xl shadow-sm" style={{ backgroundColor: quoSettings.accentColor }}>
                        {formData.agencyName.charAt(0)}
                      </div>
                      <span className="font-extrabold text-xl text-foreground">{formData.agencyName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5 leading-relaxed">
                      <p className="font-bold text-foreground text-sm">{formData.corporateName}</p>
                      <p>{formData.building}</p>
                      <p className="whitespace-pre-line">{formData.address}</p>
                      <p>Email: {formData.email}</p>
                      <p>Telp: {formData.phone}</p>
                    </div>
                  </div>

                  <div className="text-right text-sm text-muted-foreground space-y-1">
                    <h2 className="text-3xl font-black tracking-wider" style={{ color: quoSettings.accentColor }}>QUOTATION</h2>
                    <p className="font-semibold text-foreground">No. Quotation: <span className="font-mono text-muted-foreground">QUO-14-11-2023-001</span></p>
                    <p className="font-semibold text-foreground">Tanggal: <span className="text-muted-foreground">14 Nov 2023</span></p>
                  </div>
                </div>

                {/* Table */}
                <div className="border-2 rounded-2xl overflow-hidden mb-8" style={{ borderColor: quoSettings.accentColor }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: quoSettings.accentColor, backgroundColor: quoSettings.accentColor + '10' }}>
                        <th className="px-5 py-4 text-left text-foreground uppercase tracking-widest font-black text-xs">Layanan & Deskripsi</th>
                        <th className="px-3 py-4 text-center text-foreground uppercase tracking-widest font-black text-xs w-16">Qty</th>
                        <th className="px-3 py-4 text-center text-foreground uppercase tracking-widest font-black text-xs w-20">Unit</th>
                        <th className="px-5 py-4 text-right text-foreground uppercase tracking-widest font-black text-xs w-36">Harga (IDR)</th>
                        <th className="px-5 py-4 text-right text-foreground uppercase tracking-widest font-black text-xs w-36">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-100">
                      <tr>
                        <td className="px-5 py-5">
                          <p className="font-bold text-foreground text-base">Pembuatan Video Kampanye</p>
                          <p className="text-muted-foreground text-sm mt-1">Produksi konten video kreatif durasi 60 detik.</p>
                        </td>
                        <td className="px-3 py-5 text-center text-muted-foreground font-semibold text-base">1</td>
                        <td className="px-3 py-5 text-center text-muted-foreground capitalize text-base">Video</td>
                        <td className="px-5 py-5 text-right font-semibold text-base">5.000.000</td>
                        <td className="px-5 py-5 text-right font-bold text-foreground text-base">5.000.000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="flex flex-col items-end space-y-2 mt-8 font-semibold">
                  <div className="flex justify-between w-full max-w-[320px] text-sm text-muted-foreground border-b-2 border-gray-100 pb-2">
                    <span>Subtotal Pekerjaan:</span>
                    <span className="font-bold text-foreground text-base">5.000.000</span>
                  </div>
                  {quoSettings.taxEnabled && (
                    <div className="flex justify-between w-full max-w-[320px] text-sm text-muted-foreground border-b-2 border-gray-100 pb-2">
                      <span>{quoSettings.taxName} ({quoSettings.taxPercent}%):</span>
                      <span className="font-bold text-foreground text-base">550.000</span>
                    </div>
                  )}
                  <div className="flex justify-between w-full max-w-[320px] items-baseline pt-2">
                    <span className="font-bold text-foreground text-sm uppercase tracking-wide">Total Penawaran:</span>
                    <span className="font-black text-xl" style={{ color: quoSettings.accentColor }}>Rp {quoSettings.taxEnabled ? '5.550.000' : '5.000.000'}</span>
                  </div>
                </div>

                {/* Payment Details Box */}
                {quoSettings.showBank && (
                  <div className="border-2 border-gray-200 rounded-2xl p-6 bg-gray-50/20 grid md:grid-cols-2 gap-6 mt-10 leading-relaxed text-sm">
                    <div className="space-y-2">
                      <h4 className="font-extrabold uppercase tracking-widest text-[11px]" style={{ color: quoSettings.accentColor }}>TATA CARA PEMBAYARAN</h4>
                      <p className="text-muted-foreground font-medium text-sm">
                        Pembayaran termin mengikuti kesepakatan kontrak. Mohon transfer ke rekening resmi di samping dan sertakan nomor quotation saat konfirmasi.
                      </p>
                    </div>
                    <div className="md:border-l-2 border-gray-200 md:pl-6 space-y-1">
                      <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[11px] mb-2">REKENING TUJUAN</h4>
                      {(() => {
                        const bank = bankAccounts.find(b => b.id === quoSettings.selectedBankId) || bankAccounts[0];
                        return (
                          <>
                            <p className="font-extrabold text-foreground text-sm">{bank?.bankName}</p>
                            <p className="font-black text-xl tracking-wider" style={{ color: quoSettings.accentColor }}>{bank?.accountNumber}</p>
                            <p className="text-muted-foreground font-semibold text-xs mt-1">a.n. {bank?.accountName}</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Terms & Signature Section */}
                <div className="grid grid-cols-2 gap-8 mt-12 text-sm relative">
                  {/* Terms and Conditions */}
                  <div className="space-y-2 z-10">
                    <h4 className="font-extrabold uppercase tracking-widest text-[11px]" style={{ color: quoSettings.accentColor }}>SYARAT & KETENTUAN</h4>
                    <div className="text-muted-foreground font-medium leading-relaxed whitespace-pre-line text-sm">
                      {quoSettings.termsText}
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="flex flex-col items-end z-10">
                    {quoSettings.showSignature && (
                      <div className="flex flex-col items-center text-center space-y-16 w-56 mt-4 relative">
                        <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[11px]">HORMAT KAMI,</h4>
                        <div className="space-y-1 w-full relative">
                          <p className="border-b-2 border-dotted border-gray-400 pb-2 font-bold text-foreground text-base w-full text-center relative z-10">{quoSettings.signatoryName}</p>
                          <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-widest text-center w-full relative z-10">{quoSettings.signatoryRole}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
      {/* INVOICE TAB */}
      {activeTab === 'invoice' && (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 bg-white border border-border/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/40 text-xs font-bold text-orange-600 uppercase tracking-widest">
              <Receipt className="h-4 w-4" />
              KUSTOMISASI TAMPILAN CETAK INVOICE
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Warna Aksen Utama</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={invSettings.accentColor} 
                      onChange={(e) => setInvSettings({...invSettings, accentColor: e.target.value})}
                      className="h-10 w-16 p-1 rounded-lg border border-border/80 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-muted-foreground uppercase">{invSettings.accentColor}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Tampilkan Tanda Tangan</label>
                  <select 
                    value={invSettings.showSignature ? 'yes' : 'no'}
                    onChange={(e) => setInvSettings({...invSettings, showSignature: e.target.value === 'yes'})}
                    className="w-full h-10 px-3 rounded-lg border border-border/80 bg-gray-50/50 text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="yes">Ya, Tampilkan Kotak TTD</option>
                    <option value="no">Sembunyikan Kotak TTD</option>
                  </select>
                </div>
              </div>

              {invSettings.showSignature && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50/30 p-4 rounded-xl border border-orange-100">
                  <FormField 
                    label="Nama Penandatangan (Signatory Name)"
                    value={invSettings.signatoryName}
                    onChange={(v) => setInvSettings({...invSettings, signatoryName: v})}
                  />
                  <FormField 
                    label="Jabatan (Role/Title)"
                    value={invSettings.signatoryRole}
                    onChange={(v) => setInvSettings({...invSettings, signatoryRole: v})}
                  />
                  
                  <div className="col-span-full pt-2">
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={invSettings.useStamp} 
                        onChange={(e) => setInvSettings({...invSettings, useStamp: e.target.checked})}
                        className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                      />
                      Tampilkan Stempel Status Dokumen (Watermark / Rubber Stamp)
                    </label>
                  </div>
                </div>
              )}

              {/* Pajak Section */}
              <div className="bg-gray-50/50 p-4 rounded-xl border border-border/80">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={invSettings.taxEnabled} 
                    onChange={(e) => setInvSettings({...invSettings, taxEnabled: e.target.checked})}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  Terapkan Pajak Tambahan pada Invoice
                </label>
                {invSettings.taxEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField 
                      label="Nama Pajak (Contoh: PPN, VAT)"
                      value={invSettings.taxName}
                      onChange={(v) => setInvSettings({...invSettings, taxName: v})}
                    />
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Besaran (%)</label>
                      <input 
                        type="number"
                        value={invSettings.taxPercent}
                        onChange={(e) => setInvSettings({...invSettings, taxPercent: Number(e.target.value)})}
                        className="w-full h-10 px-3 rounded-lg border border-border/80 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Rekening Section */}
              <div className="bg-gray-50/50 p-4 rounded-xl border border-border/80">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={invSettings.showBank} 
                    onChange={(e) => setInvSettings({...invSettings, showBank: e.target.checked})}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  Tampilkan Kotak Informasi Rekening Pembayaran
                </label>
                {invSettings.showBank && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Pilih Rekening Bank Aktif</label>
                    <select
                      value={invSettings.selectedBankId}
                      onChange={(e) => setInvSettings({...invSettings, selectedBankId: e.target.value})}
                      className="w-full h-10 px-3 rounded-lg border border-border/80 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      {bankAccounts.map(bank => (
                        <option key={bank.id} value={bank.id}>
                          {bank.bankName} - {bank.accountNumber} (a.n. {bank.accountName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Catatan Default Invoice (Footer Notes)
                </label>
                <textarea 
                  rows={4}
                  className="w-full p-3 bg-gray-50/50 border border-border/80 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                  value={invSettings.termsText}
                  onChange={(e) => setInvSettings({...invSettings, termsText: e.target.value})}
                />
                <p className="text-[10px] text-muted-foreground mt-1.5">Teks ini akan tampil sebagai petunjuk pembayaran di bagian bawah Invoice.</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/40">
                <button className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors">
                  Simpan Format Invoice
                </button>
              </div>
            </div>
          </div>
          
          {/* Preview Panel for Invoice */}
          <div className="w-full xl:w-[600px] bg-slate-50 border border-border/60 rounded-xl p-4 shadow-inner overflow-hidden flex flex-col items-center">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 w-full text-left">Live Preview (Skala Mini 50%)</h4>
            
            <div className="relative w-[397px] h-[561px] bg-white border border-gray-300 shadow-md overflow-hidden rounded-md flex-shrink-0">
              <div className="absolute top-0 left-0 w-[794px] h-[1122px] bg-white p-12 origin-top-left" style={{ transform: 'scale(0.5)', borderColor: invSettings.accentColor }}>
                
                {invSettings.useStamp && (
                  <div className="absolute top-12 right-12 z-10 opacity-100">
                    <div className="border-[3.5px] border-rose-500/75 text-rose-500/85 rounded-xl p-2.5 text-center uppercase -rotate-[12deg] bg-transparent flex flex-col items-center justify-center font-sans tracking-wide select-none max-w-[170px] border-double opacity-85 mix-blend-multiply">
                      <div className="flex items-center gap-1 text-[9px] font-extrabold">
                        <span className="inline-flex items-center justify-center border border-rose-500/80 text-rose-500/80 rounded-full h-3.5 w-3.5 text-[8.5px] font-extrabold">!</span>
                        INVOICE
                      </div>
                      <div className="text-[10px] font-black tracking-wider my-0.5 whitespace-nowrap">
                        BELUM LUNAS / UNPAID
                      </div>
                      <div className="text-[7.5px] font-semibold text-rose-500/60 uppercase tracking-widest">
                        NANANGMRK
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Details */}
                <div className="flex items-start justify-between gap-6 mb-12">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 text-white rounded-full flex items-center justify-center font-black text-xl shadow-sm" style={{ backgroundColor: invSettings.accentColor }}>
                        {formData.agencyName.charAt(0)}
                      </div>
                      <span className="font-extrabold text-xl text-foreground">{formData.agencyName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5 leading-relaxed">
                      <p className="font-bold text-foreground text-sm">{formData.corporateName}</p>
                      <p>{formData.building}</p>
                      <p className="whitespace-pre-line">{formData.address}</p>
                      <p>Email: {formData.email}</p>
                      <p>Telp: {formData.phone}</p>
                    </div>
                  </div>

                  <div className="text-right text-sm text-muted-foreground space-y-1">
                    <h2 className="text-3xl font-black tracking-wider" style={{ color: invSettings.accentColor }}>INVOICE</h2>
                    <p className="font-semibold text-foreground">No. Invoice: <span className="font-mono text-muted-foreground">INV-14-11-2023-001</span></p>
                    <p className="font-semibold text-foreground">Tanggal: <span className="text-muted-foreground">14 Nov 2023</span></p>
                    <p className="font-semibold text-foreground">Jatuh Tempo: <span className="text-muted-foreground">21 Nov 2023</span></p>
                  </div>
                </div>

                {/* Table */}
                <div className="border-2 rounded-2xl overflow-hidden mb-8" style={{ borderColor: invSettings.accentColor }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: invSettings.accentColor, backgroundColor: invSettings.accentColor + '10' }}>
                        <th className="px-5 py-4 text-left text-foreground uppercase tracking-widest font-black text-xs">Layanan & Deskripsi</th>
                        <th className="px-3 py-4 text-center text-foreground uppercase tracking-widest font-black text-xs w-16">Qty</th>
                        <th className="px-3 py-4 text-center text-foreground uppercase tracking-widest font-black text-xs w-20">Unit</th>
                        <th className="px-5 py-4 text-right text-foreground uppercase tracking-widest font-black text-xs w-36">Harga (IDR)</th>
                        <th className="px-5 py-4 text-right text-foreground uppercase tracking-widest font-black text-xs w-36">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-100">
                      <tr>
                        <td className="px-5 py-5">
                          <p className="font-bold text-foreground text-base">Pembuatan Video Kampanye</p>
                          <p className="text-muted-foreground text-sm mt-1">Termin Pembayaran Tahap 1 (DP 50%).</p>
                        </td>
                        <td className="px-3 py-5 text-center text-muted-foreground font-semibold text-base">1</td>
                        <td className="px-3 py-5 text-center text-muted-foreground capitalize text-base">Project</td>
                        <td className="px-5 py-5 text-right font-semibold text-base">2.500.000</td>
                        <td className="px-5 py-5 text-right font-bold text-foreground text-base">2.500.000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="flex flex-col items-end space-y-2 mt-8 font-semibold">
                  <div className="flex justify-between w-full max-w-[320px] text-sm text-muted-foreground border-b-2 border-gray-100 pb-2">
                    <span>Subtotal Tagihan:</span>
                    <span className="font-bold text-foreground text-base">2.500.000</span>
                  </div>
                  {invSettings.taxEnabled && (
                    <div className="flex justify-between w-full max-w-[320px] text-sm text-muted-foreground border-b-2 border-gray-100 pb-2">
                      <span>{invSettings.taxName} ({invSettings.taxPercent}%):</span>
                      <span className="font-bold text-foreground text-base">275.000</span>
                    </div>
                  )}
                  <div className="flex justify-between w-full max-w-[320px] items-baseline pt-2">
                    <span className="font-bold text-foreground text-sm uppercase tracking-wide">Total Tagihan:</span>
                    <span className="font-black text-xl" style={{ color: invSettings.accentColor }}>Rp {invSettings.taxEnabled ? '2.775.000' : '2.500.000'}</span>
                  </div>
                </div>

                {/* Payment Details Box */}
                {invSettings.showBank && (
                  <div className="border-2 border-gray-200 rounded-2xl p-6 bg-gray-50/20 grid md:grid-cols-2 gap-6 mt-10 leading-relaxed text-sm">
                    <div className="space-y-2">
                      <h4 className="font-extrabold uppercase tracking-widest text-[11px]" style={{ color: invSettings.accentColor }}>TATA CARA PEMBAYARAN</h4>
                      <p className="text-muted-foreground font-medium text-sm">
                        Pembayaran termin mengikuti kesepakatan kontrak. Mohon transfer ke rekening resmi di samping dan sertakan nomor invoice saat konfirmasi.
                      </p>
                    </div>
                    <div className="md:border-l-2 border-gray-200 md:pl-6 space-y-1">
                      <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[11px] mb-2">REKENING TUJUAN</h4>
                      {(() => {
                        const bank = bankAccounts.find(b => b.id === invSettings.selectedBankId) || bankAccounts[0];
                        return (
                          <>
                            <p className="font-extrabold text-foreground text-sm">{bank?.bankName}</p>
                            <p className="font-black text-xl tracking-wider" style={{ color: invSettings.accentColor }}>{bank?.accountNumber}</p>
                            <p className="text-muted-foreground font-semibold text-xs mt-1">a.n. {bank?.accountName}</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Terms & Signature Section */}
                <div className="grid grid-cols-2 gap-8 mt-12 text-sm relative">
                  {/* Terms and Conditions */}
                  <div className="space-y-2 z-10">
                    <h4 className="font-extrabold uppercase tracking-widest text-[11px]" style={{ color: invSettings.accentColor }}>SYARAT & KETENTUAN</h4>
                    <div className="text-muted-foreground font-medium leading-relaxed whitespace-pre-line text-sm">
                      {invSettings.termsText}
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="flex flex-col items-end z-10">
                    {invSettings.showSignature && (
                      <div className="flex flex-col items-center text-center space-y-16 w-56 mt-4 relative">
                        <h4 className="font-extrabold text-muted-foreground uppercase tracking-widest text-[11px]">HORMAT KAMI,</h4>
                        <div className="space-y-1 w-full relative">
                          <p className="border-b-2 border-dotted border-gray-400 pb-2 font-bold text-foreground text-base w-full text-center relative z-10">{invSettings.signatoryName}</p>
                          <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-widest text-center w-full relative z-10">{invSettings.signatoryRole}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TabButton({ icon, label, badge, isActive, onClick }: { icon: React.ReactNode, label: string, badge?: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition-colors whitespace-nowrap",
        isActive 
          ? "border-orange-600 text-orange-600" 
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {icon}
      {label}
      {badge && (
        <span className={cn(
          "px-1.5 py-0.5 text-[9px] rounded-full",
          isActive ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
        )}>
          {badge}
        </span>
      )}
    </button>
  )
}

function FormField({ label, value, onChange, icon }: { label: string, value: string, onChange: (v: string) => void, icon?: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <input 
          type="text" 
          className={cn(
            "w-full pr-4 py-2.5 bg-gray-50/50 border border-border/80 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all",
            icon ? "pl-9" : "pl-4"
          )}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
