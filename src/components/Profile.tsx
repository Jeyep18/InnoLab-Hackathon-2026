import { Clock, FolderOpen, UserRoundX } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PackGrid } from '@/components/site/PackCard'
import { PackCover } from '@/components/site/PackCover'
import { RatingLine } from '@/components/site/Rating'
import { Container, EmptyState } from '@/components/site/layout'
import { contributorRating, plural } from '@/domain/logic'
import { initials } from '@/lib/pack'
import { useStore } from '@/store'

export function Profile({ id }: { id: string }) {
  const { personaById, resources, reviews, persona } = useStore()
  const profile = personaById(id)
  if (!profile) {
    return (
      <Container className="pt-16">
        <EmptyState
          icon={<UserRoundX />}
          title="This profile doesn’t exist"
          actions={
            <Button asChild>
              <a href="#/browse">Browse lesson packs</a>
            </Button>
          }
        />
      </Container>
    )
  }
  const own = resources.filter((r) => r.contributorId === profile.id)
  const published = own.filter((r) => r.status === 'published')
  const unpublished = own.filter((r) => r.status !== 'published')
  const showUnpublished = profile.id === persona.id || persona.role === 'moderator'
  const summary = contributorRating(profile.id, resources, reviews)
  const isTeacher = profile.role === 'teacher'

  return (
    <Container className="pt-10">
      <header className="flex flex-col gap-6 rounded-3xl border bg-card p-6 sm:flex-row sm:items-start sm:p-8">
        <Avatar className="size-20 shrink-0">
          <AvatarFallback className="bg-olive text-2xl font-semibold text-white">{initials(profile)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{profile.alias}</h1>
            <Badge variant="secondary">
              {profile.listed === false ? 'Contributor alias' : `Demo account${profile.role === 'moderator' ? ' · moderator' : ''}`}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">{profile.area}</p>
          {profile.bio && <p className="mt-3 max-w-2xl text-pretty">{profile.bio}</p>}
        </div>
        {isTeacher && (
          <dl className="grid shrink-0 grid-cols-2 gap-3 sm:w-72">
            <div className="col-span-2 rounded-xl bg-secondary p-3">
              <dt className="text-xs text-muted-foreground">Community rating</dt>
              <dd className="mt-1">
                <RatingLine summary={summary} />
              </dd>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <dt className="text-xs text-muted-foreground">Published</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">{plural(published.length, 'pack')}</dd>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <dt className="text-xs text-muted-foreground">Reviews</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">{summary.count}</dd>
            </div>
          </dl>
        )}
      </header>
      {isTeacher && (
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          The community rating averages every rating on this teacher’s current published packs. It reflects classroom feedback. It doesn’t
          confirm identity, credentials or ownership.
        </p>
      )}

      {isTeacher && (
        <section aria-labelledby="published-title" className="mt-12">
          <h2 id="published-title" className="mb-5 text-2xl font-bold tracking-tight">
            Published lesson packs <span className="text-muted-foreground tabular-nums">({published.length})</span>
          </h2>
          {published.length === 0 ? (
            <EmptyState icon={<FolderOpen />} title="No published packs yet" />
          ) : (
            <PackGrid packs={published} />
          )}
        </section>
      )}

      {showUnpublished && unpublished.length > 0 && (
        <section aria-labelledby="unpublished-title" className="mt-12">
          <h2 id="unpublished-title" className="mb-5 text-2xl font-bold tracking-tight">
            Waiting or on hold
          </h2>
          <ul className="grid gap-3">
            {unpublished.map((r) => (
              <li key={r.id}>
                <a
                  href={`#/resource/${r.id}`}
                  className="flex items-center gap-4 rounded-2xl border bg-card p-3 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <PackCover resource={r} size="thumb" className="w-16" />
                  <span className="min-w-0 flex-1 font-medium">{r.title}</span>
                  <Badge variant={r.status === 'pending' ? 'secondary' : 'destructive'} className="gap-1">
                    <Clock aria-hidden="true" className="size-3" />
                    {r.status === 'pending' ? 'Waiting for review' : 'On hold'}
                  </Badge>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  )
}
