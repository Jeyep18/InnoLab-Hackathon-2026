import { ArrowUpRight, Clock, Quote } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PackGrid } from '@/components/site/PackCard'
import { PackCover } from '@/components/site/PackCover'
import { PersonAvatar } from '@/components/site/PersonAvatar'
import { Stars } from '@/components/site/Rating'
import { EmptyState } from '@/components/site/layout'
import { downloadCount } from '@/domain/logic'
import { useStore } from '@/store'
import type { ProfileModel, ProfileTab } from './useProfile'

export const peso = (value: number) => `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function TabTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {action}
    </div>
  )
}

export function OverviewTab({ model, onTab }: { model: ProfileModel; onTab: (tab: ProfileTab) => void }) {
  const { state, personaById } = useStore()
  const { profile, published, isSelf, earnings, packReviews, incoming } = model
  if (!profile) return null
  if (profile.role !== 'teacher') return <EmptyState title="Verifiers check packs when authors ask" />
  const top = [...published].sort((a, b) => downloadCount(b, state) - downloadCount(a, state)).slice(0, 3)
  const pending = incoming.filter((revision) => revision.status === 'pending').length
  const quotes = packReviews.filter(({ review }) => review.text).slice(0, 2)
  return (
    <div className="space-y-12">
      {isSelf && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Shortcut value={peso(earnings.byMonth.at(-1)?.net ?? 0)} label="earned this month" onClick={() => onTab('earnings')} />
          <Shortcut value={pending === 1 ? '1 revision' : `${pending} revisions`} label="waiting for your review" onClick={() => onTab('revisions')} />
        </div>
      )}
      <section>
        <TabTitle title="Most downloaded" action={published.length > 3 && <Button variant="ghost" size="sm" onClick={() => onTab('packs')}>All {published.length} packs</Button>} />
        {top.length ? <PackGrid packs={top} /> : <EmptyState title="No published packs yet" />}
      </section>
      {quotes.length > 0 && (
        <section>
          <TabTitle title="What teachers say" action={<Button variant="ghost" size="sm" onClick={() => onTab('ratings')}>All reviews</Button>} />
          <ul className="grid gap-4 sm:grid-cols-2">
            {quotes.map(({ review, resource }) => (
              <li key={review.id}>
                <figure className="flex h-full flex-col rounded-2xl bg-secondary/60 p-5">
                  <Quote aria-hidden="true" className="size-5 text-mauve-ink" />
                  <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-pretty">{review.text}</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <PersonAvatar name={personaById(review.personaId)?.alias ?? review.authorLabel} seed={review.personaId} className="size-9" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{review.authorLabel}</span>
                      <a href={`#/resource/${resource.id}`} className="block truncate text-sm text-muted-foreground hover:underline">{resource.title}</a>
                    </span>
                    <span role="img" aria-label={`${review.rating} out of 5`}><Stars value={review.rating} /></span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Shortcut({ value, label, onClick }: { value: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex items-center justify-between gap-4 rounded-2xl border bg-card px-5 py-4 text-left outline-none transition-colors hover:border-foreground/30 focus-visible:ring-3 focus-visible:ring-ring/50">
      <span>
        <span className="block text-[28px] leading-none font-semibold tabular-nums">{value}</span>
        <span className="mt-1.5 block text-sm text-muted-foreground">{label}</span>
      </span>
      <ArrowUpRight aria-hidden="true" className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none" />
    </button>
  )
}

export function PacksTab({ model }: { model: ProfileModel }) {
  const { published, unpublished, showUnpublished, isSelf } = model
  return (
    <div className="space-y-12">
      <section>
        <TabTitle title={published.length === 1 ? '1 published pack' : `${published.length} published packs`} action={isSelf && <Button render={<a href="#/share" />} nativeButton={false}>Share a lesson</Button>} />
        {published.length === 0 ? <EmptyState title="No published packs yet" /> : <PackGrid packs={published} />}
      </section>
      {showUnpublished && unpublished.length > 0 && (
        <section>
          <TabTitle title="Hidden packs" />
          <ul className="divide-y rounded-2xl border">
            {unpublished.map((resource) => (
              <li key={resource.id}>
                <a href={`#/resource/${resource.id}`} className="flex flex-wrap items-center gap-4 p-3 transition-colors hover:bg-secondary/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
                  <PackCover resource={resource} size="thumb" variant="paper" className="w-14 shrink-0" />
                  <span className="min-w-0 flex-1 font-medium">{resource.title}</span>
                  <Badge variant="destructive" className="gap-1">
                    <Clock aria-hidden="true" className="size-3" />
                    Hidden after a report
                  </Badge>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
