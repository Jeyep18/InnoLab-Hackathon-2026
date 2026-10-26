export type PersonaRole = 'teacher' | 'moderator'

export interface Persona {
  id: string
  alias: string
  role: PersonaRole
  area: string
  bio: string
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

export type ResourceStatus = 'published' | 'pending' | 'held'

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
  references: { label: string; url?: string }[]
  version: VersionInfo
  history: VersionInfo[]
  status: ResourceStatus
  holdReason?: string
  permission: { kind: PermissionKind; notice: string }
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
}

export interface Catalogue {
  personas: Persona[]
  resources: Resource[]
  seedReviews: Review[]
}
