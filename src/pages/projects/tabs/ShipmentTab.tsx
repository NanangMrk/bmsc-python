import { useState, useRef } from 'react'
import { Upload, CheckCircle2, Package, Image, Loader2 } from 'lucide-react'
import type { Project } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuthStore } from '@/stores/auth.store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface ShipmentTabProps {
  project: Project
}

type ShipmentStatus = 'BELUM_DIKIRIM' | 'DIKIRIM' | 'DIKONFIRMASI'

export function ShipmentTab({ project: _project }: ShipmentTabProps) {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
  const isBrand = user?.role === 'BRAND'
  
  const queryClient = useQueryClient()
  const shipment = (_project as any).shipments?.[0]
  
  const status = (shipment?.status as ShipmentStatus) || 'BELUM_DIKIRIM'
  const hasProof = !!shipment?.resiPhoto
  const hasUnboxing = !!shipment?.arrivalProof
  
  const [uploadingResi, setUploadingResi] = useState(false)
  const [uploadingUnboxing, setUploadingUnboxing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const unboxingInputRef = useRef<HTMLInputElement>(null)

  const saveShipmentMutation = useMutation({
    mutationFn: (data: any) => {
      if (shipment?.id) {
        return api(`/shipments/${shipment.id}`, { method: 'PATCH', data })
      }
      return api(`/shipments`, { method: 'POST', data: { ...data, projectId: _project.id } })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', _project.id] })
  })

  const uploadFile = async (file: File) => {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('http://localhost:3000/api/upload/single', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
    const data = await res.json()
    return data.url ? `http://localhost:3000${data.url}` : null
  }

  const handleUploadResi = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingResi(true)
    try {
      const url = await uploadFile(file)
      if (url) {
        saveShipmentMutation.mutate({ resiPhoto: url, status: 'DIKIRIM' })
      }
    } finally {
      setUploadingResi(false)
    }
  }

  const handleUploadUnboxing = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingUnboxing(true)
    try {
      const url = await uploadFile(file)
      if (url) {
        saveShipmentMutation.mutate({ arrivalProof: url })
      }
    } finally {
      setUploadingUnboxing(false)
    }
  }

  const handleConfirm = () => {
    saveShipmentMutation.mutate({ status: 'DIKONFIRMASI' })
  }

  const steps = [
    { key: 'BELUM_DIKIRIM', label: 'Belum Dikirim', desc: 'Barang belum dikirim oleh brand' },
    { key: 'DIKIRIM', label: 'Dikirim', desc: 'Resi terkirim, menunggu konfirmasi admin' },
    { key: 'DIKONFIRMASI', label: 'Dikonfirmasi', desc: 'Admin sudah konfirmasi barang diterima' },
  ]

  const statusIndex = steps.findIndex((s) => s.key === status)

  return (
    <div className="space-y-6">
      {/* Status stepper */}
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                i <= statusIndex
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-background border-border text-muted-foreground'
              }`}>
                {i <= statusIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <p className="text-xs font-medium mt-2 text-center whitespace-nowrap">{step.label}</p>
              <p className="text-[10px] text-muted-foreground text-center max-w-24">{step.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-8 mx-2 transition-colors ${i < statusIndex ? 'bg-orange-500' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <StatusBadge status={status} />

      {/* Resi upload section */}
      <div className="p-5 rounded-xl border border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Package className="h-4 w-4 text-orange-500" />
          Foto Resi Pengiriman
        </h3>
        {hasProof ? (
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              <img src={shipment.resiPhoto} alt="Resi" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium">Bukti Resi Pengiriman</p>
              <a href={shipment.resiPhoto} target="_blank" rel="noreferrer" className="text-xs text-orange-500 hover:underline">Lihat Gambar Penuh</a>
            </div>
          </div>
        ) : (
          isBrand && (
            <div 
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-orange-300 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingResi ? (
                <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              )}
              <p className="text-sm font-medium mb-1">{uploadingResi ? 'Mengunggah...' : 'Upload foto resi pengiriman'}</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, PDF · Max 5MB</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleUploadResi} />
            </div>
          )
        )}

        {/* Admin: confirm receipt */}
        {isAdmin && status === 'DIKIRIM' && hasProof && (
          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <Button icon={<CheckCircle2 className="h-4 w-4" />} onClick={handleConfirm} loading={saveShipmentMutation.isPending}>
              Konfirmasi Barang Diterima
            </Button>
          </div>
        )}
      </div>

      {/* Unboxing evidence */}
      <div className="p-5 rounded-xl border border-border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Image className="h-4 w-4 text-orange-500" />
          Bukti Unboxing
          <span className="text-xs text-muted-foreground font-normal">(setelah barang diterima)</span>
        </h3>
        {hasUnboxing ? (
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              <img src={shipment.arrivalProof} alt="Unboxing" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium">Bukti Unboxing (Barang Diterima)</p>
              <a href={shipment.arrivalProof} target="_blank" rel="noreferrer" className="text-xs text-orange-500 hover:underline">Lihat Gambar Penuh</a>
            </div>
          </div>
        ) : (
          isBrand && status === 'DIKONFIRMASI' ? (
            <div 
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-orange-300 transition-colors"
              onClick={() => unboxingInputRef.current?.click()}
            >
              {uploadingUnboxing ? (
                <Loader2 className="h-6 w-6 animate-spin text-orange-500 mx-auto mb-2" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              )}
              <p className="text-sm text-muted-foreground">{uploadingUnboxing ? 'Mengunggah...' : 'Upload foto/video unboxing'}</p>
              <input type="file" ref={unboxingInputRef} className="hidden" accept="image/*,video/*" onChange={handleUploadUnboxing} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada bukti unboxing yang diunggah.</p>
          )
        )}
      </div>
    </div>
  )
}
