import { useState } from 'react'
import { bowLabel, competencyLabel, currentCurriculumReview, DemoRuleError } from '../domain/logic'
import type { Resource } from '../domain/types'
import { useStore } from '../store'
import { Empty } from './ui'

export function Moderation() {
  const { resources, persona, dispatch, notify } = useStore()
  const pending = resources.filter((r) => r.status === 'pending')
  const held = resources.filter((r) => r.status === 'held')
  const unreviewed = resources.filter((r) => r.status === 'published' && !currentCurriculumReview(r))

  if (persona.role !== 'moderator') {
    return (
      <div className="page">
        <h1>Review queue</h1>
        <Empty title="Only the demo moderator can use the review queue">
          <p>
            {pending.length} waiting, {held.length} on hold. Switch persona to publish or hold packs.
          </p>
          <button
            className="button"
            onClick={() => {
              dispatch({ type: 'select-persona', personaId: 'p-mod' })
              notify('Now browsing as the demo moderator.')
            }}
          >
            Switch to demo moderator
          </button>
        </Empty>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Review queue</h1>
      <p className="muted">
        This demonstrates the workflow. Publishing checks the files, the permission statement and that no learner
        information is included. Curriculum review is a separate step. Both are simulated: no expert or DepEd reviewer
        is involved.
      </p>
      <section aria-labelledby="pending-title">
        <h2 id="pending-title">Waiting for review ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="muted">Nothing is waiting. New submissions from Share a lesson appear here.</p>
        ) : (
          <ul className="queue">{pending.map((r) => <QueueItem key={r.id} resource={r} />)}</ul>
        )}
      </section>
      <section aria-labelledby="unreviewed-title">
        <h2 id="unreviewed-title">Published, not yet curriculum-reviewed ({unreviewed.length})</h2>
        <p className="muted small">
          Marking a pack reviewed covers its current version only. A new version or an adaptation starts unreviewed.
        </p>
        {unreviewed.length === 0 ? (
          <p className="muted">Every published pack has a review for its current version.</p>
        ) : (
          <ul className="queue">{unreviewed.map((r) => <ReviewItem key={r.id} resource={r} />)}</ul>
        )}
      </section>
      <section aria-labelledby="held-title">
        <h2 id="held-title">On hold ({held.length})</h2>
        {held.length === 0 ? (
          <p className="muted">No packs are on hold.</p>
        ) : (
          <ul className="queue">{held.map((r) => <QueueItem key={r.id} resource={r} />)}</ul>
        )}
      </section>
    </div>
  )
}

function QueueItem({ resource }: { resource: Resource }) {
  const { personaById, dispatch, notify } = useStore()
  const [holdReason, setHoldReason] = useState('')
  const reasonId = `hold-${resource.id}`
  return (
    <li className="panel queue-item">
      <h3>
        <a href={`#/resource/${resource.id}`}>{resource.title}</a>
      </h3>
      <p className="muted small">
        {resource.grade} {resource.subject}, by {personaById(resource.contributorId)?.alias}. {resource.files.length} file
        {resource.files.length === 1 ? '' : 's'}.
      </p>
      {resource.parent && (
        <p className="small">
          Adaptation of “{resource.parent.title}” version {resource.parent.version}. Change note: {resource.changeNote}
        </p>
      )}
      {resource.holdReason && <p className="small">Reported: {resource.holdReason}</p>}
      <p className="small">{resource.permission.notice}</p>
      <div className="queue-actions">
        <button
          className="button"
          onClick={() => {
            dispatch({ type: 'set-status', resourceId: resource.id, status: 'published' })
            notify(`Published “${resource.title}”.`)
          }}
        >
          Publish
        </button>
        {resource.status === 'pending' && (
          <>
            <label className="visually-hidden" htmlFor={reasonId}>
              Reason for hold
            </label>
            <input
              id={reasonId}
              placeholder="Reason for hold (optional)"
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
            />
            <button
              className="button button-quiet"
              onClick={() => {
                dispatch({
                  type: 'set-status',
                  resourceId: resource.id,
                  status: 'held',
                  holdReason: holdReason.trim() || 'Held by demo moderator',
                })
                notify(`Held “${resource.title}”.`)
              }}
            >
              Hold
            </button>
          </>
        )}
      </div>
    </li>
  )
}

function ReviewItem({ resource }: { resource: Resource }) {
  const { personaById, persona, dispatch, notify } = useStore()
  return (
    <li className="panel queue-item">
      <h3>
        <a href={`#/resource/${resource.id}`}>{resource.title}</a>
      </h3>
      <p className="muted small">
        {resource.grade} {resource.subject}, version {resource.version.label}, by {personaById(resource.contributorId)?.alias}.
        Targets {bowLabel(resource)}: {competencyLabel(resource)}.
      </p>
      <div className="queue-actions">
        <button
          className="button"
          onClick={() => {
            try {
              dispatch({
                type: 'mark-curriculum-reviewed',
                resource,
                role: persona.role,
                date: new Date().toISOString().slice(0, 10),
              })
              notify(`Marked “${resource.title}” version ${resource.version.label} as curriculum-reviewed (simulated).`)
            } catch (e) {
              notify(e instanceof DemoRuleError ? e.message : 'The review couldn’t be saved.')
            }
          }}
        >
          Mark curriculum-reviewed (simulated)
        </button>
      </div>
    </li>
  )
}
