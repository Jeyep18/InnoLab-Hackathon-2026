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
  contributorEarnings,
  migrateState,
  nextMinorVersion,
  openVerificationRequest,
  PLATFORM_FEE,
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

describe('supplement bundle acquisition', () => {
  const base = byId('r-water-cycle')
  const bundle: Resource = {
    ...base,
    supplementBundle: { pricePhp: 99 },
    files: [
      { ...base.files[0], id: 'plan', category: 'lesson-plan', required: true },
      { ...base.files[0], id: 'slides', category: 'supplement', required: false },
      { ...base.files[0], id: 'video', category: 'supplement', required: false },
    ],
  }

  it('unlocks every supplement in one purchase, without acquiring the free plan', () => {
    const result = reduce(emptyState('p-joy'), { type: 'acquire-bundle', resource: bundle })
    expect(result.acquisitions.map((item) => item.fileId)).toEqual(['slides', 'video'])
    expect(result.acquisitions.every((item) => item.personaId === 'p-joy' && item.simulatedPurchase)).toBe(true)
    expect(reduce(result, { type: 'acquire-bundle', resource: bundle }).acquisitions).toHaveLength(2)
  })

  it('keeps purchases specific to each buyer and resource', () => {
    const first = reduce(emptyState('p-joy'), { type: 'acquire-bundle', resource: bundle })
    const otherPersona = reduce(first, { type: 'select-persona', personaId: 'p-dado' })
    const second = reduce(otherPersona, { type: 'acquire-bundle', resource: bundle })
    expect(second.acquisitions.filter((item) => item.personaId === 'p-dado')).toHaveLength(2)
    expect(second.acquisitions.every((item) => item.resourceId === bundle.id)).toBe(true)
  })

  it('rejects unpublished bundles and packs without a paid bundle', () => {
    expect(() => reduce(emptyState('p-joy'), { type: 'acquire-bundle', resource: { ...bundle, status: 'held' } })).toThrow(DemoRuleError)
    expect(() => reduce(emptyState('p-joy'), { type: 'acquire-bundle', resource: { ...bundle, supplementBundle: undefined } })).toThrow(DemoRuleError)
  })
})

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
      competency: 'S4ES-IIg-h-5',
    })
    expect(results.map((r) => r.id)).toEqual(['r-water-cycle', 'r-water-cycle-bikol'])
  })

  it('matches every keyword, case-insensitively', () => {
    expect(filterResources(published, { ...NO_FILTERS, query: 'MAYON bikol' }).map((r) => r.id)).toEqual(['r-water-cycle-bikol'])
    expect(filterResources(published, { ...NO_FILTERS, query: 'MAYON water' })).toHaveLength(2)
    expect(filterResources(published, { ...NO_FILTERS, query: 'mayon fractions' })).toEqual([])
  })

  it('hides held resources', () => {
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
    expect(contributorRating(adaptation.contributorId, allResources(catalogue, state), reviews)).toEqual({ mean: 14 / 3, count: 3 })
  })
})

describe('revision proposals', () => {
  const propose = (state: DemoState, summary = 'Fixed item 3 in the answer key') =>
    reduce(state, {
      type: 'propose-revision',
      resource: byId('r-water-cycle', state),
      proposal: { id: 'rv-1', resourceId: 'r-water-cycle', baseVersion: '2.0', proposerId: '', fileId: 'answers', file: { name: 'answer-key-v2.docx', sizeBytes: 900, mimeType: '', key: 'rv-1-file' }, summary, status: 'pending', createdAt: '2026-10-27T01:00:00Z' },
    })

  it('records a private proposal from another teacher', () => {
    const state = propose(emptyState('p-joy'))
    expect(state.revisions).toHaveLength(1)
    expect(state.revisions[0]).toMatchObject({ proposerId: 'p-joy', status: 'pending' })
    expect(byId('r-water-cycle', state).version.label).toBe('2.0')
  })

  it('stops authors proposing to themselves and empty notes', () => {
    expect(() => propose(emptyState('p-lira'))).toThrow(DemoRuleError)
    expect(() => propose(emptyState('p-joy'), '  ')).toThrow(DemoRuleError)
  })

  it('publishes a new version with the revised file when the author approves', () => {
    const asAuthor = { ...propose(emptyState('p-joy')), personaId: 'p-lira' }
    const approved = reduce(asAuthor, { type: 'decide-revision', proposalId: 'rv-1', resource: byId('r-water-cycle', asAuthor), approve: true, proposerLabel: "Ma'am Joy Villanueva", at: '2026-10-27T02:00:00Z' })
    const pack = byId('r-water-cycle', approved)
    expect(pack.version.label).toBe('2.1')
    expect(pack.version.note).toContain("Ma'am Joy Villanueva")
    expect(pack.history[0].label).toBe('2.0')
    expect(pack.files.find((f) => f.id === 'answers')).toMatchObject({ name: 'answer-key-v2.docx', source: { type: 'local', key: 'rv-1-file' } })
    expect(approved.revisions[0]).toMatchObject({ status: 'approved', resultVersion: '2.1' })
    // A minor revision keeps the pack's reviews.
    expect(resourceRating(pack, allReviews(catalogue, approved)).count).toBe(3)
  })

  it('only lets the author decide, and only once', () => {
    const state = propose(emptyState('p-joy'))
    expect(() => reduce(state, { type: 'decide-revision', proposalId: 'rv-1', resource: byId('r-water-cycle', state), approve: true, proposerLabel: 'x', at: '2026-10-27' })).toThrow(DemoRuleError)
    const asAuthor = { ...state, personaId: 'p-lira' }
    const declined = reduce(asAuthor, { type: 'decide-revision', proposalId: 'rv-1', resource: byId('r-water-cycle', asAuthor), approve: false, proposerLabel: 'x', at: '2026-10-27' })
    expect(byId('r-water-cycle', declined).version.label).toBe('2.0')
    expect(() => reduce(declined, { type: 'decide-revision', proposalId: 'rv-1', resource: byId('r-water-cycle', declined), approve: true, proposerLabel: 'x', at: '2026-10-27' })).toThrow(DemoRuleError)
  })

  it('bumps the minor version', () => {
    expect(nextMinorVersion('1.0')).toBe('1.1')
    expect(nextMinorVersion('2.9')).toBe('2.10')
  })
})

