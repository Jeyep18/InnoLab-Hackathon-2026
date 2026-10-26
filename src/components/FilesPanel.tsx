import { ArrowRight, Download, Files, Lock } from 'lucide-react'
import { useState } from 'react'
import type { Resource } from '@/domain/types'
import { useStore } from '@/store'
import { lessonPlanFiles } from '@/files'
import { usePackDownloads, type PackDownloads } from './detail/usePackDownloads'
import { BundlePurchase } from './detail/BundlePurchase'

export function FilesPanel({ resource, downloads }: { resource: Resource; downloads?: PackDownloads }) {
  const own = usePackDownloads(resource)
  const dl = downloads ?? own
  const { persona } = useStore()
  const [open, setOpen] = useState(false)
  const planIds = new Set(lessonPlanFiles(resource).map((file) => file.id))
  const files = resource.files.filter((file) => !planIds.has(file.id))
  if (!files.length) return null
  const price = resource.supplementBundle?.pricePhp ?? files.reduce((sum, file) => sum + (file.samplePricePhp ?? 0), 0)
  const unlocked = files.every((file) => !dl.isLocked(file))
  return <section aria-label="Supplementary bundle" className="border-y py-5">
    <button type="button" onClick={() => setOpen(true)} className="group w-full text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <div className="flex flex-wrap items-center gap-4"><span className="grid size-10 shrink-0 place-items-center bg-secondary text-foreground"><Files className="size-5" /></span><div className="min-w-0 flex-1"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplementary bundle</span><h2 className="library-section-title mt-1 text-xl">Teaching materials</h2><p className="mt-1 text-sm text-muted-foreground">{files.length} {files.length === 1 ? 'file' : 'files'}</p></div><span className="text-xl font-semibold tabular-nums">{price > 0 ? `₱${price.toFixed(2)}` : 'Free'}</span></div>
      <div className="mt-4 flex items-center justify-between border-t pt-3"><span className="flex items-center gap-2 text-sm font-medium">{unlocked ? <Download className="size-4" /> : <Lock className="size-4" />}{unlocked ? 'Open bundle' : 'Explore bundle'}</span><ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></div>
    </button>
    <BundlePurchase key={`${resource.id}-${persona.id}`} resource={resource} files={files} price={price} dl={dl} open={open} onClose={() => setOpen(false)} />
  </section>
}
