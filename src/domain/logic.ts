import type { Catalogue, CurriculumReview, DemoState, Persona, ProfileEdits, Resource, ResourceStatus, Review, RevisionProposal, Sale, VerificationRequest } from './types'

export const STATE_SCHEMA = 4

export const DEMO_REVIEWER = 'CherIt Review Team'

/** Proposed platform fee on paid bundles. Not decided by the team yet. */
export const PLATFORM_FEE = 0.1

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
    revisions: [],
    resourcePatches: {},
    profileEdits: {},
    verificationRequests: [],
  }
}

/** Brings saved state from an older schema up to date without losing it. */
export function migrateState(saved: Partial<DemoState> & { schema?: number }, defaultPersonaId: string): DemoState {
  if (saved.schema === STATE_SCHEMA) return saved as DemoState
  if (saved.schema !== 2 && saved.schema !== 3) return emptyState(defaultPersonaId)
  // Schema 4 dropped moderator approval: anything still waiting for it is now live.
  const live = <T extends { status: string }>(item: T): T => (item.status === 'pending' ? { ...item, status: 'published' } : item)
  return {
    ...emptyState(defaultPersonaId),
    ...saved,
    contributions: (saved.contributions ?? []).map(live),
    statusOverrides: Object.fromEntries(Object.entries(saved.statusOverrides ?? {}).map(([id, o]) => [id, live(o)])),
    schema: STATE_SCHEMA,
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
    const patch = state.resourcePatches?.[resource.id]
    if (patch) result = { ...result, files: patch.files, version: patch.version, history: patch.history }
    return result
  })
}

/** A curriculum review covers one version only. A new version or an adaptation starts unreviewed. */
export function currentCurriculumReview(resource: Resource): CurriculumReview | undefined {
  return resource.curriculumReview?.version === resource.version.label ? resource.curriculumReview : undefined
}

/** The author's open request to verify the pack's current version, if any. */
export function openVerificationRequest(state: DemoState, resource: Resource): VerificationRequest | undefined {
  return state.verificationRequests.find((r) => r.resourceId === resource.id && r.version === resource.version.label)
}

/** A persona with any account details the teacher edited applied. */
export function withEdits(persona: Persona, edits?: ProfileEdits): Persona {
  if (!edits) return persona
  const set = Object.fromEntries(Object.entries(edits).filter(([, value]) => typeof value === 'string' && value.trim()))
  return { ...persona, ...set }
}

/** "2.0" → "2.1", "1.4" → "1.5". */
export function nextMinorVersion(label: string): string {
  const [major, minor = '0'] = label.split('.')
  return `${major}.${Number(minor) + 1}`
}

export interface Earnings {
  gross: number
  fee: number
  net: number
  sales: (Sale & { title: string })[]
  byMonth: { month: string; net: number }[]
}

/** Bundle sales of a contributor's packs: catalogue history plus purchases made in this browser. */
export function contributorEarnings(contributorId: string, resources: Resource[], seedSales: Sale[], state: DemoState, personaLabel: (id: string) => string): Earnings {
  const own = new Map(resources.filter((r) => r.contributorId === contributorId && r.supplementBundle).map((r) => [r.id, r]))
  const local = new Map<string, Sale>()
  for (const a of state.acquisitions) {
    const resource = own.get(a.resourceId)
    if (!a.simulatedPurchase || !resource || a.personaId === contributorId) continue
    const key = `${a.personaId}-${a.resourceId}`
    if (!local.has(key)) local.set(key, { id: `local-${key}`, resourceId: a.resourceId, buyerLabel: personaLabel(a.personaId), amountPhp: resource.supplementBundle!.pricePhp, date: new Date().toISOString().slice(0, 10) })
  }
  const sales = [...seedSales.filter((sale) => own.has(sale.resourceId)), ...local.values()]
    .map((sale) => ({ ...sale, title: own.get(sale.resourceId)!.title }))
    .sort((a, b) => b.date.localeCompare(a.date))
  const gross = sales.reduce((sum, sale) => sum + sale.amountPhp, 0)
  const fee = Math.round(gross * PLATFORM_FEE * 100) / 100
  const months = new Map<string, number>()
  for (const sale of sales) months.set(sale.date.slice(0, 7), (months.get(sale.date.slice(0, 7)) ?? 0) + sale.amountPhp * (1 - PLATFORM_FEE))
  const byMonth = [...months].sort(([a], [b]) => a.localeCompare(b)).map(([month, net]) => ({ month, net: Math.round(net * 100) / 100 }))
  return { gross, fee, net: Math.round((gross - fee) * 100) / 100, sales, byMonth }
}

