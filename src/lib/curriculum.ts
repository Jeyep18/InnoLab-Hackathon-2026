export const SCHOOL_LEVELS = [
  {
    value: 'preschool',
    label: 'Preschool & Kindergarten',
    grades: ['Nursery / Pre-K 1 (Age 3)', 'Prep / Pre-K 2 (Age 4)', 'Kindergarten (Age 5)'],
  },
  { value: 'elementary', label: 'Elementary', grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'] },
  { value: 'jhs', label: 'Junior High School', grades: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'] },
  { value: 'shs', label: 'Senior High School', grades: ['Grade 11', 'Grade 12'] },
] as const

export type SchoolLevel = (typeof SCHOOL_LEVELS)[number]['value']

export function schoolLevelForGrade(grade: string): SchoolLevel | '' {
  if (grade === 'Kindergarten') return 'preschool'
  return SCHOOL_LEVELS.find((level) => level.grades.some((option) => option === grade))?.value ?? ''
}

export function curriculumBasis(grade: string): string {
  if (grade.includes('Pre-K')) return 'ECCD · Pre-K'
  if (grade.startsWith('Kindergarten') || /^Grade ([1-9]|10)$/.test(grade)) return 'DepEd MATATAG · K–10'
  if (grade === 'Grade 11') return 'DepEd Strengthened SHS · Grade 11'
  if (grade === 'Grade 12') return 'DepEd SHS · Grade 12'
  return ''
}
