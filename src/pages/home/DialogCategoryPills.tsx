import type { HomeFilterModel } from '../useHomeFilters'
import { FILTER_SECTIONS } from './searchSections'
import { NestedCategoryFilter } from './NestedCategoryFilter'

export function DialogCategoryPills({ model }: { model: HomeFilterModel }) {
  return <div className="flex flex-wrap gap-2" aria-label="Filter categories">{FILTER_SECTIONS.map(section => <NestedCategoryFilter key={section.id} section={section} model={model} />)}</div>
}
