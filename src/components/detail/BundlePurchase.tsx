import { Check, Download, FileText, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { Resource, ResourceFile } from '@/domain/types'
import { fetchFileBlob, saveBlob } from '@/files'
import { useStore } from '@/store'
import { SupplementPreview } from './SupplementPreview'
import type { PackDownloads } from './usePackDownloads'

const STAGES = ['Files', 'Billing', 'Verify', 'Download']

export function BundlePurchase({ resource, files, price, dl, open, onClose }: {
  resource: Resource; files: ResourceFile[]; price: number; dl: PackDownloads; open: boolean; onClose: () => void
}) {
  const { dispatch } = useStore()
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [method, setMethod] = useState('GCash')
  const [name, setName] = useState('Demo Teacher')
  const [email, setEmail] = useState('teacher@example.com')
  const [address, setAddress] = useState('Demo address, Naga City')
  const heading = useRef<HTMLHeadingElement>(null)
  const unlocked = files.every((file) => !dl.isLocked(file))
  const canBuy = resource.status === 'published' && dl.canDownload
  useEffect(() => { if (!open) { setStep(0); setProgress(0); setError('') } }, [open])
  useEffect(() => { heading.current?.focus() }, [step])
  useEffect(() => {
    if (!open || step !== 2) return
    let tick = 0
    const timer = window.setInterval(() => {
      tick++
      setProgress(Math.min(100, tick * 20))
      if (tick < 5) return
      window.clearInterval(timer)
      try {
        if (!canBuy) throw new Error('This bundle is not available for purchase.')
        if (resource.supplementBundle) dispatch({ type: 'acquire-bundle', resource })
        else for (const file of files) dispatch({ type: 'acquire', resourceId: resource.id, fileId: file.id, simulatedPurchase: true })
        setStep(3)
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unlock failed. Try again.'); setStep(1) }
    }, 550)
    return () => window.clearInterval(timer)
  }, [open, step, canBuy, resource, files, dispatch])

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

  return <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><div className="flex items-center gap-2 pr-7"><DialogTitle>Supplementary bundle</DialogTitle>{price > 0 && <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">Demo payment</span>}</div><DialogDescription className="sr-only">Preview files, enter demo billing details, and download the bundle.</DialogDescription></DialogHeader>
      <ol aria-label="Purchase progress" className="my-2 grid grid-cols-4 gap-2">{STAGES.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={`border-t-2 pt-2 text-xs ${step >= index ? 'border-primary text-foreground' : 'border-border text-muted-foreground'}`}>{index < step ? '✓ ' : `${index + 1} `}{label}</li>)}</ol>
      <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold outline-none">{['Bundle files', 'Billing details', 'Verifying demo payment', unlocked && price > 0 ? 'Bundle unlocked' : 'Ready to download'][step]}</h2>
      {step === 0 && <>
        <ul className="divide-y rounded-xl border">{files.map((file) => <li key={file.id} className="flex items-center gap-3 p-3"><FileText aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1 truncate text-sm font-medium">{file.label}</span>{(file.previewPages?.length || (!dl.isLocked(file) && /\.(pdf|png|jpe?g|txt)$/i.test(file.name))) ? <SupplementPreview file={file} unlocked={!dl.isLocked(file) && /\.(pdf|png|jpe?g|txt)$/i.test(file.name)} /> : <span className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="size-3" />{dl.isLocked(file) ? 'Locked' : 'Included'}</span>}</li>)}</ul>
        <div className="mt-3 flex items-center justify-between gap-4 border-t pt-4"><span className="text-2xl font-bold">{price > 0 ? `₱${price.toFixed(2)}` : 'Free'}</span><Button disabled={!dl.canDownload || (!unlocked && !canBuy)} onClick={() => setStep(unlocked ? 3 : 1)}>{unlocked ? 'Continue to download' : 'Continue to billing'}</Button></div>
      </>}
      {step === 1 && <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); setError(''); setProgress(0); setStep(2) }}>
        <p className="text-xs text-muted-foreground">Use sample details. No payment is collected.</p>
        <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Name<Input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="off" /></label><label className="grid gap-2 text-sm font-medium">Email<Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="off" /></label></div>
        <label className="grid gap-2 text-sm font-medium">Billing address<Input value={address} onChange={(event) => setAddress(event.target.value)} required autoComplete="off" /></label>
        <fieldset><legend className="mb-2 text-sm font-medium">Payment method</legend><div className="grid grid-cols-2 gap-3">{['GCash', 'Card'].map((item) => <label key={item} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${method === item ? 'border-primary bg-secondary' : ''}`}><input type="radio" name="payment-method" value={item} checked={method === item} onChange={() => setMethod(item)} />{item}</label>)}</div></fieldset>
        <div className="flex items-center gap-2 rounded-xl bg-secondary p-3 text-sm"><ShieldCheck className="size-4" />{method === 'Card' ? 'Demo card ···· 4242' : 'Demo GCash wallet'}</div>
        <div className="flex items-center justify-between border-t pt-4"><Button type="button" variant="ghost" onClick={() => setStep(0)}>Back</Button><Button type="submit" disabled={!canBuy}>Simulate payment · ₱{price.toFixed(2)}</Button></div>
      </form>}
      {step === 2 && <div className="grid justify-items-center gap-5 py-10" role="status"><Loader2 className="size-10 animate-spin text-primary motion-reduce:animate-none" /><progress className="h-2 w-full accent-primary" value={progress} max={100} aria-label="Demo verification progress" /><span className="text-sm tabular-nums">{progress}%</span></div>}
      {step === 3 && <div className="grid justify-items-center gap-5 py-8"><span className="grid size-16 place-items-center rounded-full bg-secondary"><Check className="size-8 text-primary" /></span><span className="text-sm text-muted-foreground">{files.length} {files.length === 1 ? 'file' : 'files'} · ZIP</span><Button size="lg" onClick={() => void downloadZip()} disabled={busy || !dl.canDownload || files.some(dl.isLocked)}>{busy ? <Loader2 className="animate-spin" /> : <Download />} {busy ? 'Preparing ZIP…' : 'Download bundle'}</Button></div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </DialogContent>
  </Dialog>
}
