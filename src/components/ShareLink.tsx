import { useId, useState } from 'react'
import { bowLabel, currentCurriculumReview, resourceRating } from '../domain/logic'
import type { Resource } from '../domain/types'
import { useStore } from '../store'
import { Dialog } from './ui'

/**
 * Copies the pack link and shows how it would read when posted in a teachers' group.
 * The post is a simulated preview: CherIt isn't connected to any social network.
 */
export function ShareLink({ resource }: { resource: Resource }) {
  const { persona, reviews, personaById } = useStore()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<boolean | null>(null)
  const linkId = useId()
  const link = `${window.location.origin}${window.location.pathname}#/resource/${resource.id}`
  const rating = resourceRating(resource, reviews)
  const reviewed = currentCurriculumReview(resource)
  const contributor = personaById(resource.contributorId)?.alias ?? 'a teacher'

  async function share() {
    setOpen(true)
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <button className="button button-quiet" onClick={share}>
        Copy link to share
      </button>
      <Dialog open={open} title={copied ? 'Link copied' : 'Share this pack'} onClose={() => setOpen(false)}>
        {copied === false && <p>Your browser blocked copying. Select the link and copy it yourself.</p>}
        <label className="visually-hidden" htmlFor={linkId}>
          Link to this pack
        </label>
        <input id={linkId} className="share-link" readOnly value={link} onFocus={(e) => e.target.select()} />

        <p className="share-caption">How it reads when posted in a teachers’ group (simulated)</p>
        <figure className="post" aria-label="Simulated group post preview">
          <p className="post-author">
            <strong>{persona.alias}</strong> shared a lesson pack
          </p>
          <div className="post-card">
            <p className="post-site">CherIt</p>
            <p className="post-title">{resource.title}</p>
            <p className="post-meta">
              {resource.grade} {resource.subject}, {bowLabel(resource)}
            </p>
            <p className="post-meta">
              By {contributor}.{' '}
              {rating.mean === null
                ? 'No reviews yet.'
                : `${rating.mean.toFixed(1)} stars from ${rating.count} teacher rating${rating.count === 1 ? '' : 's'}.`}{' '}
              {reviewed ? 'Curriculum-reviewed (simulated).' : 'Not yet curriculum-reviewed.'}
            </p>
          </div>
        </figure>
        <p className="muted small">
          A preview only. CherIt isn’t connected to Facebook, and this local link opens only on this computer.
        </p>
        <div className="actions">
          <button className="button" onClick={() => setOpen(false)}>
            Done
          </button>
        </div>
      </Dialog>
    </>
  )
}
