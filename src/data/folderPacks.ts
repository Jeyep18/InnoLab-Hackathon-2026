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

  for (const pack of manifest.packs) {
    const known = existing.find((p) => p.alias === pack.alias) ?? personas.find((p) => p.alias === pack.alias)
    const contributorId = known?.id ?? `fp-${slug(pack.alias)}`
    if (!known) {
      personas.push({
        id: contributorId,
        alias: pack.alias,
        role: 'teacher',
        area: pack.source === 'sample' ? 'Placeholder contributor' : 'Teacher contributor (alias)',
        bio:
          pack.source === 'sample'
            ? 'Fictional placeholder teacher made by the CherIt team for this demonstration.'
            : 'A teacher who shared files for this demonstration, shown under an alias.',
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
      tags: [sample ? 'placeholder pack' : 'teacher-shared'],
      files,
      references: [{ label: sample ? 'Placeholder content written by the CherIt team.' : 'Teacher’s own files, shared for this demonstration.' }],
      version: { label: '1.0', date: PACK_DATE, note: 'First shared version.' },
      history: [],
      status: 'published',
      permission: sample
        ? { kind: 'fictional-sample', notice: 'Fictional placeholder pack made by the CherIt team. Not a real teacher’s file.' }
        : {
            kind: 'demo-only-teacher-file',
            notice: 'Shared by an interviewed teacher for this demonstration only. Not for redistribution, sale or public posting.',
          },
      baseline: { downloads: 6, bookmarks: 2 },
      createdAt: PACK_DATE,
    })

    // Fixed, labelled placeholder feedback (approved for the demo). Never in the teacher's voice.
    reviews.push(
      { id: `${id}-s1`, resourceId: id, resourceVersion: '1.0', personaId: 'sample-g', authorLabel: 'Sample teacher G', rating: 4, text: 'Clear steps and easy to adapt for my class.', usedInClass: false, seeded: true, updatedAt: PACK_DATE },
      { id: `${id}-s2`, resourceId: id, resourceVersion: '1.0', personaId: 'sample-h', authorLabel: 'Sample teacher H', rating: 5, text: '', usedInClass: false, seeded: true, updatedAt: PACK_DATE },
    )
  }
  return { personas, resources, reviews }
}
