import { Download, FileText, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatBytes } from '@/domain/logic'
import type { Resource, ResourceFile } from '@/domain/types'
import { extension } from '@/files'
import { useStore } from '@/store'
import { usePackDownloads, type PackDownloads } from './detail/usePackDownloads'

/** Files list. Pass `downloads` to share progress with other Download buttons on the page. */
export function FilesPanel({ resource, downloads }: { resource: Resource; downloads?: PackDownloads }) {
  const own = usePackDownloads(resource)
  const dl = downloads ?? own
  const required = resource.files.filter((f) => f.required)
  const optional = resource.files.filter((f) => !f.required)

  return (
    <section aria-labelledby="files-title" className="scroll-mt-24">
      <h2 id="files-title" className="text-2xl font-bold tracking-tight">
        Files in this pack
      </h2>
      <p className="mt-1 text-muted-foreground">
        Files open in Word, Google Docs, LibreOffice or WPS. Edit your copy freely; the shared original stays unchanged.
      </p>

      <FileGroup title="Needed to teach the lesson" files={required} dl={dl} />
      {optional.length > 0 && <FileGroup title="Optional extras" files={optional} dl={dl} />}

      <CheckoutDialog resource={resource} dl={dl} />
    </section>
  )
}

function FileGroup({ title, files, dl }: { title: string; files: ResourceFile[]; dl: PackDownloads }) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">{title}</h3>
      <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
        {files.map((file) => (
          <FileRow key={file.id} file={file} dl={dl} />
        ))}
      </ul>
    </div>
  )
}

function FileRow({ file, dl }: { file: ResourceFile; dl: PackDownloads }) {
  const locked = dl.isLocked(file)
  const errorId = `file-error-${file.id}`
  const error = dl.errors[file.id]
  const ext = extension(file.name)
  const busy = dl.busy === file.id

  return (
    <li className="flex flex-col gap-3 p-4 transition-colors hover:bg-secondary/40 sm:flex-row sm:items-center">
      <span aria-hidden="true" className="hidden size-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground sm:grid">
        <FileText className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{file.label}</p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span className="break-all">{file.name}</span>
          {file.sizeBytes !== undefined && <span className="tabular-nums">· {formatBytes(file.sizeBytes)}</span>}
          {file.editable && (
            <Badge variant="outline" className="text-muted-foreground">
              Editable .{ext}
            </Badge>
          )}
        </p>
        {file.samplePricePhp !== undefined && (
          <p className="mt-1.5 text-sm text-mauve-ink">
            Optional supplement, sample price ₱{file.samplePricePhp} (simulated checkout, no payment)
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
      {!dl.canDownload ? null : locked ? (
        <Button variant="outline" className="sm:w-auto" onClick={() => dl.setCheckout(file)}>
          <Lock aria-hidden="true" />
          Get supplement
          <span className="sr-only"> {file.label}</span>
        </Button>
      ) : (
        <Button variant="outline" onClick={() => dl.download(file)} disabled={busy} aria-describedby={error ? errorId : undefined}>
          <Download aria-hidden="true" />
          {busy ? 'Preparing…' : 'Download'}
          <span className="sr-only"> {file.label}</span>
        </Button>
      )}
    </li>
  )
}

function CheckoutDialog({ resource, dl }: { resource: Resource; dl: PackDownloads }) {
  const { persona, dispatch, notify } = useStore()
  const file = dl.checkout
  return (
    <Dialog open={file !== null} onOpenChange={(open) => !open && dl.setCheckout(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Simulated checkout</DialogTitle>
          <DialogDescription className="text-base text-foreground">
            This shows how an optional paid supplement could work. <strong>No payment is collected</strong> and no card, wallet or
            account details are asked for. The ₱{file?.samplePricePhp} price is a sample.
          </DialogDescription>
        </DialogHeader>
        {file && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-3">
            <span className="min-w-0">
              <span className="block truncate font-medium">{file.label}</span>
              <span className="block text-sm text-muted-foreground">Sample price, simulated checkout</span>
            </span>
            <span className="text-lg font-semibold tabular-nums">₱{file.samplePricePhp}</span>
          </div>
        )}
        <p className="text-sm text-muted-foreground">The core lesson stays free. A browser-side unlock like this is not real access control.</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={() => {
              if (!file) return
              dispatch({ type: 'acquire', resourceId: resource.id, fileId: file.id, simulatedPurchase: true })
              notify(`${file.label} unlocked for ${persona.alias} (simulated, no payment).`)
              dl.setCheckout(null)
            }}
          >
            Unlock supplement (simulated)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
