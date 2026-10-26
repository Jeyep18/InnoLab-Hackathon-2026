import { ArrowLeft } from 'lucide-react'
import { DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSubContent } from '@/components/ui/dropdown-menu'
import type { HomeFilterKey, HomeFilterModel } from '../useHomeFilters'
import { FIELD_LABELS } from './searchSections'

const MULTIPLE: HomeFilterKey[] = ['subject', 'needs', 'format']
const row = 'min-h-11 px-3 py-2 text-sm whitespace-normal'

export function NestedFilterChoices({ field, model, back }: { field: HomeFilterKey; model: HomeFilterModel; back: () => void }) {
  const selected = model.filters[field].split('|').filter(Boolean)
  const toggle = (value: string) => model.update(field, selected.includes(value) ? selected.filter(item => item !== value).join('|') : [...selected, value].join('|'))
  return <DropdownMenuSubContent onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); event.stopPropagation(); back() } }} side="bottom" align="start" alignOffset={-6} sideOffset={-56} aria-label={FIELD_LABELS[field]} className="nested-filter-choices max-h-[min(380px,50dvh)] w-72 max-w-[calc(100vw-2rem)] rounded-xl p-1.5">
    <DropdownMenuItem closeOnClick={false} onClick={back} aria-label={`Back from ${FIELD_LABELS[field]}`} className="sticky top-0 z-10 mb-1 h-12 bg-popover px-3 font-medium"><ArrowLeft />{FIELD_LABELS[field]}</DropdownMenuItem>
    <DropdownMenuSeparator />
    {MULTIPLE.includes(field) ? model.options[field].map(option => <DropdownMenuCheckboxItem key={option.value} className={row} checked={selected.includes(option.value)} closeOnClick={false} onCheckedChange={() => toggle(option.value)}>{option.label}</DropdownMenuCheckboxItem>) : <DropdownMenuRadioGroup value={model.filters[field]} onValueChange={value => { if (value !== null) model.update(field, value) }}>{model.options[field].map(option => <DropdownMenuRadioItem key={option.value} className={row} value={option.value} closeOnClick={false}>{option.label}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup>}
    {model.options[field].length === 0 && <DropdownMenuItem disabled className={row}>No choices for these filters</DropdownMenuItem>}
    {selected.length > 0 && <><DropdownMenuSeparator /><DropdownMenuItem closeOnClick={false} className={row} onClick={() => model.update(field, '')}>Clear {FIELD_LABELS[field].toLowerCase()}</DropdownMenuItem></>}
  </DropdownMenuSubContent>
}
