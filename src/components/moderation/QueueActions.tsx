import { BadgeCheck, Eye, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { currentCurriculumReview, DemoRuleError } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

/**
 * Verifier actions for one pack:
 * held after a report → Restore; public without a current verification → Mark verified.
 */
export function QueueActions({ resource, className }: { resource: Resource; className?: string }) {
  const { persona, dispatch, notify } = useStore()
  const needsVerification = resource.status === 'published' && !currentCurriculumReview(resource)

  const restore = () => {
    dispatch({ type: 'set-status', resourceId: resource.id, status: 'published' })
    notify(`Restored “${resource.title}”. It’s public again.`)
  }

  const markVerified = () => {
    try {
      dispatch({ type: 'mark-curriculum-reviewed', resource, role: persona.role, date: new Date().toISOString().slice(0, 10) })
      notify(`Marked “${resource.title}” version ${resource.version.label} as verified.`)
    } catch (e) {
      notify(e instanceof DemoRuleError ? e.message : 'The verification couldn’t be saved.')
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {resource.status === 'held' && (
        <Button onClick={restore} aria-label={`Restore “${resource.title}”`}>
          <RotateCcw aria-hidden="true" /> Restore
        </Button>
      )}
      {needsVerification && (
        <Button className="h-auto min-h-10 max-w-full shrink py-2 text-left whitespace-normal" onClick={markVerified} aria-label={`Mark “${resource.title}” version ${resource.version.label} verified (simulated)`}>
          <BadgeCheck aria-hidden="true" /> Mark verified
        </Button>
      )}
      <Button variant="ghost" render={<a href={`#/resource/${resource.id}`} aria-label={`View “${resource.title}”`} />} nativeButton={false}>
        <Eye aria-hidden="true" /> View
      </Button>
    </div>
  )
}
