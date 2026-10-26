import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PackGrid } from '@/components/site/PackCard'
import { PackCover } from '@/components/site/PackCover'
import { RatingLine } from '@/components/site/Rating'
import { Container, EmptyState } from '@/components/site/layout'
import { useProfile } from './profile/useProfile'

export function Profile({ id }: { id: string }) {
  const { profile, published, unpublished, showUnpublished, summary, hasSampleReviews } = useProfile(id)
  if (!profile) {
    return (
      <Container className="pt-16">
        <EmptyState
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
  const isTeacher = profile.role === 'teacher'

  return (
    <Container className="pt-10 sm:pt-14">
      <header className="flex flex-col gap-6 border-y border-foreground/25 py-7 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-sm text-muted-foreground">
            {profile.listed === false ? 'Contributor alias' : `Demo account${profile.role === 'moderator' ? ' · moderator' : ''}`}
          </p>
          <h1 className="library-title text-4xl sm:text-5xl">{profile.alias}</h1>
          <p className="mt-2 text-muted-foreground">{profile.area}</p>
          {profile.bio && <p className="mt-3 max-w-2xl text-pretty">{profile.bio}</p>}
        </div>
        {isTeacher && (
          <dl className="shrink-0 sm:max-w-xs sm:pt-1">
            <div>
              <dt className="text-sm text-muted-foreground">Community rating</dt>
              <dd className="mt-2">
                <RatingLine summary={summary} />
                {summary.count > 0 && <p className="mt-2 text-sm text-muted-foreground">{hasSampleReviews ? 'Includes sample reviews.' : 'Local demo reviews.'}</p>}
              </dd>
            </div>
          </dl>
        )}
      </header>
      {isTeacher && (
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Ratings cover this contributor's current published pack versions. They do not confirm classroom use, identity, credentials or ownership.
        </p>
      )}

      {isTeacher && (
        <section aria-labelledby="published-title" className="mt-12">
          <h2 id="published-title" className="library-section-title mb-5 text-2xl">
            Published lesson packs <span className="text-muted-foreground tabular-nums">({published.length})</span>
          </h2>
          {published.length === 0 ? (
            <EmptyState title="No published packs yet" />
          ) : (
            <PackGrid packs={published} />
          )}
        </section>
      )}

      {showUnpublished && unpublished.length > 0 && (
        <section aria-labelledby="unpublished-title" className="mt-12">
          <h2 id="unpublished-title" className="library-section-title mb-5 text-2xl">
            Waiting or on hold
          </h2>
          <ul className="divide-y border-y">
            {unpublished.map((r) => (
              <li key={r.id}>
                <a
                  href={`#/resource/${r.id}`}
                  className="flex flex-wrap items-center gap-4 py-4 transition-colors hover:bg-secondary/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <PackCover resource={r} size="thumb" variant="paper" className="w-16 shrink-0" />
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
