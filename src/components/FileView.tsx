import { FileText } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { extension, previewKind } from '@/files'

/**
 * Renders a file's contents in the page: PDF pages, images, plain text, Word (.docx) and video.
 * Anything else gets a clear "no preview" message instead of a broken frame.
 */
export function FileView({ blob, name, label }: { blob: Blob; name: string; label: string }) {
  const kind = previewKind(name)
  if (kind === 'pdf') return <PdfPages blob={blob} name={name} label={label} />
  if (kind === 'image') return <ObjectUrl blob={blob}>{(url) => <img src={url} alt={label} className="mx-auto w-full bg-white" />}</ObjectUrl>
  if (kind === 'video') return <ObjectUrl blob={blob}>{(url) => <video src={url} controls playsInline className="w-full rounded-lg bg-black" aria-label={label} />}</ObjectUrl>
  if (kind === 'text') return <TextView blob={blob} />
  if (kind === 'docx') return <DocxView blob={blob} />
  return <NoPreview name={name} />
}

export function NoPreview({ name }: { name: string }) {
  return (
    <div className="grid justify-items-center gap-2 rounded-xl bg-secondary/60 px-6 py-10 text-center">
      <FileText aria-hidden="true" className="size-8 text-muted-foreground" />
      <p className="font-medium">.{extension(name).toUpperCase() || 'This'} files can’t be previewed in the browser</p>
      <p className="max-w-sm text-sm text-muted-foreground">This file type can’t be previewed online. Download it to open it.</p>
    </div>
  )
}

function Loading() {
  return <p role="status" className="p-6 text-sm text-muted-foreground">Loading preview…</p>
}

function Failed() {
  return <p role="alert" className="p-6 text-sm text-destructive">Preview unavailable. The file may be damaged; downloading still works.</p>
}

function ObjectUrl({ blob, children }: { blob: Blob; children: (url: string) => ReactNode }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const next = URL.createObjectURL(blob)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [blob])
  return url ? children(url) : <Loading />
}

function TextView({ blob }: { blob: Blob }) {
  const [text, setText] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    void blob.text().then((value) => active && setText(value))
    return () => { active = false }
  }, [blob])
  return text === null ? <Loading /> : <pre className="whitespace-pre-wrap break-words bg-white p-6 font-sans text-sm text-black">{text}</pre>
}

function PdfPages({ blob, name, label }: { blob: Blob; name: string; label: string }) {
  const [pages, setPages] = useState<string[]>([])
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    const urls: string[] = []
    void (async () => {
      try {
        const { renderPreviewPages } = await import('@/lib/document-preview')
        const result = await renderPreviewPages(new File([blob], name, { type: 'application/pdf' }))
        if (!active) return
        for (const page of result) urls.push(URL.createObjectURL(page.blob))
        setPages([...urls])
      } catch {
        if (active) setError(true)
      }
    })()
    return () => { active = false; urls.forEach((url) => URL.revokeObjectURL(url)) }
  }, [blob, name])
  if (error) return <Failed />
  if (!pages.length) return <Loading />
  return <div className="space-y-3">{pages.map((url, index) => <img key={url} src={url} alt={`${label}, page ${index + 1}`} className="mx-auto w-full bg-white" loading={index ? 'lazy' : 'eager'} />)}</div>
}

/**
 * Word pages keep their real size and orientation (portrait or landscape) and are scaled down
 * as a whole to fit the preview, like a PDF viewer, so wide tables never reflow into a column.
 */
function DocxView({ blob }: { blob: Blob }) {
  const frame = useRef<HTMLDivElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  useEffect(() => {
    let active = true
    const el = container.current
    const outer = frame.current
    if (!el || !outer) return
    setState('loading')
    const fit = () => {
      const pages = [...el.querySelectorAll<HTMLElement>('section.docx')]
      if (!pages.length) return
      el.style.zoom = '1'
      const widest = Math.max(...pages.map((page) => page.offsetWidth)) + 24
      el.style.zoom = String(Math.min(1, outer.clientWidth / widest))
    }
    const observer = new ResizeObserver(fit)
    void (async () => {
      try {
        const { renderAsync } = await import('docx-preview')
        if (!active) return
        el.replaceChildren()
        await renderAsync(blob, el, el, { inWrapper: true, ignoreLastRenderedPageBreak: true, breakPages: true, experimental: false })
        if (!active) return
        fit()
        observer.observe(outer)
        setState('ready')
      } catch {
        if (active) setState('error')
      }
    })()
    return () => { active = false; observer.disconnect(); el.replaceChildren() }
  }, [blob])
  return (
    <div ref={frame} className="overflow-hidden">
      {state === 'loading' && <Loading />}
      {state === 'error' && <Failed />}
      <div ref={container} className="docx-view" hidden={state === 'error'} />
    </div>
  )
}
