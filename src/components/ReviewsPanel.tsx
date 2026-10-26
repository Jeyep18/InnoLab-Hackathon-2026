import { useEffect, useId, useState, type FormEvent } from 'react'
import { currentReviews, DemoRuleError, olderReviews, personaReview, resourceRating, reviewEligibility } from '../domain/logic'
import type { Resource, Review } from '../domain/types'
import { useStore } from '../store'
import { ErrorText, RatingLine, Stars } from './ui'

export function ReviewsPanel({ resource }: { resource: Resource }) {
  const { state, reviews, persona } = useStore()
  const current = currentReviews(resource, reviews)
  const older = olderReviews(resource, reviews)
  const summary = resourceRating(resource, reviews)
  const eligibility = reviewEligibility(state, resource, persona.role)

  return (
    <section className="panel" aria-labelledby="reviews-title">
      <h2 id="reviews-title">Ratings and feedback</h2>
      <p className="rating-summary">
        <RatingLine summary={summary} />
        <span className="muted small">For version {resource.version.label}. Earlier versions are listed separately.</span>
      </p>

      {eligibility === 'ok' && <ReviewForm resource={resource} />}
      {eligibility === 'not-acquired' && (
        <p className="hint">Download a file from this pack to rate it. Ratings come from teachers who got the pack.</p>
      )}
      {eligibility === 'own-resource' && <p className="hint">You shared this pack, so you can’t rate it.</p>}
      {eligibility === 'moderator' && <p className="hint">The demo moderator doesn’t rate packs. Switch to a teacher persona.</p>}

      {current.length === 0 ? (
        <p className="muted">No reviews yet for this version.</p>
      ) : (
        <ul className="review-list">
          {current.map((r) => (
            <ReviewItem key={r.id} review={r} mine={r.personaId === persona.id} />
          ))}
        </ul>
      )}

      {older.length > 0 && (
        <details className="older">
          <summary>
            {older.length} review{older.length === 1 ? '' : 's'} of earlier versions (not counted in the rating)
          </summary>
          <ul className="review-list">
            {older.map((r) => (
              <ReviewItem key={r.id} review={r} mine={r.personaId === persona.id} />
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}

function ReviewItem({ review, mine }: { review: Review; mine: boolean }) {
  return (
    <li className="review">
      <div className="review-head">
        <span aria-label={`${review.rating} out of 5`}>
          <Stars value={review.rating} />
        </span>
        <strong>{review.authorLabel}</strong>
        {review.seeded && <span className="pill">Sample review</span>}
        {mine && <span className="pill pill-mine">Your review</span>}
        <span className="muted small">Version {review.resourceVersion}</span>
      </div>
      {review.text && <p>{review.text}</p>}
      {review.usedInClass && <p className="muted small">Says they used it in class (self-reported).</p>}
    </li>
  )
}

function ReviewForm({ resource }: { resource: Resource }) {
  const { state, persona, dispatch, notify } = useStore()
  const existing = personaReview(state, resource.id)
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [text, setText] = useState(existing?.text ?? '')
  const [usedInClass, setUsedInClass] = useState(existing?.usedInClass ?? false)
  const [error, setError] = useState('')
  const ids = { text: useId(), used: useId(), error: useId() }

  // Switching persona swaps whose review is being edited.
  useEffect(() => {
    setRating(existing?.rating ?? 0)
    setText(existing?.text ?? '')
    setUsedInClass(existing?.usedInClass ?? false)
    setError('')
  }, [existing?.id, existing?.rating, existing?.text, existing?.usedInClass, persona.id])

  function submit(event: FormEvent) {
    event.preventDefault()
    try {
      dispatch({
        type: 'save-review',
        resource,
        role: persona.role,
        authorLabel: `${persona.alias} (demo persona)`,
        rating,
        text,
        usedInClass,
        at: new Date().toISOString(),
      })
      setError('')
      notify(existing ? 'Review updated. Ratings recalculated.' : 'Review posted. Ratings recalculated.')
    } catch (e) {
      setError(e instanceof DemoRuleError ? e.message : 'The review couldn’t be saved.')
    }
  }

  const olderVersion = existing && existing.resourceVersion !== resource.version.label

  return (
    <form className="review-form" onSubmit={submit} noValidate>
      <h3>{existing ? 'Edit your review' : `Rate this pack as ${persona.alias}`}</h3>
      {olderVersion && (
        <p className="hint">
          Your earlier review was for version {existing.resourceVersion}. Saving replaces it with a review of version{' '}
          {resource.version.label}.
        </p>
      )}
      <fieldset className="star-input" aria-describedby={error ? ids.error : undefined}>
        <legend>Rating</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={n <= rating ? 'on' : undefined}>
            <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} />
            <span aria-hidden="true">★</span>
            <span className="visually-hidden">
              {n} star{n === 1 ? '' : 's'}
            </span>
          </label>
        ))}
      </fieldset>
      <label htmlFor={ids.text}>What worked or what would you change? (optional)</label>
      <textarea id={ids.text} rows={3} maxLength={600} value={text} onChange={(e) => setText(e.target.value)} />
      <label className="checkbox" htmlFor={ids.used}>
        <input id={ids.used} type="checkbox" checked={usedInClass} onChange={(e) => setUsedInClass(e.target.checked)} />
        I used this in class
      </label>
      <ErrorText id={ids.error}>{error}</ErrorText>
      <button className="button" type="submit">
        {existing ? 'Update review' : 'Post review'}
      </button>
    </form>
  )
}
