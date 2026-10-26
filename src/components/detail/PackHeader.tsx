import { ChevronRight, CircleAlert, Clock } from 'lucide-react'
import { bowLabel, currentCurriculumReview } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { cn } from '@/lib/utils'
import { withParams } from '@/router'
import { useStore } from '@/store'

export const detailLinkClass = 'rounded-sm font-medium text-mauve-ink underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-3 focus-visible:ring-ring/50'

export function PackHeader({ resource }: { resource: Resource }) {
  const { resources, personaById } = useStore()
  const parentInfo = resource.parent
  const parent = parentInfo && resources.find((r) => r.id === parentInfo.resourceId)
  const parentReview = parent && currentCurriculumReview(parent)

  return (
    <header className="border-t-2 border-foreground pt-6">
      <p className="text-sm font-medium text-muted-foreground">
        {resource.grade} · {resource.subject} · {bowLabel(resource)}
      </p>
      <h1 className="library-title mt-3 text-4xl leading-tight text-balance sm:text-5xl">{resource.title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">{resource.summary}</p>
      {resource.tags.length > 0 && (
        <ul aria-label="Tags" className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {resource.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
      )}
      {parentInfo && (
        <p className="mt-6 border-l-2 border-primary pl-4 text-sm leading-relaxed">
          Adapted from{' '}
          {parent ? <a className={detailLinkClass} href={`#/resource/${parent.id}`}>{parentInfo.title}</a> : parentInfo.title}{' '}
          version {parentInfo.version} by {personaById(parentInfo.contributorId)?.alias ?? 'the original contributor'}
          {parentReview && parentReview.version === parentInfo.version ? ', which is curriculum-reviewed (simulated)' : ''}.
        </p>
      )}
    </header>
  )
}

export function Breadcrumb({ resource }: { resource: Resource }) {
  const crumbs = [
    { href: '#/browse', label: 'Browse' },
    { href: `#${withParams('/browse', { grade: resource.grade })}`, label: resource.grade },
    { href: `#${withParams('/browse', { grade: resource.grade, subject: resource.subject })}`, label: resource.subject },
  ]
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-0.5 text-sm text-muted-foreground">
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-0.5">
            {index > 0 && <ChevronRight aria-hidden="true" className="size-4 opacity-60" />}
            <a href={crumb.href} className="inline-flex min-h-10 items-center rounded-sm px-1.5 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
              {crumb.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function StatusNotice({ resource }: { resource: Resource }) {
  const held = resource.status === 'held'
  const Icon = held ? CircleAlert : Clock
  const text = {
    published: 'Published after demo moderation',
    pending: 'Waiting for demo moderation. Only you and the moderator can see it.',
    held: 'On hold and hidden from search',
  }
  return (
    <div className={cn('mt-3 flex items-start gap-3 border-l-2 px-4 py-3', held ? 'border-destructive bg-destructive/10 text-destructive' : 'border-primary bg-secondary')}>
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <p>{text[resource.status]}{resource.holdReason && ` Reason: ${resource.holdReason}`}</p>
    </div>
  )
}
