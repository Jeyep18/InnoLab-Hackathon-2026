import { Check, CreditCard, Download, Loader2, Lock, ShieldCheck, Smartphone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { Resource, ResourceFile } from '@/domain/types'
import { extension, fetchFileBlob, previewKind, saveBlob } from '@/files'
import { fileIcon, isVideo } from '@/components/share/FilePicker'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { previewSummary, SupplementPreview } from './SupplementPreview'
import type { PackDownloads } from './usePackDownloads'

const STAGES = ['Files', 'Billing', 'Payment', 'Download']
type Method = 'GCash' | 'Card'

/** What the simulated processor "does", shown one by one so the demo feels like a real checkout. */
const PROCESSING: Record<Method, string[]> = {
  GCash: ['Sending payment request to GCash', 'Waiting for approval in the GCash app', 'Confirming payment', 'Unlocking your files'],
  Card: ['Opening a secure connection', 'Authorizing card ending 4242', 'Confirming payment', 'Unlocking your files'],
}
const STAGE_MS = 900

const peso = (value: number) => `₱${value.toFixed(2)}`

export function BundlePurchase({ resource, files, price, dl, open, onClose }: {
  resource: Resource; files: ResourceFile[]; price: number; dl: PackDownloads; open: boolean; onClose: () => void
}) {
  const { dispatch, persona, personaById } = useStore()
  const owner = resource.contributorId === persona.id
  const seller = personaById(resource.contributorId)?.alias ?? 'the contributor'
  const [step, setStep] = useState(0)
  const [stage, setStage] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [method, setMethod] = useState<Method>('GCash')
  const [name, setName] = useState(persona.alias)
  const [email, setEmail] = useState('teacher@example.com')
  const [receipt, setReceipt] = useState<{ ref: string; at: string; method: Method } | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const unlocked = files.every((file) => !dl.isLocked(file))
  const canBuy = resource.status === 'published' && dl.canDownload
  const processing = step === 2
  useEffect(() => { if (!open) { setStep(0); setStage(0); setError('') } }, [open])
  useEffect(() => { heading.current?.focus() }, [step])
  useEffect(() => {
    if (!open || step !== 2) return
    const stages = PROCESSING[method]
    if (stage < stages.length) {
      const timer = window.setTimeout(() => setStage(stage + 1), STAGE_MS + (stage === 1 ? 600 : 0))
      return () => window.clearTimeout(timer)
    }
    try {
      if (!canBuy) throw new Error('This bundle is not available for purchase.')
      if (resource.supplementBundle) dispatch({ type: 'acquire-bundle', resource })
      else for (const file of files) dispatch({ type: 'acquire', resourceId: resource.id, fileId: file.id, simulatedPurchase: true })
      setReceipt({ ref: `DEMO-${Date.now().toString(36).toUpperCase().slice(-6)}`, at: new Date().toLocaleString(), method })
      setStep(3)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Payment failed. Nothing was charged. Try again.'); setStep(1) }
  }, [open, step, stage, method, canBuy, resource, files, dispatch])

  async function downloadZip() {
    if (busy || !dl.canDownload || files.some(dl.isLocked)) return
    setBusy(true); setError('')
    try {
      const entries: Record<string, Uint8Array> = {}
      for (const [index, file] of files.entries()) {
        const blob = await fetchFileBlob(file)
        entries[`${String(index + 1).padStart(2, '0')}-${file.name.replace(/[\\/]/g, '-')}`] = new Uint8Array(await blob.arrayBuffer())
      }
      const { zipSync } = await import('fflate')
      const bytes = zipSync(entries, { level: 0 })
      saveBlob(new Blob([bytes as BlobPart], { type: 'application/zip' }), `${resource.title.replace(/[^a-z0-9 -]/gi, '').trim() || 'lesson'}-supplements.zip`)
      if (resource.status === 'published') for (const file of files) dispatch({ type: 'record-download', resourceId: resource.id, fileId: file.id, at: new Date().toISOString() })
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Download failed. Try again.') }
    finally { setBusy(false) }
  }

  const title = ['Bundle files', 'Checkout', 'Processing payment', receipt ? 'Payment successful' : 'Ready to download'][step]
  return <Dialog open={open} onOpenChange={(next) => { if (!next && !processing) onClose() }}>
    <DialogContent showCloseButton={!processing} className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-2xl">
      <DialogHeader className="border-b p-4 pr-12">
        <div className="flex items-center gap-2"><DialogTitle>Supplementary bundle</DialogTitle>{price > 0 && <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">Demo payment</span>}</div>
        <DialogDescription className="sr-only">Preview files, check out with a simulated payment, and download the bundle.</DialogDescription>
        {!(unlocked && !receipt) && <ol aria-label="Purchase progress" className="mt-3 grid grid-cols-4 gap-2">{STAGES.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={cn('border-t-2 pt-2 text-xs', step >= index ? 'border-primary text-foreground' : 'border-border text-muted-foreground')}>{index < step ? '✓ ' : `${index + 1} `}{label}</li>)}</ol>}
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
      <h2 ref={heading} tabIndex={-1} className="mb-4 text-xl font-semibold outline-none">{title}</h2>
      {step === 0 && <>
        <ul className="divide-y rounded-xl border">{files.map((file) => {
          const locked = dl.isLocked(file)
          const canOpen = !!file.previewPages?.length || (!locked && previewKind(file.name) !== null)
          const Icon = fileIcon(file.name)
          const status = previewSummary(file)
            ?? (isVideo(file.name) ? (locked ? 'Video · unlocks with bundle' : 'Video')
              : !canOpen ? (locked ? 'No online preview · download after buying to open' : 'No online preview · download to open')
              : locked ? 'Locked' : 'Included')
          const meta = [extension(file.name).toUpperCase(), status].filter(Boolean).join(' · ')
          return <li key={file.id} className="flex items-center gap-3 p-3"><span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-mauve-ink"><Icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{file.label}</span><span className="flex items-center gap-1 text-xs text-muted-foreground">{locked && <Lock aria-hidden="true" className="size-3" />}{meta}</span></span>{canOpen && <SupplementPreview file={file} unlocked={!locked} owner={owner} unlockLabel={`Buy bundle · ${peso(price)}`} onUnlock={canBuy ? () => setStep(1) : undefined} />}</li>
        })}</ul>
        {owner && <p className="mt-3 text-sm text-muted-foreground">You shared this bundle, so it’s already unlocked for you. Other teachers pay {peso(price)}.</p>}
        <div className="mt-4 flex items-center justify-between gap-4 border-t pt-4"><span className="text-2xl font-bold tabular-nums">{price > 0 ? peso(price) : 'Free'}</span><Button disabled={!dl.canDownload || (!unlocked && !canBuy)} onClick={() => setStep(unlocked ? 3 : 1)}>{unlocked ? 'Continue to download' : 'Continue to checkout'}</Button></div>
      </>}
      {step === 1 && <form className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_15rem]" onSubmit={(event) => { event.preventDefault(); setError(''); setStage(0); setStep(2) }}>
        <div className="grid content-start gap-4">
          <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-medium">Name<Input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="off" /></label><label className="grid gap-1.5 text-sm font-medium">Email for receipt<Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="off" /></label></div>
          <fieldset><legend className="mb-2 text-sm font-medium">Pay with</legend><div className="grid grid-cols-2 gap-3">{(['GCash', 'Card'] as const).map((item) => <label key={item} className={cn('flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-medium has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50', method === item && 'border-primary bg-secondary')}><input type="radio" name="payment-method" value={item} checked={method === item} onChange={() => setMethod(item)} className="accent-primary" />{item === 'GCash' ? <Smartphone aria-hidden="true" className="size-4" /> : <CreditCard aria-hidden="true" className="size-4" />}{item === 'Card' ? 'Debit or credit card' : 'GCash'}</label>)}</div></fieldset>
          {method === 'GCash' ? (
            <div className="grid gap-2 rounded-xl border p-3">
              <label className="grid gap-1.5 text-sm font-medium">GCash number<Input value="0917 123 4567" readOnly aria-describedby="demo-pay-note" className="bg-muted/50 tabular-nums" /></label>
              <p className="text-xs text-muted-foreground">You’ll get a request in the GCash app to approve {peso(price)}. In this demo, approval happens automatically.</p>
            </div>
          ) : (
            <div className="grid gap-2 rounded-xl border p-3">
              <label className="grid gap-1.5 text-sm font-medium">Card number<Input value="4242 4242 4242 4242" readOnly aria-describedby="demo-pay-note" className="bg-muted/50 tabular-nums" /></label>
              <div className="grid grid-cols-2 gap-2"><label className="grid gap-1.5 text-sm font-medium">Expiry<Input value="12 / 30" readOnly className="bg-muted/50 tabular-nums" /></label><label className="grid gap-1.5 text-sm font-medium">CVC<Input value="123" readOnly className="bg-muted/50 tabular-nums" /></label></div>
              <p className="text-xs text-muted-foreground">Your card is charged once. Your bank may ask you to confirm.</p>
            </div>
          )}
          <p id="demo-pay-note" className="flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck aria-hidden="true" className="mt-px size-4 shrink-0" />Demo checkout with sample payment details. Nothing is charged and no payment details are collected.</p>
        </div>
        <aside aria-label="Order summary" className="grid content-start gap-3 rounded-xl bg-secondary/60 p-4 text-sm">
          <p className="font-semibold">Order summary</p>
          <dl className="grid gap-2">
            <div className="flex justify-between gap-3"><dt className="min-w-0">Teaching materials<span className="block text-xs text-muted-foreground">{files.length} {files.length === 1 ? 'file' : 'files'} · by {seller}</span></dt><dd className="tabular-nums">{peso(price)}</dd></div>
            <div className="flex justify-between gap-3 text-muted-foreground"><dt>Processing fee</dt><dd className="tabular-nums">{peso(0)}</dd></div>
            <div className="flex justify-between gap-3 border-t pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{peso(price)}</dd></div>
          </dl>
          <p className="text-xs text-muted-foreground">One-time payment, charged to your {method === 'GCash' ? 'GCash wallet' : 'card ending 4242'}. CherIt passes it to {seller}. No subscription.</p>
        </aside>
        <div className="flex items-center justify-between border-t pt-4 sm:col-span-2"><Button type="button" variant="ghost" onClick={() => setStep(0)}>Back</Button><Button type="submit" disabled={!canBuy}><Lock aria-hidden="true" /> Pay {peso(price)}</Button></div>
      </form>}
      {step === 2 && <div role="status" aria-live="polite" className="grid gap-5 py-4">
        <div className="grid justify-items-center gap-2 text-center">
          <Loader2 aria-hidden="true" className="size-10 animate-spin text-primary motion-reduce:animate-none" />
          <p className="text-2xl font-bold tabular-nums">{peso(price)}</p>
          <p className="text-sm text-muted-foreground">{method === 'GCash' ? 'GCash · 0917 ••• 4567' : 'Card ending 4242'} · Don’t close this window</p>
        </div>
        <progress className="h-1.5 w-full accent-primary" value={stage} max={PROCESSING[method].length} aria-label="Payment progress" />
        <ol className="grid gap-2">{PROCESSING[method].map((label, index) => <li key={label} className={cn('flex items-center gap-2 text-sm', index > stage && 'text-muted-foreground')}>
          {index < stage ? <Check aria-hidden="true" className="size-4 text-primary" /> : index === stage ? <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <span aria-hidden="true" className="size-4 rounded-full border" />}
          {label === 'Confirming payment' ? `Confirming ${peso(price)} payment` : label}{index === stage && '…'}
        </li>)}</ol>
      </div>}
      {step === 3 && <div className="grid justify-items-center gap-4 py-2">
        <span className="grid size-14 place-items-center rounded-full bg-secondary"><Check aria-hidden="true" className="size-7 text-primary" /></span>
        {receipt && <dl className="grid w-full max-w-sm gap-1.5 rounded-xl border p-4 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Amount paid</dt><dd className="font-semibold tabular-nums">{peso(price)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Paid with</dt><dd>{receipt.method === 'GCash' ? 'GCash 0917 ••• 4567' : 'Card ending 4242'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Paid to</dt><dd>{seller} via CherIt</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Reference</dt><dd className="font-mono text-xs leading-5">{receipt.ref}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Date</dt><dd>{receipt.at}</dd></div>
          <p className="mt-1 border-t pt-2 text-xs text-muted-foreground">Simulated receipt. No money moved.</p>
        </dl>}
        <span className="text-sm text-muted-foreground">{files.length} {files.length === 1 ? 'file' : 'files'} · ZIP</span>
        <Button size="lg" onClick={() => void downloadZip()} disabled={busy || !dl.canDownload || files.some(dl.isLocked)}>{busy ? <Loader2 className="animate-spin" /> : <Download />} {busy ? 'Preparing ZIP…' : 'Download bundle'}</Button>
      </div>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    </DialogContent>
  </Dialog>
}