describe('verification requests', () => {
  it('lets the author request free verification once per version', () => {
    const matter = byId('r-matter')
    const author = emptyState(matter.contributorId)
    const requested = reduce(author, { type: 'request-verification', resource: matter, at: '2026-10-27T01:00:00Z' })
    expect(openVerificationRequest(requested, matter)).toMatchObject({ tier: 'standard', version: matter.version.label })
    expect(() => reduce(requested, { type: 'request-verification', resource: matter, at: '2026-10-27T02:00:00Z' })).toThrow(DemoRuleError)
    const newer = { ...matter, version: { label: '1.1', date: '2026-10-27', note: 'Changed' } }
    expect(openVerificationRequest(requested, newer)).toBeUndefined()
  })

  it('rejects requests from other teachers, for held packs and for verified versions', () => {
    const matter = byId('r-matter')
    const other = matter.contributorId === 'p-joy' ? 'p-dado' : 'p-joy'
    expect(() => reduce(emptyState(other), { type: 'request-verification', resource: matter, at: '' })).toThrow(DemoRuleError)
    expect(() => reduce(emptyState(matter.contributorId), { type: 'request-verification', resource: { ...matter, status: 'held' }, at: '' })).toThrow(DemoRuleError)
    const water = byId('r-water-cycle')
    expect(() => reduce(emptyState(water.contributorId), { type: 'request-verification', resource: water, at: '' })).toThrow(DemoRuleError)
  })

  it('closes the request when the verifier marks the pack verified', () => {
    const matter = byId('r-matter')
    const requested = reduce(emptyState(matter.contributorId), { type: 'request-verification', resource: matter, at: '' })
    const verified = reduce(requested, { type: 'mark-curriculum-reviewed', resource: matter, role: 'moderator', date: '2026-10-27' })
    expect(verified.verificationRequests).toEqual([])
  })
})

describe('saved state and earnings', () => {
  it('publishes packs that were waiting for moderator approval in older saves', () => {
    const pending = { ...byId('r-matter'), id: 'c-1', status: 'pending' }
    const old = { ...emptyState('p-joy'), schema: 3, contributions: [pending], statusOverrides: { 'r-percent': { status: 'pending' } } } as unknown as Partial<DemoState>
    delete old.verificationRequests
    const migrated = migrateState(old, 'p-joy')
    expect(migrated.contributions[0].status).toBe('published')
    expect(migrated.statusOverrides['r-percent'].status).toBe('published')
    expect(migrated.verificationRequests).toEqual([])
  })

  it('keeps schema 2 data when upgrading', () => {
    const old = { ...emptyState('p-joy'), schema: 2, bookmarks: [{ personaId: 'p-joy', resourceId: 'r-matter' }] } as Partial<DemoState>
    delete old.revisions
    const migrated = migrateState(old, 'p-joy')
    expect(migrated.bookmarks).toHaveLength(1)
    expect(migrated.revisions).toEqual([])
  })

  it('adds this browser’s purchases to the contributor’s sales once each', () => {
    const resources = allResources(catalogue, emptyState('p-joy'))
    const before = contributorEarnings('p-dado', resources, catalogue.seedSales, emptyState('p-joy'), () => 'Buyer')
    const bought = reduce(emptyState('p-joy'), { type: 'acquire-bundle', resource: byId('r-percent') })
    const after = contributorEarnings('p-dado', resources, catalogue.seedSales, bought, () => 'Buyer')
    expect(after.sales).toHaveLength(before.sales.length + 1)
    expect(after.gross - before.gross).toBe(49)
    expect(after.fee).toBeCloseTo(after.gross * PLATFORM_FEE)
  })
})
