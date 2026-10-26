import { Download, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Resource, ResourceFile } from '@/domain/types'
import { extension, fetchFileBlob, lessonPlanFiles } from '@/files'
import type { PackDownloads } from './usePackDownloads'

export function Preview({ resource, downloads }: { resource: Resource; downloads: PackDownloads }) {
  const plans = lessonPlanFiles(resource)
  const preview = plans.find((file) => ['pdf', 'png', 'jpg', 'jpeg', 'txt'].includes(extension(file.name)))
  return <section aria-label="Lesson plan" className="overflow-hidden border bg-card">
    <div className="flex items-center justify-between border-b px-5 py-4"><h2 className="library-section-title text-xl">Lesson plan</h2><span className="border px-2 py-1 text-xs font-semibold">Free</span></div>
    {preview ? <DocumentPages key={preview.id + resource.id} file={preview} /> : resource.lesson ? <article className="space-y-6 px-6 py-8 sm:px-10">
      <h3 className="text-2xl font-bold">{resource.title}</h3><p>{resource.lesson.objective}</p>
      {resource.lesson.sections.map((section) => <div key={section.heading}><h4 className="font-semibold">{section.heading}</h4><ul className="mt-2 list-disc space-y-1 pl-5">{section.items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}
    </article> : <div className="grid justify-items-center gap-2 py-10"><FileText className="size-10 text-muted-foreground" /><span className="text-sm">{plans[0]?.name ?? 'Lesson plan unavailable'}</span></div>}
    <div className="flex flex-wrap items-center gap-3 border-t px-5 py-3"><span className="mr-auto text-sm font-medium">{plans.length === 1 ? plans[0].label : `${plans.length} lesson files`}</span><Button onClick={downloads.downloadPack} disabled={!downloads.canDownload || downloads.packBusy || !plans.length}><Download className="size-4" />{downloads.packBusy ? 'Preparing…' : 'Download lesson plan'}</Button>{downloads.packError && <p role="alert" className="w-full text-sm text-destructive">{downloads.packError}</p>}</div>
  </section>
}

export function DocumentPages({ file }: { file: ResourceFile }) {
  const [pages, setPages] = useState<string[]>([])
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    const urls: string[] = []
    async function load() {
      try {
        const blob = await fetchFileBlob(file)
        if (extension(file.name) === 'txt') {
          const value = await blob.text()
          if (active) setText(value)
          return
        }
        if (extension(file.name) === 'pdf') {
          const { renderPreviewPages } = await import('@/lib/document-preview')
          const result = await renderPreviewPages(new File([blob], file.name, { type: 'application/pdf' }))
          if (!active) return
          for (const page of result) urls.push(URL.createObjectURL(page.blob))
        } else if (active) urls.push(URL.createObjectURL(blob))
        if (active) setPages([...urls])
      } catch { if (active) setError('Preview unavailable') }
    }
    void load()
    return () => { active = false; urls.forEach((url) => URL.revokeObjectURL(url)) }
  }, [file])
  if (error) return <p role="alert" className="p-6 text-sm text-destructive">{error}</p>
  if (text !== null) return <pre className="whitespace-pre-wrap break-words p-6 font-sans text-sm">{text}</pre>
  if (!pages.length) return <p role="status" className="p-6 text-sm text-muted-foreground">Loading…</p>
  return <div className="space-y-3 bg-secondary/40 p-3">{pages.map((url, index) => <img key={url} src={url} alt={`Lesson plan, page ${index + 1}`} className="mx-auto w-full bg-white" loading={index ? 'lazy' : 'eager'} />)}</div>
}
