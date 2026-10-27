import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { ReactNode } from 'react'
import type { Resource } from '@/domain/types'
import { cn } from '@/lib/utils'

const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })

/** Every published version, newest first, including revisions approved from other teachers. */
export function VersionHistory({ resource, children }: { resource: Resource; children?: ReactNode }) {
  const versions = [resource.version, ...resource.history]
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="link" size="sm" className="h-auto px-0 text-mauve-ink" />}>
        {children ?? <><History aria-hidden="true" /> Version history ({versions.length})</>}
      </DialogTrigger>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b p-4 pr-12">
          <DialogTitle>Version history</DialogTitle>
          <DialogDescription>{resource.title}</DialogDescription>
        </DialogHeader>
        <ol className="min-h-0 flex-1 overflow-y-auto p-4">
          {versions.map((version, index) => (
            <li key={version.label} className="relative border-l pb-5 pl-5 last:pb-0">
              <span aria-hidden="true" className={cn('absolute top-1 -left-[5px] size-2.5 rounded-full', index === 0 ? 'bg-primary' : 'bg-border')} />
              <p className="text-sm">
                <span className="font-semibold tabular-nums">Version {version.label}</span>
                {index === 0 && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">Current</span>}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(version.date)}</p>
              <p className="mt-1 text-sm text-pretty">{version.note}</p>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  )
}
