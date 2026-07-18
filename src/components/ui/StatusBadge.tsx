import { cn } from '@/lib/utils'
import type { PaymentStatus, InvoiceStatus, QuotationStatus, ProjectStatus, ShipmentStatus, TaskStatus } from '@/lib/mock-data'

type AnyStatus =
  | PaymentStatus
  | InvoiceStatus
  | QuotationStatus
  | ProjectStatus
  | ShipmentStatus
  | TaskStatus
  | string

const statusConfig: Record<string, { label: string; className: string }> = {
  // Payment
  MENUNGGU: { label: 'Menunggu', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  PROSES_VERIFIKASI: { label: 'Proses Verifikasi', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  LUNAS: { label: 'Lunas', className: 'bg-green-50 text-green-700 border-green-200' },
  OVERDUE: { label: 'Overdue', className: 'bg-red-50 text-red-700 border-red-200' },
  // Invoice
  BELUM_DIBAYAR: { label: 'Belum Dibayar', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  MENUNGGU_VERIFIKASI: { label: 'Menunggu Verifikasi', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  TERMIN: { label: 'Termin (Sebagian)', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  // Quotation
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  TERKIRIM: { label: 'Terkirim', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  DIPROSES: { label: 'Diproses', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  DITOLAK: { label: 'Ditolak', className: 'bg-red-50 text-red-700 border-red-200' },
  // Project
  BERJALAN: { label: 'Berjalan', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  SELESAI: { label: 'Selesai', className: 'bg-green-50 text-green-700 border-green-200' },
  // Shipment
  BELUM_DIKIRIM: { label: 'Belum Dikirim', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  DIKIRIM: { label: 'Dikirim', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  DIKONFIRMASI: { label: 'Dikonfirmasi', className: 'bg-green-50 text-green-700 border-green-200' },
  // Task
  TODO: { label: 'To Do', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  REVIEW: { label: 'Review', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  DONE: { label: 'Done', className: 'bg-green-50 text-green-700 border-green-200' },
}

interface StatusBadgeProps {
  status: AnyStatus
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
