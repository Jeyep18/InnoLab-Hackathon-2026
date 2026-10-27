import type { ReactNode } from 'react'
import { PackCover } from '@/components/site/PackCover'
import { competencyLabel } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { licenseById, PAID_SUPPLEMENT_TERMS } from '@/lib/licenses'
import { cn } from '@/lib/utils'
import { LicenseTerms } from '@/components/LicenseTerms'
import { detailLinkClass } from './PackHeader'
import type { PackPageModel } from './usePackPage'

export function PackNotes({ resource }: { resource: Resource }) {
  return (
    <div className="space-y-5">
      <section aria-labelledby="pack-details-title" className="border-t pt-4">
        <h2 id="pack-details-title" className="sr-only">Pack details</h2>
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Detail label="Classroom needs">
            {resource.requirements.length === 0 ? <span className="text-muted-foreground">None listed</span> : (
              <ul className="flex flex-wrap gap-1.5">
                {resource.requirements.map((requirement) => <li key={requirement} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{requirement}</li>)}
              </ul>
            )}
          </Detail>
          <Detail label="Competency">
            {competencyLabel(resource)}{resource.competency.code && <span className="text-muted-foreground"> ({resource.competency.code})</span>}
          </Detail>
        </dl>
        {resource.parent && (
          <p className="mt-3 text-sm"><span className="font-medium">Changed from the original: </span>{resource.changeNote ?? 'No change note given.'} <span className="text-muted-foreground">Reviews of the original don’t carry over.</span></p>
        )}
      </section>
      <section aria-labelledby="license-title" className="border-t pt-4">
        <h2 id="license-title" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">License and permission</h2>
        <PackLicense resource={resource} />
        <p className="mt-2 text-xs text-muted-foreground">
          {resource.permission.notice}
          {resource.references.map((reference) => <span key={reference.label}> {reference.url ? <a className={detailLinkClass} href={reference.url}>{reference.label}</a> : reference.label}</span>)}
        </p>
      </section>
    </div>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1.5 text-sm">{children}</dd>
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

function PackLicense({ resource }: { resource: Resource }) {
  const license = licenseById(resource.license)
  if (!license) return <p className="mt-1.5 text-sm text-muted-foreground">No license chosen. Ask the contributor before re-sharing or adapting it.</p>
  return (
    <div className="mt-1.5 space-y-2 text-sm">
      <details className="group">
        <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-2 gap-y-1 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          <span className="font-semibold">{resource.supplementBundle && 'Lesson plan: '}{license.short}</span>
          <span className="text-muted-foreground">{license.summary}</span>
          <span className="text-xs font-medium text-mauve-ink underline-offset-2 group-hover:underline">
            <span className="group-open:hidden">Details</span><span className="hidden group-open:inline">Hide</span>
          </span>
        </summary>
        <div className="mt-2 rounded-xl bg-secondary/50 p-3">
          {license.url ? <a className={cn(detailLinkClass, 'text-xs')} href={license.url} target="_blank" rel="noreferrer">{license.name}</a> : <p className="text-xs">{license.name}</p>}
          <LicenseTerms license={license} className="mt-2" />
        </div>
      </details>
      {resource.supplementBundle && (
        <p><span className="font-semibold">Paid bundle: {PAID_SUPPLEMENT_TERMS.short}</span> <span className="text-muted-foreground">Buyers can use it in their own classes but can’t re-share or resell it.</span></p>
      )}
    </div>
  )
}
