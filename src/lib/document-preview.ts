import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerUrl

export interface PreviewPage {
  blob: Blob
  blurred: boolean
}

export async function renderPreviewPages(file: File): Promise<PreviewPage[]> {
  if (file.size > 15 * 1024 * 1024) throw new Error('Choose a preview smaller than 15 MB.')
  if (/\.pdf$/i.test(file.name)) {
    const task = getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
    try {
      const pdf = await task.promise
      if (pdf.numPages > 60) throw new Error('Preview supports up to 60 pages. Upload a shorter PDF preview.')
      const pages: PreviewPage[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const base = page.getViewport({ scale: 1 })
        const viewport = page.getViewport({ scale: Math.min(1.5, 900 / base.width) })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Page previews are unavailable in this browser.')
        await page.render({ canvas, canvasContext: context, viewport }).promise
        pages.push({ blob: await canvasBlob(canvas), blurred: true })
        page.cleanup()
      }
      return pages
    } finally {
      await task.destroy()
    }
  }
  if (!/\.(png|jpe?g)$/i.test(file.name)) throw new Error('Use a PDF, PNG, or JPG preview copy.')
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, 900 / bitmap.width)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Image previews are unavailable in this browser.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return [{ blob: await canvasBlob(canvas), blurred: true }]
  } finally {
    bitmap.close()
  }
}

export async function exportPreviewPage(page: PreviewPage): Promise<Blob> {
  if (!page.blurred) return page.blob
  const bitmap = await createImageBitmap(page.blob)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('The blurred preview could not be created.')
    context.fillStyle = '#eee9e3'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.filter = 'blur(18px)'
    context.drawImage(bitmap, 0, 0)
    return await canvasBlob(canvas)
  } finally {
    bitmap.close()
  }
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The page preview could not be created.')), 'image/webp', 0.8))
}
