import { useEffect, useId, useState } from 'react'
import { bowLabel, isBookmarked } from '../domain/logic'
import type { Resource } from '../domain/types'
import { extension, fetchFileBlob } from '../files'
import { navigate } from '../router'
import { useStore } from '../store'
import { FilesPanel } from './FilesPanel'
import { ReviewsPanel } from './ReviewsPanel'
import { TrustPanel } from './TrustPanel'
import { Dialog, Empty, ErrorText } from './ui'

const STATUS_TEXT = {
  published: 'Published after demo moderation',
  pending: 'Waiting for demo moderation. Only you and the moderator can see it.',
  held: 'On hold and hidden from search',
}

export function ResourceDetail({ id }: { id: string }) {
  const { resources, state, persona, personaById, dispatch, notify } = useStore()
  const [reporting, setReporting] = useState(false)
  const resource = resources.find((r) => r.id === id)

  if (!resource) {
    return (
      <Empty title="This lesson pack isn’t here">
        <p>It may have been removed by a demo reset.</p>
        <a className="button" href="#/">
          Browse lesson packs
        </a>
      </Empty>
    )
  }

  const canSee = resource.status === 'published' || resource.contributorId === persona.id || persona.role === 'moderator'
  if (!canSee) {
    return (
      <Empty title="This lesson pack isn’t published">
        <p>It’s waiting for review or on hold. Switch to the demo moderator persona to see it.</p>
        <a className="button" href="#/">
          Browse lesson packs
        </a>
      </Empty>
    )
  }

  const contributor = personaById(resource.contributorId)
  const adaptations = resources.filter((r) => r.parent?.resourceId === resource.id && r.status === 'published')
  const saved = isBookmarked(state, resource.id)
  const isTeacher = persona.role === 'teacher'

  return (
    <div className="page detail">
      <p>
        <a className="text-link" href="#/">
          Back to lesson packs
        </a>
      </p>

      <header className="detail-head">
        <p className="card-kicker">
          {resource.grade} {resource.subject}
          <span className="card-week">
            {bowLabel(resource)}
          </span>
        </p>
        <h1>{resource.title}</h1>
        <p className="lede">{resource.summary}</p>
        {resource.status !== 'published' && (
          <p className={`status status-${resource.status}`}>
            {STATUS_TEXT[resource.status]}
            {resource.holdReason && ` Reason: ${resource.holdReason}`}
          </p>
        )}
      </header>

      <TrustPanel resource={resource} />

      {isTeacher && resource.status === 'published' && (
        <div className="detail-actions">
          <button
            className={saved ? 'button button-quiet' : 'button'}
            aria-pressed={saved}
            onClick={() => {
              dispatch({ type: 'toggle-bookmark', resourceId: resource.id })
              notify(saved ? 'Removed from saved.' : 'Saved. Find it under Saved.')
            }}
          >
            {saved ? 'Saved' : 'Save for later'}
          </button>
          {resource.contributorId !== persona.id && (
            <button className="button button-quiet" onClick={() => setReporting(true)}>
              Report a problem
            </button>
          )}
        </div>
      )}

      <div className="detail-layout">
        <div className="detail-main">
          <Preview resource={resource} />
          <FilesPanel resource={resource} />
          {isTeacher && resource.status === 'published' && (
            <div className="adapt-callout">
              <p>
                Changed this pack for your class? Share your version as an adaptation. It credits{' '}
                {contributor?.alias ?? 'the original contributor'} and leaves the original unchanged.
              </p>
              <a className="button button-quiet" href={`#/share?adapt=${resource.id}`}>
                Share an adaptation
              </a>
            </div>
          )}
          <ReviewsPanel resource={resource} />
        </div>

        <aside className="detail-side">
          <section className="panel">
            <h2>What your classroom needs</h2>
            <ul className="plain-list">
              {resource.requirements.map((req) => (
                <li key={req}>{req}</li>
              ))}
            </ul>
            {resource.requirements.length === 0 && <p className="muted">The contributor didn’t list any.</p>}
          </section>

          <section className="panel">
            <h2>Curriculum target</h2>
            <dl className="facts">
              <dt>Competency</dt>
              <dd>
                {resource.competency.text}
                {resource.competency.code && <span className="muted small"> ({resource.competency.code})</span>}
              </dd>
              <dt>Budget of Work</dt>
              <dd>
                {resource.bow.version}, {bowLabel(resource)}
              </dd>
            </dl>
            {resource.permission.kind === 'fictional-sample' && (
              <p className="muted small">This sample uses example codes and weeks, not official DepEd alignment.</p>
            )}
          </section>

          {resource.parent && (
            <section className="panel">
              <h2>What changed from the original</h2>
              <p>{resource.changeNote ?? 'No change note given.'}</p>
              <p className="muted small">
                The original is unchanged. Any review of the original doesn’t carry over to this adaptation.
              </p>
            </section>
          )}

          {adaptations.length > 0 && (
            <section className="panel">
              <h2>Adaptations by other teachers</h2>
              <ul className="plain-list">
                {adaptations.map((a) => (
                  <li key={a.id}>
                    <a href={`#/resource/${a.id}`}>{a.title}</a>
                    <span className="muted small"> by {personaById(a.contributorId)?.alias}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="panel">
            <h2>Permission and sources</h2>
            <p>{resource.permission.notice}</p>
            <ul className="plain-list">
              {resource.references.map((ref) => (
                <li key={ref.label}>{ref.url ? <a href={ref.url}>{ref.label}</a> : ref.label}</li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>Version history</h2>
            <ol className="versions">
              <li>
                <strong>Version {resource.version.label}</strong>, {resource.version.date}: {resource.version.note}
              </li>
              {resource.history.map((v) => (
                <li key={v.label}>
                  Version {v.label}, {v.date}: {v.note}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <ReportDialog resource={resource} open={reporting} onClose={() => setReporting(false)} />
    </div>
  )
}

function Preview({ resource }: { resource: Resource }) {
  if (resource.lesson) {
    return (
      <section className="sheet-wrap" aria-labelledby="preview-title">
        <h2 id="preview-title" className="visually-hidden">
          Lesson preview
        </h2>
        <article className="sheet">
          <p className="sheet-meta">
            {resource.grade} {resource.subject}, {bowLabel(resource)}
          </p>
          <h3>{resource.title}</h3>
          <p className="sheet-objective">
            <strong>Objective.</strong> {resource.lesson.objective}
          </p>
          {resource.lesson.sections.map((section) => {
            const List = section.heading === 'Procedure' ? 'ol' : 'ul'
            return (
              <div key={section.heading}>
                <h4>{section.heading}</h4>
                <List>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </List>
              </div>
            )
          })}
        </article>
        <p className="muted small">Preview of the lesson plan file. Download for the full editable version.</p>
      </section>
    )
  }
  return <UploadedPreview resource={resource} />
}

const PREVIEWABLE = new Set(['pdf', 'png', 'jpg', 'jpeg', 'txt'])

function UploadedPreview({ resource }: { resource: Resource }) {
  const file = resource.files.find((f) => PREVIEWABLE.has(extension(f.name)))
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!file) return
    let objectUrl: string | null = null
    let cancelled = false
    fetchFileBlob(file)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  if (!file) {
    return (
      <section className="panel">
        <h2>Preview</h2>
        <p className="muted">
          These file types can’t be previewed in the browser. Download them to open in Word, Google Docs, LibreOffice or WPS.
        </p>
      </section>
    )
  }
  const ext = extension(file.name)
  return (
    <section className="panel">
      <h2>Preview of {file.name}</h2>
      {failed && <p className="error-text">The preview couldn’t load. The file may have been cleared from this browser.</p>}
      {url && ['png', 'jpg', 'jpeg'].includes(ext) && <img className="upload-preview" src={url} alt={`Preview of ${file.name}`} />}
      {url && ['pdf', 'txt'].includes(ext) && <iframe className="upload-preview" src={url} title={`Preview of ${file.name}`} />}
    </section>
  )
}

function ReportDialog({ resource, open, onClose }: { resource: Resource; open: boolean; onClose: () => void }) {
  const { dispatch, notify } = useStore()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const fieldId = useId()

  return (
    <Dialog open={open} title="Report a problem with this pack" onClose={onClose}>
      <p>The pack is hidden from search until the demo moderator looks at it.</p>
      <label htmlFor={fieldId}>What’s wrong?</label>
      <textarea
        id={fieldId}
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. contains a learner’s name, copied without permission, wrong grade"
      />
      <ErrorText>{error}</ErrorText>
      <div className="actions">
        <button
          className="button"
          onClick={() => {
            if (!reason.trim()) return setError('Describe the problem so the moderator can check it.')
            dispatch({ type: 'set-status', resourceId: resource.id, status: 'held', holdReason: reason.trim() })
            setReason('')
            setError('')
            onClose()
            notify('Reported. The pack is on hold until the demo moderator reviews it.')
            navigate('/')
          }}
        >
          Report and hold
        </button>
        <button className="button button-quiet" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Dialog>
  )
}
