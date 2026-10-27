import { Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { PersonAvatar } from '@/components/site/PersonAvatar'
import { Stars } from '@/components/site/Rating'
import { Container, EmptyState } from '@/components/site/layout'
import { replaceRoute, useRoute } from '@/router'
import { EarningsTab } from './profile/EarningsTab'
import { OverviewTab, PacksTab } from './profile/OverviewTab'
import { RatingsTab } from './profile/RatingsTab'
import { RevisionsTab } from './profile/RevisionsTab'
import { useProfile, type ProfileModel, type ProfileTab } from './profile/useProfile'

export function Profile({ id }: { id: string }) {
  const model = useProfile(id)
  const { params } = useRoute()
  const { profile, isSelf } = model
  if (!profile) {
    return (
      <Container className="pt-16">
        <EmptyState title="This profile doesn’t exist" actions={<Button render={<a href="#/" />} nativeButton={false}>Back to lesson packs</Button>} />
      </Container>
    )
  }
  const isTeacher = profile.role === 'teacher'
  const pending = model.incoming.filter((revision) => revision.status === 'pending').length
  const tabs: { tab: ProfileTab; label: string; badge?: number }[] = isTeacher
    ? [
        { tab: 'overview', label: 'Overview' },
        { tab: 'packs', label: 'Packs' },
        { tab: 'ratings', label: 'Reviews' },
        ...(isSelf ? [{ tab: 'earnings' as const, label: 'Earnings' }, { tab: 'revisions' as const, label: 'Revisions', badge: pending }] : []),
      ]
    : []
  const requested = params.get('tab') as ProfileTab | null
  const tab: ProfileTab = tabs.some((t) => t.tab === requested) ? requested! : 'overview'
  const go = (next: ProfileTab) => replaceRoute(`/profile/${id}${next === 'overview' ? '' : `?tab=${next}`}`)

  return (
    <Container className="max-w-5xl pt-10 pb-16">
      <ProfileHeader model={model} />
      {tabs.length > 0 && (
        <nav aria-label="Profile sections" className="mt-8 border-b">
          <ul className="-mb-px flex gap-6 overflow-x-auto">
            {tabs.map((item) => (
              <li key={item.tab}>
                <button
                  type="button"
                  onClick={() => go(item.tab)}
                  aria-current={tab === item.tab ? 'page' : undefined}
                  className="flex h-11 items-center gap-1.5 border-b-2 border-transparent text-[15px] font-medium whitespace-nowrap text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground aria-[current=page]:border-foreground aria-[current=page]:text-foreground"
                >
                  {item.label}
                  {!!item.badge && <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">{item.badge}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="mt-8">
        {tab === 'overview' && <OverviewTab model={model} onTab={go} />}
        {tab === 'packs' && <PacksTab model={model} />}
        {tab === 'ratings' && <RatingsTab model={model} />}
        {tab === 'earnings' && <EarningsTab model={model} />}
        {tab === 'revisions' && <RevisionsTab model={model} />}
      </div>
    </Container>
  )
}

function ProfileHeader({ model }: { model: ProfileModel }) {
  const { profile, summary, published, downloads, usedInClass, packReviews, isSelf } = model
  if (!profile) return null
  const isTeacher = profile.role === 'teacher'
  const meta = [profile.position?.split('·')[0].trim(), profile.school, profile.area.split(',')[0]].filter(Boolean).join(' · ')
  const usedShare = packReviews.length ? Math.round((usedInClass / packReviews.length) * 100) : null
  return (
    <header>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <PersonAvatar name={profile.alias} seed={profile.id} className="size-24" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[32px] leading-tight font-semibold tracking-tight">{profile.alias}</h1>
              <p className="mt-1 text-[15px] text-muted-foreground">{meta}</p>
            </div>
            {isSelf && (
              <Button variant="outline" render={<a href="#/settings" />} nativeButton={false}>
                <Settings /> Edit profile
              </Button>
            )}
          </div>
          {profile.bio && <p className="mt-3 line-clamp-2 max-w-[65ch] text-[15px] text-pretty">{profile.bio}</p>}
          {!!profile.subjects?.length && (
            <ul aria-label="Subjects" className="mt-3 flex flex-wrap gap-1.5">
              {profile.subjects.map((subject) => <li key={subject} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{subject}</li>)}
            </ul>
          )}
        </div>
      </div>
      {isTeacher && (
        <dl className="mt-8 grid grid-cols-2 border-y sm:grid-cols-4 sm:divide-x">
          <Stat label={summary.count === 1 ? '1 review' : `${summary.count} reviews`}>
            {summary.mean === null ? '—' : <span className="inline-flex items-center gap-2">{summary.mean.toFixed(1)} <Stars value={summary.mean} /></span>}
          </Stat>
          <Stat label={published.length === 1 ? 'pack' : 'packs'}>{published.length}</Stat>
          <Stat label="downloads">{downloads.toLocaleString()}</Stat>
          <Stat label="used it in class">{usedShare === null ? '—' : `${usedShare}%`}</Stat>
        </dl>
      )}
    </header>
  )
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-1 py-4 pr-4 sm:px-6 sm:first:pl-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-[28px] leading-none font-semibold tabular-nums">{children}</dd>
    </div>
  )
}
