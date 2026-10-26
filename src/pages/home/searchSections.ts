import type { HomeFilterKey } from '../useHomeFilters'

export type FilterSection = { id: string; title: string; fields: HomeFilterKey[] }
export const FILTER_SECTIONS: FilterSection[] = [
  { id: 'class', title: 'Class & subject', fields: ['level', 'grade', 'subject'] },
  { id: 'curriculum', title: 'Curriculum', fields: ['competency', 'quarter', 'week'] },
  { id: 'classroom', title: 'Classroom & files', fields: ['needs', 'format', 'editable', 'supplement'] },
  { id: 'reviews', title: 'Reviews', fields: ['review'] },
]
export const FIELD_LABELS: Record<HomeFilterKey, string> = {
  level: 'School level', grade: 'Grade', subject: 'Subject', competency: 'Competency', quarter: 'Term / quarter', week: 'BOW week', needs: 'Classroom needs', format: 'File format', editable: 'Editable files', review: 'Review status', supplement: 'Optional supplements',
}
