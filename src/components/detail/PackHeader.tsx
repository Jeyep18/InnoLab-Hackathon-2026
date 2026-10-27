import { CircleAlert, Clock } from 'lucide-react'
import { bowLabel, currentCurriculumReview } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

export const detailLinkClass = 'rounded-sm font-medium text-mauve-ink underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-3 focus-visible:ring-ring/50'

export function PackHeader({ resource }: { resource: Resource }) {
  const { resources, personaById } = useStore()
  const parentInfo = resource.parent
  const parent = parentInfo && resources.find((r) => r.id === parentInfo.resourceId)
  const parentReview = parent && currentCurriculumReview(parent)

  return (
    <header className="border-t-2 border-foreground pt-4">
      <p className="text-sm font-medium text-muted-foreground">
        {resource.grade} · {resource.subject} · {bowLabel(resource)}
      </p>
      <h1 className="library-title mt-2 text-3xl leading-tight text-balance sm:text-4xl">{resource.title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground">{resource.summary}</p>
      {resource.tags.length > 0 && (
        <ul aria-label="Tags" className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {resource.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
      )}
      {parentInfo && (
        <p className="mt-4 border-l-2 border-primary pl-4 text-sm leading-relaxed">
          Adapted from{' '}
          {parent ? <a className={detailLinkClass} href={`#/resource/${parent.id}`}>{parentInfo.title}</a> : parentInfo.title}{' '}
          version {parentInfo.version} by {personaById(parentInfo.contributorId)?.alias ?? 'the original contributor'}
          {parentReview && parentReview.version === parentInfo.version ? ', which is verified' : ''}.
        </p>
      )}
    </header>
  )
}

export function StatusNotice({ resource }: { resource: Resource }) {
  const held = resource.status === 'held'
  const Icon = held ? CircleAlert : Clock
  const text = {
    published: 'Public',
    held: 'Hidden after a report until a verifier checks it.',
  }
  return (
    <div className={cn('mt-3 flex items-start gap-3 border-l-2 px-4 py-3', held ? 'border-destructive bg-destructive/10 text-destructive' : 'border-primary bg-secondary')}>
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <p>{text[resource.status]}{resource.holdReason && ` Reason: ${resource.holdReason}`}</p>
    </div>
  )
}
