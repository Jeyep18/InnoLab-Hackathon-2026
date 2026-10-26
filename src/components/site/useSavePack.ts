import { DemoRuleError, isBookmarked } from '@/domain/logic'
import { useStore } from '@/store'

export function useSavePack(resourceId: string) {
  const { state, dispatch, notify } = useStore()
  const saved = isBookmarked(state, resourceId)
  const toggle = () => {
    try {
      dispatch({ type: 'toggle-bookmark', resourceId })
      notify(saved ? 'Removed from saved.' : 'Saved. Find it under Saved.')
    } catch (error) {
      notify(error instanceof DemoRuleError ? error.message : 'Couldn’t update saved packs.')
    }
  }
  return { saved, toggle }
}
