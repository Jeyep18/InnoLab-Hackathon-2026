import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { currentCurriculumReview, type RatingSummary } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { cn } from '@/lib/utils'

export function Stars({ value, className }: { value: number; className?: string }) {
  const filled = Math.round(value)
  return (
    <span className={cn('inline-flex items-center gap-px', className)} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn('size-3.5', i < filled ? 'fill-star text-star' : 'fill-muted-foreground/25 text-muted-foreground/25')} />
      ))}
    </span>
  )
}

/** Rating next to its review count; unrated packs say so instead of showing empty stars. */
export function RatingLine({ summary, compact = false, className }: { summary: RatingSummary; compact?: boolean; className?: string }) {
  if (summary.mean === null)
    return (
      <Badge variant="secondary" className={cn('font-medium text-muted-foreground', className)}>
        No reviews yet
      </Badge>
    )
  const reviews = `${summary.count} review${summary.count === 1 ? '' : 's'}`
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-sm tabular-nums', className)}
      aria-label={`Rated ${summary.mean.toFixed(1)} out of 5 from ${reviews}`}
    >
      <Stars value={summary.mean} />
      <strong className="font-semibold text-foreground">{summary.mean.toFixed(1)}</strong>
      <span className="text-muted-foreground">{compact ? `(${summary.count})` : `from ${reviews}`}</span>
    </span>
  )
}

/** Verification covers one version only. */
export function ReviewBadge({ resource, className }: { resource: Resource; className?: string }) {
  const review = currentCurriculumReview(resource)
  return review ? (
    <Badge className={cn('bg-olive/20 text-foreground dark:bg-olive/25', className)}>
      Verified v{review.version}
    </Badge>
  ) : (
    <Badge variant="outline" className={cn('text-muted-foreground', className)}>
      Not verified
    </Badge>
  )
}
