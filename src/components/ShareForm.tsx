import { useId, useState, type FormEvent, type ReactNode } from 'react'
import type { Resource, ResourceFile } from '../domain/types'
import { ACCEPTED_EXTENSIONS, extension, MAX_FILE_BYTES } from '../files'
import { formatBytes } from '../domain/logic'
import { navigate } from '../router'
import { deleteFiles, putFile } from '../storage/fileStore'
import { useStore } from '../store'
import { Empty, ErrorText } from './ui'

const GRADES = ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
const SUBJECTS = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'EPP / TLE', 'Values Education', 'Reading']

interface PickedFile {
  file: File
  label: string
  required: boolean
}

type Errors = Partial<Record<'title' | 'summary' | 'grade' | 'subject' | 'competency' | 'files' | 'permission' | 'changeNote' | 'submit', string>>

export function ShareForm({ parentId }: { parentId?: string }) {
  const { resources, persona, dispatch, notify, personaById } = useStore()
  const parent = parentId ? resources.find((r) => r.id === parentId && r.status === 'published') : undefined
  const [title, setTitle] = useState(parent ? `${parent.title} (adapted)` : '')
  const [summary, setSummary] = useState('')
  const [grade, setGrade] = useState(parent?.grade ?? '')
  const [subject, setSubject] = useState(parent?.subject ?? '')
  const [competency, setCompetency] = useState(parent?.competency.text ?? '')
  const [week, setWeek] = useState(parent ? `${parent.bow.quarter}, ${parent.bow.week}` : '')
  const [requirements, setRequirements] = useState(parent?.requirements.join('\n') ?? '')
  const [changeNote, setChangeNote] = useState('')
  const [picked, setPicked] = useState<PickedFile[]>([])
  const [permission, setPermission] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const id = useId()
  const f = (name: string) => `${id}-${name}`

  if (persona.role !== 'teacher') {
    return (
      <div className="page">
        <h1>Share a lesson</h1>
        <Empty title="Switch to a teacher persona to share">
          <p>The demo moderator reviews submissions but doesn’t share packs.</p>
        </Empty>
      </div>
    )
  }

  if (parentId && !parent) {
    return (
      <div className="page">
        <Empty title="The original pack isn’t available">
          <p>Only published packs can be adapted. It may be on hold or removed by a reset.</p>
          <a className="button" href="#/share">
            Share a new lesson instead
          </a>
        </Empty>
      </div>
    )
  }

  function addFiles(list: FileList | null) {
    if (!list) return
    const additions = [...list].map((file) => ({ file, label: file.name.replace(/\.[^.]+$/, ''), required: picked.length === 0 }))
    setPicked((current) => [...current, ...additions])
    setErrors((e) => ({ ...e, files: undefined }))
  }

  function fileProblem(file: File): string | null {
    if (!ACCEPTED_EXTENSIONS.includes(extension(file.name))) return `${file.name}: this file type isn’t accepted.`
    if (file.size === 0) return `${file.name} is empty.`
    if (file.size > MAX_FILE_BYTES) return `${file.name} is larger than ${formatBytes(MAX_FILE_BYTES)}.`
    return null
  }

  function validate(): Errors {
    const next: Errors = {}
    if (title.trim().length < 3) next.title = 'Give the pack a title.'
    if (!summary.trim()) next.summary = 'Describe what the lesson covers in a sentence or two.'
    if (!grade) next.grade = 'Choose a grade.'
    if (!subject) next.subject = 'Choose a subject.'
    if (!competency.trim()) next.competency = 'Name the competency or learning target.'
    if (picked.length === 0) next.files = 'Add at least one file.'
    else if (!picked.some((p) => p.required)) next.files = 'Mark at least one file as needed to teach the lesson.'
    else {
      const problem = picked.map((p) => fileProblem(p.file)).find(Boolean)
      if (problem) next.files = problem
      else if (picked.some((p) => !p.label.trim())) next.files = 'Give every file a short name.'
    }
    if (!permission) next.permission = 'Confirm you made this pack or have permission to share it.'
    if (parent && !changeNote.trim()) next.changeNote = 'Explain what you changed from the original.'
    return next
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.getElementById(f(Object.keys(found)[0]))?.focus()
      return
    }
    setSaving(true)
    const resourceId = `c-${Date.now().toString(36)}`
    const stored: string[] = []
    try {
      const files: ResourceFile[] = []
      for (const [i, p] of picked.entries()) {
        const key = `${resourceId}-${i}`
        await putFile(key, p.file)
        stored.push(key)
        files.push({
          id: `f${i}`,
          name: p.file.name,
          label: p.label.trim(),
          required: p.required,
          editable: ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'odt', 'odp', 'txt'].includes(extension(p.file.name)),
          sizeBytes: p.file.size,
          mimeType: p.file.type,
          source: { type: 'local', key },
        })
      }
      const [quarter = '', weekLabel = ''] = week.split(',').map((s) => s.trim())
      const today = new Date().toISOString().slice(0, 10)
      const resource: Resource = {
        id: resourceId,
        title: title.trim(),
        summary: summary.trim(),
        contributorId: persona.id,
        grade,
        subject,
        competency: { code: 'Not coded', text: competency.trim() },
        bow: { version: 'Entered by the contributor', quarter: quarter || 'Term not given', week: weekLabel || 'week not given' },
        requirements: requirements.split('\n').map((s) => s.trim()).filter(Boolean),
        tags: parent ? ['adaptation'] : ['new'],
        files,
        references: [{ label: parent ? `Adapted from “${parent.title}” version ${parent.version.label}.` : 'Contributor’s own work, as declared.' }],
        version: { label: '1.0', date: today, note: parent ? 'First version of this adaptation.' : 'First shared version.' },
        history: [],
        status: 'pending',
        permission: {
          kind: 'local-upload',
          notice: `${persona.alias} declared they made this pack or have permission to share it. Stored only in this browser for the demonstration.`,
        },
        parent: parent && { resourceId: parent.id, version: parent.version.label, title: parent.title, contributorId: parent.contributorId },
        changeNote: parent ? changeNote.trim() : undefined,
        baseline: { downloads: 0, bookmarks: 0 },
        createdAt: today,
      }
      dispatch({ type: 'add-contribution', resource })
      notify('Submitted. It’s waiting for the demo moderator.')
      navigate(`/resource/${resourceId}`)
    } catch {
      await deleteFiles(stored).catch(() => undefined)
      setErrors({ submit: 'The files couldn’t be stored in this browser. Storage may be full or blocked. Nothing was submitted.' })
      setSaving(false)
    }
  }

  const err = (name: keyof Errors) => (errors[name] ? `${f(name)}-error` : undefined)

  return (
    <div className="page narrow">
      <h1>{parent ? 'Share an adaptation' : 'Share a lesson'}</h1>
      {parent ? (
        <p className="lede">
          Your adaptation is shared as a separate pack that credits “{parent.title}” version {parent.version.label} by{' '}
          {personaById(parent.contributorId)?.alias}. The original stays unchanged.
        </p>
      ) : (
        <p className="lede">Upload the files you teach with. Other teachers download them and edit their own copy.</p>
      )}
      <p className="muted small">
        Demo only: files stay in this browser and are never sent to a server. Don’t include learners’ names or photos.
      </p>

      <form className="form" onSubmit={submit} noValidate>
        <Field label="Title" id={f('title')} error={errors.title}>
          <input id={f('title')} value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!errors.title} aria-describedby={err('title')} />
        </Field>
        <Field label="What the lesson covers" id={f('summary')} error={errors.summary}>
          <textarea id={f('summary')} rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} aria-invalid={!!errors.summary} aria-describedby={err('summary')} />
        </Field>
        <div className="form-row">
          <Field label="Grade" id={f('grade')} error={errors.grade}>
            <select id={f('grade')} value={grade} onChange={(e) => setGrade(e.target.value)} aria-invalid={!!errors.grade} aria-describedby={err('grade')}>
              <option value="">Choose…</option>
              {GRADES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="Subject" id={f('subject')} error={errors.subject}>
            <select id={f('subject')} value={subject} onChange={(e) => setSubject(e.target.value)} aria-invalid={!!errors.subject} aria-describedby={err('subject')}>
              <option value="">Choose…</option>
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Competency or learning target" id={f('competency')} error={errors.competency}>
          <input id={f('competency')} value={competency} onChange={(e) => setCompetency(e.target.value)} aria-invalid={!!errors.competency} aria-describedby={err('competency')} />
        </Field>
        <Field label="Budget of Work term and week (optional)" id={f('week')}>
          <input id={f('week')} placeholder="e.g. Term 2, Week 3" value={week} onChange={(e) => setWeek(e.target.value)} />
        </Field>
        <Field label="What a classroom needs, one per line (optional)" id={f('requirements')}>
          <textarea id={f('requirements')} rows={3} placeholder={'No internet needed\nOne worksheet per pair'} value={requirements} onChange={(e) => setRequirements(e.target.value)} />
        </Field>
        {parent && (
          <Field label="What you changed from the original" id={f('changeNote')} error={errors.changeNote}>
            <textarea id={f('changeNote')} rows={3} placeholder="e.g. Translated the worksheet into Bikol and removed the projector step" value={changeNote} onChange={(e) => setChangeNote(e.target.value)} aria-invalid={!!errors.changeNote} aria-describedby={err('changeNote')} />
          </Field>
        )}

        <fieldset className="files-field" aria-describedby={err('files')}>
          <legend>Files</legend>
          <p className="muted small">
            Word, PowerPoint, Excel, OpenDocument, PDF, text or images, up to {formatBytes(MAX_FILE_BYTES)} each.
          </p>
          <label className="button button-quiet file-picker" htmlFor={f('files')}>
            Add files
          </label>
          <input
            id={f('files')}
            className="visually-hidden"
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',')}
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
          {picked.length > 0 && (
            <ul className="picked">
              {picked.map((p, i) => (
                <li key={`${p.file.name}-${i}`}>
                  <span className="muted small">
                    {p.file.name}, {formatBytes(p.file.size)}
                  </span>
                  <label className="visually-hidden" htmlFor={`${f('label')}-${i}`}>
                    Name shown for {p.file.name}
                  </label>
                  <input
                    id={`${f('label')}-${i}`}
                    value={p.label}
                    onChange={(e) => setPicked((all) => all.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  />
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={p.required}
                      onChange={(e) => setPicked((all) => all.map((x, j) => (j === i ? { ...x, required: e.target.checked } : x)))}
                    />
                    Needed to teach
                  </label>
                  <button type="button" className="text-button" onClick={() => setPicked((all) => all.filter((_, j) => j !== i))}>
                    Remove <span className="visually-hidden">{p.file.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ErrorText id={err('files')}>{errors.files}</ErrorText>
        </fieldset>

        <div className="field">
          <label className="checkbox" htmlFor={f('permission')}>
            <input
              id={f('permission')}
              type="checkbox"
              checked={permission}
              onChange={(e) => setPermission(e.target.checked)}
              aria-invalid={!!errors.permission}
              aria-describedby={err('permission')}
            />
            I made this pack, or I have permission to share it. It contains no learners’ personal information.
          </label>
          <ErrorText id={err('permission')}>{errors.permission}</ErrorText>
        </div>

        <ErrorText>{errors.submit}</ErrorText>
        <div className="actions">
          <button className="button" type="submit" disabled={saving}>
            {saving ? 'Submitting…' : 'Submit for review'}
          </button>
          <button type="button" className="button button-quiet" disabled={saving} onClick={() => navigate(parent ? `/resource/${parent.id}` : '/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      <ErrorText id={error ? `${id}-error` : undefined}>{error}</ErrorText>
    </div>
  )
}
