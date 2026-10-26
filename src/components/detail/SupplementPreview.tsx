import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import type { ResourceFile } from '@/domain/types'
import { fetchFileBlob } from '@/files'
import { DocumentPages } from './Preview'

export function SupplementPreview({ file, unlocked = false }: { file: ResourceFile; unlocked?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" variant="ghost" onClick={() => setOpen(true)}>Preview<span className="sr-only"> {file.label}</span></Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader><DialogTitle>{file.label}</DialogTitle><DialogDescription className="sr-only">Contributor-selected preview</DialogDescription></DialogHeader>
          {unlocked ? <DocumentPages file={file} /> : file.previewPages?.length ? file.previewPages.map((page) => <PreviewPage key={page.page} file={file} page={page} />) : <p className="rounded-xl bg-secondary p-8 text-center text-sm">Locked</p>}
        </DialogContent>
      </Dialog>
    </>
  )
}

function PreviewPage({ file, page }: { file: ResourceFile; page: NonNullable<ResourceFile['previewPages']>[number] }) {
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
  return <figure className="overflow-hidden rounded-xl border bg-secondary">{error ? <p role="alert" className="p-6 text-sm text-destructive">Preview unavailable.</p> : url ? <img src={url} alt={page.blurred ? `Page ${page.page}, blurred` : `Page ${page.page} of ${file.label}`} className="w-full" /> : <p role="status" className="p-6 text-sm">Loading…</p>}</figure>
}
