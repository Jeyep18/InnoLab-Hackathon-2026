import { describe, expect, it } from 'vitest'
import { allResources, allReviews, contributorRating, emptyState, resourceRating } from '../domain/logic'
import { packsFromManifest, parseFolderName } from './folderPacks'
import { seedCatalogue } from './loadCatalogue'

describe('folder names', () => {
  it('reads grade, subject, BOW term/week and title', () => {
    expect(parseFolderName('Grade 5 - Mathematics - Term 2 Week 6 - Measuring area')).toEqual({
      grade: 'Grade 5',
      subject: 'Mathematics',
      quarter: 'Term 2',
      week: 'Week 6',
      title: 'Measuring area',
    })
  })

  it('treats the BOW part as optional and keeps dashes inside the title', () => {
    expect(parseFolderName('grade 6 - English - Notices - for a clean barangay')).toMatchObject({
      grade: 'Grade 6',
      subject: 'English',
      quarter: '',
      title: 'Notices - for a clean barangay',
    })
  })

  it('falls back to the whole folder name as the title', () => {
    expect(parseFolderName('Water cycle lesson')).toMatchObject({ title: 'Water cycle lesson', grade: 'Grade not given' })
  })
})

describe('folder packs', () => {
  const manifest = {
    packs: [
      {
        source: 'teacher' as const,
        alias: 'Teacher A',
        folder: 'Grade 4 - Science - Plants',
        files: [
          { name: 'Lesson plan.docx', sizeBytes: 10, url: '/pack-files/teacher/a/b/Lesson%20plan.docx' },
          { name: 'Slides.pdf', sizeBytes: 10, url: '/pack-files/teacher/a/b/Slides.pdf' },
          { name: 'Slides.pptx', sizeBytes: 10, url: '/pack-files/teacher/a/b/Slides.pptx' },
        ],
      },
      { source: 'sample' as const, alias: "Ma'am Lira", folder: 'Grade 4 - Science - Extra', files: [{ name: 'Notes.pdf', sizeBytes: 5, url: '/x' }] },
    ],
  }
  const { personas, resources, reviews } = packsFromManifest(manifest, seedCatalogue.personas)

  it('credits the folder alias, hidden from the persona switcher', () => {
    expect(personas).toHaveLength(1)
    expect(personas[0]).toMatchObject({ alias: 'Teacher A', listed: false })
    expect(resources[0].contributorId).toBe(personas[0].id)
  })

  it('reuses an existing persona when the alias matches', () => {
    expect(resources[1].contributorId).toBe('p-lira')
  })

  it('marks a PDF with the same name as an Office file as an optional preview copy', () => {
    const files = resources[0].files
    expect(files.find((f) => f.name === 'Slides.pdf')).toMatchObject({ required: false, label: 'Slides (PDF copy)' })
    expect(files.find((f) => f.name === 'Slides.pptx')).toMatchObject({ required: true, editable: true })
  })

  it('labels teacher packs demo-only and gives every pack the fixed sample reviews', () => {
    expect(resources[0].permission.kind).toBe('demo-only-teacher-file')
    expect(reviews.filter((r) => r.resourceId === resources[0].id).map((r) => [r.rating, r.seeded])).toEqual([
      [4, true],
      [5, true],
    ])
    const catalogue = { personas, resources, seedReviews: reviews }
    const state = emptyState('p-joy')
    expect(resourceRating(resources[0], allReviews(catalogue, state))).toEqual({ mean: 4.5, count: 2 })
    expect(contributorRating(personas[0].id, allResources(catalogue, state), allReviews(catalogue, state)).count).toBe(2)
  })
})
