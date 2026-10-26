import { cn } from 'cn'
import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { HomeFilterKey, HomeFilterModel } from '../useHomeFilters'
import { FIELD_LABELS, type FilterSection } from './searchSections'
import { NestedFilterChoices } from './NestedFilterChoices'

/** Stacked-menu adaptation of Moumen's reference using the installed Base UI primitives. */
export function NestedCategoryFilter({ section, model }: { section: FilterSection; model: HomeFilterModel }) {
  const [open, setOpen] = useState(false)
  const [activeField, setActiveField] = useState<HomeFilterKey | null>(null)
  const triggers = useRef<Partial<Record<HomeFilterKey, HTMLElement | null>>>({})
  const back = (field: HomeFilterKey) => { setActiveField(null); requestAnimationFrame(() => triggers.current[field]?.focus()) }
  const count = model.chips.filter(chip => section.fields.includes(chip.key)).length
  return <DropdownMenu open={open} onOpenChange={next => { setOpen(next); if (!next) setActiveField(null) }} modal={false}>
    <DropdownMenuTrigger render={<Button variant="secondary" className={cn('h-11 gap-2 px-4 font-normal', count > 0 && 'bg-primary/10 text-primary hover:bg-primary/15')} />}>
      <span className="flex min-w-0 items-center gap-2"><span className="truncate">{section.title}</span>{count > 0 && <span className="text-xs tabular-nums">{count}</span>}</span>
      <ChevronDown />
    </DropdownMenuTrigger>
    <DropdownMenuContent onKeyDown={event => { if (activeField && event.key === 'ArrowLeft') { event.preventDefault(); event.stopPropagation(); back(activeField) } }} aria-label={section.title} className="nested-category-menu w-72 max-w-[calc(100vw-2rem)] rounded-xl p-1.5" data-child-open={activeField ? '' : undefined}>
      {section.fields.map(field => {
        const summary = model.chips.filter(chip => chip.key === field).map(chip => chip.label).join(' · ') || 'Any'
        return <DropdownMenuSub key={field} closeParentOnEsc={false} open={activeField === field} onOpenChange={next => setActiveField(previous => next ? field : previous === field ? null : previous)}>
          <DropdownMenuSubTrigger ref={element => { triggers.current[field] = element }} openOnHover={false} label={FIELD_LABELS[field]} className={`h-14 justify-between px-3 transition-opacity ${activeField ? 'opacity-35' : ''}`}><span className="min-w-0 flex-1"><span className="block">{FIELD_LABELS[field]}</span><span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">{summary}</span></span></DropdownMenuSubTrigger>
          <NestedFilterChoices field={field} model={model} back={() => back(field)} />
        </DropdownMenuSub>
      })}
    </DropdownMenuContent>
  </DropdownMenu>
}
