import type { Catalogue, CurriculumReview, DemoState, Resource, ResourceStatus, Review } from './types'

export const STATE_SCHEMA = 2

export const DEMO_REVIEWER = 'Demo reviewer (simulated)'

export function emptyState(defaultPersonaId: string): DemoState {
  return {
    schema: STATE_SCHEMA,
    personaId: defaultPersonaId,
    bookmarks: [],
    reviews: [],
    downloads: [],
    acquisitions: [],
    contributions: [],
    statusOverrides: {},
    curriculumReviews: {},
  }
}

// ---------- Derived views ----------

/** Seeded and demo-created resources, with demo status changes applied. */
export function allResources(catalogue: Catalogue, state: DemoState): Resource[] {
  return [...catalogue.resources, ...state.contributions].map((resource) => {
    const override = state.statusOverrides[resource.id]
    const review = state.curriculumReviews[resource.id]
    let result = resource
    if (override) result = { ...result, status: override.status, holdReason: override.holdReason }
    if (review) result = { ...result, curriculumReview: review }
    return result
  })
}

/** A curriculum review covers one version only. A new version or an adaptation starts unreviewed. */
export function currentCurriculumReview(resource: Resource): CurriculumReview | undefined {
  return resource.curriculumReview?.version === resource.version.label ? resource.curriculumReview : undefined
}

export function allReviews(catalogue: Catalogue, state: DemoState): Review[] {
  return [...catalogue.seedReviews, ...state.reviews]
}

/** Reviews written for the resource's current published version. */
export function currentReviews(resource: Resource, reviews: Review[]): Review[] {
  return reviews.filter((r) => r.resourceId === resource.id && r.resourceVersion === resource.version.label)
}

/** Reviews of earlier versions. Shown with a label, excluded from means and counts. */
export function olderReviews(resource: Resource, reviews: Review[]): Review[] {
  return reviews.filter((r) => r.resourceId === resource.id && r.resourceVersion !== resource.version.label)
}

export interface RatingSummary {
  mean: number | null
  count: number
}

function summarize(ratings: number[]): RatingSummary {
  if (ratings.length === 0) return { mean: null, count: 0 }
  return { mean: ratings.reduce((sum, r) => sum + r, 0) / ratings.length, count: ratings.length }
}

export function resourceRating(resource: Resource, reviews: Review[]): RatingSummary {
  return summarize(currentReviews(resource, reviews).map((r) => r.rating))
}

/**
 * Mean of every underlying current-version review across the contributor's published
 * resources. Not an average of resource averages, so a resource with many reviews
 * weighs more than one with a single review.
 */
export function contributorRating(contributorId: string, resources: Resource[], reviews: Review[]): RatingSummary {
  const ratings = resources
    .filter((res) => res.contributorId === contributorId && res.status === 'published')
    .flatMap((res) => currentReviews(res, reviews).map((r) => r.rating))
  return summarize(ratings)
}

export function bookmarkCount(resource: Resource, state: DemoState): number {
  return resource.baseline.bookmarks + state.bookmarks.filter((b) => b.resourceId === resource.id).length
}

/** Download events: each started download counts once. Not unique teachers. */
export function downloadCount(resource: Resource, state: DemoState): number {
  return resource.baseline.downloads + state.downloads.filter((d) => d.resourceId === resource.id).length
}

export function isBookmarked(state: DemoState, resourceId: string): boolean {
  return state.bookmarks.some((b) => b.personaId === state.personaId && b.resourceId === resourceId)
}

export function hasAcquired(state: DemoState, resourceId: string): boolean {
  return state.acquisitions.some((a) => a.personaId === state.personaId && a.resourceId === resourceId)
}

export function hasAcquiredFile(state: DemoState, resourceId: string, fileId: string): boolean {
  return state.acquisitions.some(
    (a) => a.personaId === state.personaId && a.resourceId === resourceId && a.fileId === fileId,
  )
}

export function personaReview(state: DemoState, resourceId: string): Review | undefined {
  return state.reviews.find((r) => r.personaId === state.personaId && r.resourceId === resourceId)
}

export type ReviewEligibility = 'ok' | 'own-resource' | 'not-acquired' | 'not-published' | 'moderator'

export function reviewEligibility(state: DemoState, resource: Resource, role: 'teacher' | 'moderator'): ReviewEligibility {
  if (role === 'moderator') return 'moderator'
  if (resource.status !== 'published') return 'not-published'
  if (resource.contributorId === state.personaId) return 'own-resource'
  if (!hasAcquired(state, resource.id)) return 'not-acquired'
  return 'ok'
}

/** "Term 2, Week 3", or a plain note when the contributor gave no BOW week. */
export function bowLabel(resource: Resource): string {
  const parts = [resource.bow.quarter, resource.bow.week].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'BOW week not given'
}

/** Packs without a competency code are grouped by their competency text. */
export function competencyKey(resource: Resource): string {
  return resource.competency.code || resource.competency.text
}

export function competencyLabel(resource: Resource): string {
  return resource.competency.text || 'Competency not given'
}

// ---------- Search ----------

export interface Filters {
  query: string
  grade: string
  subject: string
  competency: string
}

export const NO_FILTERS: Filters = { query: '', grade: '', subject: '', competency: '' }

