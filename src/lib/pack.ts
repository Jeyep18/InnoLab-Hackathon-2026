import type { Persona, Resource } from '@/domain/types'

/** Cover tint per subject. Gradients darken toward the bottom where the white text sits. */
const TONES: Record<string, string> = {
  science: 'from-[#7a8b68] to-[#4f5c44]',
  mathematics: 'from-[#8c6d79] to-[#5e4553]',
  math: 'from-[#8c6d79] to-[#5e4553]',
  english: 'from-[#8a7564] to-[#54463b]',
  filipino: 'from-[#6f7f86] to-[#465359]',
}
export function subjectTone(subject: string) {
  return TONES[subject.trim().toLowerCase()] ?? 'from-[#6e655f] to-[#433b36]'
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
