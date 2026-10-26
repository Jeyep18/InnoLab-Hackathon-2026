import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { PickedFile } from './FilePicker'
import { cn } from '@/lib/utils'
import type { PreviewPage } from '@/lib/document-preview'

export function PagePreviewEditor({ picked, onChange }: { picked: PickedFile; onChange: (pages: PreviewPage[]) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function load(file: File) {
    setBusy(true)
    setError('')
    try {
      const { renderPreviewPages } = await import('@/lib/document-preview')
      onChange(await renderPreviewPages(file))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The preview could not load. Try a PDF copy.')
    } finally {
      setBusy(false)
    }
  }
  const direct = /\.(pdf|png|jpe?g)$/i.test(picked.file.name)
  return (
    <section className="mt-3 border-t pt-3" aria-label={`Preview settings for ${picked.file.name}`}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto text-sm font-semibold">Buyer preview</p>
        {direct && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void load(picked.file)}>{busy ? 'Loading pages…' : picked.previewPages ? 'Reload pages' : 'Choose pages to blur'}</Button>}
        <label className="cursor-pointer rounded-md border px-3 py-2 text-sm font-medium focus-within:ring-2 focus-within:ring-ring">
          {busy ? 'Loading…' : 'Upload PDF preview'}
          <input aria-label={`Upload preview for ${picked.file.name}`} type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void load(file); event.target.value = '' }} />
        </label>
      </div>
      {picked.previewPages ? (
        <>
          <p className="mt-2 text-xs text-muted-foreground">Select pages to blur. Unselected pages stay readable.</p>
          <div className="mt-3 grid max-h-80 grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3">
            {picked.previewPages.map((page, index) => <PageTile key={index} page={page} number={index + 1} onToggle={() => onChange(picked.previewPages!.map((item, i) => i === index ? { ...item, blurred: !item.blurred } : item))} />)}
          </div>
        </>
      ) : <p className="mt-2 text-xs text-muted-foreground">{direct ? 'Load the pages, then choose what buyers can read.' : 'Add a PDF preview copy to choose visible pages.'}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    </section>
  )
}

function PageTile({ page, number, onToggle }: { page: PreviewPage; number: number; onToggle: () => void }) {
  const [url, setUrl] = useState('')
  useEffect(() => { const next = URL.createObjectURL(page.blob); setUrl(next); return () => URL.revokeObjectURL(next) }, [page.blob])
  return (
    <button type="button" aria-pressed={page.blurred} aria-label={`Blur page ${number}`} onClick={onToggle} className={cn('overflow-hidden rounded-lg border-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring', page.blurred ? 'border-primary' : 'border-border')}>
      <div className="relative h-36 overflow-hidden bg-white"><img src={url} alt={`Page ${number}`} className={cn('h-full w-full object-contain', page.blurred && 'blur-md')} />{page.blurred && <span className="absolute inset-0 grid place-items-center text-sm font-semibold text-black">Blurred</span>}</div>
      <span className="block bg-secondary px-2 py-1.5 text-xs">Page {number} · {page.blurred ? 'Blurred' : 'Visible'}</span>
    </button>
  )
}
