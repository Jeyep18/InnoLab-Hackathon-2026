import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/site/layout'
import { formatBytes, plural } from '@/domain/logic'
import { cn } from '@/lib/utils'
import { ShareLink } from '../ShareLink'
import { SaveToggle } from './SaveToggle'
import type { PackDownloads } from './usePackDownloads'
import type { PackPageModel } from './usePackPage'

export function PackActions({ model }: { model: PackPageModel }) {
  const { resource, teacherActions, canReport, setReporting } = model
  return (
    <div className="grid gap-2">
      {teacherActions && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <SaveToggle resource={resource} className="w-full" />
            <ShareLink resource={resource} label="Share link" className="w-full" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-1">
            <Button variant="link" className="px-0 text-sm" render={<a href={`#/share?adapt=${resource.id}`} />} nativeButton={false}>Adapt this pack</Button>
            {canReport && <Button variant="link" className="px-0 text-sm text-muted-foreground" onClick={() => setReporting(true)}>Report a problem</Button>}
          </div>
        </>
      )}
    </div>
  )
}

export function MobileDownloadBar({ model }: { model: PackPageModel }) {
  return (
    <div inert={!model.showBar} aria-hidden={!model.showBar || undefined} className={cn(
      'fixed inset-x-0 bottom-0 z-30 border-t bg-background pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ease-out motion-reduce:transition-none lg:hidden',
      model.showBar ? 'translate-y-0' : 'translate-y-full',
    )}>
      <Container className="flex items-center gap-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{model.resource.title}</p>
          <p className="truncate text-xs text-muted-foreground">{packSummary(model.downloads)}</p>
        </div>
        <PackDownloadButton dl={model.downloads} className="shrink-0" />
      </Container>
    </div>
  )
}

function packSummary(dl: PackDownloads) {
  const files = dl.packFiles
  if (files.length === 0) return 'See the files in this pack'
  const sizes = files.map((file) => file.sizeBytes)
  const total = sizes.every((size) => size !== undefined) ? sizes.reduce<number>((sum, size) => sum + (size ?? 0), 0) : undefined
  return [plural(files.length, 'required file'), total !== undefined && formatBytes(total)].filter(Boolean).join(' · ')
}

function PackDownloadButton({ dl, size = 'default', className }: { dl: PackDownloads; size?: 'default' | 'lg'; className?: string }) {
  if (dl.packFiles.length === 0) {
    return <Button size={size} className={className} onClick={() => {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      document.getElementById('files-title')?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
    }}>See the files</Button>
  }
  return (
    <Button size={size} className={className} onClick={dl.downloadPack} disabled={dl.packBusy} aria-describedby={dl.packError ? 'pack-download-error' : undefined}>
      <Download aria-hidden="true" />{dl.packBusy ? 'Preparing…' : 'Download lesson pack'}
    </Button>
  )
}
