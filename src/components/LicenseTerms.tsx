import { Check, Info, X } from 'lucide-react'
import type { License } from '@/lib/licenses'
import { cn } from '@/lib/utils'

/** GitHub-style breakdown of what others may do, must do and may not do with a pack. */
export function LicenseTerms({ license, className }: { license: Omit<License, 'id'>; className?: string }) {
  const columns = [
    { title: 'Teachers can', items: license.permissions, Icon: Check, tone: 'text-primary' },
    { title: 'They must', items: license.conditions, Icon: Info, tone: 'text-mauve-ink' },
    { title: 'They can’t', items: license.limitations, Icon: X, tone: 'text-destructive' },
  ].filter((column) => column.items.length > 0)
  return (
    <dl className={cn('grid gap-4 sm:grid-cols-3', className)}>
      {columns.map(({ title, items, Icon, tone }) => (
        <div key={title}>
          <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</dt>
          {items.map((item) => (
            <dd key={item} className="mt-1.5 flex items-start gap-1.5 text-sm">
              <Icon aria-hidden="true" className={cn('mt-0.5 size-4 shrink-0', tone)} /> {item}
            </dd>
          ))}
        </div>
      ))}
    </dl>
  )
}
