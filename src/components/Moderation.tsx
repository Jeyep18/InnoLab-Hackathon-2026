import { BadgeCheck, Flag, Inbox, ShieldCheck, ShieldUser } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Container, EmptyState } from '@/components/site/layout'
import { PackCover } from '@/components/site/PackCover'
import { ReviewBadge } from '@/components/site/Rating'
import { bowLabel, competencyLabel, currentCurriculumReview, openVerificationRequest, plural } from '@/domain/logic'
import type { Resource, ResourceStatus, VerificationRequest } from '@/domain/types'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { QueueActions } from './moderation/QueueActions'

type Tab = 'requested' | 'held' | 'published'

const STATUS_LABEL: Record<ResourceStatus, string> = { held: 'Hidden', published: 'Public' }

export function Moderation() {
  const { resources, state, persona, dispatch, notify } = useStore()
  const [tab, setTab] = useState<Tab>('requested')
  const requestFor = (r: Resource) => openVerificationRequest(state, r)
  // Priority (Pro, not implemented) would come first; then oldest request first.
  const requested = resources
    .filter((r) => r.status === 'published' && requestFor(r) && !currentCurriculumReview(r))
    .sort((a, b) => {
      const ra = requestFor(a)!
      const rb = requestFor(b)!
      return Number(rb.tier === 'priority') - Number(ra.tier === 'priority') || ra.requestedAt.localeCompare(rb.requestedAt)
    })
  const held = resources.filter((r) => r.status === 'held')
  // Unverified packs come first.
  const published = resources
    .filter((r) => r.status === 'published')
    .sort((a, b) => Number(!!currentCurriculumReview(a)) - Number(!!currentCurriculumReview(b)))
  const unverified = published.filter((r) => !currentCurriculumReview(r))

  if (persona.role !== 'moderator') {
    return (
      <Container className="pt-10 pb-16">
        <PageHeader />
        <EmptyState
          className="mt-8"
          icon={<ShieldUser />}
          title="Only the verifier can use the verification queue"
          actions={
            <Button
              size="lg"
              onClick={() => {
                dispatch({ type: 'select-persona', personaId: 'p-mod' })
                notify('Now signed in as the verifier, CherIt Review Team.')
              }}
            >
              Switch to the verifier account
            </Button>
          }
        >
          <p className="tabular-nums">
            {requested.length} asking for verification, {held.length} hidden after a report. Switch persona to verify or restore packs.
          </p>
          <p className="mt-2 text-sm">You can also switch accounts from the avatar menu at the top right.</p>
        </EmptyState>
      </Container>
    )
  }

  const tabs: { value: Tab; label: string; items: Resource[] }[] = [
    { value: 'requested', label: 'Requested', items: requested },
    { value: 'held', label: 'Reported', items: held },
    { value: 'published', label: 'All public', items: published },
  ]

  return (
    <Container className="pt-10 pb-16">
      <PageHeader />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-8 gap-5">
        <TabsList aria-label="Queue" className="h-11 w-full p-1 group-data-horizontal/tabs:h-11 sm:w-fit">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="h-full min-h-9 gap-1 px-1.5 text-sm sm:gap-1.5 sm:px-4 sm:text-[15px]">
              {t.label}
              <Badge variant={t.value !== 'published' && t.items.length > 0 ? 'default' : 'secondary'} className="min-w-5 tabular-nums">
                {t.items.length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="requested" className="text-base">
          <QueueList
            items={requested}
            requestFor={requestFor}
            description="Authors asked for these versions to be checked. Verifying checks the lesson against its stated competency and covers the current version only."
            empty={
              <EmptyState icon={<Inbox />} title="No verification requests">
                When an author asks for verification, their pack appears here.
              </EmptyState>
            }
          />
        </TabsContent>
        <TabsContent value="held" className="text-base">
          <QueueList
            items={held}
            description="Packs hidden after a report. Restore one to make it public again."
            empty={
              <EmptyState icon={<Flag />} title="No reported packs">
                When a report hides a pack, it appears here so you can review and restore it.
              </EmptyState>
            }
          />
        </TabsContent>
        <TabsContent value="published" className="text-base">
          <QueueList
            items={published}
            showTarget
            description={
              <>
                <span className="font-medium text-foreground tabular-nums">
                  {unverified.length === 0 ? 'Every public pack is verified for its current version.' : `${plural(unverified.length, 'pack')} not verified.`}
                </span>{' '}
                You can verify any public pack, requested or not. A new version or an adaptation starts unverified.
              </>
            }
            empty={
              <EmptyState icon={<ShieldCheck />} title="No public packs yet">
                Packs appear here as soon as teachers share them.
              </EmptyState>
            }
          />
        </TabsContent>
      </Tabs>
    </Container>
  )
}

function PageHeader() {
  return (
    <header>
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight sm:text-4xl">
        <BadgeCheck aria-hidden="true" className="size-8 text-mauve-ink" /> Verification queue
      </h1>
      <p className="mt-2 max-w-3xl text-pretty text-muted-foreground">
        Packs go public as soon as they’re shared. Authors can ask for free verification of a version, and reports hide a pack until you restore it.
      </p>
    </header>
  )
}

type RequestFor = (resource: Resource) => VerificationRequest | undefined

function QueueList({ items, description, empty, showTarget = false, requestFor }: { items: Resource[]; description: ReactNode; empty: ReactNode; showTarget?: boolean; requestFor?: RequestFor }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-pretty text-muted-foreground">{description}</p>
      {items.length === 0 ? (
        empty
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
            <Table className="text-[15px]">
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 pl-4">Pack</TableHead>
                  <TableHead className="h-11">Contributor</TableHead>
                  <TableHead className="h-11">{requestFor ? 'Requested' : 'Shared'}</TableHead>
                  <TableHead className="h-11">Status</TableHead>
                  <TableHead className="h-11 min-w-64 pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((r) => (
                  <QueueTableRow key={r.id} resource={r} showTarget={showTarget} request={requestFor?.(r)} />
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Mobile: one card per pack */}
          <ul className="flex flex-col gap-3 md:hidden">
            {items.map((r) => (
              <QueueCard key={r.id} resource={r} showTarget={showTarget} request={requestFor?.(r)} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function QueueTableRow({ resource, showTarget, request }: { resource: Resource; showTarget: boolean; request?: VerificationRequest }) {
  const { personaById } = useStore()
  return (
    <TableRow className="align-top">
      <TableCell className="min-w-72 py-4 pl-4 align-top whitespace-normal">
        <PackSummary resource={resource} showTarget={showTarget} />
      </TableCell>
      <TableCell className="py-4 align-top whitespace-normal">{personaById(resource.contributorId)?.alias ?? 'Unknown contributor'}</TableCell>
      <TableCell className="py-4 align-top tabular-nums">
        <span className="block">{request ? request.requestedAt.slice(0, 10) : resource.createdAt}</span>
        <span className="block text-sm text-muted-foreground">Version {resource.version.label}</span>
      </TableCell>
      <TableCell className="py-4 align-top">
        <StatusBadges resource={resource} request={request} />
      </TableCell>
      <TableCell className="py-4 pr-4 align-top">
        <QueueActions resource={resource} className="justify-end" />
      </TableCell>
    </TableRow>
  )
}

function QueueCard({ resource, showTarget, request }: { resource: Resource; showTarget: boolean; request?: VerificationRequest }) {
  const { personaById } = useStore()
  return (
    <li className="rounded-2xl border bg-card p-4">
      <PackSummary resource={resource} showTarget={showTarget} />
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Contributor</dt>
          <dd className="font-medium">{personaById(resource.contributorId)?.alias ?? 'Unknown contributor'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{request ? 'Requested' : 'Shared'}</dt>
          <dd className="font-medium tabular-nums">
            {request ? request.requestedAt.slice(0, 10) : resource.createdAt} · v{resource.version.label}
          </dd>
        </div>
      </dl>
      <StatusBadges resource={resource} request={request} className="mt-3" />
      <QueueActions resource={resource} className="mt-4 border-t pt-4 [&>*]:grow" />
    </li>
  )
}

function PackSummary({ resource, showTarget }: { resource: Resource; showTarget: boolean }) {
  const files = resource.files.length
  return (
    <div className="flex gap-3">
      <div aria-hidden="true" className="w-20 shrink-0 self-start">
        <PackCover resource={resource} size="thumb" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-snug text-pretty">
          <a href={`#/resource/${resource.id}`} className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50">
            {resource.title}
          </a>
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {resource.grade} {resource.subject} · {files} file{files === 1 ? '' : 's'}
        </p>
        {showTarget && (
          <p className="mt-1 text-sm text-muted-foreground">
            Targets {bowLabel(resource)}: {competencyLabel(resource)}.
          </p>
        )}
        {resource.parent && (
          <p className="mt-1 text-sm">
            Adaptation of “{resource.parent.title}” version {resource.parent.version}. Change note: {resource.changeNote}
          </p>
        )}
        {resource.holdReason && <p className="mt-1 text-sm">Reported: {resource.holdReason}</p>}
        {resource.status !== 'published' && <p className="mt-1 text-sm text-muted-foreground">{resource.permission.notice}</p>}
      </div>
    </div>
  )
}

function StatusBadges({ resource, request, className }: { resource: Resource; request?: VerificationRequest; className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-1.5 md:flex-col md:items-start', className)}>
      <Badge variant={resource.status === 'held' ? 'destructive' : 'secondary'}>{STATUS_LABEL[resource.status]}</Badge>
      <ReviewBadge resource={resource} />
      {request && (
        <Badge variant="outline" className="border-primary/40 text-mauve-ink">
          {request.tier === 'priority' ? 'Priority queue' : 'Free queue'}
        </Badge>
      )}
    </div>
  )
}
