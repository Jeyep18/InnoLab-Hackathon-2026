import { Stars } from '@/components/site/Rating'
import { PersonAvatar } from '@/components/site/PersonAvatar'
import { EmptyState } from '@/components/site/layout'
import type { Resource, Review } from '@/domain/types'
import { useStore } from '@/store'
import type { ProfileModel } from './useProfile'

const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

export function RatingsTab({ model }: { model: ProfileModel }) {
  const { summary, distribution, packReviews } = model
  const max = Math.max(1, ...distribution.map((row) => row.count))
  if (summary.mean === null) return <EmptyState title="No reviews yet">Reviews appear after teachers download and use a pack.</EmptyState>
  return (
    <div className="space-y-10">
      <section aria-label="Rating summary" className="grid items-center gap-8 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div>
          <p className="text-6xl leading-none font-semibold tabular-nums">{summary.mean.toFixed(1)}</p>
          <div className="mt-2"><Stars value={summary.mean} /></div>
          <p className="mt-1 text-sm text-muted-foreground">{summary.count === 1 ? '1 review' : `${summary.count} reviews`}</p>
        </div>
        <ul aria-label="Rating breakdown" className="max-w-md space-y-2">
          {distribution.map((row) => (
            <li key={row.stars} className="flex items-center gap-3 text-sm tabular-nums">
              <span className="w-3 text-muted-foreground">{row.stars}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <span className="block h-full rounded-full bg-star" style={{ width: `${(row.count / max) * 100}%` }} />
              </span>
              <span className="w-5 text-right text-muted-foreground">{row.count}</span>
            </li>
          ))}
        </ul>
      </section>
      <ReviewList items={packReviews} />
    </div>
  )
}

export function ReviewList({ items }: { items: { review: Review; resource: Resource }[] }) {
  const { personaById } = useStore()
  return (
    <ul className="divide-y border-t">
      {items.map(({ review, resource }) => (
        <li key={review.id} className="flex gap-3 py-5">
          <PersonAvatar name={personaById(review.personaId)?.alias ?? review.authorLabel} seed={review.personaId} className="size-10" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <strong className="font-semibold">{review.authorLabel}</strong>
              <span className="text-sm text-muted-foreground">{formatDate(review.updatedAt)}</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
              <span role="img" aria-label={`${review.rating} out of 5`}><Stars value={review.rating} /></span>
              <a href={`#/resource/${resource.id}`} className="truncate text-muted-foreground hover:underline">{resource.title}</a>
            </div>
            {review.text && <p className="mt-2 max-w-[65ch] text-[15px] text-pretty">{review.text}</p>}
          </div>
        </li>
      ))}
    </ul>
  )
}
