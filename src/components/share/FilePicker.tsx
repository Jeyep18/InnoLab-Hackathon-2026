import { AlertCircle, Eye, File as FileIcon, FileImage, FileSpreadsheet, FileText, FileVideo, Plus, Presentation, Trash2, Upload } from 'lucide-react'
import { useState, type Dispatch, type DragEvent, type SetStateAction } from 'react'
import { FileView } from '@/components/FileView'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatBytes } from '@/domain/logic'
import { ACCEPTED_EXTENSIONS, extension, MAX_FILE_BYTES, PREVIEWABLE_TYPES_LABEL, previewKind } from '@/files'
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

export const isVideo = (name: string) => previewKind(name) === 'video'

export function fileIcon(name: string) {
  const ext = extension(name)
  if (['png', 'jpg', 'jpeg'].includes(ext)) return FileImage
  if (['mp4', 'webm', 'mov'].includes(ext)) return FileVideo
  if (['ppt', 'pptx', 'odp'].includes(ext)) return Presentation
  if (ext === 'xlsx') return FileSpreadsheet
  if (['pdf', 'doc', 'docx', 'odt', 'txt'].includes(ext)) return FileText
  return FileIcon
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
  const [previewing, setPreviewing] = useState<PickedFile | null>(null)
  const errorId = error ? `${id}-error` : undefined
  const hasFiles = picked.length > 0

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    const added = [...list].map((file) => ({ file, label: file.name.replace(/\.[^.]+$/, ''), required: kind === 'lesson-plan' }))
    setPicked((current) => [...current, ...added])
    onAdded()
  }

  const update = (i: number, patch: Partial<PickedFile>) => setPicked((all) => all.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const dropHandlers = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      setDragging(true)
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      setDragging(false)
      addFiles(e.dataTransfer.files)
    },
  }

  return (
    <fieldset className="flex flex-col gap-3" aria-describedby={[`${id}-hint`, errorId].filter(Boolean).join(' ')}>
      <legend className="sr-only">{kind === 'lesson-plan' ? 'Lesson plan files' : 'Supplementary files'}</legend>

      {hasFiles && (
        <ul aria-label={kind === 'lesson-plan' ? 'Lesson plan files' : 'Supplementary files'} className="flex flex-col gap-2">
          {picked.map((p, i) => {
            const problem = fileProblem(p.file)
            const Icon = fileIcon(p.file.name)
            const canPreview = !problem && previewKind(p.file.name) !== null
            const labelId = `${id}-label-${i}`
            return (
              <li key={`${p.file.name}-${i}`} className={cn('rounded-xl border bg-card p-2 pr-1.5', problem && 'border-destructive/60 bg-destructive/5')}>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={!canPreview}
                    onClick={() => setPreviewing(p)}
                    aria-label={canPreview ? `Preview ${p.file.name}` : `${p.file.name} has no preview`}
                    className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-mauve-ink outline-none transition-colors hover:bg-secondary/70 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:text-muted-foreground"
                  >
                    <Icon aria-hidden="true" className="size-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <label htmlFor={labelId} className="sr-only">Display name for {p.file.name}</label>
                    <Input
                      id={labelId}
                      value={p.label}
                      onChange={(e) => update(i, { label: e.target.value })}
                      placeholder="Display name"
                      aria-invalid={!p.label.trim()}
                      className="h-8 border-transparent bg-transparent px-1.5 font-medium shadow-none hover:border-input focus-visible:border-ring aria-invalid:border-destructive"
                    />
                    <p className="truncate px-1.5 text-xs text-muted-foreground tabular-nums">
                      {p.file.name} · {formatBytes(p.file.size)}
                      {!problem && !canPreview && ' · No preview'}
                    </p>
                  </div>
                  {canPreview && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewing(p)} className="shrink-0">
                      <Eye aria-hidden="true" /> <span className="max-sm:sr-only">Preview</span>
                      <span className="sr-only"> {p.file.name}</span>
                    </Button>
                  )}
                  <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => setPicked((all) => all.filter((_, j) => j !== i))} aria-label={`Remove ${p.file.name}`}>
                    <Trash2 />
                  </Button>
                </div>
                {problem && (
                  <p className="mt-1.5 flex items-center gap-1.5 px-1 text-sm font-medium text-destructive">
                    <AlertCircle aria-hidden="true" className="size-4 shrink-0" /> {problem}
                  </p>
                )}
                {kind === 'supplement' && paid && !problem && (isVideo(p.file.name)
                  ? <p className="mt-1.5 px-1 text-xs text-muted-foreground">Buyers see the title only. The video unlocks with the bundle.</p>
                  : <PagePreviewEditor picked={p} onChange={(previewPages) => update(i, { previewPages })} />)}
              </li>
            )
          })}
        </ul>
      )}

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
        {hasFiles ? (
          <label
            htmlFor={id}
            {...dropHandlers}
            className={cn(
              'flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-sm font-medium text-mauve-ink transition-colors duration-150 hover:border-primary/60 hover:bg-secondary/50 peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50',
              dragging && 'border-primary bg-secondary/60',
              error && 'border-destructive/60',
            )}
          >
            <Plus aria-hidden="true" className="size-4" /> Add more files
            <span className="font-normal text-muted-foreground max-sm:hidden">or drop them here</span>
          </label>
        ) : (
          <label
            htmlFor={id}
            {...dropHandlers}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed bg-card/60 px-6 py-8 text-center transition-colors duration-150 hover:border-primary/60 hover:bg-secondary/50 peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50',
              dragging && 'border-primary bg-secondary/60',
              error && 'border-destructive/60 bg-destructive/5',
            )}
          >
            <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-secondary text-mauve-ink">
              <Upload className="size-5" />
            </span>
            <span className="text-base font-semibold">
              Add files<span className="font-normal text-muted-foreground max-sm:hidden"> or drop them here</span>
            </span>
          </label>
        )}
        <p id={`${id}-hint`} className={cn('mt-2 text-xs text-pretty text-muted-foreground', !hasFiles && 'text-center')}>
          Up to {formatBytes(MAX_FILE_BYTES)} each. {PREVIEWABLE_TYPES_LABEL}
        </p>
      </div>
      <FieldError id={errorId}>{error}</FieldError>

      <Dialog open={!!previewing} onOpenChange={(open) => !open && setPreviewing(null)}>
        <DialogContent className="flex max-h-[88dvh] flex-col gap-0 p-0 sm:max-w-3xl">
          <DialogHeader className="border-b p-4 pr-12">
            <DialogTitle>{previewing?.label.trim() || previewing?.file.name}</DialogTitle>
            <DialogDescription>{previewing && `${previewing.file.name} · ${formatBytes(previewing.file.size)} · as other teachers will see it`}</DialogDescription>
          </DialogHeader>
          {previewing && (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-secondary/40 p-2">
              <FileView blob={previewing.file} name={previewing.file.name} label={previewing.label} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </fieldset>
  )
}
