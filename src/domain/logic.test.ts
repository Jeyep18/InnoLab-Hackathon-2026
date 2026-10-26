import { describe, expect, it } from 'vitest'
import { seedCatalogue } from '../data/loadCatalogue'
import {
  allResources,
  allReviews,
  bookmarkCount,
  contributorRating,
  currentCurriculumReview,
  DemoRuleError,
  downloadCount,
  emptyState,
  filterResources,
  formatMean,
  isBookmarked,
  NO_FILTERS,
  olderReviews,
  reduce,
  resourceRating,
} from './logic'
import type { DemoState, Resource } from './types'

const catalogue = seedCatalogue
const byId = (id: string, state: DemoState = emptyState('p-joy')): Resource =>
  allResources(catalogue, state).find((r) => r.id === id)!

function download(state: DemoState, resourceId: string, fileId = 'lesson'): DemoState {
  return reduce(state, { type: 'record-download', resourceId, fileId, at: '2026-10-26T10:00:00Z' })
}

function review(state: DemoState, resourceId: string, rating: number, text = ''): DemoState {
  return reduce(state, {
    type: 'save-review',
    resource: byId(resourceId, state),
    role: 'teacher',
    authorLabel: 'Test persona',
    rating,
    text,
    usedInClass: false,
    at: '2026-10-26T10:05:00Z',
  })
}

describe('ratings', () => {
  it('uses only current-version reviews for the resource mean and count', () => {
    const state = emptyState('p-joy')
    const water = byId('r-water-cycle')
    const reviews = allReviews(catalogue, state)
    expect(resourceRating(water, reviews)).toEqual({ mean: 14 / 3, count: 3 })
    expect(olderReviews(water, reviews).map((r) => r.rating)).toEqual([2])
  })

  it('shows "No reviews yet" instead of zero for an unrated resource', () => {
    const state = emptyState('p-joy')
    const summary = resourceRating(byId('r-folk-tale'), allReviews(catalogue, state))
    expect(summary).toEqual({ mean: null, count: 0 })
    expect(formatMean(summary)).toBe('No reviews yet')
  })

  it('weights the contributor mean by underlying reviews, not by resource averages', () => {
    const state = emptyState('p-joy')
    const resources = allResources(catalogue, state)
    // Lira: water cycle 5, 4, 5 (current) and states of matter 3. Older 2 is excluded.
    const lira = contributorRating('p-lira', resources, allReviews(catalogue, state))
    expect(lira.count).toBe(4)
    expect(lira.mean).toBeCloseTo(4.25)
    // An average of averages would give (4.667 + 3) / 2 = 3.83, which is wrong here.
    expect(lira.mean).not.toBeCloseTo(3.83, 1)
  })

  it('recomputes resource and contributor means after a review and its edit', () => {
    let state = download(emptyState('p-joy'), 'r-matter')
    state = review(state, 'r-matter', 5, 'Worked well')
    let reviews = allReviews(catalogue, state)
    expect(resourceRating(byId('r-matter', state), reviews)).toEqual({ mean: 4, count: 2 })
    expect(contributorRating('p-lira', allResources(catalogue, state), reviews).mean).toBeCloseTo(22 / 5)

    state = review(state, 'r-matter', 1, 'Changed my mind')
    reviews = allReviews(catalogue, state)
    expect(state.reviews).toHaveLength(1)
    expect(resourceRating(byId('r-matter', state), reviews)).toEqual({ mean: 2, count: 2 })
    expect(contributorRating('p-lira', allResources(catalogue, state), reviews).mean).toBeCloseTo(18 / 5)
  })

  it('excludes held resources from the contributor mean', () => {
    let state = emptyState('p-joy')
    state = reduce(state, { type: 'set-status', resourceId: 'r-matter', status: 'held', holdReason: 'Reported' })
    const lira = contributorRating('p-lira', allResources(catalogue, state), allReviews(catalogue, state))
    expect(lira).toEqual({ mean: 14 / 3, count: 3 })
  })
})

describe('review rules', () => {
  it('blocks reviews before the persona has downloaded the resource', () => {
    expect(() => review(emptyState('p-joy'), 'r-matter', 4)).toThrow(DemoRuleError)
  })

  it('blocks a contributor from rating their own resource', () => {
    const state = download(emptyState('p-lira'), 'r-water-cycle')
    expect(() => review(state, 'r-water-cycle', 5)).toThrow(/own resource/)
  })

  it('rejects ratings outside 1 to 5 and non-integers', () => {
    const state = download(emptyState('p-joy'), 'r-matter')
    for (const bad of [0, 6, 3.5, Number.NaN]) {
      expect(() => review(state, 'r-matter', bad)).toThrow(/1 to 5/)
    }
  })

  it('moves a persona review to the current version when edited, replacing the old one', () => {
    let state = download(emptyState('p-joy'), 'r-water-cycle')
    // Simulate a review this persona left on version 1.0.
    state = {
      ...state,
      reviews: [
        {
          id: 'old',
          resourceId: 'r-water-cycle',
          resourceVersion: '1.0',
          personaId: 'p-joy',
          authorLabel: 'Ma’am Joy',
          rating: 1,
          text: 'Too long',
          usedInClass: true,
          seeded: false,
          updatedAt: '2026-08-01',
        },
      ],
    }
    expect(resourceRating(byId('r-water-cycle', state), allReviews(catalogue, state)).count).toBe(3)
    state = review(state, 'r-water-cycle', 4)
    expect(state.reviews).toHaveLength(1)
    expect(state.reviews[0]).toMatchObject({ id: 'old', resourceVersion: '2.0', rating: 4 })
    expect(resourceRating(byId('r-water-cycle', state), allReviews(catalogue, state)).count).toBe(4)
  })
})

