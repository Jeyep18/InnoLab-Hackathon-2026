import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DemoRuleError, isBookmarked } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

/** Same toggle as the card SaveButton, as a labelled outline button. */
export function SaveToggle({ resource, className }: { resource: Resource; className?: string }) {
  const { state, dispatch, notify } = useStore()
  const saved = isBookmarked(state, resource.id)
  return (
    <Button
      variant="outline"
      aria-pressed={saved}
      className={cn(saved && 'border-primary/40 bg-secondary', className)}
      onClick={() => {
        try {
          dispatch({ type: 'toggle-bookmark', resourceId: resource.id })
          notify(saved ? 'Removed from saved.' : 'Saved. Find it under Saved.')
        } catch (e) {
          notify(e instanceof DemoRuleError ? e.message : 'Couldn’t update saved packs.')
        }
      }}
    >
      <Bookmark aria-hidden="true" className={cn(saved && 'fill-current')} />
      {saved ? 'Saved' : 'Save for later'}
    </Button>
  )
}
