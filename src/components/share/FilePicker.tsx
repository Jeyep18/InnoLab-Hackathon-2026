import { FileText, Trash2, Upload } from 'lucide-react'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatBytes } from '@/domain/logic'
import { ACCEPTED_EXTENSIONS, extension, MAX_FILE_BYTES } from '@/files'
import { cn } from '@/lib/utils'
import { FieldError } from './FormField'
import { PagePreviewEditor } from './PagePreviewEditor'
import type { PreviewPage } from '@/lib/document-preview'

export interface PickedFile {
  file: File
  label: string
  required: boolean
  previewPages?: PreviewPage[]
}

/** Why a file can't be shared, or null. Same rules as before the redesign. */
export function fileProblem(file: File): string | null {
  if (!ACCEPTED_EXTENSIONS.includes(extension(file.name))) return `${file.name}: this file type isn’t accepted.`
  if (file.size === 0) return `${file.name} is empty.`
  if (file.size > MAX_FILE_BYTES) return `${file.name} is larger than ${formatBytes(MAX_FILE_BYTES)}.`
  return null
}

export function FilePicker({
  id,
  picked,
  setPicked,
  error,
  onAdded,
  kind = 'lesson-plan',
  paid = false,
}: {
  id: string
  picked: PickedFile[]
  setPicked: Dispatch<SetStateAction<PickedFile[]>>
  error?: string
  onAdded: () => void
  kind?: 'lesson-plan' | 'supplement'
  paid?: boolean
}) {
  const [dragging, setDragging] = useState(false)
  const errorId = error ? `${id}-error` : undefined

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    const added = [...list].map((file) => ({ file, label: file.name.replace(/\.[^.]+$/, ''), required: kind === 'lesson-plan' }))
    setPicked((current) => [
      ...current,
      ...added,
    ])
    onAdded()
  }

  const update = (i: number, patch: Partial<PickedFile>) => setPicked((all) => all.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  return (
    <fieldset className="flex flex-col gap-4" aria-describedby={[`${id}-hint`, errorId].filter(Boolean).join(' ')}>
      <legend className="sr-only">{kind === 'lesson-plan' ? 'Lesson plan files' : 'Supplementary files'}</legend>
      <div>
        <input
          id={id}
          className="peer sr-only"
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',')}
          aria-invalid={!!error}
          aria-describedby={[`${id}-hint`, errorId].filter(Boolean).join(' ')}
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            addFiles(e.dataTransfer.files)
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed bg-card/60 px-6 py-10 text-center transition-colors duration-150 hover:border-primary/60 hover:bg-secondary/50 peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50',
            dragging && 'border-primary bg-secondary/60',
            error && 'border-destructive/60',
          )}
        >
          <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-secondary text-mauve-ink">
            <Upload className="size-5" />
          </span>
          <span className="text-base font-semibold">
            {picked.length > 0 ? 'Add more files' : 'Add files'}
            <span className="font-normal text-muted-foreground max-sm:hidden"> or drop them here</span>
          </span>
          <span id={`${id}-hint`} className="max-w-sm text-sm text-pretty text-muted-foreground">
            Documents, images or videos · {formatBytes(MAX_FILE_BYTES)} max
          </span>
        </label>
      </div>

      {picked.length > 0 && (
        <ul aria-label="Files to share" className="flex flex-col gap-3">
          {picked.map((p, i) => {
            const problem = fileProblem(p.file)
            const labelId = `${id}-label-${i}`
            return (
              <li key={`${p.file.name}-${i}`} className={cn('rounded-2xl border bg-card p-4', problem && 'border-destructive/50')}>
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.file.name}</p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {extension(p.file.name).toUpperCase() || 'File'} · {formatBytes(p.file.size)}
                    </p>
                    {problem && <p className="mt-1 text-sm font-medium text-destructive">{problem}</p>}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setPicked((all) => all.filter((_, j) => j !== i))} aria-label={`Remove ${p.file.name}`}>
                    <Trash2 />
                  </Button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={labelId} className="text-sm font-normal text-muted-foreground">
                      Display name
                    </Label>
                    <Input id={labelId} value={p.label} onChange={(e) => update(i, { label: e.target.value })} />
                  </div>
                </div>
                {kind === 'supplement' && paid && (/\.(mp4|webm|mov)$/i.test(p.file.name)
                  ? <p className="mt-3 text-sm text-muted-foreground">Video locked until bundle purchase</p>
                  : <PagePreviewEditor picked={p} onChange={(previewPages) => update(i, { previewPages })} />)}
              </li>
            )
          })}
        </ul>
      )}
      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  )
}
