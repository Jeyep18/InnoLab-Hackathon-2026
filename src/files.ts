import type { ResourceFile } from './domain/types'
import { getFile } from './storage/fileStore'

export class FileUnavailableError extends Error {}

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
    throw new FileUnavailableError('The file could not be reached. Check that the local demo server is still running.')
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

export const ACCEPTED_EXTENSIONS = ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'odt', 'odp', 'pdf', 'txt', 'png', 'jpg', 'jpeg']
export const MAX_FILE_BYTES = 15 * 1024 * 1024
