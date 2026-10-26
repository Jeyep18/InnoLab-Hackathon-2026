import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { bookmarkCount, downloadCount, plural, resourceRating } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { PackCover } from './PackCover'
import { RatingLine, ReviewBadge } from './Rating'
import { useSavePack } from './useSavePack'

export function SaveButton({ resource, className }: { resource: Resource; className?: string }) {
  const { saved, toggle } = useSavePack(resource.id)
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={saved}
      aria-label={saved ? `Remove “${resource.title}” from saved` : `Save “${resource.title}”`}
      onClick={toggle}
      className={className}
    >
      <Bookmark aria-hidden="true" className={cn(saved && 'fill-current')} />
    </Button>
  )
}

export function PackCard({ resource, className }: { resource: Resource; className?: string }) {
  const { state, reviews, personaById } = useStore()
  const contributor = personaById(resource.contributorId)
  return (
    <article className={cn('library-pack group relative flex flex-col rounded-sm border bg-card text-card-foreground', className)}>
      <h3>
        <a href={`#/resource/${resource.id}`} className="block rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-3 focus-visible:ring-ring/50">
          <PackCover resource={resource} variant="paper" />
        </a>
      </h3>
      <SaveButton resource={resource} className="absolute top-2 right-2 z-10" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-sm">{contributor?.alias ?? 'Unknown contributor'}</p>
        <div className="flex flex-col items-start gap-2">
          <RatingLine summary={resourceRating(resource, reviews)} compact />
          <ReviewBadge resource={resource} className="rounded-sm" />
        </div>
        {resource.parent && <p className="line-clamp-2 text-sm text-muted-foreground">Adapted from “{resource.parent.title}”</p>}
        <p className="mt-auto pt-2 text-xs text-muted-foreground">
          {plural(downloadCount(resource, state), 'download')} · {plural(bookmarkCount(resource, state), 'save')}
        </p>
      </div>
    </article>
  )
}

export function PackGrid({ packs, className }: { packs: Resource[]; className?: string }) {
  return (
    <ul className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {packs.map((resource) => (
        <li key={resource.id} className="flex min-w-0">
          <PackCard resource={resource} className="w-full" />
        </li>
      ))}
    </ul>
  )
}
