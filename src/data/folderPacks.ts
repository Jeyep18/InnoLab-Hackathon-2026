import type { Persona, Resource, ResourceFile, Review } from '../domain/types'

export interface PackManifest {
  packs: {
    source: 'sample' | 'teacher'
    alias: string
    folder: string
    files: { name: string; sizeBytes: number; url: string }[]
  }[]
}

const OFFICE = new Set(['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'odt', 'odp'])
const EDITABLE = new Set([...OFFICE, 'txt'])
const PACK_DATE = '2026-10-26'

const STARTERS = [
  { id: 't-maricel-adornado', name: "Ma'am Maricel Adornado", text: 'Clear steps and easy to adapt for my class.' },
  { id: 't-ronald-sy', name: 'Sir Ronald Sy', text: 'The slides follow the lesson plan closely. Saved me a weekend.' },
  { id: 't-joan-bermas', name: "Ma'am Joan Bermas", text: 'Worksheets printed fine in black and white.' },
  { id: 't-kevin-lanuza', name: 'Sir Kevin Lanuza', text: 'Used the readings as advance reading before class. Good level for STEM.' },
  { id: 't-anne-marasigan', name: "Ma'am Anne Marasigan", text: 'The summative matched what we covered. I only changed two items.' },
  { id: 't-mark-alcantara', name: 'Sir Mark Alcantara', text: 'Solid sequence. I split it into two sessions for my section.' },
]

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const splitName = (name: string) => {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? { base: name, ext: '' } : { base: name.slice(0, dot), ext: name.slice(dot + 1).toLowerCase() }
}

/**
 * Reads "Grade 4 - Science - Term 2 Week 3 - Title" (BOW part optional).
 * Anything that doesn't follow the convention becomes the title, with grade and subject unknown.
 */
export function parseFolderName(folder: string) {
  const parts = folder.split(' - ').map((p) => p.trim())
  const isGrade = (s: string) => /^(grade \d{1,2}|kindergarten)$/i.test(s)
  if (parts.length >= 3 && isGrade(parts[0])) {
    const hasBow = parts.length >= 4 && /^(term|quarter)\s*\d/i.test(parts[2])
    const bowText = hasBow ? parts[2] : ''
    const bow = bowText.match(/^((?:term|quarter)\s*\d+)\s*,?\s*(.*)$/i)
    return {
      grade: parts[0].replace(/^grade/i, 'Grade'),
      subject: parts[1],
      quarter: bow?.[1] ?? '',
      week: bow?.[2] ?? '',
      title: parts.slice(hasBow ? 3 : 2).join(' - '),
    }
  }
  return { grade: 'Grade not given', subject: 'Subject not given', quarter: '', week: '', title: folder }
}

/** Turns folder packs into catalogue entries, credited to the folder's contributor alias. */
export function packsFromManifest(manifest: PackManifest, existing: Persona[]) {
  const personas: Persona[] = []
  const resources: Resource[] = []
  const reviews: Review[] = []

  let n = 0
  for (const pack of manifest.packs) {
    const known = existing.find((p) => p.alias === pack.alias) ?? personas.find((p) => p.alias === pack.alias)
    const contributorId = known?.id ?? `fp-${slug(pack.alias)}`
    if (!known) {
      personas.push({
        id: contributorId,
        alias: pack.alias,
        role: 'teacher',
        area: 'Bicol Region',
        bio: 'Shares lesson folders with slides and worksheets ready to print.',
        listed: false,
      })
    }

    const meta = parseFolderName(pack.folder)
    const officeBases = new Set(pack.files.map((f) => splitName(f.name)).filter((f) => OFFICE.has(f.ext)).map((f) => f.base))
    const files: ResourceFile[] = pack.files.map((f, i) => {
      const { base, ext } = splitName(f.name)
      const previewCopy = ext === 'pdf' && officeBases.has(base)
      return {
        id: `f${i}`,
        name: f.name,
        label: previewCopy ? `${base} (PDF copy)` : base,
        required: !previewCopy,
        editable: EDITABLE.has(ext),
        sizeBytes: f.sizeBytes,
        source: { type: 'url', url: f.url },
      }
    })
    const id = `fp-${pack.source}-${slug(pack.alias)}-${slug(pack.folder)}`
    const sample = pack.source === 'sample'

    resources.push({
      id,
      title: meta.title,
      summary: `${files.length} file${files.length === 1 ? '' : 's'} shared as a folder: ${files
        .filter((f) => f.required)
        .map((f) => f.label)
        .join(', ')}.`,
      contributorId,
      grade: meta.grade,
      subject: meta.subject,
      competency: { code: '', text: '' },
      bow: { version: '', quarter: meta.quarter, week: meta.week },
      requirements: [],
      tags: ['shared folder'],
      files,
      references: [{ label: 'Original lesson by the author.' }],
      version: { label: '1.0', date: PACK_DATE, note: 'First shared version.' },
      history: [],
      status: 'published',
      permission: sample
        ? { kind: 'fictional-sample', notice: 'Shared by the author under the license shown.' }
        : {
            kind: 'demo-only-teacher-file',
            notice: 'Shared for use in your own classes only. Not for redistribution, sale or public posting.',
          },
      license: sample ? 'cc-by-nc-sa' : 'all-rights-reserved',
      baseline: { downloads: 6, bookmarks: 2 },
      createdAt: PACK_DATE,
    })

    // Fixed starter feedback so a new folder pack doesn't look abandoned. Never in the teacher's voice.
    // Two starter reviews per pack, varied by pack so a shelf of folder packs doesn't repeat itself.
    const [a, b] = [STARTERS[n % STARTERS.length], STARTERS[(n + 3) % STARTERS.length]]
    reviews.push(
      { id: `${id}-s1`, resourceId: id, resourceVersion: '1.0', personaId: a.id, authorLabel: a.name, rating: 4, text: a.text, usedInClass: true, seeded: true, updatedAt: PACK_DATE },
      { id: `${id}-s2`, resourceId: id, resourceVersion: '1.0', personaId: b.id, authorLabel: b.name, rating: 5, text: '', usedInClass: false, seeded: true, updatedAt: PACK_DATE },
    )
    n++
  }
  return { personas, resources, reviews }
}
