import { Gift, Tag } from 'lucide-react'
import type { Resource } from '@/domain/types'
import { paidFilesPrice } from '@/lib/pack'
import { cn } from '@/lib/utils'

/** "Free" when every file is free, otherwise the price of the optional paid files. The lesson plan is always free. */
export function PriceTag({ resource, className }: { resource: Resource; className?: string }) {
  const price = paidFilesPrice(resource)
  return price > 0 ? (
    <span className={cn('inline-flex w-fit items-center gap-1 rounded-full border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900 tabular-nums', className)} title="Free lesson plan with optional paid files">
      <Tag aria-hidden="true" className="size-3" /> Paid files · ₱{price % 1 ? price.toFixed(2) : price}
    </span>
  ) : (
    <span className={cn('inline-flex w-fit items-center gap-1 rounded-full border border-primary/30 bg-secondary px-2 py-0.5 text-xs font-medium text-mauve-ink', className)} title="Every file in this pack is free">
      <Gift aria-hidden="true" className="size-3" /> Free
    </span>
  )
}