describe('bookmarks and downloads', () => {
  it('toggles one bookmark per persona and resource', () => {
    const water = byId('r-water-cycle')
    let state = emptyState('p-joy')
    state = reduce(state, { type: 'toggle-bookmark', resourceId: water.id })
    expect(isBookmarked(state, water.id)).toBe(true)
    expect(bookmarkCount(water, state)).toBe(water.baseline.bookmarks + 1)

    state = reduce(state, { type: 'select-persona', personaId: 'p-dado' })
    expect(isBookmarked(state, water.id)).toBe(false)
    state = reduce(state, { type: 'toggle-bookmark', resourceId: water.id })
    expect(bookmarkCount(water, state)).toBe(water.baseline.bookmarks + 2)

    state = reduce(state, { type: 'toggle-bookmark', resourceId: water.id })
    expect(bookmarkCount(water, state)).toBe(water.baseline.bookmarks + 1)
  })

  it('counts every started download as an event, not unique teachers', () => {
    const water = byId('r-water-cycle')
    let state = download(emptyState('p-joy'), water.id)
    state = download(state, water.id)
    state = download(state, water.id, 'worksheet')
    expect(downloadCount(water, state)).toBe(water.baseline.downloads + 3)
    // Acquisition is recorded once per file.
    expect(state.acquisitions).toHaveLength(2)
  })

  it('reset to an empty state restores sample baselines', () => {
    const water = byId('r-water-cycle')
    let state = download(emptyState('p-joy'), water.id)
    state = reduce(state, { type: 'toggle-bookmark', resourceId: water.id })
    state = reduce(state, { type: 'replace', state: emptyState('p-joy') })
    expect(downloadCount(water, state)).toBe(water.baseline.downloads)
    expect(bookmarkCount(water, state)).toBe(water.baseline.bookmarks)
  })
})

describe('search', () => {
  const published = allResources(catalogue, emptyState('p-joy'))

  it('filters by grade, subject and competency together', () => {
    const results = filterResources(published, {
      ...NO_FILTERS,
      grade: 'Grade 4',
      subject: 'Science',
      competency: 'EX-SCI4-T2-03',
    })
    expect(results.map((r) => r.id)).toEqual(['r-water-cycle', 'r-water-cycle-bikol'])
  })

  it('matches every keyword, case-insensitively', () => {
    expect(filterResources(published, { ...NO_FILTERS, query: 'MAYON bikol' }).map((r) => r.id)).toEqual(['r-water-cycle-bikol'])
    expect(filterResources(published, { ...NO_FILTERS, query: 'MAYON water' })).toHaveLength(2)
    expect(filterResources(published, { ...NO_FILTERS, query: 'mayon fractions' })).toEqual([])
  })

  it('hides pending and held resources', () => {
    let state = emptyState('p-joy')
    state = reduce(state, { type: 'set-status', resourceId: 'r-percent', status: 'held' })
    const ids = filterResources(allResources(catalogue, state), NO_FILTERS).map((r) => r.id)
    expect(ids).not.toContain('r-percent')
  })
})

describe('curriculum review', () => {
  it('starts with the two seeded packs reviewed and the adaptation unreviewed', () => {
    const state = emptyState('p-joy')
    expect(currentCurriculumReview(byId('r-water-cycle', state))?.version).toBe('2.0')
    expect(currentCurriculumReview(byId('r-percent', state))).toBeDefined()
    expect(currentCurriculumReview(byId('r-water-cycle-bikol', state))).toBeUndefined()
    expect(currentCurriculumReview(byId('r-matter', state))).toBeUndefined()
  })

  it('covers only the version that was reviewed', () => {
    const water = byId('r-water-cycle')
    const newer = { ...water, version: { label: '3.0', date: '2026-10-27', note: 'Changed' } }
    expect(currentCurriculumReview(newer)).toBeUndefined()
  })

  it('lets only the moderator mark a published pack reviewed', () => {
    const matter = byId('r-matter')
    const teacher = emptyState('p-joy')
    expect(() =>
      reduce(teacher, { type: 'mark-curriculum-reviewed', resource: matter, role: 'teacher', date: '2026-10-26' }),
    ).toThrow(DemoRuleError)
    const mod = reduce(emptyState('p-mod'), { type: 'mark-curriculum-reviewed', resource: matter, role: 'moderator', date: '2026-10-26' })
    expect(currentCurriculumReview(byId('r-matter', mod))).toMatchObject({ version: '1.0' })
  })

  it('gives the unrated adaptation its contributor’s track record as a fallback', () => {
    const state = emptyState('p-joy')
    const adaptation = byId('r-water-cycle-bikol', state)
    const reviews = allReviews(catalogue, state)
    expect(resourceRating(adaptation, reviews)).toEqual({ mean: null, count: 0 })
    expect(contributorRating(adaptation.contributorId, allResources(catalogue, state), reviews)).toEqual({ mean: 5, count: 1 })
  })
})
