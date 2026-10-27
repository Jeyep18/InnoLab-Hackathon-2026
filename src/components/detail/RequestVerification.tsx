import { BadgeCheck, Clock, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProPlanDialog } from '@/components/site/ProPlanDialog'
import { currentCurriculumReview, DemoRuleError, openVerificationRequest } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { useStore } from '@/store'

/** Lets the author ask for free verification of the current version. Hidden for everyone else. */
export function RequestVerification({ resource }: { resource: Resource }) {
  const { state, persona, dispatch, notify } = useStore()
  const [proOpen, setProOpen] = useState(false)
  if (resource.contributorId !== persona.id || resource.status !== 'published' || currentCurriculumReview(resource)) return null
  const request = openVerificationRequest(state, resource)

  const ask = () => {
    try {
      dispatch({ type: 'request-verification', resource, at: new Date().toISOString() })
      notify(`Verification requested for version ${resource.version.label}. It’s in the free queue.`)
    } catch (e) {
      notify(e instanceof DemoRuleError ? e.message : 'The verification request couldn’t be saved.')
    }
  }

  return (
    <div className="mt-3">
      {request ? (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <Clock aria-hidden="true" className="size-3.5 shrink-0" /> Verification requested · Free queue
          </p>
          <Button type="button" variant="link" size="sm" className="h-auto px-0 after:-inset-x-1 after:-inset-y-2.5" onClick={() => setProOpen(true)}>
            <Sparkles aria-hidden="true" /> Get priority with Pro
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={ask}>
          <BadgeCheck aria-hidden="true" /> Request verification (free)
        </Button>
      )}
      <ProPlanDialog feature="priority-verification" open={proOpen} onOpenChange={setProOpen} />
    </div>
  )
}
