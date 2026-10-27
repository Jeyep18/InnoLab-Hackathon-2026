import { CalendarRange, ChevronRight, History, Scale, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { PersonAvatar } from '@/components/site/PersonAvatar'
import { ReviewBadge, Stars } from '@/components/site/Rating'
import { licenseById } from '@/lib/licenses'
import {
  bookmarkCount,
  bowLabel,
  contributorRating,
  currentCurriculumReview,
  downloadCount,
  plural,
  resourceRating,
} from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { ReviewsDialog } from './ReviewsPanel'
import { VersionHistory } from './detail/VersionHistory'
import { RequestVerification } from './detail/RequestVerification'

/** Kept for older callers (ResourceCard). Same honesty label as ReviewBadge. */
export function ReviewStatus({ resource }: { resource: Resource }) {
  return <ReviewBadge resource={resource} />
}

const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

/**
 * What a teacher checks before downloading, in reading order: who made it, how good it is,
 * what they can do with it, then the reference facts. `actions` holds Save, Share and More.
 */
export function TrustPanel({ resource, actions, quickActions, className }: { resource: Resource; actions?: ReactNode; quickActions?: ReactNode; className?: string }) {
  const { state, reviews, resources, personaById } = useStore()
  const contributor = personaById(resource.contributorId)
  const packRating = resourceRating(resource, reviews)
  const track = contributorRating(resource.contributorId, resources, reviews)
  const review = currentCurriculumReview(resource)
  const license = licenseById(resource.license)

  return (
    <section aria-labelledby="trust-title" className={cn('rounded-2xl border bg-card p-5 text-card-foreground', className)}>
      <h2 id="trust-title" className="sr-only">About this pack</h2>

      <a href={`#/profile/${resource.contributorId}`} className="group flex items-center gap-3 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <PersonAvatar name={contributor?.alias ?? '?'} seed={resource.contributorId} className="size-10" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold group-hover:underline">{contributor?.alias ?? 'Unknown contributor'}</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground tabular-nums">
            {track.mean === null ? 'No reviews yet' : <><Star aria-hidden="true" className="size-3.5 fill-star text-star" /> {track.mean.toFixed(1)} across {plural(track.count, 'review')}</>}
          </span>
        </span>
        <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
      </a>

      <div className="mt-5 border-t pt-5">
        <div className="flex items-start justify-between gap-3">
          {packRating.mean === null ? (
            <p className="text-2xl font-semibold">No reviews yet</p>
          ) : (
            <p className="flex items-baseline gap-2">
              <span className="text-[40px] leading-none font-semibold tracking-tight tabular-nums">{packRating.mean.toFixed(1)}</span>
              <Stars value={packRating.mean} />
            </p>
          )}
          {quickActions}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          {packRating.count > 0 && <span className="tabular-nums">{plural(packRating.count, 'review')}</span>}
          <ReviewsDialog resource={resource} />
        </div>
        <div className="mt-3" title={review ? `Version ${review.version} verified by the ${review.reviewer} on ${formatDate(review.date)}` : undefined}>
          <ReviewBadge resource={resource} className="rounded-full" />
        </div>
        <RequestVerification resource={resource} />
      </div>

      <dl className="mt-5 grid grid-cols-3 border-y">
        <Stat label="downloads" value={String(downloadCount(resource, state))} />
        <Stat label="saves" value={String(bookmarkCount(resource, state))} />
        <Stat label={formatDate(resource.version.date)} value={`v${resource.version.label}`} />
      </dl>

      {actions && <div className="mt-5">{actions}</div>}

      <ul className="mt-5 space-y-3 text-sm">
        <Fact icon={<CalendarRange />} title={bowLabel(resource)} detail="Budget of Work" />
        {license && <Fact icon={<Scale />} title={license.short} detail="License" />}
        <Fact
          icon={<History />}
          title={`Version ${resource.version.label}`}
          detail={<VersionHistory resource={resource}>{resource.history.length ? `See ${plural(resource.history.length + 1, 'version')}` : 'First version'}</VersionHistory>}
        />
      </ul>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse gap-0.5 py-3 not-first:border-l not-first:pl-3">
      <dt className="truncate text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg leading-tight font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function Fact({ icon, title, detail }: { icon: ReactNode; title: string; detail: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-mauve-ink [&_svg]:size-4">{icon}</span>
      <span className="min-w-0">
        <span className="block font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{detail}</span>
      </span>
    </li>
  )
}
