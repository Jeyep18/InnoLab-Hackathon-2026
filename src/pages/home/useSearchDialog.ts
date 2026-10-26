import { useState } from 'react'
import { useStore } from '@/store'
import { useHomeFilters, type HomeFilterModel } from '../useHomeFilters'

/** Draft filters stay local until Search or Enter. Closing the dialog drops unsent edits. */
export function useSearchDialog(model: HomeFilterModel, onSubmit: () => void) {
  const { resources } = useStore()
  const draft = useHomeFilters(resources, true)
  const [open, setOpen] = useState(false)
  const openChange = (next: boolean) => {
    if (next) draft.applySearch(model.query, model.filters)
    setOpen(next)
  }
  const submit = () => {
    model.applySearch(draft.query.trim(), draft.filters)
    onSubmit()
    setOpen(false)
  }
  return { draft, open, openChange, submit }
}
