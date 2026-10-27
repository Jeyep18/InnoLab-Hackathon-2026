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

/** CJ's open-book mark: a pink and a green page either side of a gap for the spine. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 316 312" aria-hidden="true" className={className}>
      <path d="M0 6C66-6 140 34 153 94V300c0 7-6 13-12 10C116 262 64 229 0 227Z" fill="#EBA0B3" />
      <path d="M316 6C250-6 176 34 163 94V300c0 7 6 13 12 10C200 262 252 229 316 227Z" fill="#BFCF98" />
    </svg>
  )
}

/** CJ's logo: the book mark plus "CherIt", whose capital I is drawn as a pencil. */
export function Logo({ className }: { className?: string }) {
  return (
    <a href="#/" aria-label="CherIt home" className={cn('flex items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50', className)}>
      <LogoMark className="h-7 w-auto shrink-0" />
      <span aria-hidden="true" className="font-logo text-[24px] leading-none tracking-[0.01em] text-foreground">
        Cher
        <svg viewBox="0 0 26 160" className="mx-[0.04em] inline-block h-[0.76em] w-[0.105em] translate-y-[0.05em] fill-current align-baseline">
          <rect width="26" height="14" />
          <rect y="19" width="26" height="113" />
          <path d="M0 136h26l-13 24z" />
        </svg>
        t
      </span>
    </a>
  )
}
