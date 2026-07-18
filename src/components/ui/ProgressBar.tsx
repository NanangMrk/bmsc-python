import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  label?: string
  color?: 'orange' | 'green' | 'blue' | 'red'
  size?: 'sm' | 'md' | 'lg'
}

const colorMap = {
  orange: 'bg-orange-500',
  green: 'bg-green-500',
  blue: 'bg-orange-500',
  red: 'bg-red-500',
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  label,
  color = 'orange',
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const heightMap = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-medium text-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', heightMap[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorMap[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
