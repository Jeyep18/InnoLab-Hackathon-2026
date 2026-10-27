import { Check, GitPullRequestArrow, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FileView } from '@/components/FileView'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PersonAvatar } from '@/components/site/PersonAvatar'
import { EmptyState } from '@/components/site/layout'
import { DemoRuleError, formatBytes, nextMinorVersion } from '@/domain/logic'
import type { ResourceFile, RevisionProposal } from '@/domain/types'
import { fetchFileBlob, shortFileName } from '@/files'
import { useStore } from '@/store'
import { TabTitle } from './OverviewTab'
import type { ProfileModel } from './useProfile'

const formatDate = (date: string) => new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

export function RevisionsTab({ model }: { model: ProfileModel }) {
  const order = (list: RevisionProposal[]) => [...list].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || b.createdAt.localeCompare(a.createdAt))
  return (
    <div className="space-y-10">
      <section>
        <TabTitle title="Revision requests" />
        {model.incoming.length ? <ul className="space-y-3">{order(model.incoming).map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} incoming />)}</ul> : <EmptyState icon={<GitPullRequestArrow />} title="No revision requests yet">When a teacher suggests a change to one of your packs, it shows up here for you to review.</EmptyState>}
      </section>
      {model.outgoing.length > 0 && (
        <section>
          <TabTitle title="Your suggestions" />
          <ul className="space-y-3">{order(model.outgoing).map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)}</ul>
        </section>
      )}
    </div>
  )
}

function ProposalCard({ proposal, incoming = false }: { proposal: RevisionProposal; incoming?: boolean }) {
  const { resources, personaById, dispatch, notify } = useStore()
  const [comparing, setComparing] = useState(false)
  const resource = resources.find((r) => r.id === proposal.resourceId)
  if (!resource) return null
  const proposer = personaById(proposal.proposerId)?.alias ?? 'A teacher'
  const original = resource.files.find((f) => f.id === proposal.fileId)
  const outdated = proposal.status === 'pending' && proposal.baseVersion !== resource.version.label

  function decide(approve: boolean) {
    try {
      dispatch({ type: 'decide-revision', proposalId: proposal.id, resource: resource!, approve, proposerLabel: proposer, at: new Date().toISOString() })
      notify(approve ? `Published version ${nextMinorVersion(resource!.version.label)} with ${proposer}’s changes.` : 'Revision declined.')
      setComparing(false)
    } catch (e) {
      notify(e instanceof DemoRuleError ? e.message : 'That didn’t work. Try again.')
    }
  }

  const status = { pending: <Badge variant="secondary">Waiting for review</Badge>, approved: <Badge className="gap-1"><Check className="size-3" /> Approved · v{proposal.resultVersion}</Badge>, declined: <Badge variant="outline">Declined</Badge> }[proposal.status]
  return (
    <li className="rounded-2xl border p-4">
      <div className="flex flex-wrap items-start gap-3">
        <PersonAvatar name={proposer} seed={proposal.proposerId} className="size-10" />
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <strong className="font-semibold">{incoming ? proposer : 'You'}</strong> suggested a change to{' '}
            <a href={`#/resource/${resource.id}`} className="font-medium underline-offset-2 hover:underline">{resource.title}</a>
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(proposal.createdAt)} · based on v{proposal.baseVersion} · replaces “{original?.label ?? 'a file'}”</p>
          <p className="mt-2 text-pretty">{proposal.summary}</p>
          {outdated && <p className="mt-1 text-xs text-muted-foreground">The pack has a newer version (v{resource.version.label}) since this was suggested.</p>}
        </div>
        {status}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 pl-13">
        <Button variant="outline" size="sm" onClick={() => setComparing(true)}>Compare files</Button>
        {incoming && proposal.status === 'pending' && (
          <>
            <Button size="sm" onClick={() => decide(true)}><Check /> Approve and publish</Button>
            <Button variant="ghost" size="sm" onClick={() => decide(false)}><X /> Decline</Button>
          </>
        )}
      </div>
      <Dialog open={comparing} onOpenChange={setComparing}>
        <DialogContent className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-5xl">
          <DialogHeader className="border-b p-4 pr-12">
            <DialogTitle>Compare changes</DialogTitle>
            <DialogDescription>{proposal.summary}</DialogDescription>
          </DialogHeader>
          <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 md:grid-cols-2">
            {original && <Pane title={`Current · v${proposal.baseVersion}`} file={original} />}
            <Pane title={`Suggested by ${proposer}`} file={{ id: 'proposed', name: proposal.file.name, label: proposal.file.name, required: false, editable: true, sizeBytes: proposal.file.sizeBytes, source: { type: 'local', key: proposal.file.key } }} />
          </div>
          {incoming && proposal.status === 'pending' && (
            <div className="flex justify-end gap-2 border-t p-4">
              <Button variant="ghost" onClick={() => decide(false)}>Decline</Button>
              <Button onClick={() => decide(true)}><Check /> Approve and publish</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </li>
  )
}

function Pane({ title, file }: { title: string; file: ResourceFile }) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    fetchFileBlob(file).then((value) => active && setBlob(value)).catch((cause) => active && setError(cause instanceof Error ? cause.message : 'Couldn’t open this file.'))
    return () => { active = false }
  }, [file])
  return (
    <section className="min-w-0 rounded-xl border">
      <header className="border-b px-3 py-2">
        <p className="text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground" title={file.name}>{shortFileName(file.name)}{file.sizeBytes ? ` · ${formatBytes(file.sizeBytes)}` : ''}</p>
      </header>
      <div className="max-h-[60dvh] overflow-y-auto bg-secondary/40 p-2">
        {error ? <p role="alert" className="p-4 text-sm text-destructive">{error}</p> : blob ? <FileView blob={blob} name={file.name} label={title} /> : <p role="status" className="p-4 text-sm text-muted-foreground">Loading…</p>}
      </div>
    </section>
  )
}
