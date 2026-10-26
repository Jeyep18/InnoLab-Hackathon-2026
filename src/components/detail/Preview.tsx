import { Download, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Resource, ResourceFile } from '@/domain/types'
import { fetchFileBlob, lessonPlanFiles, previewKind } from '@/files'
import { FileView } from '@/components/FileView'
import type { PackDownloads } from './usePackDownloads'

export function Preview({ resource, downloads }: { resource: Resource; downloads: PackDownloads }) {
  const plans = lessonPlanFiles(resource)
  const preview = plans.find((file) => previewKind(file.name))
  return <section aria-label="Lesson plan" className="overflow-hidden border bg-card">
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-3">
      <h2 className="library-section-title text-xl">Lesson plan</h2>
      <span className="border px-2 py-0.5 text-xs font-semibold">Free</span>
      <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{plans.length === 1 ? plans[0].label : `${plans.length} lesson files`}</span>
      <Button onClick={downloads.downloadPack} disabled={!downloads.canDownload || downloads.packBusy || !plans.length}><Download className="size-4" />{downloads.packBusy ? 'Preparing…' : 'Download lesson plan'}</Button>
      {downloads.packError && <p role="alert" className="w-full text-sm text-destructive">{downloads.packError}</p>}
    </div>
    {/* The preview scrolls on its own so the rest of the pack stays within a short page scroll. */}
    <div tabIndex={0} aria-label="Lesson plan preview, scrollable" className="max-h-[min(50dvh,34rem)] overflow-y-auto overscroll-contain outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      {preview ? <DocumentPages key={preview.id + resource.id} file={preview} /> : resource.lesson ? <article className="space-y-6 px-6 py-8 sm:px-10">
        <h3 className="text-2xl font-bold">{resource.title}</h3><p>{resource.lesson.objective}</p>
        {resource.lesson.sections.map((section) => <div key={section.heading}><h4 className="font-semibold">{section.heading}</h4><ul className="mt-2 list-disc space-y-1 pl-5">{section.items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}
      </article> : <div className="grid justify-items-center gap-2 py-10"><FileText className="size-10 text-muted-foreground" /><span className="text-sm">{plans[0]?.name ?? 'Lesson plan unavailable'}</span></div>}
    </div>
  </section>
}

export function DocumentPages({ file }: { file: ResourceFile }) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    setBlob(null)
    setError('')
    fetchFileBlob(file).then((value) => active && setBlob(value)).catch((cause) => active && setError(cause instanceof Error ? cause.message : 'Preview unavailable'))
    return () => { active = false }
  }, [file])
  if (error) return <p role="alert" className="p-6 text-sm text-destructive">{error}</p>
  if (!blob) return <p role="status" className="p-6 text-sm text-muted-foreground">Loading…</p>
  return <div className="bg-secondary/40 p-3"><FileView blob={blob} name={file.name} label={file.label} /></div>
}
