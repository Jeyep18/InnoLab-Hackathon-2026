import { useEffect, useId, useRef, type ReactNode } from 'react'
import type { RatingSummary } from '../domain/logic'

export function Stars({ value }: { value: number }) {
  const rounded = Math.round(value)
  return (
    <span className="stars" aria-hidden="true">
      {'★'.repeat(rounded)}
      <span className="stars-empty">{'★'.repeat(5 - rounded)}</span>
    </span>
  )
}

export function RatingLine({ summary, compact = false }: { summary: RatingSummary; compact?: boolean }) {
  if (summary.mean === null) return <span className="rating rating-none">No reviews yet</span>
  const reviews = `${summary.count} review${summary.count === 1 ? '' : 's'}`
  return (
    <span className="rating" aria-label={`Rated ${summary.mean.toFixed(1)} out of 5 from ${reviews}`}>
      <Stars value={summary.mean} />
      <strong>{summary.mean.toFixed(1)}</strong>
      <span className="muted">{compact ? `(${summary.count})` : `from ${reviews}`}</span>
    </span>
  )
}

export function Dialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return (
    <dialog ref={ref} className="dialog" aria-labelledby={titleId} onClose={onClose} onCancel={onClose}>
      <h2 id={titleId}>{title}</h2>
      {children}
    </dialog>
  )
}

export function ErrorText({ id, children }: { id?: string; children: ReactNode }) {
  if (!children) return null
  return (
    <p className="error-text" id={id} role="alert">
      {children}
    </p>
  )
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      {children}
    </div>
  )
}
