import type { Persona, Resource } from '@/domain/types'

/** Flat cover fill per subject. Every tone keeps white text above 7:1. */
const TONES: Record<string, string> = {
  science: 'bg-sage-700',
  mathematics: 'bg-sage-800',
  math: 'bg-sage-800',
  english: 'bg-sage-900',
  filipino: 'bg-[#3a3a3c]',
}
export function subjectTone(subject: string) {
  return TONES[subject.trim().toLowerCase()] ?? 'bg-[#1d1d1f]'
}

/** "DOCX ×3", "PDF", ... for the cover badges. */
export function fileKinds(resource: Resource): string[] {
  const counts = new Map<string, number>()
  for (const f of resource.files) {
    const ext = f.name.split('.').pop()?.toUpperCase() ?? 'FILE'
    counts.set(ext, (counts.get(ext) ?? 0) + 1)
  }
  return [...counts].map(([ext, n]) => (n > 1 ? `${ext} ×${n}` : ext))
}

/** Price of the optional paid files, or 0 when everything in the pack is free. Payments are simulated. */
export function paidFilesPrice(resource: Resource): number {
  if ((resource.supplementBundle?.pricePhp ?? 0) > 0) return resource.supplementBundle!.pricePhp
  return resource.files.reduce((sum, file) => sum + (file.samplePricePhp ?? 0), 0)
}

export const hasPaidFiles = (resource: Resource) => paidFilesPrice(resource) > 0

const HONORIFICS = /^(ma'?am|sir|teacher|tr\.?|mr\.?|ms\.?|mrs\.?|demo)$/i
export function initials(persona?: Persona) {
  const words = (persona?.alias ?? '?').split(/\s+/).filter((w) => !HONORIFICS.test(w.replace(/[’']/g, "'")))
  return (words.length ? words : ['?'])
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

const sortNum = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })
export const uniqueSorted = (values: string[]) => [...new Set(values.filter(Boolean))].sort(sortNum)

/** "Grades 3–6" from the packs' grade labels. */
export function gradeRange(resources: Resource[]) {
  const nums = resources.map((r) => Number(r.grade.match(/\d+/)?.[0])).filter((n) => !Number.isNaN(n))
  if (nums.length === 0) return ''
  const lo = Math.min(...nums)
  const hi = Math.max(...nums)
  return lo === hi ? `Grade ${lo}` : `Grades ${lo}–${hi}`
}
