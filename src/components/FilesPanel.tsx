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
  const previewable = files.filter((file) => file.previewPages?.length).length
  const detail = [
    `${files.length} ${files.length === 1 ? 'file' : 'files'}`,
    !unlocked && previewable > 0 && `${previewable} with page previews`,
    unlocked ? (price > 0 ? 'Unlocked' : 'Free') : 'Pay once, unlock all',
  ].filter(Boolean).join(' · ')
  return <section aria-label="Supplementary bundle">
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="group flex w-full cursor-pointer flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 text-left shadow-xs outline-none transition-[border-color,box-shadow,scale] duration-150 hover:border-primary/60 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] motion-reduce:transition-none"
    >
      <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-mauve-ink"><Files className="size-5" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">Supplementary bundle</span>
        <span className="library-section-title mt-0.5 block text-xl">Teaching materials</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{detail}</span>
      </span>
      <span className="flex items-center gap-3 max-sm:w-full max-sm:justify-between">
        <span className="text-xl font-semibold tabular-nums">{price > 0 ? `₱${price.toFixed(2)}` : 'Free'}</span>
        <span className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors group-hover:bg-primary/90">
          {unlocked ? <Download aria-hidden="true" className="size-4" /> : <Lock aria-hidden="true" className="size-4" />}
          {unlocked ? 'Open bundle' : 'Preview & buy'}
          <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </span>
      </span>
    </button>
    <BundlePurchase key={`${resource.id}-${persona.id}`} resource={resource} files={files} price={price} dl={dl} open={open} onClose={() => setOpen(false)} />
  </section>
}
