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
    <div className={cn('library-empty flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-14 text-center', className)}>
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
    <a href="#/" aria-label="CherIt home" className={cn('flex items-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50', className)}>
      <span aria-hidden="true" className="text-[21px] font-semibold tracking-[-0.02em]">
        Cher
        <span className="text-sage-700">
          {/* Inter's capital I is a bare bar that reads as "l"; the serifs keep "It" legible. */}
          <svg viewBox="0 0 42 73" className="ml-[0.02em] inline-block h-[0.727em] w-[0.42em] fill-current align-baseline">
            <rect x="16" width="10" height="73" />
            <rect x="5" width="32" height="9" />
            <rect x="5" y="64" width="32" height="9" />
          </svg>
          t
        </span>
      </span>
    </a>
  )
}
