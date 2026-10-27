export type PersonaRole = 'teacher' | 'moderator'

export interface Persona {
  id: string
  alias: string
  role: PersonaRole
  area: string
  bio: string
  /** False for contributors who aren't offered in the account switcher. */
  listed?: boolean
  school?: string
  position?: string
  /** ISO date the account was created. */
  joined?: string
  subjects?: string[]
  email?: string
}

/** A past bundle sale, used for contributor earnings. */
export interface Sale {
  id: string
  resourceId: string
  buyerLabel: string
  amountPhp: number
  date: string
}

/** A private change another teacher proposes to a pack's author. Approving it publishes a new version. */
export interface RevisionProposal {
  id: string
  resourceId: string
  /** Version the proposer started from. */
  baseVersion: string
  proposerId: string
  /** File in the pack the revision replaces. */
  fileId: string
  file: { name: string; sizeBytes: number; mimeType: string; key: string }
  summary: string
  status: 'pending' | 'approved' | 'declined'
  createdAt: string
  decidedAt?: string
  /** Version created when the author approved it. */
  resultVersion?: string
}

/** Account details a teacher edited in settings. */
export interface ProfileEdits {
  alias?: string
  bio?: string
  school?: string
  area?: string
  position?: string
}

export interface LessonSection {
  heading: string
  items: string[]
}

export interface LessonContent {
  objective: string
  sections: LessonSection[]
}

/** Where a file's bytes come from. */
export type FileSource =
  | { type: 'url'; url: string }
  | { type: 'local'; key: string }

export interface ResourceFile {
  id: string
  name: string
  label: string
  required: boolean
  editable: boolean
  sizeBytes?: number
  mimeType?: string
  source: FileSource
  /** Sample price for a simulated paid supplement. Never a real sale. */
  samplePricePhp?: number
  category?: 'lesson-plan' | 'supplement'
  previewPages?: { source: FileSource; blurred: boolean; page: number }[]
}

export interface CurriculumReview {
  version: string
  reviewer: string
  date: string
}

export interface VersionInfo {
  label: string
  date: string
  note: string
}

/** Uploads go live immediately; 'held' hides a pack after a report until a verifier restores it. */
export type ResourceStatus = 'published' | 'held'

/** 'priority' belongs to the Pro plan, which is shown but not implemented. */
export type VerificationTier = 'standard' | 'priority'

/** An author asking the verifier to check one version of their pack. Optional and free. */
export interface VerificationRequest {
  resourceId: string
  version: string
  tier: VerificationTier
  requestedAt: string
}

export type PermissionKind = 'fictional-sample' | 'demo-only-teacher-file' | 'local-upload'

export interface Resource {
  id: string
  title: string
  summary: string
  contributorId: string
  grade: string
  subject: string
  competency: { code: string; text: string }
  bow: { version: string; quarter: string; week: string }
  requirements: string[]
  tags: string[]
  files: ResourceFile[]
  supplementBundle?: { pricePhp: number }
  references: { label: string; url?: string }[]
  version: VersionInfo
  history: VersionInfo[]
  status: ResourceStatus
  holdReason?: string
  permission: { kind: PermissionKind; notice: string }
  /** License the contributor chose for the free lesson plan. Absent on seed and folder packs. */
  license?: 'cc-by' | 'cc-by-sa' | 'cc-by-nc' | 'cc-by-nc-sa' | 'all-rights-reserved'
  parent?: { resourceId: string; version: string; title: string; contributorId: string }
  changeNote?: string
  /** Simulated curriculum review of one specific version. Separate from publishing. */
  curriculumReview?: CurriculumReview
  lesson?: LessonContent
  /** Illustrative counts from before the demo starts. Labelled as sample data. */
  baseline: { downloads: number; bookmarks: number }
  createdAt: string
}

export interface Review {
  id: string
  resourceId: string
  resourceVersion: string
  personaId: string
  authorLabel: string
  rating: number
  text: string
  usedInClass: boolean
  seeded: boolean
  updatedAt: string
}

export interface DownloadEvent {
  resourceId: string
  fileId: string
  personaId: string
  at: string
}

export interface Acquisition {
  personaId: string
  resourceId: string
  fileId: string
  simulatedPurchase: boolean
}

/** Everything the demo changes. Seed data stays separate so reset is just "clear this". */
export interface DemoState {
  schema: number
  personaId: string
  bookmarks: { personaId: string; resourceId: string }[]
  reviews: Review[]
  downloads: DownloadEvent[]
  acquisitions: Acquisition[]
  contributions: Resource[]
  statusOverrides: Record<string, { status: ResourceStatus; holdReason?: string }>
  curriculumReviews: Record<string, CurriculumReview>
  revisions: RevisionProposal[]
  /** Changes to a pack from approved revisions: replaced files and the new version history. */
  resourcePatches: Record<string, { files: ResourceFile[]; version: VersionInfo; history: VersionInfo[] }>
  profileEdits: Record<string, ProfileEdits>
  verificationRequests: VerificationRequest[]
}

export interface Catalogue {
  personas: Persona[]
  resources: Resource[]
  seedReviews: Review[]
  seedSales: Sale[]
}
