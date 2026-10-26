import type { ReactNode } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RatingLine, ReviewBadge } from '@/components/site/Rating'
import {
  bookmarkCount,
  bowLabel,
  competencyLabel,
  contributorRating,
  currentCurriculumReview,
  currentReviews,
  downloadCount,
  plural,
  resourceRating,
} from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { initials } from '@/lib/pack'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

/** Kept for older callers (ResourceCard). Same honesty label as ReviewBadge. */
export function ReviewStatus({ resource }: { resource: Resource }) {
  return <ReviewBadge resource={resource} />
}

/**
 * Everything a teacher can check before downloading, in the order the team agreed,
 * laid out like a product spec sheet. `actions` holds the Download/Save/Share buttons.
 */
export function TrustPanel({ resource, actions, className }: { resource: Resource; actions?: ReactNode; className?: string }) {
  const { state, reviews, resources, personaById } = useStore()
  const contributor = personaById(resource.contributorId)
  const packRating = resourceRating(resource, reviews)
  const track = contributorRating(resource.contributorId, resources, reviews)
  const review = currentCurriculumReview(resource)
  const sampleCount = currentReviews(resource, reviews).filter((r) => r.seeded).length
  const trackHasSamples = resources
    .filter((r) => r.contributorId === resource.contributorId && r.status === 'published')
    .some((r) => currentReviews(r, reviews).some((rev) => rev.seeded))

  return (
    <section
      aria-labelledby="trust-title"
      className={cn('border-t-2 border-foreground bg-card p-5 text-card-foreground sm:p-6', className)}
    >
      <h2 id="trust-title" className="library-section-title text-2xl">
        Before you download
      </h2>

      <div className="mt-4 flex items-center gap-3">
        <Avatar className="size-11">
          <AvatarFallback className="bg-secondary text-sm font-semibold text-foreground">{initials(contributor)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Shared by</p>
          <a
            href={`#/profile/${resource.contributorId}`}
            className="block truncate rounded-sm font-semibold text-mauve-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {contributor?.alias ?? 'Unknown contributor'}
          </a>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {track.count > 0 ? (
          <>
            Track record: <RatingLine summary={track} compact className="align-middle" /> across their packs
            {trackHasSamples && ', including sample reviews'}
          </>
        ) : (
          'No reviews yet on their packs'
        )}
      </p>

      <dl className="mt-4 divide-y">
        <Tile label="Teacher rating, this version">
          <RatingLine summary={packRating} />
          <Sub>
            {packRating.count === 0
              ? 'Be the first to rate it after downloading.'
              : sampleCount > 0 &&
                `Includes ${sampleCount === packRating.count ? 'only' : sampleCount} sample review${sampleCount === 1 ? '' : 's'}.`}
          </Sub>
        </Tile>
        <Tile label="Curriculum review">
          <ReviewBadge resource={resource} />
          <Sub>
            {review
              ? `Version ${review.version} checked by the ${review.reviewer.toLowerCase()} on ${review.date}. Not a DepEd approval.`
              : resource.parent
                ? 'Adaptations need their own review; the original’s review doesn’t carry over.'
                : 'No reviewer has checked this version yet.'}
          </Sub>
        </Tile>
      </dl>

      {/* Actions follow the key trust signals so Download stays above the fold on a laptop. */}
      {actions && <div className="mt-4">{actions}</div>}

      <dl className="mt-4 divide-y">
        <Tile label="Version">
          <span className="font-semibold tabular-nums">{resource.version.label}</span>
          <Sub>
            Updated {resource.version.date}.{' '}
            {resource.history.length > 0 ? `Replaces version ${resource.history[0].label}.` : 'First version.'}
          </Sub>
        </Tile>
        <Tile label="Activity">
          <span className="font-semibold tabular-nums">
            {plural(downloadCount(resource, state), 'download')}, {plural(bookmarkCount(resource, state), 'save')}
          </span>
          <Sub>Shows popularity, not quality.</Sub>
        </Tile>
        <Tile label="Budget of Work">
          <span className="font-semibold">{bowLabel(resource)}</span>
          <Sub>{competencyLabel(resource)}</Sub>
        </Tile>
      </dl>
    </section>
  )
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex flex-col items-start gap-1 text-sm">{children}</dd>
    </div>
  )
}

function Sub({ children }: { children: ReactNode }) {
  if (!children) return null
  return <span className="text-[13px] leading-snug text-muted-foreground text-pretty">{children}</span>
}
