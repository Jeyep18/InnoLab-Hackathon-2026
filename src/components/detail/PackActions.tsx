import { Download, GitFork, GitPullRequestArrow } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/site/layout'
import { formatBytes, plural } from '@/domain/logic'
import { cn } from '@/lib/utils'
import { ShareLink } from '../ShareLink'
import { SaveToggle } from './SaveToggle'
import { SuggestRevision } from './SuggestRevision'
import type { PackDownloads } from './usePackDownloads'
import type { PackPageModel } from './usePackPage'

export function PackActions({ model }: { model: PackPageModel }) {
  const { resource, teacherActions, canReport, setReporting } = model
  const [suggesting, setSuggesting] = useState(false)
  if (!teacherActions) return null
  const button = 'h-10 rounded-full px-3'
  return (
    <div className="grid gap-2">
      <div className={cn('grid gap-2', canReport && 'grid-cols-2')}>
        <Button variant="outline" className={button} render={<a href={`#/share?adapt=${resource.id}`} />} nativeButton={false}>
          <GitFork aria-hidden="true" /> {canReport ? 'Adapt' : 'Adapt this pack'}
        </Button>
        {canReport && (
          <Button variant="outline" className={button} onClick={() => setSuggesting(true)}>
            <GitPullRequestArrow aria-hidden="true" /> Suggest edits
          </Button>
        )}
      </div>
      {canReport && (
        <>
          <Button variant="link" size="sm" className="ml-auto h-auto px-0 text-muted-foreground" onClick={() => setReporting(true)}>
            Report a problem
          </Button>
          <SuggestRevision resource={resource} open={suggesting} onOpenChange={setSuggesting} />
        </>
      )}
    </div>
  )
}

/** Save and Share as icon buttons, shown beside the pack's rating. */
export function QuickActions({ model }: { model: PackPageModel }) {
  if (!model.teacherActions) return null
  return (
    <div className="flex gap-1.5">
      <SaveToggle resource={model.resource} iconOnly className="rounded-full" />
      <ShareLink resource={model.resource} iconOnly className="rounded-full" />
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
