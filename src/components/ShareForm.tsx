import { ArrowLeft, ArrowRight, GitFork, Loader2, PackageX, Plus, Send, ShieldCheck, UserRoundCog, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Container, EmptyState } from '@/components/site/layout'
import { PackCover } from '@/components/site/PackCover'
import { formatBytes } from '@/domain/logic'
import type { Resource, ResourceFile } from '@/domain/types'
import { extension } from '@/files'
import { curriculumBasis, SCHOOL_LEVELS, schoolLevelForGrade, type SchoolLevel } from '@/lib/curriculum'
import { cn } from '@/lib/utils'
import { navigate } from '@/router'
import { deleteFiles, putFile } from '@/storage/fileStore'
import { useStore } from '@/store'
import { FilePicker, fileProblem, type PickedFile } from './share/FilePicker'
import { describedBy, FieldError, FormField } from './share/FormField'
import { Stepper } from './share/Stepper'

const SUBJECTS = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'EPP / TLE', 'Values Education', 'Reading']
const COMMON_CLASSROOM_NEEDS = ['Internet', 'Phone or tablet', 'Computer', 'Projector', 'Laboratory', 'Printer', 'Speakers', 'Printed worksheets']
const STEPS = ['Lesson info', 'Teaching files', 'Review'] as const

type ErrorKey = 'title' | 'summary' | 'schoolLevel' | 'grade' | 'subject' | 'competency' | 'files' | 'permission' | 'changeNote' | 'submit'
type Errors = Partial<Record<ErrorKey, string>>

/** Which wizard step owns each validated field, in on-screen order. */
const STEP_FIELDS: ErrorKey[][] = [['title', 'summary', 'schoolLevel', 'grade', 'subject', 'competency', 'changeNote'], ['files'], ['permission']]

const pageTitle = 'text-3xl font-bold tracking-tight sm:text-4xl'

