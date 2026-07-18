import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card rounded-xl border border-border',
        hover && 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('p-5 pb-3', className)}>
      {children}
    </div>
  )
}

export function CardContent({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('p-5 pt-0', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('p-5 pt-3 border-t border-border', className)}>
      {children}
    </div>
  )
}
