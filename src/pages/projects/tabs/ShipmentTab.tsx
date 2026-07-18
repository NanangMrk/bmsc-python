import { useState } from 'react'
import { Upload, CheckCircle2, Package, Image } from 'lucide-react'
import type { Project } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuthStore } from '@/stores/auth.store'

interface ShipmentTabProps {
  project: Project
}

type ShipmentStatus = 'BELUM_DIKIRIM' | 'DIKIRIM' | 'DIKONFIRMASI'

export function ShipmentTab({ project: _project }: ShipmentTabProps) {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
  const isBrand = user?.role === 'BRAND'
  const [status, setStatus] = useState<ShipmentStatus>('DIKIRIM')
  const [hasProof, setHasProof] = useState(true)
  const [hasUnboxing, setHasUnboxing] = useState(false)

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
            <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              <Image className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium">resi_pengiriman.jpg</p>
              <p className="text-xs text-muted-foreground">Diunggah 20 Jan 2025</p>
            </div>
          </div>
        ) : (
          isBrand && (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-orange-300 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Upload foto resi pengiriman</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, PDF · Max 5MB</p>
              <Button size="sm" className="mt-4" onClick={() => setHasProof(true)}>Pilih File</Button>
            </div>
          )
        )}

        {/* Admin: confirm receipt */}
        {isAdmin && status === 'DIKIRIM' && hasProof && (
          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <Button icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setStatus('DIKONFIRMASI')}>
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
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : (
          isBrand && status === 'DIKONFIRMASI' ? (
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-orange-300 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Upload foto/video unboxing</p>
              <Button size="sm" className="mt-3" onClick={() => setHasUnboxing(true)}>Upload</Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada bukti unboxing yang diunggah.</p>
          )
        )}
      </div>
    </div>
  )
}
