import { contributorRating } from '../domain/logic'
import { useStore } from '../store'
import { ResourceCard } from './ResourceCard'
import { Empty, RatingLine } from './ui'

export function Profile({ id }: { id: string }) {
  const { personaById, resources, reviews, persona } = useStore()
  const profile = personaById(id)
  if (!profile) {
    return (
      <Empty title="This profile doesn’t exist">
        <a className="button" href="#/">
          Browse lesson packs
        </a>
      </Empty>
    )
  }
  const own = resources.filter((r) => r.contributorId === profile.id)
  const published = own.filter((r) => r.status === 'published')
  const unpublished = own.filter((r) => r.status !== 'published')
  const showUnpublished = profile.id === persona.id || persona.role === 'moderator'
  const summary = contributorRating(profile.id, resources, reviews)

  return (
    <div className="page">
      <header className="profile-head">
        <h1>{profile.alias}</h1>
        <p className="muted">
          {profile.listed === false ? 'Contributor alias' : `Demo persona${profile.role === 'moderator' ? ', moderator' : ''}`}. {profile.area}.
        </p>
        <p>{profile.bio}</p>
        {profile.role === 'teacher' && (
          <div className="profile-rating">
            <h2>Community rating</h2>
            <RatingLine summary={summary} />
            <p className="muted small">
              The average of every rating on this teacher’s current published packs. It reflects classroom feedback. It
              doesn’t confirm identity, credentials or ownership.
            </p>
          </div>
        )}
      </header>

      {profile.role === 'teacher' && (
        <section aria-labelledby="published-title">
          <h2 id="published-title">Published lesson packs ({published.length})</h2>
          {published.length === 0 ? (
            <p className="muted">No published packs yet.</p>
          ) : (
            <div className="grid">
              {published.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          )}
        </section>
      )}

      {showUnpublished && unpublished.length > 0 && (
        <section aria-labelledby="unpublished-title">
          <h2 id="unpublished-title">Waiting or on hold</h2>
          <ul className="plain-list">
            {unpublished.map((r) => (
              <li key={r.id}>
                <a href={`#/resource/${r.id}`}>{r.title}</a>
                <span className="muted small"> {r.status === 'pending' ? 'waiting for review' : 'on hold'}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
