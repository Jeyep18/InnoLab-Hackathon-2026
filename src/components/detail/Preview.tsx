import { FileX2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { bowLabel } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { extension, fetchFileBlob } from '@/files'

/** Lesson-plan "sheet" for packs with structured lesson content, else a browser preview of an uploaded file. */
export function Preview({ resource }: { resource: Resource }) {
  if (resource.lesson) {
    return (
      <section aria-labelledby="preview-title">
        <h2 id="preview-title" className="text-2xl font-bold tracking-tight">
          Lesson preview
        </h2>
        <article className="mt-4 rounded-2xl border bg-card px-5 py-7 shadow-[0_1px_2px_rgb(51_44_39/0.04)] sm:px-10 sm:py-10">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {resource.grade} {resource.subject}, {bowLabel(resource)}
          </p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-balance sm:text-2xl">{resource.title}</h3>
          <p className="mt-4 rounded-xl border-l-4 border-primary bg-secondary/60 px-4 py-3 text-pretty">
            <strong className="font-semibold">Objective.</strong> {resource.lesson.objective}
          </p>
          <div className="mt-6 space-y-6">
            {resource.lesson.sections.map((section) => {
              const ordered = section.heading === 'Procedure'
              const List = ordered ? 'ol' : 'ul'
              return (
                <div key={section.heading}>
                  <h4 className="font-semibold">{section.heading}</h4>
                  <List className={ordered ? 'mt-2 list-decimal space-y-1.5 pl-6' : 'mt-2 list-disc space-y-1.5 pl-6 marker:text-muted-foreground'}>
                    {section.items.map((item) => (
                      <li key={item} className="pl-1 text-pretty">
                        {item}
                      </li>
                    ))}
                  </List>
                </div>
              )
            })}
          </div>
        </article>
        <p className="mt-2 text-sm text-muted-foreground">Preview of the lesson plan file. Download for the full editable version.</p>
      </section>
    )
  }
  return <UploadedPreview resource={resource} />
}

const PREVIEWABLE = new Set(['pdf', 'png', 'jpg', 'jpeg', 'txt'])

function UploadedPreview({ resource }: { resource: Resource }) {
  const file = resource.files.find((f) => PREVIEWABLE.has(extension(f.name)))
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!file) return
    // Served files load directly, so the PDF viewer shows the real file name.
    if (file.source.type === 'url') {
      setUrl(file.source.url)
      return
    }
    let objectUrl: string | null = null
    let cancelled = false
    fetchFileBlob(file)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  if (!file) {
    return (
      <section aria-labelledby="preview-title" className="rounded-2xl border border-dashed bg-card/50 p-6">
        <h2 id="preview-title" className="text-xl font-semibold tracking-tight">
          Preview
        </h2>
        <p className="mt-1 text-muted-foreground">
          These file types can’t be previewed in the browser. Download them to open in Word, Google Docs, LibreOffice or WPS.
        </p>
      </section>
    )
  }
  const ext = extension(file.name)
  return (
    <section aria-labelledby="preview-title">
      <h2 id="preview-title" className="text-2xl font-bold tracking-tight break-words">
        Preview of {file.name}
      </h2>
      <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
        {failed ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <FileX2 aria-hidden="true" className="size-8 text-muted-foreground" />
            <p className="max-w-sm text-destructive">The preview couldn’t load. The file may have been cleared from this browser.</p>
          </div>
        ) : !url ? (
          <div role="status">
            <Skeleton className="h-[60vh] min-h-80 w-full rounded-none" />
            <span className="sr-only">Loading preview…</span>
          </div>
        ) : ['png', 'jpg', 'jpeg'].includes(ext) ? (
          <img src={url} alt={`Preview of ${file.name}`} className="mx-auto max-h-[75vh] w-auto object-contain" />
        ) : ['pdf', 'txt'].includes(ext) ? (
          // White page behind the file: plain-text files render dark text with no background of their own.
          <iframe src={url} title={`Preview of ${file.name}`} className="h-[70vh] min-h-96 w-full bg-white" />
        ) : null}
      </div>
    </section>
  )
}
