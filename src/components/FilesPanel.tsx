import { useState } from 'react'
import { formatBytes, hasAcquiredFile } from '../domain/logic'
import type { Resource, ResourceFile } from '../domain/types'
import { extension, fetchFileBlob, FileUnavailableError, saveBlob } from '../files'
import { useStore } from '../store'
import { Dialog } from './ui'

export function FilesPanel({ resource }: { resource: Resource }) {
  const { state, persona, dispatch, notify } = useStore()
  const [busy, setBusy] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [checkout, setCheckout] = useState<ResourceFile | null>(null)
  const canDownload = resource.status === 'published' || resource.contributorId === persona.id || persona.role === 'moderator'

  async function download(file: ResourceFile) {
    setBusy(file.id)
    setErrors((e) => ({ ...e, [file.id]: '' }))
    try {
      const blob = await fetchFileBlob(file)
      saveBlob(blob, file.name)
      if (resource.status === 'published') {
        dispatch({ type: 'record-download', resourceId: resource.id, fileId: file.id, at: new Date().toISOString() })
      }
      notify(`Downloading ${file.name}.`)
    } catch (error) {
      const message = error instanceof FileUnavailableError ? error.message : 'The download failed. Try again.'
      setErrors((e) => ({ ...e, [file.id]: message }))
    } finally {
      setBusy(null)
    }
  }

  const required = resource.files.filter((f) => f.required)
  const optional = resource.files.filter((f) => !f.required)

  const renderFile = (file: ResourceFile) => {
    const locked = file.samplePricePhp !== undefined && !hasAcquiredFile(state, resource.id, file.id) && resource.contributorId !== persona.id
    const errorId = `file-error-${file.id}`
    return (
      <li key={file.id} className="file-row">
        <div className="file-info">
          <span className="file-label">{file.label}</span>
          <span className="muted">
            {file.name}
            {file.sizeBytes !== undefined && `, ${formatBytes(file.sizeBytes)}`}
            {file.editable ? `, editable .${extension(file.name)}` : ''}
          </span>
          {file.samplePricePhp !== undefined && (
            <span className="price-note">Optional supplement, sample price ₱{file.samplePricePhp} (simulated)</span>
          )}
          {errors[file.id] && (
            <span className="error-text" id={errorId} role="alert">
              {errors[file.id]}
            </span>
          )}
        </div>
        {!canDownload ? null : locked ? (
          <button className="button button-quiet" onClick={() => setCheckout(file)}>
            Get supplement
          </button>
        ) : (
          <button
            className="button"
            onClick={() => download(file)}
            disabled={busy === file.id}
            aria-describedby={errors[file.id] ? errorId : undefined}
          >
            {busy === file.id ? 'Preparing…' : 'Download'}
            <span className="visually-hidden"> {file.label}</span>
          </button>
        )}
      </li>
    )
  }

  return (
    <section className="panel" aria-labelledby="files-title">
      <h2 id="files-title">Files in this pack</h2>
      <h3 className="file-group">Needed to teach the lesson</h3>
      <ul className="file-list">{required.map(renderFile)}</ul>
      {optional.length > 0 && (
        <>
          <h3 className="file-group">Optional extras</h3>
          <ul className="file-list">{optional.map(renderFile)}</ul>
        </>
      )}
      <p className="muted small">
        Files open in Word, Google Docs, LibreOffice or WPS. Edit your copy freely; the shared original stays unchanged.
      </p>

      <Dialog open={checkout !== null} title="Simulated checkout" onClose={() => setCheckout(null)}>
        <p>
          This shows how an optional paid supplement could work. <strong>No payment is collected</strong> and no card,
          wallet or account details are asked for. The ₱{checkout?.samplePricePhp} price is a sample.
        </p>
        <p className="muted small">The core lesson stays free. A browser-side unlock like this is not real access control.</p>
        <div className="actions">
          <button
            className="button"
            onClick={() => {
              if (!checkout) return
              dispatch({ type: 'acquire', resourceId: resource.id, fileId: checkout.id, simulatedPurchase: true })
              notify(`${checkout.label} unlocked for ${persona.alias} (simulated, no payment).`)
              setCheckout(null)
            }}
          >
            Unlock supplement (simulated)
          </button>
          <button className="button button-quiet" onClick={() => setCheckout(null)}>
            Cancel
          </button>
        </div>
      </Dialog>
    </section>
  )
}