/** Count of current-version ratings at each star level, 5 down to 1. */
export function ratingDistribution(contributorId: string, resources: Resource[], reviews: Review[]): { stars: number; count: number }[] {
  const ratings = resources
    .filter((res) => res.contributorId === contributorId && res.status === 'published')
    .flatMap((res) => currentReviews(res, reviews).map((r) => r.rating))
  return [5, 4, 3, 2, 1].map((stars) => ({ stars, count: ratings.filter((r) => r === stars).length }))
}

export function allReviews(catalogue: Catalogue, state: DemoState): Review[] {
  return [...catalogue.seedReviews, ...state.reviews]
}

const major = (label: string) => label.split('.')[0]

/**
 * Reviews of the current major version. A minor revision (2.0 → 2.1) keeps them;
 * a new major version (2.x → 3.0) starts fresh.
 */
export function currentReviews(resource: Resource, reviews: Review[]): Review[] {
  return reviews.filter((r) => r.resourceId === resource.id && major(r.resourceVersion) === major(resource.version.label))
}

/** Reviews of earlier major versions. Shown with a label, excluded from means and counts. */
export function olderReviews(resource: Resource, reviews: Review[]): Review[] {
  return reviews.filter((r) => r.resourceId === resource.id && major(r.resourceVersion) !== major(resource.version.label))
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
  | { type: 'request-verification'; resource: Resource; at: string }
  | { type: 'propose-revision'; proposal: RevisionProposal; resource: Resource }
  | { type: 'decide-revision'; proposalId: string; resource: Resource; approve: boolean; proposerLabel: string; at: string }
  | { type: 'save-profile'; edits: ProfileEdits }
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
      if (action.role !== 'moderator') throw new DemoRuleError('Only the verifier can mark a pack verified.')
      if (action.resource.status !== 'published') throw new DemoRuleError('Only public packs can be verified.')
      return {
        ...state,
        curriculumReviews: {
          ...state.curriculumReviews,
          [action.resource.id]: { version: action.resource.version.label, reviewer: DEMO_REVIEWER, date: action.date },
        },
        verificationRequests: state.verificationRequests.filter((r) => r.resourceId !== action.resource.id),
      }
    }

    case 'request-verification': {
      if (action.resource.contributorId !== state.personaId) throw new DemoRuleError('Only the pack’s author can ask for verification.')
      if (action.resource.status !== 'published') throw new DemoRuleError('Only public packs can be verified.')
      if (currentCurriculumReview(action.resource)) throw new DemoRuleError('This version is already verified.')
      if (openVerificationRequest(state, action.resource)) throw new DemoRuleError('Verification is already requested for this version.')
      // Priority verification is a Pro feature that isn't implemented, so every request joins the free queue.
      const request: VerificationRequest = { resourceId: action.resource.id, version: action.resource.version.label, tier: 'standard', requestedAt: action.at }
      return { ...state, verificationRequests: [...state.verificationRequests, request] }
    }

    case 'propose-revision': {
      if (action.resource.status !== 'published') throw new DemoRuleError('Only published packs can receive revisions.')
      if (action.resource.contributorId === state.personaId) throw new DemoRuleError('You can update your own pack directly.')
      if (!action.proposal.summary.trim()) throw new DemoRuleError('Describe what you changed.')
      if (!action.resource.files.some((f) => f.id === action.proposal.fileId)) throw new DemoRuleError('Choose a file in this pack to revise.')
      return { ...state, revisions: [...state.revisions, { ...action.proposal, proposerId: state.personaId, status: 'pending' }] }
    }

    case 'decide-revision': {
      const proposal = state.revisions.find((r) => r.id === action.proposalId)
      if (!proposal || proposal.status !== 'pending') throw new DemoRuleError('This revision was already handled.')
      if (action.resource.id !== proposal.resourceId || action.resource.contributorId !== state.personaId) throw new DemoRuleError('Only the pack’s author can approve revisions.')
      if (!action.approve) {
        return { ...state, revisions: state.revisions.map((r) => (r.id === proposal.id ? { ...r, status: 'declined', decidedAt: action.at } : r)) }
      }
      const current = action.resource
      const version = { label: nextMinorVersion(current.version.label), date: action.at.slice(0, 10), note: `Revision by ${action.proposerLabel}: ${proposal.summary}` }
      const files = current.files.map((f) =>
        f.id === proposal.fileId
          ? { ...f, name: proposal.file.name, sizeBytes: proposal.file.sizeBytes, mimeType: proposal.file.mimeType, previewPages: undefined, source: { type: 'local' as const, key: proposal.file.key } }
          : f,
      )
      return {
        ...state,
        resourcePatches: { ...state.resourcePatches, [current.id]: { files, version, history: [current.version, ...current.history] } },
        revisions: state.revisions.map((r) => (r.id === proposal.id ? { ...r, status: 'approved', decidedAt: action.at, resultVersion: version.label } : r)),
      }
    }

    case 'save-profile':
      return { ...state, profileEdits: { ...state.profileEdits, [state.personaId]: { ...state.profileEdits[state.personaId], ...action.edits } } }

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
