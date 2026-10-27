import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { PickedFile } from './FilePicker'
import { cn } from '@/lib/utils'
import type { PreviewPage } from '@/lib/document-preview'

export function PagePreviewEditor({ picked, onChange }: { picked: PickedFile; onChange: (pages: PreviewPage[]) => void }) {
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  async function load(file: File) {
    setBusy(true)
    setError('')
    try {
      const { renderPreviewPages } = await import('@/lib/document-preview')
      onChange(await renderPreviewPages(file))
      setOpen(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The pages couldn’t load. Try again.')
    } finally {
      setBusy(false)
    }
  }
  const direct = /\.(pdf|png|jpe?g)$/i.test(picked.file.name)
  const pages = picked.previewPages
  const readable = pages?.filter((page) => !page.blurred).length ?? 0
  return (
    <section className="mt-2 rounded-lg bg-secondary/50 px-2.5 py-2" aria-label={`Buyer preview for ${picked.label || picked.file.name}`}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto text-xs">
          <span className="font-semibold">Buyer preview</span>
          <span className="text-muted-foreground">
            {' · '}
            {pages ? `${readable} of ${pages.length} ${pages.length === 1 ? 'page' : 'pages'} readable, ${pages.length - readable} blurred` : direct ? 'Choose which pages buyers can read' : 'No online preview. Buyers download it to open it.'}
          </span>
        </p>
        {pages && <Button type="button" size="sm" variant="ghost" className="h-7" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Done' : 'Edit pages'}</Button>}
        {direct && !pages && <Button type="button" size="sm" variant="outline" className="h-7" disabled={busy} onClick={() => void load(picked.file)}>{busy ? 'Loading pages…' : 'Choose pages'}</Button>}
      </div>
      {pages && open && (
        <>
          <p className="mt-2 text-xs text-muted-foreground">Tap a page to blur or show it. Blurred pages still appear to buyers, marked as locked.</p>
          <div className="mt-2 grid max-h-72 grid-cols-3 gap-2 overflow-y-auto p-1 sm:grid-cols-4">
            {pages.map((page, index) => <PageTile key={index} page={page} number={index + 1} onToggle={() => onChange(pages.map((item, i) => i === index ? { ...item, blurred: !item.blurred } : item))} />)}
          </div>
        </>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    </section>
  )
}

function PageTile({ page, number, onToggle }: { page: PreviewPage; number: number; onToggle: () => void }) {
  const [url, setUrl] = useState('')
  useEffect(() => { const next = URL.createObjectURL(page.blob); setUrl(next); return () => URL.revokeObjectURL(next) }, [page.blob])
  return (
    <button type="button" aria-pressed={page.blurred} aria-label={`Blur page ${number}`} onClick={onToggle} className={cn('overflow-hidden rounded-lg border-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring', page.blurred ? 'border-primary' : 'border-border')}>
      <div className="relative h-28 overflow-hidden bg-white"><img src={url} alt={`Page ${number}`} className={cn('h-full w-full object-contain', page.blurred && 'blur-md')} />{page.blurred && <span className="absolute inset-0 grid place-items-center text-sm font-semibold text-black">Blurred</span>}</div>
      <span className="block bg-secondary px-2 py-1.5 text-xs">Page {number} · {page.blurred ? 'Blurred' : 'Visible'}</span>
    </button>
  )
}
