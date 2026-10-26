import { ArrowRight, Search, XIcon } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { HomeFilterModel } from '../useHomeFilters'
import { DialogCategoryPills } from './DialogCategoryPills'
import { useSearchDialog } from './useSearchDialog'

export function SearchDialog({ model, onSubmit, onClear }: { model: HomeFilterModel; onSubmit: () => void; onClear?: () => void }) {
  const { draft, open, openChange, submit } = useSearchDialog(model, onSubmit)
  const trigger = <DialogTrigger render={<Button variant="outline" className={cn('h-14 w-full justify-between gap-4 px-5 text-left font-normal', onClear ? 'mt-0' : 'mt-7')} />} aria-label="Open lesson search">
    <span className="flex min-w-0 items-center gap-3"><Search className="text-muted-foreground" /><span className="min-w-0"><span className="block truncate text-muted-foreground">{model.query || 'What are you teaching this week?'}</span>{model.chips.length > 0 && <span className="block text-xs text-muted-foreground">{model.chips.length} search filter{model.chips.length === 1 ? '' : 's'} applied</span>}</span></span><span className="flex items-center gap-2 font-medium text-primary">Search<ArrowRight /></span>
  </DialogTrigger>
  return <Dialog open={open} onOpenChange={openChange}>
    {onClear
      ? <div className="flex items-center gap-3"><div className="min-w-0 flex-1">{trigger}</div>{model.hasSearch && <Button variant="outline" className="h-14 px-5" onClick={onClear} aria-label="Clear search and filters">Clear</Button>}</div>
      : trigger}
    <DialogContent aria-describedby={undefined} showCloseButton={false} className="max-h-[85dvh] max-w-[calc(100%-2rem)] grid-rows-[auto_auto_minmax(0,1fr)] gap-6 overflow-hidden rounded-[24px] p-6 sm:max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <DialogTitle className="text-xl font-semibold tracking-tight">Find a lesson</DialogTitle>
        <DialogClose render={<Button variant="ghost" size="icon-sm" className="-mr-2" aria-label="Close" />}><XIcon /></DialogClose>
      </div>
      <div className="relative">
        <Label htmlFor="dialog-lesson-query" className="sr-only">Topic or keyword</Label>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="dialog-lesson-query" className="h-11 rounded-full pr-12 pl-10 text-base sm:text-sm" placeholder="Water cycle, fractions, reading…" value={draft.query} onChange={event => draft.setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); submit() } }} />
        <Button size="icon-sm" className="absolute top-1/2 right-1.5 -translate-y-1/2" onClick={submit} aria-label="Search lessons"><ArrowRight /></Button>
      </div>
      <div className="min-h-0 overflow-y-auto" key={String(open)}><DialogCategoryPills model={draft} /></div>
    </DialogContent>
  </Dialog>
}