export function ShareForm({ parentId }: { parentId?: string }) {
  const { resources, persona, dispatch, notify, personaById } = useStore()
  const parent = parentId ? resources.find((r) => r.id === parentId && r.status === 'published') : undefined
  const [title, setTitle] = useState(parent ? `${parent.title} (adapted)` : '')
  const [summary, setSummary] = useState('')
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | ''>(schoolLevelForGrade(parent?.grade ?? ''))
  const [grade, setGrade] = useState(parent?.grade ?? '')
  const [subject, setSubject] = useState(parent?.subject ?? '')
  const [competency, setCompetency] = useState(parent?.competency.text ?? '')
  const [quarter, setQuarter] = useState(parent?.bow.quarter ?? '')
  const [week, setWeek] = useState(parent?.bow.week ?? '')
  const [requirements, setRequirements] = useState(parent?.requirements.join('\n') ?? '')
  const [customNeed, setCustomNeed] = useState('')
  const [changeNote, setChangeNote] = useState('')
  const [picked, setPicked] = useState<PickedFile[]>([])
  const [supplements, setSupplements] = useState<PickedFile[]>([])
  const [supplementAccess, setSupplementAccess] = useState('free')
  const [bundlePrice, setBundlePrice] = useState('')
  const [permission, setPermission] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [announcement, setAnnouncement] = useState('')
  const reduceMotion = useReducedMotion()
  const id = useId()
  const f = (name: string) => `${id}-${name}`

  // Focus target for after a step change or a failed "Next". Resolved once the element is mounted.
  const pendingFocus = useRef<string | null>(null)
  const flushFocus = useCallback(() => {
    if (!pendingFocus.current) return
    const el = document.getElementById(pendingFocus.current)
    if (el) {
      el.focus()
      pendingFocus.current = null
    }
  }, [])
  useEffect(flushFocus, [step, errors, flushFocus])

  if (persona.role !== 'teacher') {
    return (
      <Container className="max-w-3xl pt-10 pb-16">
        <h1 className={pageTitle}>Share a lesson</h1>
        <EmptyState
          className="mt-8"
          icon={<UserRoundCog />}
          title="Switch to a teacher persona to share"
          actions={
            <Button
              onClick={() => {
                dispatch({ type: 'select-persona', personaId: 'p-joy' })
                notify("Now sharing as Ma'am Joy (demo account).")
              }}
            >
              Continue as Ma&apos;am Joy
            </Button>
          }
        >
          <p>The demo moderator reviews submissions but doesn’t share packs.</p>
          <p className="mt-2 text-sm">You can choose another teacher from the account menu at the top right.</p>
        </EmptyState>
      </Container>
    )
  }

  if (parentId && !parent) {
    return (
      <Container className="max-w-3xl pt-10 pb-16">
        <EmptyState
          icon={<PackageX />}
          title="The original pack isn’t available"
          actions={
            <Button render={<a href="#/share" />} nativeButton={false}>Share a new lesson instead</Button>
          }
        >
          Only published packs can be adapted. It may be on hold or removed by a reset.
        </EmptyState>
      </Container>
    )
  }

  function validate(): Errors {
    const next: Errors = {}
    if (title.trim().length < 3) next.title = 'Give the pack a title.'
    if (!summary.trim()) next.summary = 'Describe what the lesson covers in a sentence or two.'
    if (!schoolLevel) next.schoolLevel = 'Choose a school level.'
    if (!grade) next.grade = 'Choose a grade.'
    if (!subject.trim()) next.subject = 'Enter a subject.'
    if (!competency.trim()) next.competency = 'Name the competency or learning target.'
    if (picked.length === 0) next.files = 'Upload a free lesson plan.'
    else if (picked.some((p) => /\.(mp4|webm|mov)$/i.test(p.file.name))) next.files = 'Upload a document for the lesson plan. Add videos under supplements.'
    else {
      const problems = [...picked, ...supplements].map((p) => fileProblem(p.file)).filter(Boolean)
      if (problems.length > 0) next.files = `${problems.join(' ')} Remove ${problems.length === 1 ? 'it' : 'them'} to continue.`
      else if ([...picked, ...supplements].some((p) => !p.label.trim())) next.files = 'Give every file a short name.'
      else if (supplementAccess === 'paid' && supplements.length > 0) {
        if (!Number.isFinite(Number(bundlePrice)) || Number(bundlePrice) <= 0 || !/^\d+(\.\d{1,2})?$/.test(bundlePrice)) next.files = 'Enter a bundle price greater than ₱0 (up to two decimal places).'
        else if (supplements.some((p) => !/\.(mp4|webm|mov)$/i.test(p.file.name) && !p.previewPages?.length)) next.files = 'Set preview pages for each paid document. Videos stay fully locked.'
      }
    }
    if (!permission) next.permission = 'Confirm you made this pack or have permission to share it.'
    if (parent && !changeNote.trim()) next.changeNote = 'Explain what you changed from the original.'
    return next
  }

  /** Errors from `found` that belong to the given step, in on-screen order. */
  const stepErrors = (found: Errors, s: number) => STEP_FIELDS[s].filter((k) => found[k])

  function goTo(next: number, focusId?: string) {
    setDirection(next > step ? 1 : -1)
    pendingFocus.current = focusId ?? f(`step-${next}-heading`)
    setStep(next)
  }

  function showErrors(found: Errors, s: number) {
    const keys = stepErrors(found, s)
    setErrors(Object.fromEntries(keys.map((k) => [k, found[k]])))
    setAnnouncement(`${keys.length === 1 ? '1 field needs' : `${keys.length} fields need`} attention before you continue.`)
    if (s === step) {
      pendingFocus.current = f(keys[0])
      flushFocus()
    } else goTo(s, f(keys[0]))
  }

  function next() {
    const found = validate()
    if (stepErrors(found, step).length > 0) return showErrors(found, step)
    setErrors({})
    setAnnouncement('')
    goTo(step + 1)
  }

  /** Go back to an earlier step (Back, the stepper or an "Edit" link) without validating or losing input. */
  function jumpBack(s: number) {
    setErrors({})
    setAnnouncement('')
    goTo(s)
  }

  async function submit() {
    if (saving) return
    const found = validate()
    const firstBad = STEP_FIELDS.findIndex((_, s) => stepErrors(found, s).length > 0)
    if (firstBad !== -1) return showErrors(found, firstBad)
    setErrors({})
    setSaving(true)
    const resourceId = `c-${Date.now().toString(36)}`
    const stored: string[] = []
    try {
      const files: ResourceFile[] = []
      for (const [i, p] of [...picked, ...supplements].entries()) {
        const key = `${resourceId}-${i}`
        await putFile(key, p.file)
        stored.push(key)
        files.push({
          id: `f${i}`,
          name: p.file.name,
          label: p.label.trim(),
          required: i < picked.length,
          category: i < picked.length ? 'lesson-plan' : 'supplement',
          editable: ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'odt', 'odp', 'txt'].includes(extension(p.file.name)),
          sizeBytes: p.file.size,
          mimeType: p.file.type,
          source: { type: 'local', key },
        })
        if (i >= picked.length && supplementAccess === 'paid' && p.previewPages) {
          const { exportPreviewPage } = await import('@/lib/document-preview')
          files[files.length - 1].previewPages = []
          for (const [pageIndex, page] of p.previewPages.entries()) {
            const previewKey = `${key}-preview-${pageIndex}`
            await putFile(previewKey, await exportPreviewPage(page))
            stored.push(previewKey)
            files[files.length - 1].previewPages!.push({ source: { type: 'local', key: previewKey }, page: pageIndex + 1, blurred: page.blurred })
          }
        }
      }
      const today = new Date().toISOString().slice(0, 10)
      const resource: Resource = {
        id: resourceId,
        title: title.trim(),
        summary: summary.trim(),
        contributorId: persona.id,
        grade,
        subject,
        competency: { code: '', text: competency.trim() },
        bow: { version: 'Entered by the contributor', quarter: quarter.trim(), week: week.trim() },
        requirements: requirements.split('\n').map((s) => s.trim()).filter(Boolean),
        tags: parent ? ['adaptation'] : ['new'],
        files,
        supplementBundle: supplementAccess === 'paid' && supplements.length > 0 ? { pricePhp: Number(bundlePrice) } : undefined,
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

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    if (step < STEPS.length - 1) next()
    else void submit()
  }

  const cancel = () => navigate(parent ? `/resource/${parent.id}` : '/')
  const selectedLevel = SCHOOL_LEVELS.find((level) => level.value === schoolLevel)
  const gradeOptions: string[] = selectedLevel ? [...selectedLevel.grades] : []
  if (grade && !gradeOptions.includes(grade)) gradeOptions.unshift(grade)
  const subjectOptions = subject && !SUBJECTS.includes(subject) ? [subject, ...SUBJECTS] : SUBJECTS
  const requirementItems = requirements.split('\n').map((item) => item.trim()).filter(Boolean)
  const customRequirements = requirementItems.filter((item) => !COMMON_CLASSROOM_NEEDS.includes(item))
  const parentAuthor = parent && personaById(parent.contributorId)?.alias
  const isLast = step === STEPS.length - 1

  const setRequirementItems = (items: string[]) => setRequirements([...new Set(items.map((item) => item.trim()).filter(Boolean))].join('\n'))
  const toggleRequirement = (item: string) =>
    setRequirementItems(requirementItems.includes(item) ? requirementItems.filter((current) => current !== item) : [...requirementItems, item])
  const addCustomNeed = () => {
    const item = customNeed.trim()
    if (!item) return
    setRequirementItems([...requirementItems, item])
    setCustomNeed('')
  }

  const panel = {
    initial: reduceMotion ? false : { opacity: 0, x: direction * 12 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const } },
    exit: reduceMotion ? undefined : { opacity: 0, x: direction * -8, transition: { duration: 0.12, ease: 'easeIn' as const } },
  }

  return (
    <Container className="max-w-3xl pt-8 pb-8 sm:pb-16">
      <header>
        <h1 className={pageTitle}>{parent ? 'Share an adaptation' : 'Share a lesson'}</h1>
        {parent && <p className="mt-2 text-sm text-muted-foreground">The original stays unchanged.</p>}
      </header>

      {parent && (
        <section aria-label="Original pack" className="mt-6 flex items-center gap-4 rounded-2xl border bg-secondary/50 p-3 pr-4">
          <div aria-hidden="true" className="w-20 shrink-0">
            <PackCover resource={parent} size="thumb" />
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-mauve-ink uppercase">
              <GitFork aria-hidden="true" className="size-3.5" /> Adapting
            </p>
            <p className="mt-0.5 truncate font-semibold">
              <a href={`#/resource/${parent.id}`} className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50">
                “{parent.title}”
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              Version {parent.version.label} by {parentAuthor}. Your pack credits them.
            </p>
          </div>
        </section>
      )}

      <div className="mt-6">
        <Stepper steps={STEPS} current={step} onSelect={(s) => s < step && jumpBack(s)} />
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} {...panel} className="rounded-2xl border bg-card p-5 sm:p-8">
            <OnMount run={flushFocus} />
            <h2 id={f(`step-${step}-heading`)} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none">
              {step === 0 && 'Lesson info'}
              {step === 1 && 'Teaching files'}
              {step === 2 && 'Review'}
            </h2>

            {step === 0 && (
              <div className="mt-5 flex flex-col gap-5">
                <FormField id={f('title')} label="Title" error={errors.title}>
                  <Input id={f('title')} value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!errors.title} aria-describedby={describedBy(f('title'), { error: errors.title })} />
                </FormField>
                <FormField id={f('summary')} label="Short description" error={errors.summary}>
                  <Textarea
                    id={f('summary')}
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    aria-invalid={!!errors.summary}
                    aria-describedby={describedBy(f('summary'), { error: errors.summary })}
                  />
                </FormField>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField id={f('schoolLevel')} label="School level" error={errors.schoolLevel}>
                    <Select
                      items={[{ value: null, label: 'Choose a level' }, ...SCHOOL_LEVELS.map((level) => ({ value: level.value, label: level.label }))]}
                      value={schoolLevel || null}
                      onValueChange={(value) => {
                        setSchoolLevel(value ?? '')
                        setGrade('')
                        setErrors((current) => ({ ...current, schoolLevel: undefined, grade: undefined }))
                      }}
                    >
                      <SelectTrigger
                        id={f('schoolLevel')}
                        className="w-full"
                        aria-invalid={!!errors.schoolLevel}
                        aria-describedby={describedBy(f('schoolLevel'), { error: errors.schoolLevel })}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {SCHOOL_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField
                    id={f('grade')}
                    label="Grade level"
                    hint={schoolLevel === 'preschool' ? 'ECCD for Pre-K · DepEd for Kindergarten' : undefined}
                    error={errors.grade}
                  >
                    <Select
                      items={[{ value: null, label: schoolLevel ? 'Choose a grade' : 'Choose a level first' }, ...gradeOptions.map((option) => ({ value: option, label: option }))]}
                      value={grade || null}
                      onValueChange={(value) => setGrade(value ?? '')}
                      disabled={!schoolLevel}
                    >
                      <SelectTrigger
                        id={f('grade')}
                        className="w-full"
                        aria-invalid={!!errors.grade}
                        aria-describedby={describedBy(f('grade'), { hint: schoolLevel === 'preschool', error: errors.grade })}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {gradeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
                {grade && (
                  <p className="-mt-2 w-fit rounded-full border bg-secondary/60 px-3 py-1 text-xs font-semibold text-secondary-foreground">{curriculumBasis(grade)}</p>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField id={f('subject')} label="Learning area or subject" error={errors.subject}>
                    <Input
                      id={f('subject')}
                      list={f('subject-options')}
                      placeholder="Type or choose"
                      value={subject}
                      autoComplete="off"
                      spellCheck={false}
                      data-1p-ignore
                      aria-invalid={!!errors.subject}
                      aria-describedby={describedBy(f('subject'), { error: errors.subject })}
                      onChange={(event) => {
                        setSubject(event.target.value)
                        if (errors.subject) setErrors((current) => ({ ...current, subject: undefined }))
                      }}
                    />
                    <datalist id={f('subject-options')}>
                      {subjectOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </FormField>
                  <FormField id={f('competency')} label="Expected competency" error={errors.competency}>
                    <Input
                      id={f('competency')}
                      placeholder="Learning outcome"
                      value={competency}
                      onChange={(e) => setCompetency(e.target.value)}
                      aria-invalid={!!errors.competency}
                      aria-describedby={describedBy(f('competency'), { error: errors.competency })}
                    />
                  </FormField>
                </div>
                <section aria-labelledby={f('class-setup')} className="border-t pt-4">
                  <div className="flex items-baseline gap-2">
                    <h3 id={f('class-setup')} className="text-sm font-semibold">Class setup</h3>
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <FormField id={f('quarter')} label="Quarter">
                      <Select
                        items={[{ value: null, label: 'Choose' }, ...['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'].map((option) => ({ value: option, label: option }))]}
                        value={quarter || null}
                        onValueChange={(value) => setQuarter(value ?? '')}
                      >
                        <SelectTrigger id={f('quarter')} className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'].map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField id={f('week')} label="Week">
                      <Input id={f('week')} inputMode="numeric" placeholder="e.g. Week 3" value={week} onChange={(e) => setWeek(e.target.value)} />
                    </FormField>
                  </div>
                  <div className="mt-4">
                    <p id={f('requirements-label')} className="text-sm font-medium">Classroom needs</p>
                    <div role="group" aria-labelledby={f('requirements-label')} className="mt-2 flex flex-wrap gap-2">
                      {COMMON_CLASSROOM_NEEDS.map((item) => {
                        const selected = requirementItems.includes(item)
                        return (
                          <Button
                            key={item}
                            type="button"
                            variant={selected ? 'default' : 'outline'}
                            size="sm"
                            aria-pressed={selected}
                            onClick={() => toggleRequirement(item)}
                            className="rounded-full"
                          >
                            {item}
                          </Button>
                        )
                      })}
                      {customRequirements.map((item) => (
                        <Button
                          key={item}
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => toggleRequirement(item)}
                          aria-label={`Remove ${item}`}
                          className="rounded-full"
                        >
                          {item} <X aria-hidden="true" className="size-3.5" />
                        </Button>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id={f('requirements')}
                        value={customNeed}
                        placeholder="Add another need"
                        autoComplete="off"
                        spellCheck={false}
                        onChange={(event) => setCustomNeed(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter') return
                          event.preventDefault()
                          addCustomNeed()
                        }}
                      />
                      <Button type="button" variant="outline" size="icon" disabled={!customNeed.trim()} onClick={addCustomNeed} aria-label="Add classroom need">
                        <Plus aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </section>
                {parent && (
                  <FormField id={f('changeNote')} label="What you changed from the original" hint="Teachers see this next to the credit to the original pack." error={errors.changeNote}>
                    <Textarea
                      id={f('changeNote')}
                      rows={3}
                      placeholder="e.g. Translated the worksheet into Bikol and removed the projector step"
                      value={changeNote}
                      onChange={(e) => setChangeNote(e.target.value)}
                      aria-invalid={!!errors.changeNote}
                      aria-describedby={describedBy(f('changeNote'), { hint: true, error: errors.changeNote })}
                    />
                  </FormField>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="mt-5 space-y-6">
                <section aria-label="Free lesson plan">
                <div className="mb-3 flex items-center gap-2"><h3 className="font-semibold">Lesson plan</h3><span className="rounded-full bg-secondary px-2 py-0.5 text-xs">Always free · Required</span></div>
                <FilePicker id={f('files')} picked={picked} setPicked={setPicked} error={errors.files} onAdded={() => setErrors((e) => ({ ...e, files: undefined }))} />
                </section>
                <section aria-label="Supplementary materials" className="border-t pt-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2"><h3 className="mr-auto font-semibold">Supplementary materials</h3><span className="text-xs text-muted-foreground">Optional</span></div>
                  <div role="group" aria-label="Supplement pricing" className="mb-4 flex flex-wrap items-center gap-2">
                    <Button type="button" variant={supplementAccess === 'free' ? 'default' : 'outline'} aria-pressed={supplementAccess === 'free'} onClick={() => setSupplementAccess('free')}>Free</Button>
                    <Button type="button" variant={supplementAccess === 'paid' ? 'default' : 'outline'} aria-pressed={supplementAccess === 'paid'} onClick={() => setSupplementAccess('paid')}>Paid bundle</Button>
                    {supplementAccess === 'paid' && <div className="flex items-center gap-2"><label htmlFor={f('bundle-price')} className="text-sm">₱</label><Input id={f('bundle-price')} aria-label="Supplement bundle price in pesos" className="w-28" inputMode="decimal" placeholder="0.00" value={bundlePrice} onChange={(event) => setBundlePrice(event.target.value)} /><span className="text-xs text-muted-foreground">One price · All supplements</span></div>}
                  </div>
                  <FilePicker id={f('supplements')} picked={supplements} setPicked={setSupplements} kind="supplement" paid={supplementAccess === 'paid'} onAdded={() => setErrors((e) => ({ ...e, files: undefined }))} />
                  {supplementAccess === 'paid' && <p className="mt-3 text-xs text-muted-foreground">Simulated checkout · Videos stay locked · Documents use your page preview</p>}
                </section>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-mauve-ink" />
                  <p>Stored in this browser · No learner data</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-6 flex flex-col gap-6">
                <ReviewSummary
                  onEdit={jumpBack}
                  rows={[
                    { step: 0, label: 'Title', value: title.trim() },
                    { step: 0, label: 'Short description', value: summary.trim() },
                    { step: 0, label: 'Class', value: `${selectedLevel?.label} · ${grade} · ${subject}` },
                    { step: 0, label: 'Curriculum', value: curriculumBasis(grade) },
                    { step: 0, label: 'Expected competency', value: competency.trim() },
                    ...([quarter.trim(), week.trim()].some(Boolean)
                      ? [{ step: 0, label: 'Schedule', value: [quarter.trim(), week.trim()].filter(Boolean).join(' · ') }]
                      : []),
                    ...(requirements.trim()
                      ? [{ step: 0, label: 'Classroom needs', value: requirements.split('\n').map((s) => s.trim()).filter(Boolean).join(' · ') }]
                      : []),
                    ...(parent ? [{ step: 0, label: 'What changed', value: changeNote.trim() }] : []),
                    {
                      step: 1,
                      label: `Files (${picked.length + supplements.length})`,
                      value: (
                        <ul className="flex flex-col gap-1">
                          {[...picked, ...supplements].map((p, i) => (
                            <li key={i}>
                              {p.label.trim()} <span className="text-muted-foreground">· {i < picked.length ? 'Free lesson plan' : supplementAccess === 'paid' ? 'Paid bundle' : 'Free supplement'} · {formatBytes(p.file.size)}</span>
                            </li>
                          ))}
                        </ul>
                      ),
                    },
                  ]}
                />
                {supplementAccess === 'paid' && supplements.length > 0 && <p className="text-sm font-medium">Supplement bundle · ₱{Number(bundlePrice).toFixed(2)} · {supplements.length} files · Simulated checkout</p>}

                <div className={cn('rounded-xl border p-4 transition-colors', permission ? 'border-primary/40 bg-secondary/50' : 'bg-background/60', errors.permission && 'border-destructive/60')}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={f('permission')}
                      checked={permission}
                      onCheckedChange={(v) => {
                        setPermission(v === true)
                        if (v === true) setErrors((e) => ({ ...e, permission: undefined }))
                      }}
                      aria-invalid={!!errors.permission}
                      aria-describedby={describedBy(f('permission'), { error: errors.permission })}
                      className="mt-0.5 size-5"
                    />
                    <label htmlFor={f('permission')} className="cursor-pointer text-[15px] leading-snug font-medium">
                      I own this pack or have permission to share it. It contains no learner data.
                    </label>
                  </div>
                  <FieldError id={errors.permission ? `${f('permission')}-error` : undefined}>
                    <span className="mt-2 block pl-8">{errors.permission}</span>
                  </FieldError>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                  <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-mauve-ink" />
                  <p>Moderator review · Curriculum badge is simulated</p>
                </div>

                {errors.submit && (
                  <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                    {errors.submit}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex items-center gap-3 border-t bg-background/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          {step === 0 ? (
            <Button type="button" variant="ghost" size="lg" disabled={saving} onClick={cancel}>
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" size="lg" disabled={saving} onClick={() => jumpBack(step - 1)}>
              <ArrowLeft aria-hidden="true" /> Back
            </Button>
          )}
          <span className="ml-auto hidden text-sm text-muted-foreground tabular-nums sm:inline">
            Step {step + 1} of {STEPS.length}
          </span>
          <Button type="submit" size="lg" disabled={saving} className="max-sm:ml-auto max-sm:flex-1 sm:min-w-44">
            {isLast ? (
              saving ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Send aria-hidden="true" /> Submit for review
                </>
              )
            ) : (
              <>
                {STEPS[step + 1]} <ArrowRight aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
        {step > 0 && (
          <div className="mt-3 hidden justify-start sm:flex">
            <Button type="button" variant="link" disabled={saving} onClick={cancel} className="px-0 text-muted-foreground">
              Cancel and leave
            </Button>
          </div>
        )}
      </form>
    </Container>
  )
}

/** Runs once when a step panel mounts, so focus lands after the previous panel has left. */
function OnMount({ run }: { run: () => void }) {
  useEffect(run, [run])
  return null
}

function ReviewSummary({ rows, onEdit }: { rows: { step: number; label: string; value: ReactNode }[]; onEdit: (step: number) => void }) {
  return (
    <section aria-labelledby="share-summary-title" className="rounded-xl border">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h3 id="share-summary-title" className="font-semibold">
          What you’re submitting
        </h3>
      </div>
      <dl className="divide-y">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:gap-4">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="min-w-0 text-[15px] break-words">{row.value}</dd>
            <dd className="sm:text-right">
              <Button type="button" variant="link" size="sm" className="h-auto min-h-10 px-0 text-mauve-ink" onClick={() => onEdit(row.step)}>
                Edit <span className="sr-only">{row.label}</span>
              </Button>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
