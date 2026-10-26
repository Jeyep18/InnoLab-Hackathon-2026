import { ChevronRight, CircleAlert, Clock, Download, EyeOff, Flag, GitFork, SearchX } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { PackCover } from '@/components/site/PackCover'
import { Container, EmptyState } from '@/components/site/layout'
import { bowLabel, competencyLabel, currentCurriculumReview, formatBytes, plural } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { cn } from '@/lib/utils'
import { withParams } from '@/router'
import { useStore } from '@/store'
import { Preview } from './detail/Preview'
import { ReportDialog } from './detail/ReportDialog'
import { SaveToggle } from './detail/SaveToggle'
import { usePackDownloads, type PackDownloads } from './detail/usePackDownloads'
import { FilesPanel } from './FilesPanel'
import { ReviewsPanel } from './ReviewsPanel'
import { ShareLink } from './ShareLink'
import { TrustPanel } from './TrustPanel'

const STATUS_TEXT = {
  published: 'Published after demo moderation',
  pending: 'Waiting for demo moderation. Only you and the moderator can see it.',
  held: 'On hold and hidden from search',
}

const linkClass = 'rounded-sm font-medium text-mauve-ink underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-3 focus-visible:ring-ring/50'

export function ResourceDetail({ id }: { id: string }) {
  const { resources, persona } = useStore()
  const resource = resources.find((r) => r.id === id)

  if (!resource) {
    return (
      <Container className="pt-16">
        <EmptyState icon={<SearchX />} title="This lesson pack isn’t here" actions={<BrowseButton />}>
          <p>It may have been removed by a demo reset.</p>
        </EmptyState>
      </Container>
    )
  }

  const canSee = resource.status === 'published' || resource.contributorId === persona.id || persona.role === 'moderator'
  if (!canSee) {
    return (
      <Container className="pt-16">
        <EmptyState icon={<EyeOff />} title="This lesson pack isn’t published" actions={<BrowseButton />}>
          <p>It’s waiting for review or on hold. Switch to the demo moderator persona to see it.</p>
        </EmptyState>
      </Container>
    )
  }

  return <PackPage resource={resource} />
}

function BrowseButton() {
  return (
    <Button asChild>
      <a href="#/browse">Browse lesson packs</a>
    </Button>
  )
}

