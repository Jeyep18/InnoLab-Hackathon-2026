import { Bookmark } from 'lucide-react'
import { bookmarkCount, DemoRuleError, downloadCount, isBookmarked, plural, resourceRating } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { initials } from '@/lib/pack'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { PackCover } from './PackCover'
import { RatingLine, ReviewBadge } from './Rating'

export function SaveButton({ resource, className }: { resource: Resource; className?: string }) {
  const { state, dispatch, notify } = useStore()
  const saved = isBookmarked(state, resource.id)
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove “${resource.title}” from saved` : `Save “${resource.title}”`}
      onClick={() => {
        try {
          dispatch({ type: 'toggle-bookmark', resourceId: resource.id })
          notify(saved ? 'Removed from saved.' : 'Saved. Find it under Saved.')
        } catch (e) {
          notify(e instanceof DemoRuleError ? e.message : 'Couldn’t update saved packs.')
        }
      }}
      className={cn(
        'grid size-10 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-[background-color,transform] duration-150 ease-out hover:bg-black/40 active:scale-[0.94] focus-visible:ring-3 focus-visible:ring-white/70 focus-visible:outline-none',
        className,
      )}
    >
      <Bookmark className={cn('size-[18px]', saved && 'fill-current')} />
    </button>
  )
}

export function PackCard({ resource, className }: { resource: Resource; className?: string }) {
  const { state, reviews, personaById } = useStore()
  const contributor = personaById(resource.contributorId)
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(51_44_39/0.04)] transition-[transform,box-shadow] duration-200 ease-out focus-within:ring-3 focus-within:ring-ring/50 motion-safe:hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-16px_rgb(51_44_39/0.35)]',
        className,
      )}
    >
      <h3>
        <a href={`#/resource/${resource.id}`} className="block outline-none after:absolute after:inset-0 after:content-['']">
          <PackCover resource={resource} />
        </a>
      </h3>
      <SaveButton resource={resource} className="absolute top-2.5 right-2.5 z-10" />
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <RatingLine summary={resourceRating(resource, reviews)} compact />
          <ReviewBadge resource={resource} />
        </div>
        {resource.parent && <p className="line-clamp-1 text-sm text-muted-foreground">Adapted from “{resource.parent.title}”</p>}
        <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground">
          <span aria-hidden="true" className="grid size-6 place-items-center rounded-full border bg-secondary text-[10px] font-semibold text-foreground">
            {initials(contributor)}
          </span>
          <span className="truncate">
            {contributor?.alias ?? 'Unknown contributor'} · {plural(downloadCount(resource, state), 'download')} ·{' '}
            {plural(bookmarkCount(resource, state), 'save')}
          </span>
        </div>
      </div>
    </article>
  )
}

export function PackGrid({ packs, className }: { packs: Resource[]; className?: string }) {
  return (
    <ul className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {packs.map((r) => (
        <li key={r.id} className="flex">
          <PackCard resource={r} className="w-full" />
        </li>
      ))}
    </ul>
  )
}
