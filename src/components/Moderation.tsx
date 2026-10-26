import { Inbox, PauseCircle, ShieldCheck, ShieldUser } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Container, EmptyState } from '@/components/site/layout'
import { PackCover } from '@/components/site/PackCover'
import { ReviewBadge } from '@/components/site/Rating'
import { bowLabel, competencyLabel, currentCurriculumReview, plural } from '@/domain/logic'
import type { Resource, ResourceStatus } from '@/domain/types'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { QueueActions } from './moderation/QueueActions'

type Tab = 'pending' | 'held' | 'published'

const STATUS_LABEL: Record<ResourceStatus, string> = { pending: 'Pending', held: 'On hold', published: 'Published' }

export function Moderation() {
  const { resources, persona, dispatch, notify } = useStore()
  const [tab, setTab] = useState<Tab>('pending')
  const pending = resources.filter((r) => r.status === 'pending')
  const held = resources.filter((r) => r.status === 'held')
  // Packs still needing a curriculum review for their current version come first.
  const published = resources
    .filter((r) => r.status === 'published')
    .sort((a, b) => Number(!!currentCurriculumReview(a)) - Number(!!currentCurriculumReview(b)))
  const unreviewed = published.filter((r) => !currentCurriculumReview(r))

  if (persona.role !== 'moderator') {
    return (
      <Container className="pt-10 pb-16">
        <PageHeader />
        <EmptyState
          className="mt-8"
          icon={<ShieldUser />}
          title="Only the demo moderator can use the review queue"
          actions={
            <Button
              size="lg"
              onClick={() => {
                dispatch({ type: 'select-persona', personaId: 'p-mod' })
                notify('Now browsing as the demo moderator.')
              }}
            >
              Switch to demo moderator
            </Button>
          }
        >
          <p className="tabular-nums">
            {pending.length} waiting, {held.length} on hold. Switch persona to publish or hold packs.
          </p>
          <p className="mt-2 text-sm">You can also switch demo account from the avatar menu at the top right.</p>
        </EmptyState>
      </Container>
    )
  }

  const tabs: { value: Tab; label: string; items: Resource[] }[] = [
    { value: 'pending', label: 'Pending', items: pending },
    { value: 'held', label: 'Held', items: held },
    { value: 'published', label: 'Published', items: published },
  ]

  return (
    <Container className="pt-10 pb-16">
      <PageHeader />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-8 gap-5">
        <TabsList aria-label="Queue" className="h-11 w-full p-1 group-data-horizontal/tabs:h-11 sm:w-fit">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="h-full min-h-9 gap-1 px-1.5 text-sm sm:gap-1.5 sm:px-4 sm:text-[15px]">
              {t.label}
              <Badge variant={t.value === 'pending' && t.items.length > 0 ? 'default' : 'secondary'} className="min-w-5 tabular-nums">
                {t.items.length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="pending" className="text-base">
          <QueueList
            items={pending}
            description="New submissions from Share a lesson. Publishing checks the files, the permission statement and that no learner information is included."
            empty={
              <EmptyState icon={<Inbox />} title="Nothing is waiting">
                New submissions from Share a lesson appear here.
              </EmptyState>
            }
          />
        </TabsContent>
        <TabsContent value="held" className="text-base">
          <QueueList
            items={held}
            description="Packs held by the moderator or after a report. Publish one to return it to Browse."
            empty={<EmptyState icon={<PauseCircle />} title="No packs are on hold" />}
          />
        </TabsContent>
        <TabsContent value="published" className="text-base">
          <QueueList
            items={published}
            showTarget
            description={
              <>
                <span className="font-medium text-foreground tabular-nums">
                  {unreviewed.length === 0 ? 'Every published pack has a review for its current version.' : `${plural(unreviewed.length, 'pack')} not yet curriculum-reviewed.`}
                </span>{' '}
                Marking a pack reviewed covers its current version only. A new version or an adaptation starts unreviewed.
              </>
            }
            empty={<EmptyState icon={<ShieldCheck />} title="No published packs yet" />}
          />
        </TabsContent>
      </Tabs>
    </Container>
  )
}

function PageHeader() {
  return (
    <header>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Review queue</h1>
      <p className="mt-2 max-w-3xl text-pretty text-muted-foreground">
        This demonstrates the workflow. Publishing checks the files, the permission statement and that no learner information is included.
        Curriculum review is a separate step. Both are simulated: no expert or DepEd reviewer is involved.
      </p>
    </header>
  )
}

function QueueList({ items, description, empty, showTarget = false }: { items: Resource[]; description: ReactNode; empty: ReactNode; showTarget?: boolean }) {
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
                  <TableHead className="h-11">Submitted</TableHead>
                  <TableHead className="h-11">Status</TableHead>
                  <TableHead className="h-11 min-w-64 pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((r) => (
                  <QueueTableRow key={r.id} resource={r} showTarget={showTarget} />
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Mobile: one card per pack */}
          <ul className="flex flex-col gap-3 md:hidden">
            {items.map((r) => (
              <QueueCard key={r.id} resource={r} showTarget={showTarget} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function QueueTableRow({ resource, showTarget }: { resource: Resource; showTarget: boolean }) {
  const { personaById } = useStore()
  return (
    <TableRow className="align-top">
      <TableCell className="min-w-72 py-4 pl-4 align-top whitespace-normal">
        <PackSummary resource={resource} showTarget={showTarget} />
      </TableCell>
      <TableCell className="py-4 align-top whitespace-normal">{personaById(resource.contributorId)?.alias ?? 'Unknown contributor'}</TableCell>
      <TableCell className="py-4 align-top tabular-nums">
        <span className="block">{resource.createdAt}</span>
        <span className="block text-sm text-muted-foreground">Version {resource.version.label}</span>
      </TableCell>
      <TableCell className="py-4 align-top">
        <StatusBadges resource={resource} />
      </TableCell>
      <TableCell className="py-4 pr-4 align-top">
        <QueueActions resource={resource} className="justify-end" />
      </TableCell>
    </TableRow>
  )
}

function QueueCard({ resource, showTarget }: { resource: Resource; showTarget: boolean }) {
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
          <dt className="text-muted-foreground">Submitted</dt>
          <dd className="font-medium tabular-nums">
            {resource.createdAt} · v{resource.version.label}
          </dd>
        </div>
      </dl>
      <StatusBadges resource={resource} className="mt-3" />
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

function StatusBadges({ resource, className }: { resource: Resource; className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-1.5 md:flex-col md:items-start', className)}>
      <Badge
        variant={resource.status === 'held' ? 'destructive' : resource.status === 'pending' ? 'outline' : 'secondary'}
        className={cn(resource.status === 'pending' && 'border-primary/40 text-mauve-ink')}
      >
        {STATUS_LABEL[resource.status]}
      </Badge>
      <ReviewBadge resource={resource} />
    </div>
  )
}