export function filterResources(resources: Resource[], filters: Filters): Resource[] {
  const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean)
  return resources.filter((r) => {
    if (r.status !== 'published') return false
    if (filters.grade && r.grade !== filters.grade) return false
    if (filters.subject && r.subject !== filters.subject) return false
    if (filters.competency && competencyKey(r) !== filters.competency) return false
    if (terms.length === 0) return true
    const haystack = [r.title, r.summary, r.subject, r.grade, r.competency.code, r.competency.text, ...r.tags, ...r.requirements]
      .join(' ')
      .toLowerCase()
    return terms.every((t) => haystack.includes(t))
  })
}

// ---------- State transitions ----------

export type Action =
  | { type: 'acquire-bundle'; resource: Resource }
  | { type: 'select-persona'; personaId: string }
  | { type: 'toggle-bookmark'; resourceId: string }
  | { type: 'record-download'; resourceId: string; fileId: string; at: string; simulatedPurchase?: boolean }
  | { type: 'acquire'; resourceId: string; fileId: string; simulatedPurchase: boolean }
  | {
      type: 'save-review'
      resource: Resource
      role: 'teacher' | 'moderator'
      authorLabel: string
      rating: number
      text: string
      usedInClass: boolean
      at: string
    }
  | { type: 'add-contribution'; resource: Resource }
  | { type: 'set-status'; resourceId: string; status: ResourceStatus; holdReason?: string }
  | { type: 'mark-curriculum-reviewed'; resource: Resource; role: 'teacher' | 'moderator'; date: string }
  | { type: 'replace'; state: DemoState }

export class DemoRuleError extends Error {}

export function validateRating(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new DemoRuleError('Choose a rating from 1 to 5 stars.')
  }
}

export function reduce(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'acquire-bundle': {
      if (action.resource.status !== 'published') throw new DemoRuleError('This bundle is not published.')
      if (!action.resource.supplementBundle || action.resource.supplementBundle.pricePhp <= 0) throw new DemoRuleError('This pack has no paid bundle.')
      return action.resource.files.filter((file) => file.category === 'supplement').reduce((next, file) =>
        reduce(next, { type: 'acquire', resourceId: action.resource.id, fileId: file.id, simulatedPurchase: true }), state)
    }
    case 'select-persona':
      return { ...state, personaId: action.personaId }

    case 'toggle-bookmark': {
      const exists = isBookmarked(state, action.resourceId)
      const bookmarks = exists
        ? state.bookmarks.filter((b) => !(b.personaId === state.personaId && b.resourceId === action.resourceId))
        : [...state.bookmarks, { personaId: state.personaId, resourceId: action.resourceId }]
      return { ...state, bookmarks }
    }

    case 'acquire': {
      if (hasAcquiredFile(state, action.resourceId, action.fileId)) return state
      return {
        ...state,
        acquisitions: [
          ...state.acquisitions,
          {
            personaId: state.personaId,
            resourceId: action.resourceId,
            fileId: action.fileId,
            simulatedPurchase: action.simulatedPurchase,
          },
        ],
      }
    }

    case 'record-download': {
      const withEvent = {
        ...state,
        downloads: [
          ...state.downloads,
          { resourceId: action.resourceId, fileId: action.fileId, personaId: state.personaId, at: action.at },
        ],
      }
      return reduce(withEvent, {
        type: 'acquire',
        resourceId: action.resourceId,
        fileId: action.fileId,
        simulatedPurchase: action.simulatedPurchase ?? false,
      })
    }

    case 'save-review': {
      const eligibility = reviewEligibility(state, action.resource, action.role)
      if (eligibility === 'own-resource') throw new DemoRuleError('You can’t rate your own resource.')
      if (eligibility === 'not-acquired') throw new DemoRuleError('Download the lesson pack before reviewing it.')
      if (eligibility !== 'ok') throw new DemoRuleError('Only teacher personas can review published resources.')
      validateRating(action.rating)
      const existing = personaReview(state, action.resource.id)
      const review: Review = {
        id: existing?.id ?? `rev-${action.resource.id}-${state.personaId}`,
        resourceId: action.resource.id,
        resourceVersion: action.resource.version.label,
        personaId: state.personaId,
        authorLabel: action.authorLabel,
        rating: action.rating,
        text: action.text.trim(),
        usedInClass: action.usedInClass,
        seeded: false,
        updatedAt: action.at,
      }
      // One review per persona and resource: an edit (even for a newer version) replaces it.
      const reviews = existing
        ? state.reviews.map((r) => (r.id === existing.id ? review : r))
        : [...state.reviews, review]
      return { ...state, reviews }
    }

    case 'add-contribution':
      return { ...state, contributions: [...state.contributions, action.resource] }

    case 'set-status':
      return {
        ...state,
        statusOverrides: {
          ...state.statusOverrides,
          [action.resourceId]: { status: action.status, holdReason: action.holdReason },
        },
      }

    case 'mark-curriculum-reviewed': {
      if (action.role !== 'moderator') throw new DemoRuleError('Only the demo reviewer can mark a pack as reviewed.')
      if (action.resource.status !== 'published') throw new DemoRuleError('Publish the pack before marking it reviewed.')
      return {
        ...state,
        curriculumReviews: {
          ...state.curriculumReviews,
          [action.resource.id]: { version: action.resource.version.label, reviewer: DEMO_REVIEWER, date: action.date },
        },
      }
    }

    case 'replace':
      return action.state
  }
}

// ---------- Formatting ----------

export function formatMean(summary: RatingSummary): string {
  return summary.mean === null ? 'No reviews yet' : summary.mean.toFixed(1)
}

export function plural(count: number, word: string, many = `${word}s`): string {
  return `${count} ${count === 1 ? word : many}`
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
