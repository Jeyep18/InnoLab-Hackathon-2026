import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
}

export function EmptyState({
  icon,
  title,
  children,
  actions,
  className,
}: {
  icon?: ReactNode
  title: string
  children?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-14 text-center', className)}>
      {icon && <div className="mb-4 grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground [&_svg]:size-6">{icon}</div>}
      <h2 className="text-xl font-semibold tracking-tight text-balance">{title}</h2>
      {children && <div className="mt-2 max-w-md text-pretty text-muted-foreground">{children}</div>}
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  )
}

/** Temporary wordmark until CJ's logo arrives. */
export function Logo({ className }: { className?: string }) {
  return (
    <a href="#/" aria-label="CherIt home" className={cn('flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50', className)}>
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-[9px] bg-primary text-[15px] font-bold text-primary-foreground">
        C
      </span>
      <span className="flex items-baseline gap-2">
        <span className="text-xl font-bold tracking-tight">CherIt</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">say “share it”</span>
      </span>
    </a>
  )
}
