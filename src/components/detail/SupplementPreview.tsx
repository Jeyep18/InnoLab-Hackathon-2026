import { Eye, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import type { ResourceFile } from '@/domain/types'
import { fetchFileBlob } from '@/files'
import { cn } from '@/lib/utils'
import { DocumentPages } from './Preview'

type PreviewPageInfo = NonNullable<ResourceFile['previewPages']>[number]

/** "4 pages · 1 readable, 3 locked" for a paid file's contributor-chosen preview. */
export function previewSummary(file: ResourceFile): string | null {
  const pages = file.previewPages
  if (!pages?.length) return null
  const locked = pages.filter((page) => page.blurred).length
  const total = `${pages.length} ${pages.length === 1 ? 'page' : 'pages'}`
  if (locked === 0) return `${total} · all readable`
  if (locked === pages.length) return `${total} · all locked`
  return `${total} · ${pages.length - locked} readable, ${locked} locked`
}

/**
 * Preview of one supplementary file. Buyers who haven't unlocked it see every page the
 * contributor exported, readable or blurred, so it's clear how much is still locked.
 * Owners and buyers who unlocked it can switch to the full file.
 */
export function SupplementPreview({ file, unlocked = false, owner = false, unlockLabel, onUnlock }: { file: ResourceFile; unlocked?: boolean; owner?: boolean; unlockLabel?: string; onUnlock?: () => void }) {
  const [open, setOpen] = useState(false)
  const hasBuyerView = !!file.previewPages?.length
  const [view, setView] = useState<'buyer' | 'full'>(owner || !unlocked ? 'buyer' : 'full')
  const showBuyer = hasBuyerView && (!unlocked || view === 'buyer')
  const unlock = !unlocked && onUnlock ? () => { setOpen(false); onUnlock() } : undefined
  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Eye aria-hidden="true" /> Preview<span className="sr-only"> {file.label}</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[88dvh] flex-col gap-0 p-0 sm:max-w-3xl">
          <DialogHeader className="border-b p-4 pr-12">
            <DialogTitle>{file.label}</DialogTitle>
            <DialogDescription>{showBuyer ? 'Pages the contributor chose to show before purchase' : 'Full file'}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
          {unlocked && hasBuyerView && (
            <div role="group" aria-label="Preview mode" className="flex w-fit gap-1 rounded-lg bg-secondary p-1">
              {(['buyer', 'full'] as const).map((mode) => (
                <Button key={mode} type="button" size="sm" variant={view === mode ? 'default' : 'ghost'} aria-pressed={view === mode} onClick={() => setView(mode)} className="h-8">
                  {mode === 'buyer' ? 'What buyers see' : 'Full file'}
                </Button>
              ))}
            </div>
          )}
          {showBuyer ? <BuyerPages file={file} owner={owner} unlockLabel={unlockLabel} onUnlock={unlock} /> : unlocked ? <DocumentPages file={file} /> : (
            <p className="flex items-center justify-center gap-2 rounded-xl bg-secondary p-8 text-center text-sm">
              <Lock aria-hidden="true" className="size-4" /> Unlocks with the bundle
            </p>
          )}
          </div>
          {!unlocked && onUnlock && (
            <div className="flex items-center justify-between gap-3 border-t p-4">
              <p className="text-sm text-muted-foreground">Unlock every page and file in the bundle.</p>
              <Button onClick={unlock}><Lock aria-hidden="true" /> {unlockLabel ?? 'Unlock bundle'}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function BuyerPages({ file, owner, unlockLabel, onUnlock }: { file: ResourceFile; owner: boolean; unlockLabel?: string; onUnlock?: () => void }) {
  const pages = file.previewPages!
  const locked = pages.filter((page) => page.blurred).length
  return (
    <div className="space-y-3">
      {locked > 0 && (
        <p className="flex items-start gap-2 rounded-xl border border-primary/30 bg-secondary p-3 text-sm">
          <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-mauve-ink" />
          <span>
            <strong className="font-semibold">{pages.length - locked} of {pages.length} pages readable.</strong>{' '}
            {owner ? `Buyers see the other ${locked} blurred until they buy the bundle.` : `The other ${locked} ${locked === 1 ? 'page unlocks' : 'pages unlock'} with the bundle.`}
          </span>
        </p>
      )}
      {pages.map((page) => <PreviewPage key={page.page} file={file} page={page} total={pages.length} unlockLabel={unlockLabel} onUnlock={onUnlock} />)}
    </div>
  )
}

function PreviewPage({ file, page, total, unlockLabel, onUnlock }: { file: ResourceFile; page: PreviewPageInfo; total: number; unlockLabel?: string; onUnlock?: () => void }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    let objectUrl = ''
    fetchFileBlob({ ...file, source: page.source }).then((blob) => {
      if (!active) return
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    }).catch(() => { if (active) setError(true) })
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [file, page])
  return (
    <figure className={cn('relative overflow-hidden rounded-xl border bg-secondary', page.blurred && 'border-dashed')}>
      {error ? <p role="alert" className="p-6 text-sm text-destructive">Preview unavailable.</p> : url ? (
        <img src={url} alt={page.blurred ? `Page ${page.page} of ${total}, locked and blurred` : `Page ${page.page} of ${total}`} className={cn('w-full', page.blurred && 'opacity-80')} />
      ) : <p role="status" className="p-6 text-sm">Loading…</p>}
      {page.blurred && url && (
        <div className="absolute inset-0 grid place-items-center bg-background/20">
          {onUnlock ? (
            <button type="button" onClick={onUnlock} className="flex cursor-pointer items-center gap-2 rounded-full bg-foreground/90 px-4 py-2 text-sm font-semibold text-background shadow-lg outline-none transition-transform hover:scale-[1.03] focus-visible:ring-3 focus-visible:ring-ring active:scale-[0.98] motion-reduce:transition-none">
              <Lock aria-hidden="true" className="size-4" /> Page {page.page} locked · {unlockLabel ?? 'Unlock bundle'}
            </button>
          ) : (
            <span aria-hidden="true" className="flex items-center gap-2 rounded-full bg-foreground/85 px-4 py-2 text-sm font-semibold text-background shadow-lg">
              <Lock className="size-4" /> Page {page.page} · Unlocks with bundle
            </span>
          )}
        </div>
      )}
      <figcaption className="absolute top-2 left-2 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm">
        Page {page.page} of {total} · {page.blurred ? 'Locked' : 'Free preview'}
      </figcaption>
    </figure>
  )
}
