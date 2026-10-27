import { GitPullRequestArrow, Loader2, Upload } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DemoRuleError, formatBytes, nextMinorVersion } from '@/domain/logic'
import type { Resource } from '@/domain/types'
import { ACCEPTED_EXTENSIONS, shortFileName } from '@/files'
import { putFile } from '@/storage/fileStore'
import { useStore } from '@/store'
import { fileProblem } from '../share/FilePicker'

/**
 * Lets a teacher privately send the author a revised file, like a pull request. The author
 * reviews it under Revision requests on their profile; approving it publishes a new version.
 */
export function SuggestRevision({ resource, open: controlled, onOpenChange }: { resource: Resource; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const { personaById, dispatch, notify } = useStore()
  const id = useId()
  const [uncontrolled, setUncontrolled] = useState(false)
  const open = controlled ?? uncontrolled
  const setOpen = onOpenChange ?? setUncontrolled
  const [fileId, setFileId] = useState(resource.files[0]?.id ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const author = personaById(resource.contributorId)?.alias ?? 'the author'

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    const problem = file ? fileProblem(file) : 'Attach your revised file.'
    if (problem) return setError(problem)
    if (!summary.trim()) return setError('Tell the author what you changed and why.')
    setBusy(true)
    setError('')
    const proposalId = `rv-${Date.now().toString(36)}`
    try {
      const key = `${proposalId}-file`
      await putFile(key, file!)
      dispatch({
        type: 'propose-revision',
        resource,
        proposal: { id: proposalId, resourceId: resource.id, baseVersion: resource.version.label, proposerId: '', fileId, file: { name: file!.name, sizeBytes: file!.size, mimeType: file!.type, key }, summary: summary.trim(), status: 'pending', createdAt: new Date().toISOString() },
      })
      notify(`Sent to ${author}. You’ll see their decision under Revision requests on your profile.`)
      setOpen(false)
      setFile(null)
      setSummary('')
    } catch (e) {
      setError(e instanceof DemoRuleError ? e.message : 'Your file couldn’t be saved. Storage may be full.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlled === undefined && <DialogTrigger render={<Button variant="link" className="px-0 text-sm" />}>Suggest a revision</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><GitPullRequestArrow className="size-5" /> Suggest a revision</DialogTitle>
          <DialogDescription>Only {author} sees this. If they approve it, it becomes version {nextMinorVersion(resource.version.label)} and the change note credits you.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">Which file did you change?</legend>
            {resource.files.map((f) => (
              <label key={f.id} className="flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-secondary/60">
                <input type="radio" name={`${id}-file`} value={f.id} checked={fileId === f.id} onChange={() => setFileId(f.id)} className="accent-primary" />
                <span className="min-w-0 flex-1 truncate">{f.label}</span>
                <span className="text-xs text-muted-foreground">{f.name.split('.').pop()?.toUpperCase()}</span>
              </label>
            ))}
          </fieldset>
          <div className="grid gap-1.5">
            <span className="text-sm font-medium">Your revised file</span>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-3 py-3 text-sm hover:border-primary/60 hover:bg-secondary/40 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
              <Upload className="size-4 shrink-0 text-mauve-ink" />
              <span className="min-w-0 flex-1 truncate" title={file?.name}>{file ? `${shortFileName(file.name)} · ${formatBytes(file.size)}` : 'Choose a file'}</span>
              <input type="file" className="sr-only" accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',')} onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(''); event.target.value = '' }} />
            </label>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`${id}-summary`}>What did you change?</Label>
            <Textarea id={`${id}-summary`} rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="e.g. Fixed the answer key for item 3 and added a Bikol word list" />
          </div>
          {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <GitPullRequestArrow />} Send to {author.split(' ').slice(0, 2).join(' ')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
