import { useState } from 'react'
import { hasAcquiredFile, plural } from '@/domain/logic'
import type { Resource, ResourceFile } from '@/domain/types'
import { fetchFileBlob, FileUnavailableError, lessonPlanFiles, saveBlob } from '@/files'
import { useStore } from '@/store'

/**
 * Download state shared by the trust card, the mobile download bar and the files list,
 * so every Download button shows the same progress and errors.
 */
export function usePackDownloads(resource: Resource) {
  const { state, persona, dispatch, notify } = useStore()
  const [busy, setBusy] = useState<string | null>(null)
  const [packBusy, setPackBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [packError, setPackError] = useState('')

  const canDownload = resource.status === 'published' || resource.contributorId === persona.id || persona.role === 'moderator'
  const isLocked = (file: ResourceFile) =>
    (file.samplePricePhp !== undefined || (file.category === 'supplement' && !!resource.supplementBundle)) && !hasAcquiredFile(state, resource.id, file.id) && resource.contributorId !== persona.id
  /** What the main Download button gets: the files needed to teach the lesson, minus locked supplements. */
  const packFiles = lessonPlanFiles(resource).filter((f) => !isLocked(f))

  async function fetchAndSave(file: ResourceFile): Promise<boolean> {
    setErrors((e) => ({ ...e, [file.id]: '' }))
    try {
      const blob = await fetchFileBlob(file)
      saveBlob(blob, file.name)
      if (resource.status === 'published') {
        dispatch({ type: 'record-download', resourceId: resource.id, fileId: file.id, at: new Date().toISOString() })
      }
      return true
    } catch (error) {
      const message = error instanceof FileUnavailableError ? error.message : 'The download failed. Try again.'
      setErrors((e) => ({ ...e, [file.id]: message }))
      return false
    }
  }

  async function download(file: ResourceFile) {
    if (!canDownload || isLocked(file)) return
    setBusy(file.id)
    try {
      if (await fetchAndSave(file)) notify(`Downloading ${file.name}.`)
    } finally {
      setBusy(null)
    }
  }

  /** Downloads each required file in turn. Each file is recorded as its own download, as before. */
  async function downloadPack() {
    if (packFiles.length === 0) return
    setPackBusy(true)
    setPackError('')
    let ok = 0
    try {
      for (const [i, file] of packFiles.entries()) {
        setBusy(file.id)
        if (await fetchAndSave(file)) ok++
        // A short gap keeps browsers from dropping back-to-back downloads.
        if (i < packFiles.length - 1) await new Promise((r) => setTimeout(r, 400))
      }
    } finally {
      setBusy(null)
      setPackBusy(false)
    }
    const failed = packFiles.length - ok
    if (failed === 0) {
      notify(packFiles.length === 1 ? `Downloading ${packFiles[0].name}.` : `Downloading ${plural(packFiles.length, 'file')}.`)
    } else {
      const message =
        ok === 0
          ? 'Download failed. Try again.'
          : `${plural(failed, 'file')} failed. Try again.`
      setPackError(message)
      notify(message)
    }
  }

  return { canDownload, isLocked, packFiles, busy, packBusy, errors, packError, download, downloadPack }
}

export type PackDownloads = ReturnType<typeof usePackDownloads>
