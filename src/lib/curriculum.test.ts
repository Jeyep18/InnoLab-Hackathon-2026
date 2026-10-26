import { describe, expect, it } from 'vitest'
import { curriculumBasis, SCHOOL_LEVELS, schoolLevelForGrade } from './curriculum'

describe('CherIt curriculum grade bands', () => {
  it('offers only preschool through senior high school', () => {
    expect(SCHOOL_LEVELS.map((level) => level.label)).toEqual([
      'Preschool & Kindergarten',
      'Elementary',
      'Junior High School',
      'Senior High School',
    ])
    expect(SCHOOL_LEVELS.flatMap((level) => level.grades)).not.toContain('College')
  })

  it.each([
    ['Nursery / Pre-K 1 (Age 3)', 'preschool'],
    ['Kindergarten', 'preschool'],
    ['Kindergarten (Age 5)', 'preschool'],
    ['Grade 1', 'elementary'],
    ['Grade 6', 'elementary'],
    ['Grade 7', 'jhs'],
    ['Grade 10', 'jhs'],
    ['Grade 11', 'shs'],
    ['Grade 12', 'shs'],
  ] as const)('maps %s to %s', (grade, level) => {
    expect(schoolLevelForGrade(grade)).toBe(level)
  })

  it('distinguishes ECCD, MATATAG, and senior high curriculum sources', () => {
    expect(curriculumBasis('Nursery / Pre-K 1 (Age 3)')).toContain('ECCD')
    expect(curriculumBasis('Kindergarten (Age 5)')).toContain('MATATAG')
    expect(curriculumBasis('Grade 6')).toContain('MATATAG')
    expect(curriculumBasis('Grade 11')).toContain('Strengthened SHS')
    expect(curriculumBasis('Grade 12')).toContain('DepEd SHS')
  })
})
