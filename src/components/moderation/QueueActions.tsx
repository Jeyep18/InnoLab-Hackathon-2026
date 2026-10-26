import { BadgeCheck, Eye, PauseCircle, Send } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { currentCurriculumReview, DemoRuleError } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

/**
 * Moderator actions for one pack, unchanged from the original queue:
 * pending → Publish or Hold; held → Publish; published without a current review → Mark curriculum-reviewed (simulated).
 */
export function QueueActions({ resource, className }: { resource: Resource; className?: string }) {
  const { persona, dispatch, notify } = useStore()
  const [holding, setHolding] = useState(false)
  const needsReview = resource.status === 'published' && !currentCurriculumReview(resource)

  const publish = () => {
    dispatch({ type: 'set-status', resourceId: resource.id, status: 'published' })
    notify(`Published “${resource.title}”.`)
  }

  const markReviewed = () => {
    try {
      dispatch({ type: 'mark-curriculum-reviewed', resource, role: persona.role, date: new Date().toISOString().slice(0, 10) })
      notify(`Marked “${resource.title}” version ${resource.version.label} as curriculum-reviewed (simulated).`)
    } catch (e) {
      notify(e instanceof DemoRuleError ? e.message : 'The review couldn’t be saved.')
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {resource.status !== 'published' && (
        <Button onClick={publish} aria-label={`Publish “${resource.title}”`}>
          <Send aria-hidden="true" /> Publish
        </Button>
      )}
      {resource.status === 'pending' && (
        <Button variant="outline" onClick={() => setHolding(true)} aria-label={`Hold “${resource.title}”`}>
          <PauseCircle aria-hidden="true" /> Hold
        </Button>
      )}
      {needsReview && (
        <Button variant="secondary" className="h-auto min-h-10 max-w-full shrink py-2 text-left whitespace-normal" onClick={markReviewed} aria-label={`Mark “${resource.title}” version ${resource.version.label} curriculum-reviewed (simulated)`}>
          <BadgeCheck aria-hidden="true" /> Mark curriculum-reviewed (simulated)
        </Button>
      )}
      <Button variant="ghost" render={<a href={`#/resource/${resource.id}`} aria-label={`View “${resource.title}”`} />} nativeButton={false}>
          <Eye aria-hidden="true" /> View
        </Button>
      {resource.status === 'pending' && <HoldDialog resource={resource} open={holding} onOpenChange={setHolding} />}
    </div>
  )
}

function HoldDialog({ resource, open, onOpenChange }: { resource: Resource; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { dispatch, notify } = useStore()
  const [reason, setReason] = useState('')
  const id = useId()

  const hold = (e: FormEvent) => {
    e.preventDefault()
    dispatch({ type: 'set-status', resourceId: resource.id, status: 'held', holdReason: reason.trim() || 'Held by demo moderator' })
    notify(`Held “${resource.title}”.`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={hold} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Hold “{resource.title}”?</DialogTitle>
            <DialogDescription>The pack stays out of Browse until you publish it. The reason shows on the pack page.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor={id}>
              Reason for hold <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input id={id} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. A worksheet shows a learner’s name" />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
            <Button type="submit">Hold pack</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
