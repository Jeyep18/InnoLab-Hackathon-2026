import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DemoRuleError, isBookmarked } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

/** Same toggle as the card SaveButton, as a labelled outline button. */
export function SaveToggle({ resource, className, iconOnly = false }: { resource: Resource; className?: string; iconOnly?: boolean }) {
  const { state, dispatch, notify } = useStore()
  const saved = isBookmarked(state, resource.id)
  return (
    <Button
      variant="outline"
      size={iconOnly ? 'icon' : 'default'}
      aria-pressed={saved}
      aria-label={iconOnly ? (saved ? 'Saved' : 'Save for later') : undefined}
      title={iconOnly ? (saved ? 'Saved' : 'Save') : undefined}
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
      {!iconOnly && (saved ? 'Saved' : 'Save')}
    </Button>
  )
}
