import type { Resource, ResourceFile } from './domain/types'
import { getFile } from './storage/fileStore'

export class FileUnavailableError extends Error {}

export function lessonPlanFiles(resource: Resource): ResourceFile[] {
  const explicit = resource.files.filter((file) => file.category === 'lesson-plan')
  if (explicit.length) return explicit
  const free = resource.files.filter((file) => file.required && file.samplePricePhp === undefined && file.category !== 'supplement')
  const named = free.filter((file) => /lesson[ -]?plan/i.test(`${file.name} ${file.label}`))
  return named.length ? named : free.slice(0, 1)
}

export async function fetchFileBlob(file: ResourceFile): Promise<Blob> {
  if (file.source.type === 'local') {
    let blob: Blob | undefined
    try {
      blob = await getFile(file.source.key)
    } catch {
      throw new FileUnavailableError('This browser’s file storage could not be read.')
    }
    if (!blob) throw new FileUnavailableError('This file is no longer stored in this browser. It may have been cleared by a reset.')
    return blob
  }
  let response: Response
  try {
    response = await fetch(file.source.url, { cache: 'no-store' })
  } catch {
    throw new FileUnavailableError('The file could not be reached. Check your connection and try again.')
  }
  const type = response.headers.get('content-type') ?? ''
  // The dev server answers unknown paths with index.html, so treat HTML as missing too.
  if (!response.ok || type.includes('text/html')) {
    throw new FileUnavailableError('This file is missing from the lesson pack. The other files can still be downloaded.')
  }
  return response.blob()
}

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function extension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

/** "Grade4_Science_Quarter2…revised_v3.docx": keeps the start and the extension, drops the middle. */
export function shortFileName(name: string, max = 42): string {
  if (name.length <= max) return name
  const ext = extension(name)
  const tail = ext ? Math.min(14, Math.floor(max / 3)) + ext.length + 1 : Math.floor(max / 3)
  return `${name.slice(0, max - tail - 1)}…${name.slice(-tail)}`
}

export type PreviewKind = 'pdf' | 'image' | 'text' | 'docx' | 'video'

/** How a file can be shown in the browser, or null when it can only be downloaded. */
export function previewKind(name: string): PreviewKind | null {
  const ext = extension(name)
  if (ext === 'pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg'].includes(ext)) return 'image'
  if (ext === 'txt') return 'text'
  if (ext === 'docx') return 'docx'
  if (['mp4', 'webm', 'mov'].includes(ext)) return 'video'
  return null
}

/** Shown wherever teachers pick files, so they know what will preview. */
export const PREVIEWABLE_TYPES_LABEL = 'PDF, Word (.docx), images, text and video preview here. PowerPoint, Excel and .doc files download only.'

export const ACCEPTED_EXTENSIONS = ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'odt', 'odp', 'pdf', 'txt', 'png', 'jpg', 'jpeg', 'mp4', 'webm', 'mov']
export const MAX_FILE_BYTES = 15 * 1024 * 1024