function PackPage({ resource }: { resource: Resource }) {
  const { resources, persona, personaById } = useStore()
  const [reporting, setReporting] = useState(false)
  const downloads = usePackDownloads(resource)
  const contributor = personaById(resource.contributorId)
  const adaptations = resources.filter((r) => r.parent?.resourceId === resource.id && r.status === 'published')
  const isTeacher = persona.role === 'teacher'
  const teacherActions = isTeacher && resource.status === 'published'

  // The mobile download bar hides while the card's own Download button, or the page footer, is on screen.
  const primaryRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [primaryVisible, setPrimaryVisible] = useState(false)
  const [pastEnd, setPastEnd] = useState(false)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const primary = new IntersectionObserver(([entry]) => setPrimaryVisible(entry.isIntersecting))
    const end = new IntersectionObserver(([entry]) => setPastEnd(entry.isIntersecting || entry.boundingClientRect.top < 0))
    if (primaryRef.current) primary.observe(primaryRef.current)
    if (endRef.current) end.observe(endRef.current)
    return () => {
      primary.disconnect()
      end.disconnect()
    }
  }, [])
  const showBar = downloads.canDownload && !primaryVisible && !pastEnd

  return (
    <>
      <Container className="pt-6 pb-32 lg:pb-0">
        <Breadcrumb resource={resource} />
        {resource.status !== 'published' && <StatusNotice resource={resource} />}
        <div className="mt-2 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-x-12">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <PackHeader resource={resource} />
          </div>
          {/* Between header and preview in the DOM so phones get title, trust, then content.
              On desktop it starts beside the title, which keeps Download above the fold. */}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:rounded-2xl">
              <TrustPanel
                resource={resource}
                actions={
                  <div className="grid gap-2">
                    {downloads.canDownload && (
                      <div ref={primaryRef} className="grid gap-2">
                        <PackDownloadButton dl={downloads} size="lg" className="w-full" />
                        <PackDownloadNote dl={downloads} resource={resource} />
                      </div>
                    )}
                    {teacherActions && (
                      <>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <SaveToggle resource={resource} className="w-full" />
                          <ShareLink resource={resource} label="Share link" className="w-full" />
                        </div>
                        <Button variant="secondary" className="w-full" asChild>
                          <a href={`#/share?adapt=${resource.id}`}>
                            <GitFork aria-hidden="true" />
                            Adapt this pack
                          </a>
                        </Button>
                        {resource.contributorId !== persona.id && (
                          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setReporting(true)}>
                            <Flag aria-hidden="true" />
                            Report a problem
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                }
              />
            </div>
          </div>

          <div className="min-w-0 space-y-14 lg:col-start-1 lg:row-start-2">
            <Preview resource={resource} />
            <FilesPanel resource={resource} downloads={downloads} />

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="What your classroom needs">
                {resource.requirements.length === 0 ? (
                  <p className="text-muted-foreground">The contributor didn’t list any.</p>
                ) : (
                  <ul className="list-disc space-y-1 pl-5 marker:text-muted-foreground">
                    {resource.requirements.map((req) => (
                      <li key={req}>{req}</li>
                    ))}
                  </ul>
                )}
              </InfoCard>
              <InfoCard title="Curriculum target">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Competency</dt>
                    <dd>
                      {competencyLabel(resource)}
                      {resource.competency.code && <span className="text-sm text-muted-foreground"> ({resource.competency.code})</span>}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Budget of Work</dt>
                    <dd>{resource.bow.version ? `${resource.bow.version}, ${bowLabel(resource)}` : bowLabel(resource)}</dd>
                  </div>
                </dl>
                {resource.permission.kind === 'fictional-sample' && (
                  <p className="mt-3 text-sm text-muted-foreground">This sample uses example codes and weeks, not official DepEd alignment.</p>
                )}
              </InfoCard>
            </div>

            {resource.parent && (
              <InfoCard title="What changed from the original">
                <p>{resource.changeNote ?? 'No change note given.'}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  The original is unchanged. Any review of the original doesn’t carry over to this adaptation.
                </p>
              </InfoCard>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="Permission and sources">
                <p>{resource.permission.notice}</p>
                {resource.references.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm marker:text-muted-foreground">
                    {resource.references.map((ref) => (
                      <li key={ref.label}>
                        {ref.url ? (
                          <a className={linkClass} href={ref.url}>
                            {ref.label}
                          </a>
                        ) : (
                          ref.label
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </InfoCard>
              <InfoCard title="Version history">
                <ol className="space-y-3">
                  {[resource.version, ...resource.history].map((v, i) => (
                    <li key={v.label} className="relative border-l-2 pl-4 data-[current=true]:border-primary" data-current={i === 0}>
                      <p className="text-sm">
                        <span className={cn('tabular-nums', i === 0 && 'font-semibold')}>Version {v.label}</span>
                        <span className="text-muted-foreground">, {v.date}</span>
                        {i === 0 && <span className="ml-2 text-xs font-medium text-mauve-ink">Current</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">{v.note}</p>
                    </li>
                  ))}
                </ol>
              </InfoCard>
            </div>

            {(adaptations.length > 0 || teacherActions) && (
              <section aria-labelledby="adaptations-title">
                <h2 id="adaptations-title" className="text-2xl font-bold tracking-tight">
                  Adaptations by other teachers
                </h2>
                {adaptations.length > 0 ? (
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {adaptations.map((a) => (
                      <li key={a.id}>
                        <a
                          href={`#/resource/${a.id}`}
                          className="flex items-center gap-3 rounded-2xl border bg-card p-3 outline-none transition-[transform,box-shadow] duration-200 ease-out hover:shadow-[0_12px_32px_-16px_rgb(51_44_39/0.35)] focus-visible:ring-3 focus-visible:ring-ring/50 motion-safe:hover:-translate-y-0.5"
                        >
                          <PackCover resource={a} size="thumb" className="w-16 shrink-0" />
                          <span className="min-w-0">
                            <span className="line-clamp-2 font-medium">{a.title}</span>
                            <span className="text-sm text-muted-foreground"> by {personaById(a.contributorId)?.alias}</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-muted-foreground">No adaptations yet.</p>
                )}
                {teacherActions && (
                  <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-secondary p-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-pretty">
                      Changed this pack for your class? Share your version as an adaptation. It credits{' '}
                      {contributor?.alias ?? 'the original contributor'} and leaves the original unchanged.
                    </p>
                    <Button variant="outline" asChild className="shrink-0">
                      <a href={`#/share?adapt=${resource.id}`}>Share an adaptation</a>
                    </Button>
                  </div>
                )}
              </section>
            )}

            <ReviewsPanel resource={resource} />
          </div>
        </div>
        <div ref={endRef} aria-hidden="true" className="h-px" />
      </Container>

      {downloads.canDownload && (
        <div
          inert={!showBar}
          aria-hidden={!showBar || undefined}
          className={cn(
            'fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-200 ease-out motion-reduce:transition-none lg:hidden',
            showBar ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <Container className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{resource.title}</p>
              <p className="truncate text-xs text-muted-foreground">{packSummary(downloads)}</p>
            </div>
            <PackDownloadButton dl={downloads} className="shrink-0" />
          </Container>
        </div>
      )}

      <ReportDialog resource={resource} open={reporting} onClose={() => setReporting(false)} />
    </>
  )
}

function Breadcrumb({ resource }: { resource: Resource }) {
  const crumbs = [
    { href: '#/browse', label: 'Browse' },
    { href: `#${withParams('/browse', { grade: resource.grade })}`, label: resource.grade },
    { href: `#${withParams('/browse', { grade: resource.grade, subject: resource.subject })}`, label: resource.subject },
  ]
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-0.5 text-sm text-muted-foreground">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-0.5">
            {i > 0 && <ChevronRight aria-hidden="true" className="size-4 opacity-60" />}
            <a
              href={c.href}
              className="inline-flex min-h-10 items-center rounded-md px-1.5 outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {c.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function StatusNotice({ resource }: { resource: Resource }) {
  const held = resource.status === 'held'
  const Icon = held ? CircleAlert : Clock
  return (
    <div
      className={cn(
        'mt-2 flex items-start gap-3 rounded-2xl border px-4 py-3',
        held ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground',
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <p>
        {STATUS_TEXT[resource.status]}
        {resource.holdReason && ` Reason: ${resource.holdReason}`}
      </p>
    </div>
  )
}

function PackHeader({ resource }: { resource: Resource }) {
  const { resources, personaById } = useStore()
  const parentInfo = resource.parent
  const parent = parentInfo && resources.find((r) => r.id === parentInfo.resourceId)
  const parentReview = parent && currentCurriculumReview(parent)

  return (
    <header className="mt-4 grid items-center gap-6 md:grid-cols-[280px_minmax(0,1fr)] md:gap-8">
      {/* The h1 below carries the title; the cover is decoration. */}
      <div aria-hidden="true">
        <PackCover resource={resource} className="rounded-2xl" />
      </div>
      <div>
        <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {resource.grade} · {resource.subject} · {bowLabel(resource)}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{resource.title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-pretty text-muted-foreground">{resource.summary}</p>
        {resource.tags.length > 0 && (
          <ul aria-label="Tags" className="mt-4 flex flex-wrap gap-2">
            {resource.tags.map((t) => (
              <li key={t} className="inline-flex h-8 items-center rounded-full bg-secondary px-3 text-sm font-medium text-secondary-foreground">
                {t}
              </li>
            ))}
          </ul>
        )}
        {parentInfo && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border bg-card px-4 py-3 text-sm">
            <GitFork aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>
              Adapted from{' '}
              {parent ? (
                <a className={linkClass} href={`#/resource/${parent.id}`}>
                  {parentInfo.title}
                </a>
              ) : (
                parentInfo.title
              )}{' '}
              version {parentInfo.version} by {personaById(parentInfo.contributorId)?.alias ?? 'the original contributor'}
              {parentReview && parentReview.version === parentInfo.version ? ', which is curriculum-reviewed (simulated)' : ''}.
            </span>
          </p>
        )}
      </div>
    </header>
  )
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 transition-shadow duration-200 hover:shadow-[0_12px_32px_-20px_rgb(51_44_39/0.3)]">
      <h2 className="mb-3 text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

function packSummary(dl: PackDownloads) {
  const files = dl.packFiles
  if (files.length === 0) return 'See the files in this pack'
  const sizes = files.map((f) => f.sizeBytes)
  const total = sizes.every((s) => s !== undefined) ? sizes.reduce<number>((sum, s) => sum + (s ?? 0), 0) : undefined
  return [plural(files.length, 'required file'), total !== undefined && formatBytes(total)].filter(Boolean).join(' · ')
}

function PackDownloadButton({ dl, size = 'default', className }: { dl: PackDownloads; size?: 'default' | 'lg'; className?: string }) {
  if (dl.packFiles.length === 0) {
    return (
      <Button
        size={size}
        className={className}
        onClick={() => {
          const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
          document.getElementById('files-title')?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
        }}
      >
        See the files
      </Button>
    )
  }
  return (
    <Button size={size} className={className} onClick={dl.downloadPack} disabled={dl.packBusy} aria-describedby={dl.packError ? 'pack-download-error' : undefined}>
      <Download aria-hidden="true" />
      {dl.packBusy ? 'Preparing…' : 'Download lesson pack'}
    </Button>
  )
}

function PackDownloadNote({ dl, resource }: { dl: PackDownloads; resource: Resource }) {
  const optional = resource.files.filter((f) => !f.required).length
  return (
    <>
      <p className="text-center text-xs text-muted-foreground">
        {packSummary(dl)}
        {optional > 0 && ` · ${plural(optional, 'optional extra')} listed under Files`}
      </p>
      {dl.packError && (
        <p id="pack-download-error" role="alert" className="text-center text-sm text-destructive">
          {dl.packError}
        </p>
      )}
    </>
  )
}
