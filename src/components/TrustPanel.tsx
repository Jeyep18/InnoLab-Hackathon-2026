import { bookmarkCount, bowLabel, competencyLabel, contributorRating, currentCurriculumReview, currentReviews, downloadCount, plural, resourceRating } from '../domain/logic'
import type { Resource } from '../domain/types'
import { useStore } from '../store'
import { RatingLine } from './ui'

export function ReviewStatus({ resource }: { resource: Resource }) {
  const review = currentCurriculumReview(resource)
  return review ? (
    <span className="badge badge-reviewed">Curriculum-reviewed, simulated</span>
  ) : (
    <span className="badge">Not yet reviewed</span>
  )
}

/** Everything a teacher can check before downloading, in the order the team agreed. */
export function TrustPanel({ resource }: { resource: Resource }) {
  const { state, reviews, resources, personaById } = useStore()
  const contributor = personaById(resource.contributorId)
  const packRating = resourceRating(resource, reviews)
  const track = contributorRating(resource.contributorId, resources, reviews)
  const review = currentCurriculumReview(resource)
  const parent = resource.parent && resources.find((r) => r.id === resource.parent!.resourceId)
  const parentReview = parent && currentCurriculumReview(parent)
  const sampleCount = currentReviews(resource, reviews).filter((r) => r.seeded).length
  const trackHasSamples = resources
    .filter((r) => r.contributorId === resource.contributorId && r.status === 'published')
    .some((r) => currentReviews(r, reviews).some((rev) => rev.seeded))

  return (
    <section className="trust" aria-labelledby="trust-title">
      <h2 id="trust-title" className="visually-hidden">
        Before you download
      </h2>

      <div className="trust-row">
        <div className="trust-cell">
          <p className="trust-label">Shared by</p>
          <p className="trust-value">
            <a href={`#/profile/${resource.contributorId}`}>{contributor?.alias ?? 'Unknown contributor'}</a>
          </p>
          <p className="trust-sub">
            {track.count > 0 ? (
              <>
                Track record: <RatingLine summary={track} compact /> across their packs
                {trackHasSamples && ', including sample reviews'}
              </>
            ) : (
              'No reviews yet on their packs'
            )}
          </p>
        </div>
        <div className="trust-cell">
          <p className="trust-label">Teacher rating, this version</p>
          <p className="trust-value">
            <RatingLine summary={packRating} />
          </p>
          {packRating.count === 0 ? (
            <p className="trust-sub">Be the first to rate it after downloading.</p>
          ) : (
            sampleCount > 0 && (
              <p className="trust-sub">
                Includes {sampleCount === packRating.count ? 'only' : sampleCount} sample review{sampleCount === 1 ? '' : 's'}.
              </p>
            )
          )}
        </div>
        <div className="trust-cell">
          <p className="trust-label">Activity</p>
          <p className="trust-value">
            {plural(downloadCount(resource, state), 'download')}, {plural(bookmarkCount(resource, state), 'save')}
          </p>
          <p className="trust-sub">Shows popularity, not quality.</p>
        </div>
      </div>

      <div className="trust-row trust-row-facts">
        <div className="trust-cell">
          <p className="trust-label">Curriculum review</p>
          <p className="trust-value">
            <ReviewStatus resource={resource} />
          </p>
          <p className="trust-sub">
            {review
              ? `Version ${review.version} checked by the ${review.reviewer.toLowerCase()} on ${review.date}. Not a DepEd approval.`
              : resource.parent
                ? 'Adaptations need their own review; the original’s review doesn’t carry over.'
                : 'No reviewer has checked this version yet.'}
          </p>
        </div>
        <div className="trust-cell">
          <p className="trust-label">Version</p>
          <p className="trust-value">
            {resource.version.label}, updated {resource.version.date}
          </p>
          <p className="trust-sub">
            {resource.history.length > 0 ? `Replaces version ${resource.history[0].label}.` : 'First version.'}
          </p>
        </div>
        <div className="trust-cell">
          <p className="trust-label">Targets</p>
          <p className="trust-value">
            {bowLabel(resource)}
          </p>
          <p className="trust-sub">{competencyLabel(resource)}</p>
        </div>
      </div>

      {resource.parent && (
        <p className="trust-parent">
          Adapted from{' '}
          {parent ? <a href={`#/resource/${parent.id}`}>{resource.parent.title}</a> : resource.parent.title} version{' '}
          {resource.parent.version} by {personaById(resource.parent.contributorId)?.alias ?? 'the original contributor'}
          {parentReview && parentReview.version === resource.parent.version ? ', which is curriculum-reviewed (simulated)' : ''}.
        </p>
      )}
    </section>
  )
}
