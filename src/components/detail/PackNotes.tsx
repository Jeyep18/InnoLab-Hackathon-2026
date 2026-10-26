import type { ReactNode } from 'react'
import { PackCover } from '@/components/site/PackCover'
import { bowLabel, competencyLabel } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { cn } from '@/lib/utils'
import { detailLinkClass } from './PackHeader'
import type { PackPageModel } from './usePackPage'

export function PackNotes({ resource }: { resource: Resource }) {
  return (
    <div className="space-y-10">
      <InfoSection title="What your classroom needs">
        {resource.requirements.length === 0 ? <p className="text-muted-foreground">The contributor didn’t list any.</p> : (
          <ul className="list-disc space-y-1 pl-5 marker:text-muted-foreground">
            {resource.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
          </ul>
        )}
      </InfoSection>
      <InfoSection title="Curriculum target">
        <dl className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Competency</dt>
            <dd className="mt-1">{competencyLabel(resource)}{resource.competency.code && <span className="text-sm text-muted-foreground"> ({resource.competency.code})</span>}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Budget of Work</dt>
            <dd className="mt-1">{resource.bow.version ? `${resource.bow.version}, ${bowLabel(resource)}` : bowLabel(resource)}</dd>
          </div>
        </dl>
        {resource.permission.kind === 'fictional-sample' && <p className="mt-3 text-sm text-muted-foreground">This sample uses example codes and weeks, not official DepEd alignment.</p>}
      </InfoSection>
      {resource.parent && (
        <InfoSection title="What changed from the original">
          <p>{resource.changeNote ?? 'No change note given.'}</p>
          <p className="mt-2 text-sm text-muted-foreground">The original is unchanged. Any review of the original doesn’t carry over to this adaptation.</p>
        </InfoSection>
      )}
      <InfoSection title="Permission and sources">
        <p>{resource.permission.notice}</p>
        {resource.references.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm marker:text-muted-foreground">
            {resource.references.map((reference) => <li key={reference.label}>{reference.url ? <a className={detailLinkClass} href={reference.url}>{reference.label}</a> : reference.label}</li>)}
          </ul>
        )}
      </InfoSection>
      <InfoSection title="Version history">
        <ol className="space-y-4">
          {[resource.version, ...resource.history].map((version, index) => (
            <li key={version.label} className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-5">
              <p className="text-sm">
                <span className={cn('tabular-nums', index === 0 && 'font-semibold')}>Version {version.label}</span>
                {index === 0 && <span className="ml-2 text-xs font-medium text-mauve-ink">Current</span>}
                <span className="block text-muted-foreground">{version.date}</span>
              </p>
              <p className="text-sm text-muted-foreground">{version.note}</p>
            </li>
          ))}
        </ol>
      </InfoSection>
    </div>
  )
}

export function Adaptations({ model }: { model: PackPageModel }) {
  if (model.adaptations.length === 0 && !model.teacherActions) return null
  return (
    <section aria-labelledby="adaptations-title" className="border-t pt-5">
      <h2 id="adaptations-title" className="library-section-title text-2xl">Adaptations by other teachers</h2>
      {model.adaptations.length === 0 ? <p className="mt-3 text-muted-foreground">No adaptations yet.</p> : (
        <ul className="mt-4 divide-y">
          {model.adaptations.map((adaptation) => (
            <li key={adaptation.id}>
              <a href={`#/resource/${adaptation.id}`} className="flex items-center gap-4 py-4 outline-none hover:text-mauve-ink focus-visible:ring-3 focus-visible:ring-ring/50">
                <PackCover resource={adaptation} size="thumb" variant="paper" className="w-16 shrink-0" />
                <span className="min-w-0">
                  <span className="block font-medium">{adaptation.title}</span>
                  <span className="text-sm text-muted-foreground">by {model.personaById(adaptation.contributorId)?.alias}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border-t pt-5"><h2 className="library-section-title mb-4 text-2xl">{title}</h2>{children}</section>
}
