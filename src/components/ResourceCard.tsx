import { bookmarkCount, bowLabel, downloadCount, isBookmarked, plural, resourceRating } from '../domain/logic'
import type { Resource } from '../domain/types'
import { useStore } from '../store'
import { ReviewStatus } from './TrustPanel'
import { RatingLine } from './ui'

export function ResourceCard({ resource }: { resource: Resource }) {
  const { state, reviews, personaById } = useStore()
  const contributor = personaById(resource.contributorId)
  const saved = isBookmarked(state, resource.id)
  return (
    <article className="card">
      <p className="card-kicker">
        {resource.grade} {resource.subject}
        <span className="card-week">
          {bowLabel(resource)}
        </span>
      </p>
      <h3>
        <a href={`#/resource/${resource.id}`}>{resource.title}</a>
      </h3>
      <p className="card-summary">{resource.summary}</p>
      {resource.parent && <p className="card-parent">Adapted from “{resource.parent.title}”</p>}
      <ul className="tags" aria-label="Classroom fit">
        {resource.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div className="card-foot">
        <span className="card-trust">
          <RatingLine summary={resourceRating(resource, reviews)} compact />
          <ReviewStatus resource={resource} />
        </span>
        <span className="muted">
          {plural(downloadCount(resource, state), 'download')}, {plural(bookmarkCount(resource, state), 'save')}
          {saved && <span className="saved-mark">, saved by you</span>}
        </span>
        <span className="muted">by {contributor?.alias ?? 'Unknown contributor'}</span>
      </div>
    </article>
  )
}
